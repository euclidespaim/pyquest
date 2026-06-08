// ─── SMART OFFLINE PYTHON SIMULATOR ──────────────────────────────────────────

export function runSimulatedPython(code) {
  const linesList = code.split("\n").map((lineText, idx) => {
    const indentMatch = lineText.match(/^([ \t]*)/);
    const indent = indentMatch ? indentMatch[1].replace(/\t/g, "    ").length : 0;
    return {
      text: lineText.trim(),
      indent: indent,
      lineNum: idx + 1
    };
  });

  const scope = {
    __vfs: {}
  };
  const stdout = [];
  const errors = [];
  let currentLineNum = null;

  function evaluateExpression(expr, localScope, depth = 0) {
    expr = expr.trim();
    if (!expr) return "";

    // 1. Handle "or"
    if (expr.includes(" or ")) {
      const parts = expr.split(" or ");
      return parts.some(p => evaluateExpression(p, localScope, depth));
    }

    // 2. Handle "and"
    if (expr.includes(" and ")) {
      const parts = expr.split(" and ");
      return parts.every(p => evaluateExpression(p, localScope, depth));
    }

    // 3. Handle comparisons (==, !=, >=, <=, >, <)
    const cmpMatch = expr.match(/(.+?)(==|!=|>=|<=|>|<)(.+)/);
    if (cmpMatch) {
      const left = evaluateExpression(cmpMatch[1], localScope, depth);
      const op = cmpMatch[2].trim();
      const right = evaluateExpression(cmpMatch[3], localScope, depth);
      switch (op) {
        // eslint-disable-next-line eqeqeq
        case "==": return left == right;
        // eslint-disable-next-line eqeqeq
        case "!=": return left != right;
        case ">=": return Number(left) >= Number(right);
        case "<=": return Number(left) <= Number(right);
        case ">": return Number(left) > Number(right);
        case "<": return Number(left) < Number(right);
        default: return false;
      }
    }

    // 4. Handle addition (+) and subtraction (-)
    if (expr.includes("+") && !expr.startsWith('"') && !expr.startsWith("'") && !expr.startsWith("[")) {
      const idx = expr.lastIndexOf("+");
      if (idx !== -1) {
        const left = evaluateExpression(expr.slice(0, idx), localScope, depth);
        const right = evaluateExpression(expr.slice(idx + 1), localScope, depth);
        if (typeof left === "string" || typeof right === "string") {
          return String(left) + String(right);
        }
        return Number(left) + Number(right);
      }
    }
    if (expr.includes("-") && !expr.startsWith('"') && !expr.startsWith("'") && !/^-?\d+(\.\d+)?$/.test(expr)) {
      const idx = expr.lastIndexOf("-");
      if (idx > 0) {
        const left = evaluateExpression(expr.slice(0, idx), localScope, depth);
        const right = evaluateExpression(expr.slice(idx + 1), localScope, depth);
        return Number(left) - Number(right);
      }
    }

    // 4.1. Handle multiplication (*) and division (/)
    if (expr.includes("*") && !expr.startsWith('"') && !expr.startsWith("'") && !expr.startsWith("[")) {
      const idx = expr.lastIndexOf("*");
      if (idx !== -1) {
        const left = evaluateExpression(expr.slice(0, idx), localScope, depth);
        const right = evaluateExpression(expr.slice(idx + 1), localScope, depth);
        return Number(left) * Number(right);
      }
    }
    if (expr.includes("/") && !expr.startsWith('"') && !expr.startsWith("'") && !expr.startsWith("[")) {
      const idx = expr.lastIndexOf("/");
      if (idx !== -1) {
        const left = evaluateExpression(expr.slice(0, idx), localScope, depth);
        const right = evaluateExpression(expr.slice(idx + 1), localScope, depth);
        if (Number(right) === 0) {
          errors.push(`ZeroDivisionError (Linha ${currentLineNum || "?"}): division by zero`);
          return 0;
        }
        return Number(left) / Number(right);
      }
    }

    // 5. Handle list literal [...]
    if (expr.startsWith("[") && expr.endsWith("]")) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      const items = [];
      let current = "";
      let inQuote = false;
      let quoteChar = "";
      for (let c = 0; c < inner.length; c++) {
        const char = inner[c];
        if ((char === '"' || char === "'") && inner[c - 1] !== "\\") {
          if (!inQuote) {
            inQuote = true;
            quoteChar = char;
          } else if (char === quoteChar) {
            inQuote = false;
          }
        }
        if (char === "," && !inQuote) {
          items.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      if (current.trim()) {
        items.push(current.trim());
      }
      return items.map(item => evaluateExpression(item, localScope, depth));
    }

    // 6. Handle dictionary literal {...}
    if (expr.startsWith("{") && expr.endsWith("}")) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return {};
      const obj = {};
      let current = "";
      let inQuote = false;
      let quoteChar = "";
      const pairs = [];
      for (let c = 0; c < inner.length; c++) {
        const char = inner[c];
        if ((char === '"' || char === "'") && inner[c - 1] !== "\\") {
          if (!inQuote) {
            inQuote = true;
            quoteChar = char;
          } else if (char === quoteChar) {
            inQuote = false;
          }
        }
        if (char === "," && !inQuote) {
          pairs.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      if (current.trim()) {
        pairs.push(current.trim());
      }
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(":");
        if (colonIdx === -1) continue;
        const keyRaw = pair.slice(0, colonIdx).trim();
        const valRaw = pair.slice(colonIdx + 1).trim();
        const key = evaluateExpression(keyRaw, localScope, depth);
        const val = evaluateExpression(valRaw, localScope, depth);
        obj[key] = val;
      }
      return obj;
    }

    // 7. Handle len() function
    if (expr.startsWith("len(") && expr.endsWith(")")) {
      const arg = expr.slice(4, -1).trim();
      const val = evaluateExpression(arg, localScope, depth);
      if (Array.isArray(val) || typeof val === "string") {
        return val.length;
      }
      if (typeof val === "object" && val !== null) {
        return Object.keys(val).length;
      }
      return 0;
    }

    // 7.1. Handle open() function
    if (expr.startsWith("open(") && expr.endsWith(")")) {
      const inner = expr.slice(5, -1).trim();
      const args = inner.split(",").map(a => evaluateExpression(a, localScope, depth));
      const filename = args[0];
      const mode = args[1] || "r";
      return {
        __isFile__: true,
        filename: filename,
        mode: mode,
        closed: false
      };
    }

    // 8. Handle list/dictionary key access: variable[key]
    const accessMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.*)\]$/);
    if (accessMatch) {
      const varName = accessMatch[1];
      const keyExpr = accessMatch[2].trim();
      const dictOrList = localScope[varName];
      if (dictOrList !== undefined) {
        const key = evaluateExpression(keyExpr, localScope, depth);
        return dictOrList[key];
      }
    }

    // 8.1. Handle method call returning a value (e.g. f.read() or heroi.atacar())
    const methodCallMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
    if (methodCallMatch) {
      const objName = methodCallMatch[1];
      const methodName = methodCallMatch[2];
      const rawArgs = methodCallMatch[3].split(",").map(a => a.trim()).filter(Boolean);
      const targetObj = localScope[objName];
      if (targetObj !== undefined) {
        const args = rawArgs.map(a => evaluateExpression(a, localScope, depth));
        if (targetObj.__isFile__) {
          if (targetObj.closed) {
            errors.push(`Erro (Linha ${currentLineNum || "?"}): Operação em arquivo fechado '${targetObj.filename}'.`);
            return "";
          }
          if (methodName === "read") {
            return scope.__vfs[targetObj.filename] || "";
          }
        } else if (targetObj.__isInstance__) {
          const method = targetObj.__class__.methods[methodName];
          if (method) {
            const methodScope = Object.create(localScope);
            methodScope["self"] = targetObj;
            let argIdx = 0;
            method.params.forEach(param => {
              if (param === "self") {
                methodScope["self"] = targetObj;
              } else {
                methodScope[param] = args[argIdx++];
              }
            });
            runInterpreter(method.body, methodScope, depth + 1);
            return methodScope.__returnValue !== undefined ? methodScope.__returnValue : null;
          }
        }
      }
    }

    // 8.2. Handle class instantiation or normal function call returning value
    const funcCallMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
    if (funcCallMatch) {
      const funcName = funcCallMatch[1];
      const rawArgs = funcCallMatch[2].split(",").map(a => a.trim()).filter(Boolean);
      const args = rawArgs.map(a => evaluateExpression(a, localScope));

      // Check if it's a class
      const possibleClass = localScope[funcName];
      if (possibleClass && possibleClass.__isClass__) {
        const instance = {
          __isInstance__: true,
          __class__: possibleClass
        };
        const initMethod = possibleClass.methods["__init__"];
        if (initMethod) {
          const initScope = Object.create(localScope);
          initScope["self"] = instance;
          let argIdx = 0;
          initMethod.params.forEach(param => {
            if (param === "self") {
              initScope["self"] = instance;
            } else {
              initScope[param] = args[argIdx++];
            }
          });
          runInterpreter(initMethod.body, initScope, depth + 1);
        }
        return instance;
      }

      // Check if it's a normal function
      let targetFunc = null;
      let currScope = localScope;
      while (currScope) {
        if (currScope.__functions && currScope.__functions[funcName]) {
          targetFunc = currScope.__functions[funcName];
          break;
        }
        currScope = Object.getPrototypeOf(currScope);
      }
      if (!targetFunc && scope.__functions && scope.__functions[funcName]) {
        targetFunc = scope.__functions[funcName];
      }

      if (targetFunc) {
        const funcScope = Object.create(localScope);
        targetFunc.params.forEach((param, idx) => {
          funcScope[param] = args[idx] !== undefined ? args[idx] : null;
        });
        runInterpreter(targetFunc.body, funcScope, depth + 1);
        return funcScope.__returnValue !== undefined ? funcScope.__returnValue : null;
      }
    }

    // 8.3. Handle property access: object.property
    const propAccessMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)$/);
    if (propAccessMatch) {
      const objName = propAccessMatch[1];
      const propName = propAccessMatch[2];
      const obj = localScope[objName];
      if (obj !== undefined) {
        return obj[propName];
      }
    }

    // 9. Primitives
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }
    if (expr === "True") return true;
    if (expr === "False") return false;
    if (!isNaN(expr) && expr !== "") return Number(expr);

    // 10. Variable lookup
    if (localScope[expr] !== undefined) {
      return localScope[expr];
    }

    return expr;
  }

  function runInterpreter(subLines, subScope, depth = 0) {
    if (depth > 12) {
      errors.push(`Erro (Linha ${currentLineNum || "?"}): Limite de recursão excedido (stack overflow simulado).`);
      return;
    }

    const condStack = [];

    for (let i = 0; i < subLines.length; i++) {
      if (subScope.__returnValue !== undefined) {
        break;
      }

      const lineObj = subLines[i];
      currentLineNum = lineObj.lineNum;
      const line = lineObj.text;
      const indent = lineObj.indent;

      if (!line || line.startsWith("#")) continue;

      // Determine if this line should be skipped based on active conditionals
      let shouldSkip = false;
      for (const cond of condStack) {
        if (indent > cond.indent) {
          if (!cond.currentConditionMet) {
            shouldSkip = true;
            break;
          }
        }
      }

      // Pop conditions if we are back to a lower/equal indentation level
      if (line.startsWith("elif ") || line.startsWith("else")) {
        while (condStack.length > 0 && condStack[condStack.length - 1].indent > indent) {
          condStack.pop();
        }
      } else {
        while (condStack.length > 0 && condStack[condStack.length - 1].indent >= indent) {
          condStack.pop();
        }
      }

      if (shouldSkip) continue;

      // A. Function definition
      if (line.startsWith("def ")) {
        const match = line.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*:/);
        if (match) {
          const funcName = match[1];
          const params = match[2].split(",").map(p => p.trim()).filter(Boolean);
          const body = [];
          let j = i + 1;
          while (j < subLines.length && (subLines[j].text.trim() === "" || subLines[j].indent > indent)) {
            if (subLines[j].text.trim() !== "") {
              body.push(subLines[j]);
            }
            j++;
          }
          subScope.__functions = subScope.__functions || {};
          subScope.__functions[funcName] = { params, body };
          i = j - 1;
          continue;
        } else {
          errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): Definição de função incorreta. Ex: def minha_funcao(a):`);
          continue;
        }
      }

      // A.1. Class definition
      if (line.startsWith("class ")) {
        const match = line.match(/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
        if (match) {
          const className = match[1];
          const classMethods = {};
          const body = [];
          let j = i + 1;
          while (j < subLines.length && (subLines[j].text.trim() === "" || subLines[j].indent > indent)) {
            if (subLines[j].text.trim() !== "") {
              body.push(subLines[j]);
            }
            j++;
          }
          for (let k = 0; k < body.length; k++) {
            const bLineObj = body[k];
            const bLine = bLineObj.text;
            const bIndent = bLineObj.indent;
            if (bLine.startsWith("def ")) {
              const defMatch = bLine.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*:/);
              if (defMatch) {
                const methodName = defMatch[1];
                const params = defMatch[2].split(",").map(p => p.trim()).filter(Boolean);
                const methodBody = [];
                let m = k + 1;
                while (m < body.length && (body[m].text.trim() === "" || body[m].indent > bIndent)) {
                  if (body[m].text.trim() !== "") {
                    methodBody.push(body[m]);
                  }
                  m++;
                }
                classMethods[methodName] = { params, body: methodBody };
                k = m - 1;
              }
            }
          }
          subScope[className] = {
            __isClass__: true,
            className: className,
            methods: classMethods
          };
          i = j - 1;
          continue;
        } else {
          errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): Definição de classe incorreta. Ex: class Personagem:`);
          continue;
        }
      }

      // B. Conditionals (if, elif, else)
      if (line.startsWith("if ") || line.startsWith("elif ") || line.startsWith("else")) {
        if (!line.endsWith(":")) {
          errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): Falta dois-pontos ':' no final da condicional.`);
          continue;
        }

        if (line.startsWith("if ")) {
          const condExpr = line.slice(3, -1).trim();
          const isTrue = !!evaluateExpression(condExpr, subScope);
          condStack.push({
            indent: indent,
            hasExecuted: isTrue,
            currentConditionMet: isTrue
          });
        } else if (line.startsWith("elif ")) {
          const condExpr = line.slice(5, -1).trim();
          const parentCond = condStack[condStack.length - 1];
          if (!parentCond || parentCond.indent !== indent) {
            errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): 'elif' sem 'if' correspondente.`);
            continue;
          }
          if (parentCond.hasExecuted) {
            parentCond.currentConditionMet = false;
          } else {
            const isTrue = !!evaluateExpression(condExpr, subScope);
            parentCond.currentConditionMet = isTrue;
            if (isTrue) parentCond.hasExecuted = true;
          }
        } else if (line.startsWith("else")) {
          if (line.trim() !== "else:") {
            errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): O 'else' deve ser escrito apenas como 'else:'.`);
            continue;
          }
          const parentCond = condStack[condStack.length - 1];
          if (!parentCond || parentCond.indent !== indent) {
            errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): 'else' sem 'if' correspondente.`);
            continue;
          }
          if (parentCond.hasExecuted) {
            parentCond.currentConditionMet = false;
          } else {
            parentCond.currentConditionMet = true;
            parentCond.hasExecuted = true;
          }
        }
        continue;
      }

      // C. Print without parens check (Python 2 syntax)
      if (line.startsWith("print ") && !line.includes("(")) {
        errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): No Python 3, a função print() exige parênteses. Ex: print("Olá")`);
        continue;
      }

      // D. Print statement
      const printMatch = line.match(/^print\((.*)\)$/);
      if (printMatch) {
        const arg = printMatch[1].trim();
        const val = evaluateExpression(arg, subScope);
        stdout.push(String(val));
        continue;
      }

      // E. While loop
      if (line.startsWith("while ")) {
        if (!line.endsWith(":")) {
          errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): Falta dois-pontos ':' no final do 'while'.`);
          continue;
        }
        const condExpr = line.slice(5, -1).trim();
        const body = [];
        let j = i + 1;
        while (j < subLines.length && (subLines[j].text.trim() === "" || subLines[j].indent > indent)) {
          if (subLines[j].text.trim() !== "") {
            body.push(subLines[j]);
          }
          j++;
        }
        i = j - 1;

        let iterations = 0;
        const maxIterations = 500;
        while (evaluateExpression(condExpr, subScope)) {
          iterations++;
          if (iterations > maxIterations) {
            errors.push(`Erro (Linha ${lineObj.lineNum}): Loop infinito detectado no 'while' (excedeu ${maxIterations} iterações).`);
            break;
          }
          runInterpreter(body, subScope, depth + 1);
          if (errors.length > 0 || subScope.__returnValue !== undefined) break;
        }
        continue;
      }

      // F. For loop
      if (line.startsWith("for ")) {
        const match = line.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+(.+)\s*:/);
        if (!match) {
          errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): Estrutura 'for' incorreta. Ex: for x in range(5):`);
          continue;
        }
        const varName = match[1];
        const seqExpr = match[2].trim();
        const body = [];
        let j = i + 1;
        while (j < subLines.length && (subLines[j].text.trim() === "" || subLines[j].indent > indent)) {
          if (subLines[j].text.trim() !== "") {
            body.push(subLines[j]);
          }
          j++;
        }
        i = j - 1;

        let sequence = [];
        if (seqExpr.startsWith("range(")) {
          const rangeMatch = seqExpr.match(/^range\((.*)\)$/);
          if (rangeMatch) {
            const args = rangeMatch[1].split(",").map(a => evaluateExpression(a, subScope));
            let start = 0, end = 0, step = 1;
            if (args.length === 1) {
              end = Number(args[0]);
            } else if (args.length === 2) {
              start = Number(args[0]);
              end = Number(args[1]);
            } else if (args.length === 3) {
              start = Number(args[0]);
              end = Number(args[1]);
              step = Number(args[2]);
            }
            for (let k = start; step > 0 ? k < end : k > end; k += step) {
              sequence.push(k);
            }
          }
        } else {
          const val = evaluateExpression(seqExpr, subScope);
          if (Array.isArray(val)) {
            sequence = val;
          } else {
            errors.push(`Erro (Linha ${currentLineNum || "?"}): '${seqExpr}' não é uma lista ou sequência iterável.`);
            continue;
          }
        }

        for (const item of sequence) {
          subScope[varName] = item;
          runInterpreter(body, subScope, depth + 1);
          if (errors.length > 0 || subScope.__returnValue !== undefined) break;
        }
        continue;
      }

      // E.1. With open statement
      if (line.startsWith("with ")) {
        const match = line.match(/^with\s+(open\([^)]+\))\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
        if (match) {
          const openExpr = match[1];
          const varName = match[2];
          const body = [];
          let j = i + 1;
          while (j < subLines.length && (subLines[j].text.trim() === "" || subLines[j].indent > indent)) {
            if (subLines[j].text.trim() !== "") {
              body.push(subLines[j]);
            }
            j++;
          }
          i = j - 1;

          const fileObj = evaluateExpression(openExpr, subScope);
          if (fileObj && fileObj.__isFile__) {
            subScope[varName] = fileObj;
            runInterpreter(body, subScope, depth + 1);
            fileObj.closed = true;
          }
          continue;
        } else {
          errors.push(`Erro de Sintaxe (Linha ${lineObj.lineNum}): Estrutura 'with' incorreta. Ex: with open("arquivo.txt", "w") as f:`);
          continue;
        }
      }

      // E.2. Try/Except statement
      if (line === "try:") {
        const tryBody = [];
        let j = i + 1;
        while (j < subLines.length && (subLines[j].text.trim() === "" || subLines[j].indent > indent)) {
          if (subLines[j].text.trim() !== "") {
            tryBody.push(subLines[j]);
          }
          j++;
        }

        let exceptBody = [];
        let hasExcept = false;
        let nextIdx = j;
        while (nextIdx < subLines.length && subLines[nextIdx].text.trim() === "") {
          nextIdx++;
        }
        if (nextIdx < subLines.length && subLines[nextIdx].indent === indent && subLines[nextIdx].text.startsWith("except")) {
          hasExcept = true;
          let k = nextIdx + 1;
          while (k < subLines.length && (subLines[k].text.trim() === "" || subLines[k].indent > indent)) {
            if (subLines[k].text.trim() !== "") {
              exceptBody.push(subLines[k]);
            }
            k++;
          }
          j = k;
        }
        i = j - 1;

        const originalErrorCount = errors.length;
        runInterpreter(tryBody, subScope, depth + 1);

        if (errors.length > originalErrorCount) {
          errors.splice(originalErrorCount);
          if (hasExcept) {
            runInterpreter(exceptBody, subScope, depth + 1);
          }
        }
        continue;
      }

      // G. Standalone object method call (e.g. mochila.append("espada") or f.write("Link"))
      const methodMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
      if (methodMatch) {
        const varName = methodMatch[1];
        const methodName = methodMatch[2];
        const rawArgs = methodMatch[3].split(",").map(a => a.trim()).filter(Boolean);
        const targetObj = subScope[varName];

        if (targetObj !== undefined) {
          const args = rawArgs.map(a => evaluateExpression(a, subScope));
          if (Array.isArray(targetObj)) {
            if (methodName === "append") {
              targetObj.push(args[0]);
              continue;
            } else if (methodName === "remove") {
              const idx = targetObj.indexOf(args[0]);
              if (idx !== -1) {
                targetObj.splice(idx, 1);
              }
              continue;
            } else if (methodName === "pop") {
              targetObj.pop();
              continue;
            }
          } else if (targetObj.__isFile__) {
            if (targetObj.closed) {
              errors.push(`Erro (Linha ${currentLineNum || "?"}): Operação em arquivo fechado '${targetObj.filename}'.`);
              continue;
            }
            if (methodName === "write") {
              const text = args[0] !== undefined ? String(args[0]) : "";
              scope.__vfs = scope.__vfs || {};
              if (targetObj.mode === "w") {
                scope.__vfs[targetObj.filename] = text;
              } else if (targetObj.mode === "a") {
                scope.__vfs[targetObj.filename] = (scope.__vfs[targetObj.filename] || "") + text;
              }
              continue;
            } else if (methodName === "close") {
              targetObj.closed = true;
              continue;
            }
          } else if (targetObj.__isInstance__) {
            const method = targetObj.__class__.methods[methodName];
            if (method) {
              const methodScope = Object.create(subScope);
              methodScope["self"] = targetObj;
              let argIdx = 0;
              method.params.forEach(param => {
                if (param === "self") {
                  methodScope["self"] = targetObj;
                } else {
                  methodScope[param] = args[argIdx++];
                }
              });
              runInterpreter(method.body, methodScope, depth + 1);
              continue;
            }
          }
        }
      }

      // H. Index/Key assignment (e.g. jogador["hp"] = 90)
      const keyAssignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.*)\]\s*=\s*(.+)$/);
      if (keyAssignmentMatch) {
        const varName = keyAssignmentMatch[1];
        const keyExpr = keyAssignmentMatch[2].trim();
        const rawVal = keyAssignmentMatch[3].trim();
        const dictOrList = subScope[varName];
        if (dictOrList !== undefined) {
          const key = evaluateExpression(keyExpr, subScope);
          const val = evaluateExpression(rawVal, subScope);
          dictOrList[key] = val;
          continue;
        }
      }

      // H.1. Property assignment (e.g. self.nome = nome)
      const propAssignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (propAssignmentMatch) {
        const objName = propAssignmentMatch[1];
        const propName = propAssignmentMatch[2];
        const rawVal = propAssignmentMatch[3].trim();
        const obj = subScope[objName];
        if (obj !== undefined) {
          const val = evaluateExpression(rawVal, subScope);
          obj[propName] = val;
          continue;
        }
      }

      // I. Standalone function call
      const callMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
      if (callMatch) {
        const funcName = callMatch[1];
        const rawArgs = callMatch[2].split(",").map(a => a.trim()).filter(Boolean);

        let targetFunc = null;
        let currScope = subScope;
        while (currScope) {
          if (currScope.__functions && currScope.__functions[funcName]) {
            targetFunc = currScope.__functions[funcName];
            break;
          }
          currScope = Object.getPrototypeOf(currScope);
        }

        if (!targetFunc && scope.__functions && scope.__functions[funcName]) {
          targetFunc = scope.__functions[funcName];
        }

        if (targetFunc) {
          const args = rawArgs.map(a => evaluateExpression(a, subScope));
          const localScope = Object.create(subScope);
          targetFunc.params.forEach((param, idx) => {
            localScope[param] = args[idx] !== undefined ? args[idx] : null;
          });
          runInterpreter(targetFunc.body, localScope, depth + 1);
          continue;
        }
      }

      // J. Variable assignment
      const assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignmentMatch) {
        const varName = assignmentMatch[1];
        const rawVal = assignmentMatch[2].trim();
        subScope[varName] = evaluateExpression(rawVal, subScope);
        continue;
      }

      // J.1. Return statement
      if (line.startsWith("return ") || line === "return") {
        const exprToReturn = line.startsWith("return ") ? line.slice(7).trim() : "None";
        subScope.__returnValue = exprToReturn === "None" ? null : evaluateExpression(exprToReturn, subScope);
        continue;
      }
    }
  }

  runInterpreter(linesList, scope, 0);

  return { variables: scope, stdout, errors };
}

// ─── OFFLINE PEDAGOGICAL TEST RUNNER ─────────────────────────────────────────

export function evaluatePythonLocally(levelId, code) {
  const clean = code.replace(/#.*$/gm, "").trim();
  const run = runSimulatedPython(code);

  if (run.errors.length > 0) {
    return {
      aprovado: false,
      nota: 0,
      feedback: run.errors[0],
      dica: "Ajuste a sintaxe ou a grafia antes de enviar!"
    };
  }

  // Level 7: Hero Profile Challenge
  if (levelId === 7) {
    const hasNome = run.variables.nome === "Link";
    const hasMoedas = Number(run.variables.moedas) === 50;
    const printedNome = run.stdout.includes("Link");
    const printedMoedas = run.stdout.some(s => s === "50" || s === "50.0");

    if (!hasNome) {
      return {
        aprovado: false,
        nota: 30,
        feedback: "Ops! Não encontrei a variável 'nome' guardando o valor 'Link'.",
        dica: "Verifique se escreveu: nome = \"Link\" (com L maiúsculo e aspas)."
      };
    }
    if (!hasMoedas) {
      return {
        aprovado: false,
        nota: 50,
        feedback: "Muito bem com o nome, mas a variável 'moedas' precisa guardar o número inteiro 50.",
        dica: "Escreva: moedas = 50 (números inteiros não usam aspas!)."
      };
    }
    if (!printedNome || !printedMoedas) {
      return {
        aprovado: false,
        nota: 70,
        feedback: "As variáveis foram criadas corretamente! Mas você esqueceu de exibi-las.",
        dica: "Use print(nome) e print(moedas) nas últimas linhas para que apareçam na tela."
      };
    }

    return {
      aprovado: true,
      nota: 100,
      feedback: "Excelente! Você declarou a string 'nome', o inteiro 'moedas' e imprimiu ambos com perfeição! O herói Link está pronto! 🏆",
      dica: "Continue assim! O próximo nível aborda tomada de decisões com o comando 'if'."
    };
  }

  // Level 15: Fever Scaler Challenge
  if (levelId === 15) {
    const hasTempVar = run.variables.temperatura !== undefined;
    const hasIf = /\bif\b/.test(clean);
    const hasElif = /\belif\b/.test(clean);
    const hasElse = /\belse\b/.test(clean);

    const hasFebre = /print\s*\(\s*(["'])Febre\1\s*\)/i.test(clean);
    const hasSubfebril = /print\s*\(\s*(["'])Subfebril\1\s*\)/i.test(clean);
    const hasNormal = /print\s*\(\s*(["'])Normal\1\s*\)/i.test(clean);

    if (!hasTempVar) {
      return {
        aprovado: false,
        nota: 20,
        feedback: "Você declarou a variável 'temperatura'? Ela é necessária para testar o sistema.",
        dica: "Adicione na primeira linha: temperatura = 38.2"
      };
    }

    if (!hasIf) {
      return {
        aprovado: false,
        nota: 40,
        feedback: "Para testar as condições, precisamos começar a estrutura com 'if'.",
        dica: "Use: if temperatura >= 37.8: e indente o print correspondente."
      };
    }

    if (!hasElif) {
      return {
        aprovado: false,
        nota: 60,
        feedback: "Lembre-se de utilizar a palavra-chave 'elif' para verificar o estado 'Subfebril'.",
        dica: "Use: elif temperatura >= 37.0: (pois o if anterior já capturou temperaturas maiores ou iguais a 37.8)."
      };
    }

    if (!hasElse) {
      return {
        aprovado: false,
        nota: 70,
        feedback: "Você esqueceu de tratar a temperatura saudável. Precisamos de uma cláusula 'else:' no final.",
        dica: "Use: else: na mesma linha de recuo do if principal."
      };
    }

    if (!hasFebre || !hasSubfebril || !hasNormal) {
      return {
        aprovado: false,
        nota: 80,
        feedback: "Suas condições estão estruturadas, mas certifique-se de usar print() para exibir exatamente 'Febre', 'Subfebril' e 'Normal'.",
        dica: "Escreva as palavras exatamente como solicitadas, incluindo maiúsculas."
      };
    }

    // Double check indentation logic
    const linesOfCode = clean.split("\n");
    let indentationError = false;
    for (let i = 0; i < linesOfCode.length; i++) {
      const l = linesOfCode[i];
      if (l.startsWith("if") || l.startsWith("elif") || l.startsWith("else")) {
        let nextLineIndex = i + 1;
        while (nextLineIndex < linesOfCode.length && linesOfCode[nextLineIndex].trim() === "") {
          nextLineIndex++;
        }
        const nextLine = linesOfCode[nextLineIndex];
        if (nextLine && !nextLine.startsWith(" ") && !nextLine.startsWith("\t")) {
          indentationError = true;
          break;
        }
      }
    }

    if (indentationError) {
      return {
        aprovado: false,
        nota: 85,
        feedback: "Cuidado com o espaçamento! Em Python, as linhas dentro de condicionais PRECISAM de 4 espaços à esquerda.",
        dica: "Adicione espaços na frente das linhas do print(). Ex:\nif condicao:\n    print(...)"
      };
    }

    return {
      aprovado: true,
      nota: 100,
      feedback: "Brilhante! Você construiu uma balança de febre médica completa usando if, elif e else, respeitando todas as indentações! 🎓🏥",
      dica: "Você completou a jornada de introdução às condicionais!"
    };
  }

  // Level 22: Master Calculator / Damage Multiplier Challenge
  if (levelId === 22) {
    const hasDef = /\bdef\s+calcular_dano\s*\(\s*base\s*,\s*bonus\s*\)\s*:/i.test(clean);
    const hasCall = /\bcalcular_dano\s*\(\s*50\s*,\s*15\s*\)/i.test(clean);
    const printedDano = run.stdout.includes("65") || run.stdout.includes("65.0") || run.stdout.some(s => s.trim() === "65");

    if (!hasDef) {
      return {
        aprovado: false,
        nota: 30,
        feedback: "Ops! Não encontrei a definição da função 'calcular_dano(base, bonus)'.",
        dica: "Escreva: def calcular_dano(base, bonus): (não esqueça dos dois pontos!)."
      };
    }

    if (!hasCall) {
      return {
        aprovado: false,
        nota: 60,
        feedback: "A função foi definida corretamente! Mas você precisa chamá-la passando os valores 50 e 15.",
        dica: "Fora do bloco def, escreva: calcular_dano(50, 15)"
      };
    }

    if (!printedDano) {
      return {
        aprovado: false,
        nota: 80,
        feedback: "A chamada foi feita, mas a função precisa imprimir o resultado do dano total (base + bonus).",
        dica: "Dentro da função, use: print(base + bonus) (e certifique-se de usar 4 espaços de indentação!)."
      };
    }

    return {
      aprovado: true,
      nota: 100,
      feedback: "Extraordinário! Você definiu a função calcular_dano, passou os parâmetros e obteve a soma com perfeição! Você alcançou o nível lendário de Python! 🏆🔥",
      dica: "Parabéns por concluir toda a trilha sinuosa do Módulo 2!"
    };
  }

  // Level 26: Dungeon Hero OOP Challenge
  if (levelId === 26) {
    const hasClass = /\bclass\s+Heroi\b/.test(clean);
    const hasInit = /\bdef\s+__init__\s*\(\s*self\s*,\s*nome\s*,\s*hp\s*\)\s*:/i.test(clean);
    const hasAtacar = /\bdef\s+atacar\s*\(\s*self\s*\)\s*:/i.test(clean);
    const hasInst = /\bh\s*=\s*Heroi\s*\(\s*(["'])Aragorn\1\s*,\s*100\s*\)/i.test(clean);
    const hasCall = /\bh\s*\.\s*atacar\s*\(\s*\)/i.test(clean);
    const printedAtack = run.stdout.includes("Aragorn atacou!") || run.stdout.some(s => s.trim() === "Aragorn atacou!");

    if (!hasClass) {
      return {
        aprovado: false,
        nota: 20,
        feedback: "Não encontrei a definição da classe 'Heroi'.",
        dica: "Escreva: class Heroi: (com 'H' maiúsculo e dois pontos no final)."
      };
    }
    if (!hasInit) {
      return {
        aprovado: false,
        nota: 40,
        feedback: "Certifique-se de definir o construtor '__init__' com os parâmetros self, nome e hp.",
        dica: "Escreva dentro da classe: def __init__(self, nome, hp):"
      };
    }
    if (!hasAtacar) {
      return {
        aprovado: false,
        nota: 60,
        feedback: "A classe precisa do método 'atacar(self)' que imprime o ataque.",
        dica: "Use: def atacar(self): e indente a linha de print com self.nome."
      };
    }
    if (!hasInst) {
      return {
        aprovado: false,
        nota: 70,
        feedback: "Você precisa criar a instância do herói chamada 'h' passando 'Aragorn' e 100.",
        dica: "Fora da classe, escreva: h = Heroi(\"Aragorn\", 100)"
      };
    }
    if (!hasCall) {
      return {
        aprovado: false,
        nota: 80,
        feedback: "Você esqueceu de fazer o herói atacar no final do script.",
        dica: "Adicione na última linha: h.atacar()"
      };
    }
    if (!printedAtack) {
      return {
        aprovado: false,
        nota: 90,
        feedback: "A chamada foi feita, mas o método atacar(self) precisa exibir a mensagem 'Aragorn atacou!'.",
        dica: "Dentro de atacar(self), utilize: print(self.nome + \" atacou!\")"
      };
    }

    return {
      aprovado: true,
      nota: 100,
      feedback: "Brilhante! Você construiu sua primeira classe em Python, inicializou as propriedades do herói e disparou a ação de ataque com maestria! O Aragorn está pronto para a masmorra! ⚔️🏰",
      dica: "Excelente! Agora avançaremos para o tratamento de erros em Python."
    };
  }

  // Level 30: NPC Generator (Files and OOP)
  if (levelId === 30) {
    const hasClass = /\bclass\s+Npc\b/.test(clean);
    const hasInit = /\bdef\s+__init__\s*\(\s*self\s*,\s*nome\s*,\s*classe\s*\)\s*:/i.test(clean);
    const hasSalvar = /\bdef\s+salvar\s*\(\s*self\s*\)\s*:/i.test(clean);
    const hasWith = /\bwith\s+open\s*\(\s*(["'])npc\.txt\1\s*,\s*(["'])w\2\s*\)\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*\s*:/i.test(clean);
    const hasInst = /\bnpc\s*=\s*Npc\s*\(\s*(["'])Gimli\1\s*,\s*(["'])Guerreiro\2\s*\)/i.test(clean);
    const hasCall = /\bnpc\s*\.\s*salvar\s*\(\s*\)/i.test(clean);
    const fileWritten = run.variables.__vfs && run.variables.__vfs["npc.txt"] !== undefined;
    const fileContentCorrect = fileWritten && run.variables.__vfs["npc.txt"].trim() === "Gimli - Guerreiro";

    if (!hasClass) {
      return {
        aprovado: false,
        nota: 20,
        feedback: "Não encontrei a definição da classe 'Npc'.",
        dica: "Escreva: class Npc: (com 'N' maiúsculo e dois pontos no final)."
      };
    }
    if (!hasInit) {
      return {
        aprovado: false,
        nota: 40,
        feedback: "Certifique-se de definir o construtor '__init__' com os parâmetros self, nome e classe.",
        dica: "Escreva dentro da classe: def __init__(self, nome, classe):"
      };
    }
    if (!hasSalvar) {
      return {
        aprovado: false,
        nota: 50,
        feedback: "A classe precisa do método 'salvar(self)' para salvar as informações no arquivo.",
        dica: "Escreva dentro da classe: def salvar(self):"
      };
    }
    if (!hasWith) {
      return {
        aprovado: false,
        nota: 65,
        feedback: "O método salvar(self) precisa abrir o arquivo 'npc.txt' no modo 'w' usando o gerenciador de contexto 'with open'.",
        dica: "Dentro de salvar(self), use: with open(\"npc.txt\", \"w\") as f:"
      };
    }
    if (!hasInst) {
      return {
        aprovado: false,
        nota: 75,
        feedback: "Você precisa criar a instância do NPC chamada 'npc' passando 'Gimli' e 'Guerreiro'.",
        dica: "Fora da classe, escreva: npc = Npc(\"Gimli\", \"Guerreiro\")"
      };
    }
    if (!hasCall) {
      return {
        aprovado: false,
        nota: 85,
        feedback: "Você esqueceu de fazer o npc se salvar no final do script.",
        dica: "Adicione na última linha: npc.salvar()"
      };
    }
    if (!fileWritten) {
      return {
        aprovado: false,
        nota: 90,
        feedback: "A gravação do arquivo falhou. O arquivo 'npc.txt' não foi gerado no sistema virtual.",
        dica: "Certifique-se de usar f.write(self.nome + \" - \" + self.classe) dentro do bloco with!"
      };
    }
    if (!fileContentCorrect) {
      return {
        aprovado: false,
        nota: 95,
        feedback: "O arquivo foi gravado, mas seu conteúdo está incorreto. Ele deve conter exatamente: 'Gimli - Guerreiro'.",
        dica: "Use f.write(self.nome + \" - \" + self.classe) para formatar a string perfeitamente!"
      };
    }

    return {
      aprovado: true,
      nota: 100,
      feedback: "Lendário! Você concluiu a última masmorra do PyQuest 2.0! Conseguiu unir POO e manipulação de arquivos VFS criando um gerador e salvando o anão Gimli com perfeição! 🏆🛡️⚒️",
      dica: "Parabéns por concluir toda a jornada avançada de programação com Python!"
    };
  }

  return { aprovado: false, nota: 0, feedback: "Exercício não mapeado", dica: null };
}
