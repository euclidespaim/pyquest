# Lista de Tarefas: PyQuest 2.0 🚀

Acompanhamento do progresso das tarefas de desenvolvimento e refatoração do projeto.

---

## 🏗️ Sprint 1: Refatoração da Arquitetura e Modularização
- `[x]` Criar novos arquivos de componentes:
  - `[x]` [Header.jsx](file:///home/paim/Projects/pyquest2.0/src/components/Header.jsx)
  - `[x]` [Home.jsx](file:///home/paim/Projects/pyquest2.0/src/components/Home.jsx)
  - `[x]` [Roadmap.jsx](file:///home/paim/Projects/pyquest2.0/src/components/Roadmap.jsx)
  - `[x]` [LevelView.jsx](file:///home/paim/Projects/pyquest2.0/src/components/LevelView.jsx)
  - `[x]` [BadgesModal.jsx](file:///home/paim/Projects/pyquest2.0/src/components/Modals/BadgesModal.jsx)
  - `[x]` [SettingsModal.jsx](file:///home/paim/Projects/pyquest2.0/src/components/Modals/SettingsModal.jsx)
- `[x]` Isolar a lógica de áudio em `src/utils/audio.js`
- `[x]` Criar e gerenciar a nova estrutura de módulos em `src/data/questions.js`
- `[x]` Criar componente `ModuleSelector.jsx` para navegar e desbloquear módulos
- `[x]` Atualizar o [App.js](file:///home/paim/Projects/pyquest2.0/src/App.js) para atuar como Router e gerenciador de estado
- `[x]` Testar localmente a integridade da aplicação após a refatoração

## 💻 Sprint 2: Melhorias no Interpretador e Módulo Intermediário (Módulo 2)
- `[x]` Expandir o simulador em `interpreter.js` para suportar:
  - `[x]` Loops `for` (ex: `for x in range(5):` e `for item in lista:`)
  - `[x]` Loops `while` (ex: `while x < 5:`)
  - `[x]` Métodos de lista: `append()`, `remove()` e `len()`
  - `[x]` Dicionários simples (acesso e alteração)
- `[x]` Criar os desafios e questões práticas do Módulo 2 (loops, dicionários, métodos de lista) em `questions.js`
- `[x]` Atualizar o avaliador de submissões em `evaluatePythonLocally` para validar os desafios do Módulo 2

## 🏆 Sprint 3: Módulo Avançado (Módulo 3)
- `[ ]` Expandir o simulador em `interpreter.js` para compreender definições de classes básicas (OOP) e blocos `try`/`except`
- `[ ]` Criar os desafios e questões do Módulo 3 em `questions.js`
- `[ ]` Atualizar o avaliador de submissões para validar os desafios do Módulo 3

## 🧪 Sprint 4: CI/CD e Validação Web Completa
- `[ ]` Criar testes unitários para as novas funcionalidades do interpretador (`interpreter.test.js`)
- `[ ]` Configurar GitHub Actions (`ci.yml`) para rodar os testes automaticamente
- `[ ]` Configurar deploy contínuo na Vercel
- `[ ]` Testes de interface manual e validação final da plataforma web

## 📱 Sprint 5: Empacotamento Mobile (Apenas após validação web total)
- `[ ]` Inicializar o CapacitorJS no projeto
- `[ ]` Integrar a plataforma Android
- `[ ]` Validar áudio, persistência de progresso e visualização no emulador Android
- `[ ]` Gerar build de produção (`.aab`) assinado
