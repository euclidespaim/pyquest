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

  const scope = {};
  const stdout = [];
  const errors = [];

  function evaluateExpression(expr, localScope) {
    expr = expr.trim();
    if (!expr) return "";

    // 1. Handle "or"
    if (expr.includes(" or ")) {
      const parts = expr.split(" or ");
      return parts.some(p => evaluateExpression(p, localScope));
    }

    // 2. Handle "and"
    if (expr.includes(" and ")) {
      const parts = expr.split(" and ");
      return parts.every(p => evaluateExpression(p, localScope));
    }

    // 3. Handle comparisons (==, !=, >=, <=, >, <)
    const cmpMatch = expr.match(/(.+?)(==|!=|>=|<=|>|<)(.+)/);
    if (cmpMatch) {
      const left = evaluateExpression(cmpMatch[1], localScope);
      const op = cmpMatch[2].trim();
      const right = evaluateExpression(cmpMatch[3], localScope);
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
    if (expr.includes("+") && !expr.startsWith('"') && !expr.startsWith("'")) {
      const parts = expr.split("+");
      const left = evaluateExpression(parts[0], localScope);
      const right = evaluateExpression(parts[1], localScope);
      if (typeof left === "string" || typeof right === "string") {
        return String(left) + String(right);
      }
      return Number(left) + Number(right);
    }
    if (expr.includes("-") && !expr.startsWith('"') && !expr.startsWith("'") && !/^-?\d+(\.\d+)?$/.test(expr)) {
      const parts = expr.split("-");
      const left = evaluateExpression(parts[0], localScope);
      const right = evaluateExpression(parts[1], localScope);
      return Number(left) - Number(right);
    }

    // 5. Primitives
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }
    if (expr === "True") return true;
    if (expr === "False") return false;
    if (!isNaN(expr) && expr !== "") return Number(expr);

    // 6. Variable lookup
    if (localScope[expr] !== undefined) {
      return localScope[expr];
    }

    return expr;
  }

  function runInterpreter(subLines, subScope, depth = 0) {
    if (depth > 12) {
      errors.push("Erro: Limite de recursão excedido (stack overflow simulado).");
      return;
    }

    const condStack = [];

    for (let i = 0; i < subLines.length; i++) {
      const lineObj = subLines[i];
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

      // E. Standalone function call
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

      // F. Variable assignment
      const assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignmentMatch) {
        const varName = assignmentMatch[1];
        const rawVal = assignmentMatch[2].trim();
        subScope[varName] = evaluateExpression(rawVal, subScope);
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

  // Level 18: Master Calculator Challenge
  if (levelId === 18) {
    const hasDef = /\bdef\s+somar\s*\(\s*a\s*,\s*b\s*\)\s*:/i.test(clean);
    const hasCall = /\bsomar\s*\(\s*10\s*,\s*20\s*\)/i.test(clean);
    const printedSoma = run.stdout.includes("30") || run.stdout.includes("30.0") || run.stdout.some(s => s.trim() === "30");

    if (!hasDef) {
      return {
        aprovado: false,
        nota: 30,
        feedback: "Ops! Não encontrei a definição da função 'somar(a, b)'.",
        dica: "Escreva: def somar(a, b): (não esqueça dos dois pontos!)."
      };
    }

    if (!hasCall) {
      return {
        aprovado: false,
        nota: 60,
        feedback: "A função foi definida corretamente! Mas você precisa chamá-la passando os valores 10 e 20.",
        dica: "Fora do bloco def, escreva: somar(10, 20)"
      };
    }

    if (!printedSoma) {
      return {
        aprovado: false,
        nota: 80,
        feedback: "A chamada foi feita, mas a função precisa imprimir o resultado da soma de a + b.",
        dica: "Dentro da função, use: print(a + b) (e certifique-se de usar 4 espaços de indentação!)."
      };
    }

    return {
      aprovado: true,
      nota: 100,
      feedback: "Extraordinário! Você definiu uma função parametrizada nativa, passou argumentos de forma correta e obteve a soma com perfeição! Você alcançou o nível lendário de Python! 🏆🔥",
      dica: "Parabéns por concluir toda a trilha sinuosa do PyQuest!"
    };
  }

  return { aprovado: false, nota: 0, feedback: "Exercício não mapeado", dica: null };
}
