// ─── CURRICULUM BANK: 15 MAIN PATH LEVELS + 3 ADVANCED (Total 18 Níveis) ──────
export const QUESTIONS = [
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
    theory: "Parabéns por chegar ao último nível da trilha de condicionais! Vamos combinar tudo o que você aprendeu em um sistema real.\n\nImagine que estamos criando um termômetro inteligente.\n\n**Desafio:**\nCrie uma variável chamada `temperatura` e coloque nela o valor `38.2` (representando a febre do paciente).\n\nDepois, escreva uma estrutura condicional para avaliar a temperatura:\n- Se a temperatura for **maior ou igual a 37.8**, exiba `\"Febre\"` usando o `print`.\n- Se a temperatura estiver **entre 37.0 e 37.7** (inclusive), exiba `\"Subfebril\"`.\n- Caso contrário (menor que 37.0), exiba `\"Normal\"`.\n\n*Dica de Sintaxe:* No Python, você pode usar `elif temperatura >= 37.0 and temperatura <= 37.7:` ou simplesmente `elif temperatura >= 37.0:` (pois o `if` anterior já capturou temperaturas maiores ou iguais a 37.8). Não se esqueça dos dois pontos `:` e dos 4 espaços de indentação!",
    placeholder: "# 1. Declare a variável temperatura com o valor 38.2\ntemperatura = 38.2\n\n# 2. Escreva as condicionais if, elif e else abaixo\n",
    hint: "Escreva:\nif temperatura >= 37.8:\n    print(\"Febre\")\nelif temperatura >= 37.0:\n    print(\"Subfebril\")\nelse:\n    print(\"Normal\")"
  },
  {
    id: 16,
    title: "16. Listas e Coleções",
    topic: "Coleções",
    type: "fill",
    xp: 20,
    theory: "Listas são usadas para guardar múltiplos itens em uma única variável. Criamos uma lista usando colchetes `[]` e separamos os itens por vírgulas.\n\n**Exemplo:**\n`nomes = [\"Link\", \"Zelda\"]`\n\nPodemos acessar itens pelo índice (começando do zero): `nomes[0]` retornará `\"Link\"`.",
    code: "jogadores = [___, \"Zelda\"]",
    answer: "\"Link\"",
    placeholder: "Complete com \"Link\" (com aspas)",
    hint: "Coloque o texto \"Link\" com aspas duplas."
  },
  {
    id: 17,
    title: "17. Funções Reutilizáveis (def)",
    topic: "Modularização",
    type: "quiz",
    xp: 25,
    theory: "Funções são blocos de código que só rodam quando são chamadas, ajudando a evitar repetição. Criamos funções com a palavra `def` seguida do nome e parênteses.\n\n**Exemplo:**\n```python\ndef saudar():\n    print(\"Olá!\")\n```",
    question: "Qual palavra-chave é usada para iniciar a definição de uma função em Python?",
    options: ["function", "def", "create", "define"],
    answer: 1,
    explanation: "def é a palavra-chave reservada do Python para definir uma função (abreviação de define)."
  },
  {
    id: 18,
    title: "18. Desafio Mestre: A Calculadora",
    topic: "Modularização",
    type: "challenge",
    xp: 40,
    theory: "Chegou a hora de provar que você é um mestre supremo em Python!\n\n**Desafio:** Crie uma função chamada `somar(a, b)` que recebe dois parâmetros, calcula a soma deles e imprime o resultado usando `print()`. Depois de declarar a função, chame-a passando os números `10` e `20` como argumentos.\n\n**Exemplo de estrutura:**\n```python\ndef somar(a, b):\n    print(a + b)\n\nsomar(10, 20)\n```",
    placeholder: "# Defina a função somar(a, b) abaixo e chame-a no final\n",
    hint: "Escreva:\ndef somar(a, b):\n    print(a + b)\n\nsomar(10, 20)"
  }
];

export const BADGES = [
  { id: "primeiros_passos", name: "Primeiros Passos", icon: "🐣", desc: "Completou o nível 1 e deu partida na jornada!", criteria: (comp) => comp["1"] === "correct" },
  { id: "var_expert", name: "Mestre das Caixas", icon: "📦", desc: "Completou todos os 7 primeiros níveis sobre Variáveis e Tipos.", criteria: (comp) => Array.from({ length: 7 }, (_, i) => i + 1).every(id => comp[id] === "correct") },
  { id: "decision_maker", name: "Tomador de Decisão", icon: "⚖️", desc: "Completou os primeiros desafios de condicionais (Nível 8, 9 e 10).", criteria: (comp) => ["8", "9", "10"].every(id => comp[id] === "correct") },
  { id: "streak_3", name: "Fogo no Cérebro", icon: "🔥", desc: "Acertou 3 ou mais questões seguidas!", criteria: (_, streak) => streak >= 3 },
  { id: "pythonista_supremo", name: "Mestre da Febre", icon: "🐍", desc: "Venceu o desafio final da Balança da Febre (Nível 15).", criteria: (comp) => comp["15"] === "correct" }
];

export const RANKS = [
  { name: "Recruta Pythonista", min: 0, icon: "🐣" },
  { name: "Aprendiz de Variáveis", min: 50, icon: "📗" },
  { name: "Desenvolvedor Jr", min: 120, icon: "💻" },
  { name: "Pythonista de Elite", min: 200, icon: "🐍" },
  { name: "Mestre das Condições", min: 280, icon: "⚡" }
];

export function getRank(xp) {
  return [...RANKS].reverse().find(r => xp >= r.min) || RANKS[0];
}

export const SUB_QUESTIONS = {
  // NÍVEL 1
  "1-A": {
    id: "1-A", parentId: 1, type: "quiz", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 1-A: Modificação Dinâmica",
    question: "Podemos alterar o valor de uma variável depois de criada em Python?",
    options: ["Sim, a qualquer momento", "Não, o valor é permanente", "Apenas se for número", "Apenas se for texto"],
    answer: 0,
    explanation: "Variáveis no Python são dinâmicas e podem ser alteradas a qualquer momento no decorrer do programa."
  },
  "1-B": {
    id: "1-B", parentId: 1, type: "fill", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 1-B: O Portal do Conhecimento",
    question: "Para destrancar o portal da caverna do Professor Cobra, você deve programar o painel digitando o nome da linguagem secreta, que é 'Python':",
    code: "segredo = \"___\"",
    answer: "Python",
    hint: "Digite apenas a palavra: Python."
  },

  // NÍVEL 2
  "2-A": {
    id: "2-A", parentId: 2, type: "quiz", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 2-A: Hífens e Underscores",
    question: "O nome de variável 'valor-total' (com hífen) é válido no Python?",
    options: ["Não, hífen '-' não é permitido", "Sim, está perfeitamente correto", "Sim, mas só no Python antigo", "Não, deveria começar com um número"],
    answer: 0,
    explanation: "O hífen '-' é um operador de subtração no Python. Para nomes compostos usamos underline '_'."
  },
  "2-B": {
    id: "2-B", parentId: 2, type: "fill", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 2-B: O Inventário de Poções",
    question: "No seu inventário, você precisa criar uma variável utilizando o padrão snake_case para guardar a quantidade de poções vermelhas (10 poções):",
    code: "___ = 10",
    answer: "potoes_vermelhas",
    hint: "Escreva poções vermelhas em inglês/português sem caracteres especiais ou espaços, use o underline: potoes_vermelhas."
  },

  // NÍVEL 3
  "3-A": {
    id: "3-A", parentId: 3, type: "quiz", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 3-A: Inteiros Negativos",
    question: "O tipo 'int' pode armazenar números negativos no Python?",
    options: ["Sim, como -10 ou -500", "Não, apenas números positivos", "Apenas se colocarmos entre aspas", "Não, números negativos são do tipo float"],
    answer: 0,
    explanation: "Números inteiros podem ser positivos, negativos ou zero, desde que não tenham casas decimais."
  },
  "3-B": {
    id: "3-B", parentId: 3, type: "fill", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 3-B: A Temperatura do Subsolo",
    question: "Você desceu para a masmorra de gelo e o termômetro marcou 15 graus abaixo de zero. Defina a variável 'temperatura_masmorra' com esse valor inteiro:",
    code: "temperatura_masmorra = ___",
    answer: "-15",
    hint: "Digite o número negativo menos quinze sem espaços ou aspas: -15."
  },

  // NÍVEL 4
  "4-A": {
    id: "4-A", parentId: 4, type: "quiz", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 4-A: Ponto vs Vírgula",
    question: "Por que não usamos vírgula em números decimais no Python (ex: 1,75)?",
    options: ["Porque a vírgula separa elementos e gera erro de sintaxe", "Porque o Python só aceita números inteiros", "Porque a vírgula serve apenas para textos", "Porque o Python foi feito para não usar decimais"],
    answer: 0,
    explanation: "Na programação, o ponto decimal '.' é o padrão internacional. A vírgula ',' serve para separar parâmetros e itens."
  },
  "4-B": {
    id: "4-B", parentId: 4, type: "fill", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 4-B: O Salto do Abismo",
    question: "Para saltar um abismo com segurança, sua velocidade em metros por segundo precisa ser exatamente 8.5. Complete a variável de velocidade com esse valor decimal:",
    code: "velocidade_salto = ___",
    answer: "8.5",
    hint: "Lembre-se de usar ponto '.' e não vírgula para declarar oito e meio."
  },

  // NÍVEL 5
  "5-A": {
    id: "5-A", parentId: 5, type: "quiz", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 5-A: Compatibilidade de Aspas",
    question: "O código `msg = \"Olá'` (abrindo com duplas e fechando com simples) é válido?",
    options: ["Não, as aspas devem abrir e fechar com o mesmo tipo", "Sim, o Python corrige automaticamente", "Sim, pois ambas definem strings", "Não, strings só podem usar aspas duplas"],
    answer: 0,
    explanation: "Você pode usar aspas simples ou duplas, mas deve fechar com o mesmo tipo que abriu a string."
  },
  "5-B": {
    id: "5-B", parentId: 5, type: "fill", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 5-B: O Nome do Clã",
    question: "Você foi convidado para o clã lendário dos programadores. Defina a variável 'nome_cla' com o texto 'Cobra Real' utilizando as aspas corretas:",
    code: "nome_cla = ___",
    answer: "\"Cobra Real\"",
    hint: "Escreva o texto \"Cobra Real\" entre aspas duplas."
  },

  // NÍVEL 6
  "6-A": {
    id: "6-A", parentId: 6, type: "quiz", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 6-A: Sensibilidade de Maiúsculas",
    question: "O que acontece se escrevermos 'true' com 't' minúsculo em Python?",
    options: ["O Python dará erro porque não reconhecerá a palavra-chave", "O Python aceitará normalmente", "A variável vira uma string automática", "O valor é convertido para zero"],
    answer: 0,
    explanation: "Python é case-sensitive. True e False devem começar obrigatoriamente com letras maiúsculas."
  },
  "6-B": {
    id: "6-B", parentId: 6, type: "fill", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 6-B: Status do Guerreiro",
    question: "O guerreiro sofreu um ataque crítico de um monstro, mas conseguiu sobreviver com 1 HP! Defina o estado da variável 'fim_de_jogo' (game over) como falso, indicando que a aventura continua:",
    code: "fim_de_jogo = ___",
    answer: "False",
    hint: "Escreva False com a primeira letra maiúscula (e sem aspas, pois é booleano)."
  },

  // NÍVEL 7
  "7-A": {
    id: "7-A", parentId: 7, type: "quiz", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 7-A: A Saída do Print",
    question: "Se executarmos `print(\"Olá\")`, o que aparece no terminal de saída?",
    options: ["Olá (sem aspas)", "\"Olá\" (com aspas)", "print(\"Olá\")", "Nada, dá erro"],
    answer: 0,
    explanation: "A função print() remove as aspas delimitadoras do texto ao exibi-lo na tela."
  },
  "7-B": {
    id: "7-B", parentId: 7, type: "fill", topic: "Variáveis & Tipos", xp: 5,
    title: "Sub-fase 7-B: O Grito de Guerra",
    question: "O chefe da masmorra apareceu! Mostre na tela a mensagem guardada na variável 'grito_guerra' para assustá-lo e iniciar o combate:",
    code: "___(grito_guerra)",
    answer: "print",
    hint: "Use a função de exibição padrão do Python para enviar variáveis à tela."
  },

  // NÍVEL 8
  "8-A": {
    id: "8-A", parentId: 8, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 8-A: Importância do Recuo",
    question: "O que é indentação no Python e por que ela é obrigatória?",
    options: ["São os espaços no início da linha para delimitar blocos de código", "É o nome que se dá à escrita de comentários", "É um comando para declarar variáveis", "É a obrigatoriedade de terminar linhas com ponto e vírgula"],
    answer: 0,
    explanation: "Diferente de outras linguagens que usam chaves {}, o Python usa espaços (normalmente 4) para saber quais linhas pertencem à condicional."
  },
  "8-B": {
    id: "8-B", parentId: 8, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 8-B: A Porta Misteriosa",
    question: "Uma porta de ouro maciço na masmorra exige que você tenha exatamente 3 chaves para abrir. Complete a condicional para verificar essa igualdade:",
    code: "___ chaves == 3:",
    answer: "if",
    hint: "Escreva a condicional 'se' em inglês."
  },

  // NÍVEL 9
  "9-A": {
    id: "9-A", parentId: 9, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 9-A: Distinção de Símbolos",
    question: "Para que serve o operador de igual único `=` no Python?",
    options: ["Para atribuir ou guardar um valor numa variável", "Para comparar se duas coisas são iguais", "Para verificar se uma condição é falsa", "Para criar uma função"],
    answer: 0,
    explanation: "Um igual `=` atribui valor. Dois iguais `==` comparam igualdade."
  },
  "9-B": {
    id: "9-B", parentId: 9, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 9-B: A Ponte Estreita",
    question: "Você só pode cruzar a ponte estreita sobre a lava se a sua quantidade de vidas for diferente de zero. Complete a comparação de diferença:",
    code: "if vidas ___ 0:",
    answer: "!=",
    hint: "Use o operador 'diferente de' correspondente no Python (sinal de exclamação e igual)."
  },

  // NÍVEL 10
  "10-A": {
    id: "10-A", parentId: 10, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 10-A: Estrutura do Else",
    question: "O comando `else` pode receber um teste de condição direto (ex: `else x > 5:`)?",
    options: ["Não, o else nunca recebe condições e roda apenas se o if falhar", "Sim, pode receber a qualquer momento", "Sim, mas apenas condições numéricas", "Não, o else deve ser escrito como senão"],
    answer: 0,
    explanation: "O else é o caso genérico final. Ele não testa condições; apenas executa se tudo anterior der False."
  },
  "10-B": {
    id: "10-B", parentId: 10, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 10-B: O Baú de Tesouro",
    question: "Se o baú de tesouro estiver trancado, nós chamamos a função 'tentar_abrir()'. Caso contrário (else), exibimos a mensagem 'Tesouro coletado!'. Preencha a lacuna do senão:",
    code: "if trancado:\n    tentar_abrir()\n___:\n    print(\"Tesouro coletado!\")",
    answer: "else",
    hint: "Palavra-chave para o caso contrário em inglês."
  },

  // NÍVEL 11
  "11-A": {
    id: "11-A", parentId: 11, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 11-A: Posição do Elif",
    question: "Onde o comando 'elif' deve ser colocado em uma estrutura de decisão?",
    options: ["Entre o 'if' inicial e o 'else' final", "Sempre antes do 'if'", "Depois do 'else'", "No topo do arquivo, isolado"],
    answer: 0,
    explanation: "O elif (senão se) serve para testar condições intermediárias e só pode vir depois de um if e antes de um else."
  },
  "11-B": {
    id: "11-B", parentId: 11, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 11-B: O Elevador de Níveis",
    question: "Se o seu XP for menor que 100, você é 'Bronze'. Senão, se (elif) o XP for menor que 200, você é 'Prata'. Complete a condicional alternativa para validar o nível prata:",
    code: "if xp < 100:\n    print(\"Bronze\")\n___ xp < 200:\n    print(\"Prata\")",
    answer: "elif",
    hint: "Utilize a abreviação do Python para 'else if'."
  },

  // NÍVEL 12
  "12-A": {
    id: "12-A", parentId: 12, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 12-A: Operador Diferente",
    question: "Qual símbolo representa o operador relacional 'Diferente de' em Python?",
    options: ["!=", "<>", "==", "not"],
    answer: 0,
    explanation: "'!=' é o operador de diferença no Python. Ele compara se dois valores não são iguais."
  },
  "12-B": {
    id: "12-B", parentId: 12, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 12-B: O Dragão Adormecido",
    question: "Você se deparou com um dragão adormecido! Você só conseguirá passar sorrateiramente se o seu nível de barulho for menor que 10. Complete a condição relacional:",
    code: "if barulho ___ 10:\n    passar_sorrateiro()",
    answer: "<",
    hint: "Use o símbolo matemático de menor que."
  },

  // NÍVEL 13
  "13-A": {
    id: "13-A", parentId: 13, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 13-A: A Tabela do And",
    question: "Quando o operador lógico 'and' retorna True?",
    options: ["Apenas quando TODAS as condições associadas forem True", "Quando pelo menos uma for True", "Apenas quando ambas forem False", "Sempre que houver números envolvidos"],
    answer: 0,
    explanation: "O operador 'and' (e) é exigente. Ele necessita que todas as subcondições sejam verdadeiras para dar True."
  },
  "13-B": {
    id: "13-B", parentId: 13, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 13-B: A Sala do Trono",
    question: "Para adentrar na sala do trono, você precisa pertencer ao clã dos guerreiros E (and) possuir a medalha de honra. Use o operador lógico adequado:",
    code: "if eh_guerreiro ___ tem_medalha:\n    entrar_sala()",
    answer: "and",
    hint: "Escreva o operador 'e' em inglês."
  },

  // NÍVEL 14
  "14-A": {
    id: "14-A", parentId: 14, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 14-A: Flexibilidade do Or",
    question: "Quando o operador lógico 'or' retorna True?",
    options: ["Quando pelo menos UMA das condições associadas for True", "Apenas quando todas forem True", "Apenas se todas forem False", "Quando a primeira condição for False"],
    answer: 0,
    explanation: "O 'or' (ou) é flexível. Se pelo menos uma das condições for verdadeira, a expressão inteira é True."
  },
  "14-B": {
    id: "14-B", parentId: 14, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 14-B: Fuga da Caverna",
    question: "A caverna está desmoronando! Para escapar a tempo, você pode usar uma poção de teletransporte OU (or) correr pela saída de emergência. Complete com o operador lógico:",
    code: "if tem_pocao ___ tem_saida:\n    escapar_seguro()",
    answer: "or",
    hint: "Escreva o operador 'ou' em inglês."
  },

  // NÍVEL 15
  "15-A": {
    id: "15-A", parentId: 15, type: "quiz", topic: "Condicionais", xp: 5,
    title: "Sub-fase 15-A: Fluxo Exclusivo",
    question: "O que acontece se mais de uma condição for True em uma cadeia de if-elif-else?",
    options: ["Apenas o primeiro bloco correspondente roda, e os outros são ignorados", "Todos os blocos que derem True serão executados", "O programa dá erro de compilação", "O Python executa apenas o bloco else"],
    answer: 0,
    explanation: "O Python avalia de cima para baixo. Assim que encontra uma condição verdadeira, executa seu bloco e salta para fora de toda a estrutura."
  },
  "15-B": {
    id: "15-B", parentId: 15, type: "fill", topic: "Condicionais", xp: 5,
    title: "Sub-fase 15-B: Monitor de Energia",
    question: "No painel da espaçonave, se a bateria for menor que 20% mostramos 'Crítico'. Senão, se (elif) for menor que 50%, exibimos 'Alerta'. Preencha a lacuna condicional:",
    code: "if bateria < 20:\n    print(\"Crítico\")\n___ bateria < 50:\n    print(\"Alerta\")",
    answer: "elif",
    hint: "Use a palavra-chave condicional secundária."
  },

  // NÍVEL 16
  "16-A": {
    id: "16-A", parentId: 16, type: "quiz", topic: "Coleções", xp: 5,
    title: "Sub-fase 16-A: Índices da Lista",
    question: "Qual o índice do primeiro item de uma lista em Python?",
    options: ["0 (Zero)", "1 (Um)", "-1 (Menos Um)", "Qualquer valor"],
    answer: 0,
    explanation: "Listas em Python são indexadas a partir do zero. O primeiro elemento está na posição 0."
  },
  "16-B": {
    id: "16-B", parentId: 16, type: "fill", topic: "Coleções", xp: 5,
    title: "Sub-fase 16-B: O Inventário Organizado",
    question: "Sua mochila de itens é descrita por `itens = [\"espada\", \"escudo\", \"arco\"]`. Complete a lacuna para resgatar o primeiro elemento (índice zero) e equipar sua espada:",
    code: "equipar = itens[___]",
    answer: "0",
    hint: "Digite apenas o índice numérico correspondente ao primeiro elemento da lista."
  },

  // NÍVEL 17
  "17-A": {
    id: "17-A", parentId: 17, type: "quiz", topic: "Modularização", xp: 5,
    title: "Sub-fase 17-A: O que são Parâmetros?",
    question: "Para que servem os parâmetros/argumentos de uma função?",
    options: ["Para enviar informações de entrada para que a função possa processá-las", "Para renomear a função", "Para forçar a função a parar", "Para criar variáveis globais automáticas"],
    answer: 0,
    explanation: "Os parâmetros funcionam como variáveis locais que recebem valores quando chamamos a função, tornando-a flexível."
  },
  "17-B": {
    id: "17-B", parentId: 17, type: "fill", topic: "Modularização", xp: 5,
    title: "Sub-fase 17-B: O Feitiço de Fogo",
    question: "Crie a definição de uma função chamada 'lancar_fogo' para que seu mago possa disparar chamas a qualquer momento. Preencha com a palavra-chave de criação:",
    code: "___ lancar_fogo():\n    print(\"Fogo!\")",
    answer: "def",
    hint: "Palavra-chave utilizada para definir funções em Python."
  },
  // NÍVEL 18
  "18-A": {
    id: "18-A", parentId: 18, type: "quiz", topic: "Modularização", xp: 5,
    title: "Sub-fase 18-A: Escopo Local",
    question: "Uma variável criada dentro de uma função pode ser acessada livremente fora dela?",
    options: ["Não, ela tem escopo local e existe apenas dentro da função", "Sim, variáveis em Python são sempre globais", "Sim, desde que a função já tenha sido chamada", "Apenas se for um número inteiro"],
    answer: 0,
    explanation: "Variáveis declaradas dentro de uma função nascem e morrem ali dentro. Isso é chamado de escopo local."
  },
  "18-B": {
    id: "18-B", parentId: 18, type: "fill", topic: "Modularização", xp: 5,
    title: "Sub-fase 18-B: Ativando a Cura",
    question: "Seu parceiro de clã está ferido no combate. Chame a função de cura 'curar' passando a quantidade de 50 pontos de vida como argumento:",
    code: "___(50)",
    answer: "curar",
    hint: "Escreva exatamente o nome da função que realiza a cura."
  }
};





export function getSubQuestion(levelId, subId) {
  const customKey = `${levelId}-${subId}`;
  return SUB_QUESTIONS[customKey] || null;
}
