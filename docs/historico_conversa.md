# Histórico de Desenvolvimento e Mentoria: PyQuest 2.0 🐍

Este documento registra a sessão de mentoria e engenharia de software realizada em 04 de Junho de 2026 com o assistente **Antigravity**. Ele serve como documentação viva do projeto para orientar as próximas etapas e manter o registro de decisões arquiteturais.

---

## 🎯 Escopo da Sessão

O objetivo principal desta sessão foi analisar o estado inicial do **PyQuest** (originalmente uma SPA monolítica em React com 18 fases lineares) e propor um plano de evolução estruturado para transformá-lo em um aplicativo escalável de ensino de Python para alunos de Ensino Médio, preparando as bases para:
1. Execução local estável.
2. Refatoração estrutural (Clean Code e componentização).
3. Expansão de conteúdo com novos módulos (Módulo 2 e Módulo 3).
4. Pipelines de testes automatizados e deploy contínuo (CI/CD com Vercel).
5. Publicação mobile como app nativo via CapacitorJS.

---

## 🏗️ Decisões Arquiteturais & Melhorias Implementadas

### 1. Quebra do Monolito `App.js`
Originalmente, toda a lógica de renderização, IDE, console, áudio e estilos residia em um arquivo monolítico de 1.800 linhas. O projeto foi modularizado nos seguintes componentes:
*   `src/components/Header.jsx`: Painel global de status do jogador (nome, XP, streak, rank, conquistas e configurações).
*   `src/components/Home.jsx`: Tela de login/entrada de novos alunos.
*   `src/components/ModuleSelector.jsx`: Nova interface para selecionar os módulos didáticos disponíveis.
*   `src/components/Roadmap.jsx`: Renderizador da trilha SVG sinuosa, agora alimentado dinamicamente pelas fases do módulo selecionado.
*   `src/components/LevelView.jsx`: Painel principal de execução de fases (IDE de código com console simulado, painel de teoria de blocos de código e botão do Professor Cobra/AI Mentor).
*   `src/components/Modals/BadgesModal.jsx` e `SettingsModal.jsx`: Modals específicos para visualização de conquistas e configurações do app.
*   `src/utils/audio.js`: Isolamento da Web Audio API para reprodução nativa de efeitos sonoros.

### 2. Nova Grade de Módulos (Trilha Progressiva)
A estrutura linear de fases foi agrupada em **Módulos Fechados**. Os módulos seguintes só são desbloqueados ao concluir **100%** de todas as fases (principais e sub-fases A e B) do módulo anterior.
*   **Módulo 1: Fundamentos & Condicionais (Fases 1 a 15):** Variáveis, tipos de dados primitivos, operadores lógicos e aritméticos, e condicionais (`if`, `elif`, `else`).
*   **Módulo 2: Coleções, Repetições & Funções (Fases 16 a 22):** Listas (indexação e fatiamento), laços de repetição (`for` e `while`), dicionários simples e modularização por meio de funções parametrizadas.

### 3. Evolução do Interpretador Python Offline
O interpretador offline nativo (`src/utils/interpreter.js`) foi expandido para suportar o currículo do Módulo 2. Ele agora é capaz de simular em JavaScript:
*   Laços `while` (com limitador automático de 500 iterações para prevenir loops infinitos no navegador dos alunos).
*   Laços `for` (com suporte à função global `range()` e iterações sobre arrays/listas).
*   Métodos nativos de lista: `.append()`, `.remove()`, `.pop()` e a função `len()`.
*   Estruturas de dicionários (pares de chave-valor) e atribuições em coleções (`mochila[0] = "espada"`, `jogador["hp"] = 90`).

### 4. Modo Desenvolvedor (Bypass de Testes)
Para auxiliar na depuração e testes imediatos das fases avançadas, adicionamos a opção **Modo Desenvolvedor** no menu de configurações. Quando ativo, todas as travas de progresso são suspensas, permitindo acesso direto a qualquer módulo ou sub-desafio.

### 5. Melhorias de UX e Correção de Bugs
*   **Dica Oculta:** As dicas teóricas de lacuna (`fill`) agora iniciam ocultas sob um botão dinâmico de lâmpada (`💡 Mostrar Dica`), forçando os alunos a tentar resolver antes de ver a dica.
*   **Objetivo dos Desafios:** Exibição clara das metas e instruções dos desafios práticos diretamente acima da caixa da IDE (`🎯 Objetivo do Desafio`), reduzindo a fadiga de leitura na barra lateral esquerda.
*   **Bug de Validação das Aspas:** Corrigimos o avaliador de lacunas que gerava falsos negativos em fases contendo aspas no gabarito (como no nível 16). Agora, as aspas de ambos os lados são normalizadas antes da comparação.

---

## 🧪 Testes de Validação

Escrevemos uma suite de testes unitários em [interpreter.test.js](file:///home/paim/Projects/pyquest2.0/src/utils/interpreter.test.js) cobrindo as novas regras do simulador. O comando `npm test` obteve aprovação máxima:
```bash
PASS src/utils/interpreter.test.js
  ✓ Basic assignment and print
  ✓ Conditionals if/elif/else
  ✓ While loop with counter
  ✓ For loop with range
  ✓ Lists, appends, and len
  ✓ Dictionaries and assignments
```

---

## 📅 Próximos Passos Planejados

De acordo com o plano aprovado:
1.  **Sprint 3 (Módulo Avançado 3):** Expandir o currículo e o interpretador para abranger conceitos de Programação Orientada a Objetos (Classes, Construtor `__init__`, `self` e Métodos), manipulação de arquivos e tratamento de erros (`try/except`).
2.  **Sprint 4 (Deploy & CI/CD):** Configurar o workflow de testes automáticos via GitHub Actions e o pipeline de deploy na Vercel.
3.  **Sprint 5 (Mobile):** Integrar o CapacitorJS, rodar o build no emulador Android e gerar o arquivo de lançamento `.aab` para publicação na Google Play Store.
