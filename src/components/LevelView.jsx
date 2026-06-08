import React, { useState, useEffect, useRef } from "react";
import { runSimulatedPython, evaluatePythonLocally } from "../utils/interpreter";

function highlightPython(code) {
  if (!code) return "";
  
  // Escape HTML entities
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const comments = [];
  const strings = [];

  // 1. Hide comments
  html = html.replace(/#[^\n]*/g, (match) => {
    comments.push(match);
    return `__PY_COMMENT_${comments.length - 1}__`;
  });

  // 2. Hide strings
  html = html.replace(/(["'])(?:(?!\1|\\).|\\.)*\1/g, (match) => {
    strings.push(match);
    return `__PY_STRING_${strings.length - 1}__`;
  });

  // 3. Keywords
  const keywords = [
    "class", "def", "self", "if", "elif", "else", "while", "for", "in", 
    "try", "except", "with", "open", "as", "return", "print", "len", "range", 
    "True", "False", "None"
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  html = html.replace(keywordRegex, '<span style="color: #ff7b72; font-weight: bold;">$1</span>');

  // 4. Numbers
  html = html.replace(/\b(\d+)(?:\.\d+)?\b/g, '<span style="color: #79c0ff;">$1</span>');

  // 5. Functions/Methods
  html = html.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, '<span style="color: #d2a8ff;">$1</span>');

  // Restore strings
  html = html.replace(/__PY_STRING_(\d+)__/g, (match, idx) => {
    return `<span style="color: #a5d6ff;">${strings[Number(idx)]}</span>`;
  });

  // Restore comments
  html = html.replace(/__PY_COMMENT_(\d+)__/g, (match, idx) => {
    return `<span style="color: #8b949e; font-style: italic;">${comments[Number(idx)]}</span>`;
  });

  return html;
}

const animationStyle = `
  @keyframes floatUpFade {
    0% {
      transform: translate(-50%, -50%) translateY(0) scale(0.8);
      opacity: 0;
    }
    20% {
      transform: translate(-50%, -50%) translateY(-20px) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) translateY(-100px) scale(1);
      opacity: 0;
    }
  }

  @keyframes slashAnim {
    0% {
      width: 0%;
      opacity: 0;
    }
    35% {
      width: 100%;
      opacity: 1;
    }
    100% {
      width: 100%;
      opacity: 0;
      transform: translateY(30px) rotate(-12deg);
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
    20%, 40%, 60%, 80% { transform: translateX(6px); }
  }
  
  .editor-shake {
    animation: shake 0.4s ease-in-out;
  }
`;

export default function LevelView({
  activeLevel,
  theme,
  activeTheme,
  aiApiKey,
  completed,
  onBackToRoadmap,
  onUpdateProgress,
  getNextLevel,
  playSound
}) {
  // Input/Solution States
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [fillValue, setFillValue] = useState("");
  const [challengeCode, setChallengeCode] = useState(activeLevel.placeholder || "");
  const [showHint, setShowHint] = useState(false);
  
  // Execution/Terminal States
  const [terminalOutputs, setTerminalOutputs] = useState([]);
  const [terminalError, setTerminalError] = useState("");

  // AI Mentor States
  const [mentorMessage, setMentorMessage] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);

  // Phase/Feedback States
  const [phase, setPhase] = useState("question"); // question | feedback
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Upgrades: Visual & Audio feedback states
  const [showFloatingXp, setShowFloatingXp] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Editor overlay ref
  const preRef = useRef(null);

  // Reset inputs when active level changes
  useEffect(() => {
    setSelectedQuizOption(null);
    setFillValue("");
    setChallengeCode(activeLevel.placeholder || "");
    setTerminalOutputs([]);
    setTerminalError("");
    setMentorMessage("");
    setFeedback(null);
    setPhase("question");
    setShowConfetti(false);
    setShowHint(false);
    setShowFloatingXp(false);
    setShowSlash(false);
    setScreenShake(false);
  }, [activeLevel]);

  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Actions
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
    const isAlreadyCompleted = completed[activeLevel.id] === "correct";
    let gainedXp = isAlreadyCompleted ? 0 : activeLevel.xp;
    let exp = "";

    if (activeLevel.type === "quiz") {
      isCorrect = selectedQuizOption === activeLevel.answer;
      exp = activeLevel.explanation;
    } else if (activeLevel.type === "fill") {
      const cleanInput = fillValue.replace(/'|"/g, "").trim().toLowerCase();
      const cleanAnswer = activeLevel.answer.replace(/'|"/g, "").trim().toLowerCase();
      isCorrect = cleanInput === cleanAnswer;
      exp = isCorrect 
        ? `Correto! A resposta é exatamente: ${activeLevel.answer}`
        : `Ah, a resposta correta era: ${activeLevel.answer}`;
    }

    if (isCorrect) {
      playSound("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Floating XP upgrade
      setShowFloatingXp(true);
      setTimeout(() => setShowFloatingXp(false), 2000);
      
      setFeedback({ 
        correct: true, 
        gained: gainedXp, 
        explanation: exp,
        alreadyCompleted: isAlreadyCompleted
      });
      
      onUpdateProgress(activeLevel.id, true, gainedXp);
    } else {
      playSound("error");
      
      // Shake upgrade
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400);

      setFeedback({ correct: false, gained: 0, explanation: exp });
      onUpdateProgress(activeLevel.id, false, 0);
    }

    setPhase("feedback");
  }

  function handleConfirmChallenge() {
    const isAlreadyCompleted = completed[activeLevel.id] === "correct";
    const gainedXp = isAlreadyCompleted ? 0 : activeLevel.xp;

    const res = evaluatePythonLocally(activeLevel.id, challengeCode);
    
    if (res.aprovado) {
      playSound("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Floating XP & Sword slash upgrades
      setShowFloatingXp(true);
      setTimeout(() => setShowFloatingXp(false), 2000);
      setShowSlash(true);
      setTimeout(() => setShowSlash(false), 800);
      
      setFeedback({ 
        correct: true, 
        gained: gainedXp, 
        explanation: res.feedback, 
        note: res.nota,
        alreadyCompleted: isAlreadyCompleted
      });

      onUpdateProgress(activeLevel.id, true, gainedXp);
    } else {
      playSound("error");
      
      // Shake upgrade
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400);

      setFeedback({ 
        correct: false, 
        gained: 0, 
        explanation: res.feedback, 
        note: res.nota, 
        dica: res.dica 
      });
      onUpdateProgress(activeLevel.id, false, 0);
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
          text = `Professor Cobra diz: 🐍\n\nNesta questão de escolha múltipla, analise com calma a teoria ao lado. A resposta está diretamente ligada ao conceito de que "${activeLevel.explanation ? activeLevel.explanation.split(" ").slice(0, 8).join(" ") : "os fundamentos do Python..."}...". Tente ler o exemplo e eliminar as que violam as regras básicas!`;
        } else if (activeLevel.type === "fill") {
          text = `Professor Cobra diz: 🐍\n\nNo preenchimento de código, preste atenção aos detalhes de sintaxe. A palavra procurada serve para: "${activeLevel.hint}". Lembre-se de escrever exatamente igual ao Python, em letras minúsculas!`;
        } else if (activeLevel.id === 7) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio 'Ficha do Herói', você precisa ter exatamente estas 4 linhas de código:\n1. Criar a variável: nome = "Link"\n2. Criar a variável: moedas = 50\n3. Imprimir o nome: print(nome)\n4. Imprimir as moedas: print(moedas)\n\nLembre-se de não usar aspas no número 50 e usar aspas na palavra "Link"!`;
        } else if (activeLevel.id === 15) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio final, lembre-se da indentação! A estrutura deve ser exatamente assim:\n\ntemperatura = 38.2\nif temperatura >= 37.8:\n    print("Febre")\nelif temperatura >= 37.0:\n    print("Subfebril")\nelse:\n    print("Normal")\n\nPreste muita atenção nos dois pontos ':' no final das linhas de condição e nos 4 espaços à esquerda dentro do print.`;
        } else if (activeLevel.id === 18 || activeLevel.id === 22) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio da Calculadora, você deve definir a função somar(a, b) com recuo e no final chamá-la:\n\ndef somar(a, b):\n    print(a + b)\n\nsomar(10, 20)`;
        } else {
          text = `Professor Cobra diz: 🐍\n\n${activeLevel.hint || "Revise a teoria ao lado e preste atenção na sintaxe e indentação!"}`;
        }
        setMentorMessage(text);
        setMentorLoading(false);
      }, 1000);
      return;
    }

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

  return (
    <main style={styles.splitScreen}>
      {showConfetti && <Confetti piecesCount={35} />}

      {/* COLUNA ESQUERDA: TEORIA E EXEMPLO */}
      <section className="level-view-panel level-view-panel-theory" style={{ ...styles.splitPanel, background: activeTheme.theoryBg, borderRight: `1px solid ${activeTheme.divider}`, color: activeTheme.text }}>
        <button style={{ ...styles.backBtn, color: activeTheme.primary }} onClick={() => { playSound("click"); onBackToRoadmap(); }}>
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
          {(activeLevel.theory || "Revisão prática rápida baseada nos conceitos fundamentais desta fase.").split("\n\n").map((paragraph, pIdx) => {
            if (paragraph.startsWith("```python")) {
              const rawCode = paragraph.replace(/```python|```/g, "").trim();
              return (
                <div key={pIdx} style={styles.codeIDEContainer}>
                  <div style={styles.codeIDETab}>exemplo.py</div>
                  <pre style={styles.codeIDEBlock}>{rawCode}</pre>
                </div>
              );
            }

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

        {/* PROFESSOR COBRA MENTOR BOX */}
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

      {/* COLUNA DIREITA: QUESTÃO, TERMINAL OU QUIZ */}
      <section 
        className={`level-view-panel level-view-panel-ide ${screenShake ? "editor-shake" : ""}`}
        style={{ ...styles.splitPanel, background: activeTheme.bg, color: activeTheme.text, position: "relative" }}
      >
        <style dangerouslySetInnerHTML={{ __html: animationStyle }} />

        {showFloatingXp && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "48px",
            fontWeight: "900",
            color: "#eab308", // Golden yellow
            textShadow: "0 0 20px rgba(234, 179, 8, 0.6), 0 0 2px #000",
            pointerEvents: "none",
            animation: "floatUpFade 1.8s ease-out forwards",
            zIndex: 9999
          }}>
            +{feedback ? feedback.gained : activeLevel.xp} XP
          </div>
        )}

        {showSlash && (
          <div style={{
            position: "absolute",
            top: "40%",
            left: "0",
            width: "100%",
            height: "10px",
            background: "linear-gradient(90deg, transparent, #fff 50%, transparent)",
            transform: "rotate(-12deg)",
            boxShadow: "0 0 25px #79c0ff, 0 0 12px #fff",
            animation: "slashAnim 0.7s ease-out forwards",
            zIndex: 100,
            pointerEvents: "none"
          }} />
        )}
        
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
                    <div style={{ ...styles.codeIDEBlock, padding: "20px 24px", display: "flex", alignItems: "center", flexWrap: "nowrap", gap: 0, overflowX: "auto" }}>
                      {activeLevel.code.split("___").map((snippet, sIdx, arr) => (
                        <span key={sIdx} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 17, color: "#d4d4d4", whiteSpace: "pre" }}>{snippet}</span>
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
                  
                  <div style={{ marginTop: 14 }}>
                    <button 
                      onClick={() => { playSound("click"); setShowHint(!showHint); }}
                      style={{ 
                        ...styles.secondaryBtn, 
                        borderColor: activeTheme.accent, 
                        color: activeTheme.accent, 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 6,
                        padding: "6px 12px",
                        fontSize: 13
                      }}
                    >
                      💡 {showHint ? "Esconder Dica" : "Mostrar Dica"}
                    </button>
                    {showHint && (
                      <div style={{ ...styles.hintTextBubble, background: activeTheme.theoryBg, marginTop: 8 }}>
                        {activeLevel.hint}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. LAYOUT CODE CHALLENGE */}
              {activeLevel.type === "challenge" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ ...styles.challengeGoalBox, background: activeTheme.theoryBg, borderColor: activeTheme.primary }}>
                    <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: activeTheme.primary }}>🎯 Objetivo do Desafio:</h4>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-line", color: activeTheme.text }}>
                      {activeLevel.question}
                    </p>
                  </div>
                  <p style={{ margin: "6px 0 4px", fontSize: 13, color: activeTheme.textMuted, lineHeight: 1.4 }}>
                    Digite sua solução abaixo e utilize o console para testar sua lógica.
                  </p>

                  <div style={{ ...styles.codeIDEContainer, marginBottom: 0 }}>
                    <div style={{ ...styles.codeIDETab, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>programa.py</span>
                      <span style={{ fontSize: 11, color: activeTheme.pythonGreen }}>● Editando</span>
                    </div>
                    <div style={{
                      ...styles.codeEditorWrapper,
                      background: activeTheme.terminalBg,
                      borderColor: activeTheme.cardBorder
                    }}>
                      <pre
                        ref={preRef}
                        style={{
                          ...styles.codeHighlightOverlay,
                          color: "#d4d4d4"
                        }}
                        dangerouslySetInnerHTML={{ __html: highlightPython(challengeCode) }}
                      />
                      <textarea
                        spellCheck={false}
                        value={challengeCode}
                        onChange={e => setChallengeCode(e.target.value)}
                        onScroll={handleScroll}
                        style={{
                          ...styles.codeEditorTextarea,
                          caretColor: activeTheme.text
                        }}
                      />
                    </div>
                  </div>

                  {/* Helper Keyboard */}
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

            {/* CONFIRMATION ACTION BUTTONS */}
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
                {feedback.correct 
                  ? (feedback.alreadyCompleted 
                      ? "Fase concluída anteriormente (+0 XP)" 
                      : `+${feedback.gained} XP conquistados!`)
                  : "Não desanime!"}
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

              {/* NAVIGATION CONTROLS */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 12 }}>
                {feedback.correct && getNextLevel(activeLevel.id) && (
                  <button
                    style={{ 
                      ...styles.primaryBtn, 
                      background: activeTheme.pythonGreen, 
                      boxShadow: `0 4px 14px ${activeTheme.pythonGreen}44`,
                      fontWeight: 800,
                      fontSize: 16
                    }}
                    onClick={() => {
                      const next = getNextLevel(activeLevel.id);
                      if (next) {
                        // Level transitions handled by parent component
                        setSelectedQuizOption(null);
                        setFillValue("");
                        setChallengeCode(next.placeholder || "");
                        setTerminalOutputs([]);
                        setTerminalError("");
                        setMentorMessage("");
                        setFeedback(null);
                        setPhase("question");
                        setShowConfetti(false);
                        
                        // Callback to parent to load next question
                        onUpdateProgress(null, null, null, next);
                      }
                    }}
                  >
                    Avançar para o Próximo Desafio ➔
                  </button>
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
                    style={{ 
                      ...styles.secondaryBtn, 
                      flex: 1, 
                      borderColor: activeTheme.divider, 
                      color: activeTheme.text 
                    }} 
                    onClick={() => { playSound("click"); onBackToRoadmap(); }}
                  >
                    Voltar ao Mapa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// Local simple Confetti component
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

const styles = {
  splitScreen: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%"
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
  tag: {
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "20px",
    display: "inline-block"
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
  secondaryBtn: {
    padding: "10px 16px",
    background: "none",
    border: "2px solid",
    borderRadius: "12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "center"
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
    width: "100%",
    boxSizing: "border-box",
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
  codeEditorWrapper: {
    position: "relative",
    width: "100%",
    height: "220px",
    boxSizing: "border-box",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    borderWidth: "0 1px 1px 1px",
    borderStyle: "solid",
    overflow: "hidden",
  },
  codeHighlightOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    padding: "16px",
    fontSize: "14px",
    fontFamily: "monospace",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    boxSizing: "border-box",
    pointerEvents: "none",
    background: "transparent",
    overflow: "hidden",
    border: "none",
    textAlign: "left",
  },
  codeEditorTextarea: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    padding: "16px",
    fontSize: "14px",
    fontFamily: "monospace",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    boxSizing: "border-box",
    background: "transparent",
    color: "transparent",
    border: "none",
    outline: "none",
    resize: "none",
    overflowY: "auto",
    overflowX: "hidden",
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
  challengeGoalBox: {
    padding: "16px",
    borderRadius: "12px",
    borderLeft: "4px solid",
    marginBottom: "10px",
  }
};
