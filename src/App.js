import { useState, useEffect } from "react";

// ─── AUDIO SYNTHESIZER FOR GAMIFICATION ──────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === "success") {
      // Elegant arpeggio: C5 -> E5 -> G5 -> C6
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "error") {
      // Deep warning buzz
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "click") {
      // Soft button click sound
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    console.log("Web Audio blocked or not supported yet: ", e);
  }
}

// ─── CURRICULUM BANK: 15 SEQUENTIAL PATH LEVELS ──────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    title: "1. Guardando Dados",
    topic: "Variáveis & Tipos",
    type: "fill",
    xp: 15,
    theory: "Variáveis são como **caixas organizadoras** na memória do computador. Cada caixa tem um **nome** (rótulo) e guarda um **valor** (conteúdo).\n\nPara guardar algo em uma variável, usamos o símbolo de igual `=` (chamado de operador de atribuição).\n\n**Exemplo:**\n```python\nidade = 15\n```\nNo exemplo acima, criamos uma caixa chamada `idade` e guardamos o número `15` dentro dela.",
    code: "linguagem = ___",
    answer: "Python",
    placeholder: "Complete com \"Python\" (com aspas)",
    hint: "Insira o nome da linguagem de programação que estamos estudando entre aspas duplas, por exemplo: \"Python\""
  },
  {
    id: 2,
    title: "2. Regras de Nomeação",
    topic: "Variáveis & Tipos",
    type: "quiz",
    xp: 10,
    theory: "No Python, existem algumas regras importantes para dar nome às variáveis:\n- Deve começar com uma **letra** ou underline `_`.\n- **Não** pode começar com números.\n- **Não** pode conter espaços (use `_` para separar palavras, estilo *snake_case*).\n- **Não** pode conter caracteres especiais como `$`, `%`, `@`.\n\n**Exemplo de nomes válidos:** `nome_aluno`, `x`, `nota2`.\n**Exemplo de nomes inválidos:** `1nota`, `nome aluno`, `preco$`",
    question: "Qual dos seguintes nomes de variável é VÁLIDO no Python?",
    options: ["1valor", "preco total", "nome_do_player", "moedas$"],
    answer: 2,
    explanation: "nome_do_player usa apenas letras e underlines, respeitando perfeitamente as regras de nomenclatura do Python!"
  },
  {
    id: 3,
    title: "3. Números Inteiros (int)",
    topic: "Variáveis & Tipos",
    type: "quiz",
    xp: 10,
    theory: "Em Python, os números sem casa decimal são do tipo **inteiro** (`int`).\n\nEles podem ser positivos, negativos ou zero.\n\n**Exemplo:**\n```python\nvidas = 3\npontos = 150\ntemperatura = -5\n```\nO Python descobre o tipo automaticamente! Se você digitar um número sem ponto, a variável será do tipo `int`.",
    question: "Se declararmos a variável x = 2026, qual será o tipo de dado de x?",
    options: ["float (decimal)", "str (texto)", "int (inteiro)", "bool (booleano)"],
    answer: 2,
    explanation: "Como 2026 é um número inteiro sem ponto decimal, seu tipo no Python é classificado como 'int'."
  },
  {
    id: 4,
    title: "4. Números Decimais (float)",
    topic: "Variáveis & Tipos",
    type: "fill",
    xp: 15,
    theory: "Números com casas decimais (números quebrados) são chamados de **float** (ponto flutuante).\n\n**Importante:** No Python e na programação, usamos **ponto `.`** e não vírgula `,` para separar a parte decimal!\n\n**Exemplo:**\n```python\npreco = 4.99   # Correto!\naltura = 1,75  # Erro de sintaxe!\n```\nSempre utilize o ponto para números quebrados.",
    code: "nota = ___",
    answer: "8.5",
    placeholder: "Complete com o decimal 8.5",
    hint: "Declare a variável nota com o valor decimal oito e meio usando o ponto decimal."
  },
  {
    id: 5,
    title: "5. Textos e Palavras (str)",
    topic: "Variáveis & Tipos",
    type: "quiz",
    xp: 10,
    theory: "Textos e palavras são chamados de **strings** (`str`) em Python.\n\nPara que o Python diferencie textos de comandos do programa, devemos colocá-los obrigatoriamente entre **aspas simples** (`'`) ou **aspas duplas** (`\"`).\n\n**Exemplo:**\n```python\nescola = \"Senai\"\ncidade = 'São Paulo'\n```\nSe você esquecer de colocar as aspas, o Python pensará que é uma variável ou comando inexistente e dará um erro!",
    question: "Qual das opções abaixo é uma declaração de string válida no Python?",
    options: ["escola = Etec", "escola = 'Etec'", "escola = [Etec]", "escola = (Etec)"],
    answer: 1,
    explanation: "'Etec' está corretamente envolvido em aspas simples, definindo uma string válida."
  },
  {
    id: 6,
    title: "6. Valores Lógicos (bool)",
    topic: "Variáveis & Tipos",
    type: "quiz",
    xp: 10,
    theory: "O tipo booleano (`bool`) guarda apenas duas respostas lógicas possíveis:\n- `True` (Verdadeiro)\n- `False` (Falso)\n\n**Atenção extrema:** No Python, a primeira letra **deve ser maiúscula**! `true` e `false` com letras minúsculas causarão erros.\n\n**Exemplo:**\n```python\njogo_ativo = True\ntem_energia = False\n```",
    question: "Qual é a forma correta de declarar que uma variável chamada 'passou' é verdadeira em Python?",
    options: ["passou = true", "passou = True", "passou = \"True\"", "passou = TRUE"],
    answer: 1,
    explanation: "True (com T maiúsculo e sem aspas) é a palavra-chave booleana verdadeira nativa do Python."
  },
  {
    id: 7,
    title: "7. Desafio: A Ficha do Herói",
    topic: "Variáveis & Tipos",
    type: "challenge",
    xp: 30,
    theory: "Chegou a hora do seu primeiro grande desafio prático! Vamos usar a função `print()` para exibir dados na tela (o nosso \"Terminal\").\n\n**Exemplo de saída:**\n```python\nprint(\"Olá mundo!\")\n```\nVocê também pode colocar o nome de uma variável dentro dos parênteses do `print()` para exibir seu valor!\n\n**Desafio:** Crie uma variável chamada `nome` e guarde o texto `\"Link\"` nela. Depois, crie uma variável `moedas` e guarde o número inteiro `50`. Por fim, exiba o nome e as moedas no terminal usando `print(nome)` e `print(moedas)` em linhas separadas.",
    placeholder: "# 1. Crie a variável nome com o texto \"Link\"\nnome = \"Link\"\n\n# 2. Crie a variável moedas com o valor 50\nmoedas = 50\n\n# 3. Use a função print() para exibir as duas variáveis\n",
    hint: "Escreva:\nprint(nome)\nprint(moedas)"
  },
  {
    id: 8,
    title: "8. Decisões com if",
    topic: "Condicionais",
    type: "fill",
    xp: 15,
    theory: "Na programação, tomamos decisões usando o comando **`if`** (que significa \"se\" em inglês).\n\nEle verifica uma condição. Se for verdadeira, executa o bloco de código logo abaixo.\n\n**Sintaxe importante:**\n1. Usamos dois pontos `:` no final da linha do `if`.\n2. O código de dentro do `if` deve ter um recuo de **4 espaços** (chamado de **indentação**). O Python usa esse espaço para saber o que está dentro do bloco.\n\n```python\nif idade >= 18:\n    print(\"Maior de idade\")\n```",
    code: "___ idade >= 16:\n    print(\"Pode votar\")",
    answer: "if",
    placeholder: "Complete com a condicional se",
    hint: "Palavra-chave que inicia a estrutura de decisão condicional (\"se\" em inglês)."
  },
  {
    id: 9,
    title: "9. Igualdade vs Atribuição",
    topic: "Condicionais",
    type: "quiz",
    xp: 10,
    theory: "Um erro muito comum de iniciantes é confundir `=` com `==`:\n- Um único igual `=` é usado para **guardar** (atribuir) um valor em uma variável. Ex: `pontos = 10`.\n- Dois iguais `==` são usados para **comparar** se dois valores são iguais. Ex: `if pontos == 10:`.\n\n**Exemplo:**\n```python\n# Guardando o valor\nsupremo = \"Python\"\n\n# Comparando o valor\nif supremo == \"Python\":\n    print(\"Sim!\")\n```",
    question: "Qual dos seguintes códigos compara corretamente se a variável 'cor' é igual a 'verde'?",
    options: ["if cor = 'verde':", "if cor == 'verde'", "if cor == 'verde':", "if cor === 'verde':"],
    answer: 2,
    explanation: "Usa == para comparação, fecha com : no final da linha, e usa aspas corretas para a string verde."
  },
  {
    id: 10,
    title: "10. O Caso Contrário (else)",
    topic: "Condicionais",
    type: "fill",
    xp: 15,
    theory: "O que fazemos quando a condição do `if` é falsa? Usamos o **`else`** (que significa \"caso contrário\").\n\nO bloco dentro do `else` roda **apenas** quando a condição do `if` falha (dá False).\n\n**Sintaxe:** O `else` **não** recebe uma condição de teste e termina com dois pontos `:`.\n\n```python\nif nota >= 6.0:\n    print(\"Aprovado\")\nelse:\n    print(\"Reprovado\")\n```",
    code: "if nota >= 6:\n    print(\"Aprovado\")\n___:\n    print(\"Reprovado\")",
    answer: "else",
    placeholder: "Complete com o senão",
    hint: "A palavra-chave para \"caso contrário\" em inglês."
  },
  {
    id: 11,
    title: "11. Mais Opções com elif",
    topic: "Condicionais",
    type: "quiz",
    xp: 10,
    theory: "E se tivermos mais do que apenas duas opções? E se quisermos testar várias condições em ordem?\n\nUsamos o **`elif`** (abreviação de *else if*, ou \"senão se\"). Ele testa uma nova condição caso a anterior seja falsa.\n\nVocê pode usar quantos `elif` quiser entre o `if` e o `else`!\n\n**Exemplo:**\n```python\nif sinal == \"verde\":\n    print(\"Siga\")\nelif sinal == \"amarelo\":\n    print(\"Atenção\")\nelse:\n    print(\"Pare\")\n```",
    question: "Qual a palavra-chave correta no Python para testar uma condição alternativa caso o primeiro 'if' falhe?",
    options: ["else if", "elseif", "elif", "otherwise"],
    answer: 2,
    explanation: "elif é a contração padrão do Python para 'else if'."
  },
  {
    id: 12,
    title: "12. Operadores de Comparação",
    topic: "Condicionais",
    type: "quiz",
    xp: 10,
    theory: "Podemos comparar números usando os seguintes operadores:\n- `>` (maior que)\n- `<` (menor que)\n- `>=` (maior ou igual a)\n- `<=` (menor ou igual a)\n- `!=` (diferente de)\n\n**Exemplo:**\n```python\nif saldo < 0:\n    print(\"Conta no vermelho!\")\n```",
    question: "O que o seguinte programa exibirá no console?\n\nidade = 15\nif idade >= 18:\n    print(\"Adulto\")\nelse:\n    print(\"Jovem\")",
    options: ["Adulto", "Jovem", "Erro de Sintaxe", "Nada"],
    answer: 1,
    explanation: "Como idade (15) não é maior ou igual a 18, a condição do if é falsa, rodando o bloco do else que imprime 'Jovem'."
  },
  {
    id: 13,
    title: "13. O Operador Lógico and",
    topic: "Condicionais",
    type: "quiz",
    xp: 10,
    theory: "Às vezes, precisamos testar **duas condições ao mesmo tempo**. O operador **`and`** (e) exige que **ambas** sejam verdadeiras.\n\nSe apenas uma for falsa, todo o teste falha!\n\n**Exemplo:**\n```python\nif tem_ingresso and tem_documento:\n    print(\"Pode entrar no show!\")\n```",
    question: "Qual é o resultado lógico da seguinte linha de teste?\n\n10 > 5 and 3 > 8",
    options: ["True", "False", "Error", "None"],
    answer: 1,
    explanation: "10 > 5 é True, mas 3 > 8 é False. Como o operador é 'and', ambos precisavam ser True. O resultado final é False."
  },
  {
    id: 14,
    title: "14. O Operador Lógico or",
    topic: "Condicionais",
    type: "quiz",
    xp: 10,
    theory: "O operador **`or`** (ou) exige que **apenas uma** das condições seja verdadeira para que todo o teste passe!\n\nEle só dará falso se **todas** as condições forem falsas.\n\n**Exemplo:**\n```python\nif sabado or domingo:\n    print(\"Dia de descansar!\")\n```",
    question: "Qual é o resultado da expressão: 5 > 20 or 10 < 100 ?",
    options: ["True", "False", "Error", "None"],
    answer: 0,
    explanation: "5 > 20 é False, mas 10 < 100 é True. Com o operador 'or', ter uma verdadeira é suficiente. Logo, o resultado é True."
  },
  {
    id: 15,
    title: "15. Desafio Final: A Balança da Febre",
    topic: "Condicionais",
    type: "challenge",
    xp: 40,
    theory: "Parabéns por chegar ao último nível da trilha! Vamos combinar tudo o que você aprendeu em um sistema real.\n\nImagine que estamos criando um termômetro inteligente.\n\n**Desafio:**\nCrie uma variável chamada `temperatura` e coloque nela o valor `38.2` (representando a febre do paciente).\n\nDepois, escreva uma estrutura condicional para avaliar a temperatura:\n- Se a temperatura for **maior ou igual a 37.8**, exiba `\"Febre\"` usando o `print`.\n- Se a temperatura estiver **entre 37.0 e 37.7** (inclusive), exiba `\"Subfebril\"`.\n- Caso contrário (menor que 37.0), exiba `\"Normal\"`.\n\n*Dica de Sintaxe:* No Python, você pode usar `elif temperatura >= 37.0 and temperatura <= 37.7:` ou simplesmente `elif temperatura >= 37.0:` (pois o `if` anterior já capturou temperaturas maiores ou iguais a 37.8). Não se esqueça dos dois pontos `:` e dos 4 espaços de indentação!",
    placeholder: "# 1. Declare a variável temperatura com o valor 38.2\ntemperatura = 38.2\n\n# 2. Escreva as condicionais if, elif e else abaixo\n",
    hint: "Escreva:\nif temperatura >= 37.8:\n    print(\"Febre\")\nelif temperatura >= 37.0:\n    print(\"Subfebril\")\nelse:\n    print(\"Normal\")"
  }
];

const BADGES = [
  { id: "primeiros_passos", name: "Primeiros Passos", icon: "🐣", desc: "Completou o nível 1 e deu partida na jornada!", criteria: (comp) => comp["1"] === "correct" },
  { id: "var_expert", name: "Mestre das Caixas", icon: "📦", desc: "Completou todos os 7 primeiros níveis sobre Variáveis e Tipos.", criteria: (comp) => Array.from({ length: 7 }, (_, i) => i + 1).every(id => comp[id] === "correct") },
  { id: "decision_maker", name: "Tomador de Decisão", icon: "⚖️", desc: "Completou os primeiros desafios de condicionais (Nível 8, 9 e 10).", criteria: (comp) => ["8", "9", "10"].every(id => comp[id] === "correct") },
  { id: "streak_3", name: "Fogo no Cérebro", icon: "🔥", desc: "Acertou 3 ou mais questões seguidas!", criteria: (_, streak) => streak >= 3 },
  { id: "pythonista_supremo", name: "Mestre da Febre", icon: "🐍", desc: "Venceu o desafio final da Balança da Febre (Nível 15).", criteria: (comp) => comp["15"] === "correct" }
];

const RANKS = [
  { name: "Recruta Pythonista", min: 0, icon: "🐣" },
  { name: "Aprendiz de Variáveis", min: 50, icon: "📗" },
  { name: "Desenvolvedor Jr", min: 120, icon: "💻" },
  { name: "Pythonista de Elite", min: 200, icon: "🐍" },
  { name: "Mestre das Condições", min: 280, icon: "⚡" }
];

function getRank(xp) {
  return [...RANKS].reverse().find(r => xp >= r.min) || RANKS[0];
}

// ─── SMART OFFLINE PYTHON SIMULATOR ──────────────────────────────────────────
function runSimulatedPython(code) {
  const lines = code.split("\n");
  const variables = {};
  const stdout = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    // A. Check for classic syntax errors: missing colon in if/elif/else
    if ((line.startsWith("if ") || line.startsWith("elif ")) && !line.endsWith(":")) {
      errors.push(`Erro de Sintaxe (Linha ${i + 1}): Falta dois-pontos ':' no final da condicional.`);
      continue;
    }
    if (line === "else" || (line.startsWith("else") && !line.endsWith(":"))) {
      errors.push(`Erro de Sintaxe (Linha ${i + 1}): O 'else' deve ser escrito apenas como 'else:'.`);
      continue;
    }

    // B. Check for print statement with missing parens (Python 2 vs 3 mistake)
    if (line.startsWith("print ") && !line.includes("(")) {
      errors.push(`Erro de Sintaxe (Linha ${i + 1}): No Python 3, a função print() exige parênteses. Ex: print("Olá")`);
      continue;
    }

    // C. Check for simple variable assignment
    const assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (assignmentMatch) {
      const varName = assignmentMatch[1];
      const rawVal = assignmentMatch[2].trim();

      try {
        if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
          variables[varName] = rawVal.slice(1, -1);
        } else if (rawVal === "True") {
          variables[varName] = true;
        } else if (rawVal === "False") {
          variables[varName] = false;
        } else if (!isNaN(rawVal)) {
          variables[varName] = Number(rawVal);
        } else {
          // Check if assigning from another variable
          if (variables[rawVal] !== undefined) {
            variables[varName] = variables[rawVal];
          } else {
            variables[varName] = rawVal; // string fallback
          }
        }
      } catch (e) {
        errors.push(`Erro (Linha ${i + 1}): Falha ao ler atribuição.`);
      }
      continue;
    }

    // D. Check for print call
    const printMatch = line.match(/^print\((.*)\)$/);
    if (printMatch) {
      const arg = printMatch[1].trim();
      if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
        stdout.push(arg.slice(1, -1));
      } else if (variables[arg] !== undefined) {
        stdout.push(String(variables[arg]));
      } else {
        // String formatting or expressions
        stdout.push(arg.replace(/'|"/g, ""));
      }
      continue;
    }
  }

  return { variables, stdout, errors };
}

// ─── OFFLINE PEDAGOGICAL TEST RUNNER ─────────────────────────────────────────
function evaluatePythonLocally(levelId, code) {
  const clean = code.replace(/#.*$/gm, "").trim();
  const run = runSimulatedPython(code);

  if (run.errors.length > 0) {
    return {
      aprovado: false,
      nota: 0,
      feedback: run.errors[0],
      dica: "Ajuste os dois-pontos ':' ou a grafia antes de enviar!"
    };
  }

  if (levelId === 7) {
    // Requirements: nome="Link", moedas=50, printed both
    const hasNome = run.variables.nome === "Link";
    const hasMoedas = Number(run.variables.moedas) === 50;
    const printedNome = run.stdout.includes("Link");
    const printedMoedas = run.stdout.some(s => s === "50" || s === "50.0");

    if (!hasNome) {
      return {
        aprovado: false,
        nota: 30,
        feedback: "Ops! Não encontrei a variável 'nome' guardando o valor 'Link'.",
        dica: "Verifique se escreveu: nome = \"Link\" (com L maiúsculo)."
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

  if (levelId === 15) {
    // Requirements: temperatura=38.2, if/elif/else, print Febre, Subfebril, Normal
    const hasTempVar = run.variables.temperatura !== undefined;
    const hasIf = /\bif\b/.test(clean);
    const hasElif = /\belif\b/.test(clean);
    const hasElse = /\belse\b/.test(clean);

    const hasFebre = /print\(\s*(["'])Febre\1\s*\)/i.test(clean);
    const hasSubfebril = /print\(\s*(["'])Subfebril\1\s*\)/i.test(clean);
    const hasNormal = /print\(\s*(["'])Normal\1\s*\)/i.test(clean);

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
        dica: "Use: elif temperatura >= 37.0: (como o if anterior já pegou acima de 37.8, o elif testará a faixa do meio!)."
      };
    }

    if (!hasElse) {
      return {
        aprovado: false,
        nota: 70,
        feedback: "Você esqueceu de tratar a temperatura saudável. Precisamos de uma cláusula 'else:' no final.",
        dica: "Use: else: (na linha de baixo, com recuo, coloque print(\"Normal\"))."
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

    // Double check indentation logic in lines (all lines after if/elif/else should have indentation)
    const linesOfCode = clean.split("\n");
    let indentationError = false;
    for (let i = 0; i < linesOfCode.length; i++) {
      const l = linesOfCode[i];
      if (l.startsWith("if") || l.startsWith("elif") || l.startsWith("else")) {
        const nextLine = linesOfCode[i + 1];
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
      dica: "Você completou a jornada de introdução! Agora você é oficialmente um mestre das condicionais no Python!"
    };
  }

  return { aprovado: false, nota: 0, feedback: "Exercício não mapeado", dica: null };
}

// ─── MAIN PYQUEST REACT APPLICATION ──────────────────────────────────────────
export default function App() {
  // Persistence states
  const [theme, setTheme] = useState(() => localStorage.getItem("pyquest_theme") || "dark");
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("pyquest_player_name") || "");
  const [nameInput, setNameInput] = useState("");
  const [xp, setXp] = useState(() => Number(localStorage.getItem("pyquest_xp")) || 0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("pyquest_streak")) || 0);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pyquest_completed")) || {};
    } catch {
      return {};
    }
  });
  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pyquest_badges")) || [];
    } catch {
      return [];
    }
  });

  // UI States
  const [screen, setScreen] = useState(() => (playerName ? "roadmap" : "home")); // home | roadmap | level
  const [activeLevel, setActiveLevel] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [fillValue, setFillValue] = useState("");
  const [challengeCode, setChallengeCode] = useState("");
  const [terminalOutputs, setTerminalOutputs] = useState([]);
  const [terminalError, setTerminalError] = useState("");
  
  // Feedback states
  const [phase, setPhase] = useState("question"); // question | feedback
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mentor / Settings States
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem("pyquest_ai_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [showBadgesPanel, setShowBadgesPanel] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("pyquest_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pyquest_player_name", playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem("pyquest_xp", xp);
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("pyquest_streak", streak);
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("pyquest_completed", JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem("pyquest_badges", JSON.stringify(unlockedBadges));
  }, [unlockedBadges]);

  // Badge trigger verification
  useEffect(() => {
    if (screen === "roadmap" || screen === "level") {
      const newBadges = [...unlockedBadges];
      let unlockedAny = false;

      BADGES.forEach(badge => {
        if (!newBadges.includes(badge.id)) {
          const isEligible = badge.id === "streak_3" ? badge.criteria(null, streak) : badge.criteria(completed);
          if (isEligible) {
            newBadges.push(badge.id);
            unlockedAny = true;
          }
        }
      });

      if (unlockedAny) {
        setUnlockedBadges(newBadges);
        // Play special sound for achievement
        playSound("success");
      }
    }
  }, [completed, streak, screen, unlockedBadges]);

  const activeTheme = THEMES[theme];

  // Actions
  function handleStart(name) {
    if (!name.trim()) return;
    playSound("click");
    setPlayerName(name.trim());
    setScreen("roadmap");
  }

  function handleSelectLevel(level) {
    // Check if level is locked
    const isUnlocked = level.id === 1 || completed[level.id - 1] === "correct";
    if (!isUnlocked) {
      playSound("error");
      window.alert("Nível bloqueado! Conclua o desafio anterior para poder avançar nesta missão. 🔐");
      return;
    }

    playSound("click");
    setActiveLevel(level);
    setSelectedQuizOption(null);
    setFillValue("");
    setChallengeCode(level.placeholder || "");
    setTerminalOutputs([]);
    setTerminalError("");
    setMentorMessage("");
    setFeedback(null);
    setPhase("question");
    setScreen("level");
  }

  function handleRunSimulate() {
    playSound("click");
    const res = runSimulatedPython(challengeCode);
    if (res.errors.length > 0) {
      setTerminalError(res.errors[0]);
      setTerminalOutputs([]);
    } else {
      setTerminalError("");
      setTerminalOutputs(res.stdout.length > 0 ? res.stdout : ["[Programa executado sem gerar saídas print]"]);
    }
  }

  function handleConfirmAnswer() {
    let isCorrect = false;
    let gainedXp = activeLevel.xp;
    let exp = "";

    if (activeLevel.type === "quiz") {
      isCorrect = selectedQuizOption === activeLevel.answer;
      exp = activeLevel.explanation;
    } else if (activeLevel.type === "fill") {
      // sanitize responses
      const cleanInput = fillValue.replace(/'|"/g, "").trim().toLowerCase();
      const cleanAnswer = activeLevel.answer.toLowerCase();
      isCorrect = cleanInput === cleanAnswer;
      exp = isCorrect 
        ? `Correto! A resposta é exatamente: ${activeLevel.answer}`
        : `Ah, a resposta correta era: ${activeLevel.answer}`;
    }

    if (isCorrect) {
      playSound("success");
      setXp(x => x + gainedXp);
      setStreak(s => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setCompleted(prev => ({ ...prev, [activeLevel.id]: "correct" }));
      setFeedback({ correct: true, gained: gainedXp, explanation: exp });
    } else {
      playSound("error");
      setStreak(0);
      setCompleted(prev => {
        // preserve correct marks
        if (prev[activeLevel.id] === "correct") return prev;
        return { ...prev, [activeLevel.id]: "wrong" };
      });
      setFeedback({ correct: false, gained: 0, explanation: exp });
    }

    setPhase("feedback");
  }

  function handleConfirmChallenge() {
    // Call offline evaluator
    const res = evaluatePythonLocally(activeLevel.id, challengeCode);
    
    if (res.aprovado) {
      playSound("success");
      const gained = activeLevel.xp;
      setXp(x => x + gained);
      setStreak(s => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setCompleted(prev => ({ ...prev, [activeLevel.id]: "correct" }));
      setFeedback({ correct: true, gained: gained, explanation: res.feedback, note: res.nota });
    } else {
      playSound("error");
      setStreak(0);
      setCompleted(prev => {
        if (prev[activeLevel.id] === "correct") return prev;
        return { ...prev, [activeLevel.id]: "wrong" };
      });
      setFeedback({ correct: false, gained: 0, explanation: res.feedback, note: res.nota, dica: res.dica });
    }
    setPhase("feedback");
  }

  async function handleAskMentor() {
    playSound("click");
    setMentorLoading(true);
    setMentorMessage("");

    // Fallback didático se não houver chave de API cadastrada
    if (!aiApiKey.trim()) {
      setTimeout(() => {
        let text = "";
        if (activeLevel.type === "quiz") {
          text = `Professor Cobra diz: 🐍\n\nNesta questão de escolha múltipla, analise com calma a teoria ao lado. A resposta está diretamente ligada ao conceito de que "${activeLevel.explanation.split(" ").slice(0, 8).join(" ")}...". Tente ler o exemplo e eliminar as que violam as regras básicas!`;
        } else if (activeLevel.type === "fill") {
          text = `Professor Cobra diz: 🐍\n\nNo preenchimento de código, preste atenção aos detalhes de sintaxe. A palavra procurada serve para: "${activeLevel.hint}". Lembre-se de escrever exatamente igual ao Python, em letras minúsculas!`;
        } else if (activeLevel.id === 7) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio 'Ficha do Herói', você precisa ter exatamente estas 4 linhas de código:\n1. Criar a variável: nome = "Link"\n2. Criar a variável: moedas = 50\n3. Imprimir o nome: print(nome)\n4. Imprimir as moedas: print(moedas)\n\nLembre-se de não usar aspas no número 50 e usar aspas na palavra "Link"!`;
        } else if (activeLevel.id === 15) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio final, lembre-se da indentação! A estrutura deve ser exatamente assim:\n\ntemperatura = 38.2\nif temperatura >= 37.8:\n    print("Febre")\nelif temperatura >= 37.0:\n    print("Subfebril")\nelse:\n    print("Normal")\n\nPreste muita atenção nos dois pontos ':' no final das linhas de condição e nos 4 espaços à esquerda dentro do print.`;
        }
        setMentorMessage(text);
        setMentorLoading(false);
      }, 1000);
      return;
    }

    // Se houver chave API do Claude
    try {
      const promptText = activeLevel.type === "challenge" 
        ? `Estou tentando resolver o desafio de Python "${activeLevel.title}" (${activeLevel.topic}). 
           Minha resposta/código atual é:\n${challengeCode}\n
           Por favor, dê uma dica didática para mim (aluno do 1º ano do ensino médio). 
           Não me dê o código pronto! Apenas aponte onde errei e explique didaticamente em português.`
        : `Estou respondendo a questão "${activeLevel.title}" (${activeLevel.topic}). 
           A teoria é: ${activeLevel.theory}. 
           A pergunta ou código incompleto é: ${activeLevel.type === "fill" ? activeLevel.code : activeLevel.question}.
           Me explique didaticamente como chegar à resposta correta sem revelá-la diretamente.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": aiApiKey,
          "anthropic-version": "2023-06-01",
          "dangerously-allow-browser": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 600,
          system: "Você é o 'Professor Cobra', um mentor de Python muito simpático e motivador para alunos de 1º ano de informática. Explique de forma bem simples e use emojis. Responda em português.",
          messages: [{ role: "user", content: promptText }]
        })
      });

      const data = await response.json();
      if (data.content && data.content[0]) {
        setMentorMessage(data.content[0].text);
      } else {
        setMentorMessage("Professor Cobra diz: Ops, tive um pequeno problema ao me conectar. Deixe-me dar uma dica offline: " + (activeLevel.hint || "Revise a teoria e o exemplo ao lado!"));
      }
    } catch (e) {
      setMentorMessage("Professor Cobra diz: Erro de conexão com a API. Dica offline: Revise se seu código tem dois pontos ':' no final e se está indentado.");
    }
    setMentorLoading(false);
  }

  function handleReset() {
    if (window.confirm("Quer mesmo reiniciar sua jornada do zero? Seus pontos, conquistas e fases serão limpos!")) {
      localStorage.clear();
      setXp(0);
      setStreak(0);
      setCompleted({});
      setUnlockedBadges([]);
      setPlayerName("");
      setScreen("home");
      setShowSettings(false);
    }
  }

  const rank = getRank(xp);
  const maxPossibleXP = QUESTIONS.reduce((sum, q) => sum + q.xp, 0);
  const xpPercentage = Math.min(100, Math.round((xp / maxPossibleXP) * 100));

  return (
    <div style={{ ...styles.root, background: activeTheme.bg, color: activeTheme.text }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${activeTheme.primaryGlow}; transform: scale(1); }
          70% { box-shadow: 0 0 15px 5px ${activeTheme.primaryGlow}; transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 ${activeTheme.primaryGlow}; transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        @keyframes cursorPulse {
          50% { opacity: 0; }
        }
        .pulse-node {
          animation: pulse 2s infinite ease-in-out;
        }
        .float-avatar {
          animation: float 3s infinite ease-in-out;
        }
        .code-input-blank {
          font-family: 'Courier New', Courier, monospace;
          background: ${activeTheme.inputBg};
          color: ${activeTheme.pythonBlue};
          border: 2px solid ${activeTheme.primary};
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 16px;
          outline: none;
          min-width: 140px;
          transition: border .2s;
        }
        .code-input-blank:focus {
          border-color: ${activeTheme.pythonGreen};
          box-shadow: 0 0 8px ${activeTheme.pythonGreen}44;
        }
      `}</style>

      {/* CONFETTI SYSTEM */}
      {showConfetti && <Confetti piecesCount={35} />}

      {/* GLOBAL HEADER BAR */}
      {screen !== "home" && (
        <header style={{ ...styles.header, background: activeTheme.headerBg, borderColor: activeTheme.divider }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28, cursor: "pointer" }} onClick={() => setScreen("roadmap")}>🐍</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={styles.playerName}>{playerName}</span>
                <span style={{ ...styles.rankBadge, background: activeTheme.primaryGlow, color: activeTheme.primary }}>
                  {rank.icon} {rank.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <div style={{ ...styles.progressBar, background: activeTheme.divider }}>
                  <div style={{ ...styles.progressFill, background: activeTheme.pythonGreen, width: `${xpPercentage}%` }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: activeTheme.pythonGreen }}>{xp} XP</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {streak >= 2 && (
              <div style={{ ...styles.streakBadge, background: theme === "dark" ? "#78350f" : "#fef3c7", borderColor: "#f59e0b", color: "#f59e0b" }}>
                🔥 {streak}
              </div>
            )}
            
            {/* Action Buttons */}
            <button 
              style={{ ...styles.iconBtn, color: activeTheme.text }} 
              onClick={() => { playSound("click"); setShowBadgesPanel(!showBadgesPanel); }}
              title="Conquistas"
            >
              🏆 <span style={{ fontSize: 11, marginLeft: 2 }}>{unlockedBadges.length}</span>
            </button>

            <button 
              style={{ ...styles.iconBtn, color: activeTheme.text }} 
              onClick={() => { playSound("click"); setTheme(theme === "dark" ? "light" : "dark"); }}
              title="Alternar Tema"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <button 
              style={{ ...styles.iconBtn, color: activeTheme.text }} 
              onClick={() => { playSound("click"); setShowSettings(true); }}
              title="Configurações"
            >
              ⚙️
            </button>
          </div>
        </header>
      )}

      {/* TELA A: HOME CARD / LOGIN */}
      {screen === "home" && (
        <main style={styles.homeScreen}>
          <div style={{ ...styles.homeCard, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}>
            <div className="float-avatar" style={{ fontSize: 72, marginBottom: 12 }}>🐍</div>
            <h1 style={{ ...styles.title, color: activeTheme.pythonGreen }}>PyQuest 2.0</h1>
            <p style={{ ...styles.subtitle, color: activeTheme.textMuted }}>Aprenda Python do zero em uma aventura gamificada!</p>
            
            <div style={styles.badgeRow}>
              <span style={{ ...styles.tag, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid #38bdf8" }}>💻 Variáveis</span>
              <span style={{ ...styles.tag, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", border: "1px solid #22c55e" }}>⚖️ Condicionais</span>
              <span style={{ ...styles.tag, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid #f59e0b" }}>🎓 1º Ano</span>
            </div>

            <div style={{ width: "100%", textAlign: "left", marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: activeTheme.textMuted, marginBottom: 6, display: "block" }}>
                Qual o seu nome, jovem programador(a)?
              </label>
              <input
                style={{ ...styles.nameInput, background: activeTheme.inputBg, color: activeTheme.text, borderColor: activeTheme.inputBorder }}
                placeholder="Ex: Ana Clara, João Pedro..."
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStart(nameInput)}
                autoFocus
              />
            </div>

            <button
              style={{ 
                ...styles.primaryBtn, 
                background: activeTheme.pythonGreen, 
                opacity: nameInput.trim() ? 1 : 0.5,
                transform: nameInput.trim() ? "scale(1)" : "none",
                cursor: nameInput.trim() ? "pointer" : "not-allowed"
              }}
              disabled={!nameInput.trim()}
              onClick={() => handleStart(nameInput)}
            >
              Iniciar Aventura ▶
            </button>
          </div>
        </main>
      )}

      {/* TELA B: ROADMAP DE APRENDIZADO (Duolingo Style) */}
      {screen === "roadmap" && (
        <main style={styles.roadmapScreen}>
          <div style={styles.roadmapContainer}>
            <div style={styles.roadmapWelcome}>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Sua Jornada Python 🗺️</h2>
              <p style={{ color: activeTheme.textMuted, fontSize: 14, marginTop: 4 }}>Complete as missões para desbloquear novas habilidades</p>
            </div>

            {/* ROADMAP NODES CONTAINER */}
            <div style={{ ...styles.nodesContainer, position: "relative" }}>
              {/* Central connecting dashed line */}
              <div style={{ ...styles.roadmapLine, background: activeTheme.roadmapLine }} />

              {QUESTIONS.map((level, idx) => {
                const isCompleted = completed[level.id] === "correct";
                const isUnlocked = level.id === 1 || completed[level.id - 1] === "correct";
                const isCurrent = isUnlocked && !isCompleted;

                // Alternate nodes left / center / right for a zig-zag path
                const offsetPattern = [0, 50, 0, -50];
                const horizontalOffset = offsetPattern[idx % 4];

                return (
                  <div 
                    key={level.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      margin: "24px 0",
                      transform: `translateX(${horizontalOffset}px)`,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <button
                      className={isCurrent ? "pulse-node" : ""}
                      onClick={() => handleSelectLevel(level)}
                      style={{
                        ...styles.roadmapNode,
                        background: isCompleted 
                          ? activeTheme.pythonGreen 
                          : isCurrent 
                            ? activeTheme.pythonBlue 
                            : activeTheme.cardBg,
                        borderColor: isCompleted 
                          ? activeTheme.pythonGreen 
                          : isCurrent 
                            ? activeTheme.pythonBlue 
                            : activeTheme.cardBorder,
                        opacity: isUnlocked ? 1 : 0.6,
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        transform: isCurrent ? "scale(1.1)" : "scale(1)"
                      }}
                    >
                      {isCompleted ? "👑" : level.id}
                    </button>

                    <div style={{ ...styles.nodeTextBubble, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: activeTheme.pythonBlue, textTransform: "uppercase" }}>
                        {level.topic}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: activeTheme.text, marginTop: 2 }}>
                        {level.title.split(". ")[1]}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: activeTheme.textMuted }}>
                          {level.type === "quiz" ? "🎯 Quiz" : level.type === "fill" ? "✏️ Completar" : "🏆 Desafio"}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: activeTheme.primary }}>+{level.xp} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* TELA C: QUESTÃO E TEORIA (Coddy Style Split Screen) */}
      {screen === "level" && activeLevel && (
        <main style={styles.splitScreen}>
          
          {/* COLUNA ESQUERDA: TEORIA E EXEMPLO */}
          <section style={{ ...styles.splitPanel, background: activeTheme.theoryBg, borderRight: `1px solid ${activeTheme.divider}` }}>
            <button style={{ ...styles.backBtn, color: activeTheme.primary }} onClick={() => { playSound("click"); setScreen("roadmap"); }}>
              ← Voltar ao Mapa
            </button>

            <div style={{ marginTop: 14 }}>
              <span style={{ ...styles.tag, background: activeTheme.primaryGlow, color: activeTheme.primary }}>
                {activeLevel.topic}
              </span>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 12px" }}>{activeLevel.title}</h2>
            </div>

            {/* RENDER TEORIA FORMATADA */}
            <div style={{ ...styles.theoryContent, color: activeTheme.text }}>
              {activeLevel.theory.split("\n\n").map((paragraph, pIdx) => {
                // If paragraph is a code block
                if (paragraph.startsWith("```python")) {
                  const rawCode = paragraph.replace(/```python|```/g, "").trim();
                  return (
                    <div key={pIdx} style={styles.codeIDEContainer}>
                      <div style={styles.codeIDETab}>exemplo.py</div>
                      <pre style={styles.codeIDEBlock}>{rawCode}</pre>
                    </div>
                  );
                }

                // Parse simple markdown **bold** and `code` inline elements
                const parts = paragraph.split(/(\*\*.*?\*\*|`.*?`)/g);
                return (
                  <p key={pIdx} style={{ lineHeight: 1.6, fontSize: 15, margin: "0 0 14px" }}>
                    {parts.map((part, partIdx) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={partIdx} style={{ color: activeTheme.pythonGreen }}>{part.slice(2, -2)}</strong>;
                      }
                      if (part.startsWith("`") && part.endsWith("`")) {
                        return <code key={partIdx} style={{ ...styles.inlineCode, background: theme === "dark" ? "#0f172a" : "#e2e8f0" }}>{part.slice(1, -1)}</code>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>

            {/* PROFESSOR COBRA / AI ASSISTANT BOX */}
            <div style={{ ...styles.mentorBox, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 32 }}>🐍</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Professor Cobra</h4>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: activeTheme.textMuted }}>Precisa de uma mãozinha explicativa?</p>
                </div>
              </div>

              {mentorMessage && (
                <div style={{ ...styles.mentorMsg, background: activeTheme.theoryBg, color: activeTheme.text }}>
                  {mentorMessage.split("\n").map((line, lIdx) => <div key={lIdx} style={{ marginBottom: 4 }}>{line}</div>)}
                </div>
              )}

              <button 
                style={{ ...styles.secondaryBtn, borderColor: activeTheme.primary, color: activeTheme.primary, marginTop: 10 }}
                onClick={handleAskMentor}
                disabled={mentorLoading}
              >
                {mentorLoading ? "Pensando na dica..." : "💡 Pedir dica do Professor"}
              </button>
            </div>
          </section>

          {/* COLUNA DIREITA: TRABALHO PRÁTICO E EXERCÍCIOS */}
          <section style={{ ...styles.splitPanel, background: activeTheme.bg }}>
            
            {phase === "question" ? (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: activeTheme.textMuted }}>
                      {activeLevel.type === "quiz" ? "🎯 SELECIONE A OPÇÃO CORRETA" : activeLevel.type === "fill" ? "✏️ PREENCHA A LACUNA" : "🏆 ESCREVA O CÓDIGO FONTE"}
                    </h3>
                    <span style={{ fontSize: 12, fontWeight: 800, color: activeTheme.pythonGreen }}>
                      Valor: +{activeLevel.xp} XP
                    </span>
                  </div>

                  {/* 1. LAYOUT QUIZ */}
                  {activeLevel.type === "quiz" && (
                    <div>
                      <h4 style={{ fontSize: 17, fontWeight: 800, marginBottom: 18, lineHeight: 1.4 }}>
                        {activeLevel.question}
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {activeLevel.options.map((option, oIdx) => {
                          const isSelected = selectedQuizOption === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => { playSound("click"); setSelectedQuizOption(oIdx); }}
                              style={{
                                ...styles.quizOptionBtn,
                                background: isSelected ? activeTheme.primaryGlow : activeTheme.cardBg,
                                borderColor: isSelected ? activeTheme.primary : activeTheme.cardBorder,
                                color: activeTheme.text,
                                fontWeight: isSelected ? 700 : 500,
                              }}
                            >
                              <span style={{
                                ...styles.quizOptionLetter,
                                background: isSelected ? activeTheme.primary : activeTheme.divider,
                                color: isSelected ? "#fff" : activeTheme.textMuted
                              }}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. LAYOUT FILL IN THE BLANK */}
                  {activeLevel.type === "fill" && (
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 18 }}>
                        Preencha o espaço em branco `___` para fazer o código funcionar:
                      </h4>

                      <div style={styles.codeIDEContainer}>
                        <div style={styles.codeIDETab}>desafio.py</div>
                        <div style={{ ...styles.codeIDEBlock, padding: "20px 24px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          {activeLevel.code.split("___").map((snippet, sIdx, arr) => (
                            <span key={sIdx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontFamily: "monospace", fontSize: 17, color: "#d4d4d4" }}>{snippet}</span>
                              {sIdx < arr.length - 1 && (
                                <input
                                  className="code-input-blank"
                                  placeholder="digite aqui"
                                  value={fillValue}
                                  onChange={e => setFillValue(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && fillValue.trim() && handleConfirmAnswer()}
                                  autoFocus
                                />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ ...styles.hintTextBubble, background: activeTheme.theoryBg }}>
                        💡 **Dica:** {activeLevel.hint}
                      </div>
                    </div>
                  )}

                  {/* 3. LAYOUT CODE CHALLENGE WITH CONSOLE */}
                  {activeLevel.type === "challenge" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 14, color: activeTheme.textMuted, lineHeight: 1.4 }}>
                        Digite sua solução abaixo e utilize o console para testar sua lógica.
                      </p>

                      {/* Code Editor */}
                      <div style={{ ...styles.codeIDEContainer, marginBottom: 0 }}>
                        <div style={{ ...styles.codeIDETab, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>programa.py</span>
                          <span style={{ fontSize: 11, color: activeTheme.pythonGreen }}>● Editando</span>
                        </div>
                        <textarea
                          spellCheck={false}
                          rows={10}
                          value={challengeCode}
                          onChange={e => setChallengeCode(e.target.value)}
                          style={{
                            ...styles.codeEditorArea,
                            background: activeTheme.terminalBg,
                            color: "#d4d4d4",
                            borderColor: activeTheme.cardBorder
                          }}
                        />
                      </div>

                      {/* Helper Keyboard Panel */}
                      <div style={styles.helperKeyboard}>
                        {["print()", "if ", "elif ", "else:", "nome", "moedas", "temperatura", "==", ">=", "=", "38.2", "\"Link\""].map((keyChar, kIdx) => (
                          <button
                            key={kIdx}
                            onClick={() => {
                              playSound("click");
                              setChallengeCode(c => c + keyChar);
                            }}
                            style={{ ...styles.helperKey, background: activeTheme.theoryBg, color: activeTheme.text, borderColor: activeTheme.divider }}
                          >
                            {keyChar.trim()}
                          </button>
                        ))}
                      </div>

                      {/* Simulated Console Screen */}
                      <div style={{ ...styles.consoleContainer, background: activeTheme.terminalBg, borderColor: activeTheme.cardBorder }}>
                        <div style={styles.consoleHeader}>
                          💻 TERMINAL DE SAÍDA (CONSOLE)
                        </div>
                        <div style={styles.consoleBody}>
                          {terminalError ? (
                            <div style={{ color: activeTheme.error, fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap" }}>
                              ❌ {terminalError}
                            </div>
                          ) : terminalOutputs.length > 0 ? (
                            terminalOutputs.map((out, outIdx) => (
                              <div key={outIdx} style={{ color: activeTheme.terminalText, fontFamily: "monospace", fontSize: 13 }}>
                                🐍 &gt; {out}
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "#475569", fontFamily: "monospace", fontSize: 13, fontStyle: "italic" }}>
                              Nenhuma saída gerada. Clique em 'Executar Código' para simular seu código!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONFIRMATION WORKSPACE ACTIONS */}
                <div style={{ marginTop: 24 }}>
                  {activeLevel.type === "challenge" ? (
                    <div style={{ display: "flex", gap: 12 }}>
                      <button 
                        style={{ ...styles.secondaryBtn, flex: 1, borderColor: activeTheme.pythonBlue, color: activeTheme.pythonBlue }}
                        onClick={handleRunSimulate}
                      >
                        ▶ Executar Código
                      </button>
                      <button 
                        style={{ ...styles.primaryBtn, flex: 1, background: activeTheme.pythonGreen }}
                        onClick={handleConfirmChallenge}
                      >
                        🏆 Enviar Desafio
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={activeLevel.type === "quiz" ? selectedQuizOption === null : !fillValue.trim()}
                      style={{
                        ...styles.primaryBtn,
                        background: activeTheme.pythonGreen,
                        opacity: (activeLevel.type === "quiz" ? selectedQuizOption !== null : fillValue.trim()) ? 1 : 0.5,
                        cursor: (activeLevel.type === "quiz" ? selectedQuizOption !== null : fillValue.trim()) ? "pointer" : "not-allowed"
                      }}
                    >
                      Confirmar Resposta
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* FEEDBACK INTERACTIVE VIEW */
              <div style={styles.feedbackContainer}>
                <div style={{
                  ...styles.feedbackCard,
                  background: feedback.correct ? activeTheme.successBg : activeTheme.errorBg,
                  borderColor: feedback.correct ? activeTheme.success : activeTheme.error
                }}>
                  <div style={{ fontSize: 64, marginBottom: 12 }}>
                    {feedback.correct ? "🎉" : "😢"}
                  </div>
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 900,
                    margin: 0,
                    color: feedback.correct ? activeTheme.successText : activeTheme.errorText
                  }}>
                    {feedback.correct ? "Excelente Trabalho!" : "Hum, ainda não está correto."}
                  </h3>
                  
                  <div style={{ fontSize: 14, fontWeight: 700, margin: "8px 0", color: activeTheme.text }}>
                    {feedback.correct ? `+${feedback.gained} XP conquistados!` : "Não desanime!"}
                  </div>

                  {feedback.note !== undefined && (
                    <div style={{ ...styles.gradeCircle, background: feedback.correct ? activeTheme.success : activeTheme.error }}>
                      {feedback.note}/100
                    </div>
                  )}

                  <p style={{ 
                    fontSize: 15, 
                    lineHeight: 1.5, 
                    margin: "12px 0 18px", 
                    color: feedback.correct ? activeTheme.successText : activeTheme.errorText 
                  }}>
                    {feedback.explanation}
                  </p>

                  {feedback.dica && (
                    <div style={{ ...styles.dicaAlert, background: "rgba(245, 158, 11, 0.12)", borderColor: "#f59e0b", color: activeTheme.text }}>
                      💡 **Conselho do Professor:** {feedback.dica}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, justifyContent: "center", width: "100%" }}>
                    {!feedback.correct && (
                      <button 
                        style={{ ...styles.secondaryBtn, flex: 1, borderColor: activeTheme.textMuted, color: activeTheme.text }} 
                        onClick={() => { playSound("click"); setPhase("question"); }}
                      >
                        Tentar Novamente
                      </button>
                    )}
                    <button 
                      style={{ ...styles.primaryBtn, flex: 1, background: feedback.correct ? activeTheme.pythonGreen : activeTheme.primary }} 
                      onClick={() => { playSound("click"); setScreen("roadmap"); }}
                    >
                      Voltar ao Mapa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* DRAWER / MODAL: CONQUISTAS (BADGES) */}
      {showBadgesPanel && (
        <div style={styles.modalOverlay} onClick={() => setShowBadgesPanel(false)}>
          <div style={{ ...styles.modalContent, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Suas Conquistas 🏆</h3>
              <button style={styles.closeBtn} onClick={() => setShowBadgesPanel(false)}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {BADGES.map(badge => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <div 
                    key={badge.id} 
                    style={{ 
                      ...styles.badgeCard, 
                      borderColor: isUnlocked ? activeTheme.pythonGreen : activeTheme.divider,
                      background: isUnlocked ? "rgba(34, 197, 94, 0.05)" : "transparent",
                      opacity: isUnlocked ? 1 : 0.5
                    }}
                  >
                    <span style={{ fontSize: 32, filter: isUnlocked ? "none" : "grayscale(100%)" }}>{badge.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: isUnlocked ? activeTheme.pythonGreen : activeTheme.text }}>
                        {badge.name} {isUnlocked ? "✅" : "🔒"}
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: activeTheme.textMuted }}>{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: CONFIGURAÇÕES (SETTINGS) */}
      {showSettings && (
        <div style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div style={{ ...styles.modalContent, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Configurações ⚙️</h3>
              <button style={styles.closeBtn} onClick={() => setShowSettings(false)}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Reset progress */}
              <div style={styles.settingsSection}>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800 }}>Chave API Claude (Opcional)</h4>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: activeTheme.textMuted }}>
                  Para ter respostas personalizadas de IA com o Professor Cobra. Se vazio, o app usará dicas automáticas estáticas locais!
                </p>
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={e => {
                    setAiApiKey(e.target.value);
                    localStorage.setItem("pyquest_ai_key", e.target.value);
                  }}
                  placeholder="sk-ant-..."
                  style={{ ...styles.nameInput, background: activeTheme.inputBg, color: activeTheme.text, borderColor: activeTheme.inputBorder }}
                />
              </div>

              <div style={{ ...styles.divider, background: activeTheme.divider }} />

              <div style={styles.settingsSection}>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: activeTheme.error }}>Área de Perigo</h4>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: activeTheme.textMuted }}>Apagar todos os dados do aluno do computador.</p>
                <button style={{ ...styles.primaryBtn, background: activeTheme.error }} onClick={handleReset}>
                  Reiniciar Progresso do Zero
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONFETTI SIMULATION COMPONENT ───────────────────────────────────────────
function Confetti({ piecesCount }) {
  const pieces = Array.from({ length: piecesCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: ["#22c55e", "#f59e0b", "#38bdf8", "#ef4444", "#a855f7"][i % 5],
  }));

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 99999 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: "-10px",
          width: 10, height: 10, borderRadius: "2px",
          background: p.color, opacity: 0.9,
          animation: `fall 2s ${p.delay}s ease-in forwards`,
        }} />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── STYLING SYSTEM (DESIGN SYSTEM TOKENS) ───────────────────────────────────
const THEMES = {
  dark: {
    bg: "#090d16",
    cardBg: "#121a2e",
    cardBorder: "#1e294b",
    text: "#f8fafc",
    textMuted: "#64748b",
    primary: "#38bdf8",
    primaryGlow: "rgba(56, 189, 248, 0.15)",
    success: "#22c55e",
    successBg: "rgba(34, 197, 94, 0.1)",
    successText: "#4ade80",
    error: "#ef4444",
    errorBg: "rgba(239, 68, 68, 0.1)",
    errorText: "#fca5a5",
    accent: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.1)",
    pythonGreen: "#22c55e",
    pythonBlue: "#38bdf8",
    headerBg: "#0d1527",
    divider: "#1e294b",
    terminalBg: "#030712",
    terminalText: "#38bdf8",
    theoryBg: "#0b111e",
    inputBg: "#070b12",
    inputBorder: "#1e294b",
    roadmapLine: "#1e294b"
  },
  light: {
    bg: "#f8fafc",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    primary: "#2563eb",
    primaryGlow: "rgba(37, 99, 235, 0.08)",
    success: "#16a34a",
    successBg: "#d1fae5",
    successText: "#15803d",
    error: "#dc2626",
    errorBg: "#fee2e2",
    errorText: "#b91c1c",
    accent: "#d97706",
    accentBg: "#fef3c7",
    pythonGreen: "#16a34a",
    pythonBlue: "#0284c7",
    headerBg: "#ffffff",
    divider: "#e2e8f0",
    terminalBg: "#0f172a",
    terminalText: "#38bdf8",
    theoryBg: "#f1f5f9",
    inputBg: "#ffffff",
    inputBorder: "#cbd5e1",
    roadmapLine: "#cbd5e1"
  }
};

const styles = {
  root: {
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    transition: "background .3s, color .3s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    borderBottom: "1px solid",
    position: "sticky",
    top: 0,
    zIndex: 99,
  },
  playerName: {
    fontWeight: 800,
    fontSize: 15,
  },
  rankBadge: {
    fontSize: 11,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: "12px",
  },
  progressBar: {
    width: 100,
    height: 6,
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width .4s ease-out",
  },
  streakBadge: {
    fontSize: 13,
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: "12px",
    border: "1px solid",
  },
  iconBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    padding: 6,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background .2s",
  },
  homeScreen: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  homeCard: {
    maxWidth: 440,
    width: "100%",
    borderRadius: 24,
    border: "1px solid",
    padding: "40px 32px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    margin: "0 0 6px",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    margin: "0 0 24px",
    lineHeight: 1.5,
  },
  badgeRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  tag: {
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "20px",
  },
  nameInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    borderRadius: "12px",
    border: "1px solid",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: 15,
    fontWeight: 700,
    transition: "opacity .2s, transform .1s",
  },
  secondaryBtn: {
    padding: "10px 16px",
    background: "none",
    border: "2px solid",
    borderRadius: "12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background .2s, border-color .2s",
  },
  roadmapScreen: {
    flex: 1,
    padding: "32px 16px 80px",
    display: "flex",
    justifyContent: "center",
  },
  roadmapContainer: {
    maxWidth: 520,
    width: "100%",
  },
  roadmapWelcome: {
    textAlign: "center",
    marginBottom: 40,
  },
  nodesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  roadmapLine: {
    position: "absolute",
    top: 20,
    bottom: 20,
    width: 4,
    borderStyle: "dashed",
    zIndex: 1,
  },
  roadmapNode: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "4px solid",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  },
  nodeTextBubble: {
    marginTop: 8,
    borderRadius: 14,
    border: "1px solid",
    padding: "10px 14px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    minWidth: 160,
  },
  splitScreen: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  splitPanel: {
    flex: 1,
    minWidth: 320,
    padding: "24px 32px 40px",
    boxSizing: "border-box",
    overflowY: "auto",
    maxHeight: "calc(100vh - 65px)",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  theoryContent: {
    marginTop: 16,
  },
  inlineCode: {
    padding: "2px 6px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: 14,
  },
  codeIDEContainer: {
    borderRadius: "12px",
    overflow: "hidden",
    margin: "16px 0",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
  },
  codeIDETab: {
    background: "#1e293b",
    color: "#94a3b8",
    padding: "6px 16px",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "monospace",
    borderBottom: "1px solid #0f172a",
  },
  codeIDEBlock: {
    background: "#0f172a",
    color: "#d4d4d4",
    margin: 0,
    padding: "16px 20px",
    fontSize: 14,
    lineHeight: 1.6,
    overflowX: "auto",
    fontFamily: "monospace",
  },
  mentorBox: {
    marginTop: 24,
    border: "1px solid",
    borderRadius: "16px",
    padding: "16px 20px",
  },
  mentorMsg: {
    marginTop: 12,
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: 13,
    lineHeight: 1.5,
  },
  quizOptionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 18px",
    borderRadius: "12px",
    border: "2px solid",
    fontSize: 15,
    textAlign: "left",
    cursor: "pointer",
    transition: "all .2s ease",
  },
  quizOptionLetter: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
  },
  hintTextBubble: {
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: 13,
    marginTop: 18,
    lineHeight: 1.5,
  },
  codeEditorArea: {
    width: "100%",
    padding: "16px",
    fontSize: 14,
    fontFamily: "monospace",
    lineHeight: 1.6,
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    borderWidth: "0 1px 1px 1px",
    borderStyle: "solid",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  helperKeyboard: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
  },
  helperKey: {
    padding: "5px 10px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: 12,
    fontFamily: "monospace",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background .15s",
  },
  consoleContainer: {
    border: "1px solid",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: 14,
  },
  consoleHeader: {
    background: "#0f172a",
    color: "#64748b",
    fontSize: 10,
    fontWeight: 800,
    padding: "6px 12px",
    borderBottom: "1px solid #1e293b",
  },
  consoleBody: {
    padding: "12px 16px",
    minHeight: 80,
    maxHeight: 120,
    overflowY: "auto",
  },
  feedbackContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: 20,
  },
  feedbackCard: {
    maxWidth: 400,
    width: "100%",
    borderRadius: 20,
    border: "2px solid",
    padding: "32px 24px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  gradeCircle: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    color: "#fff",
    fontSize: 16,
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "8px 0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  dicaAlert: {
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: 13,
    lineHeight: 1.4,
    border: "1px solid",
    marginBottom: 20,
    textAlign: "left",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    maxWidth: 440,
    width: "100%",
    borderRadius: 20,
    border: "1px solid",
    padding: 24,
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    padding: 4,
  },
  badgeCard: {
    display: "flex",
    gap: 16,
    padding: 12,
    border: "1px solid",
    borderRadius: "12px",
    alignItems: "center",
  },
  settingsSection: {
    display: "flex",
    flexDirection: "column",
  }
};
