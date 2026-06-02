import { useState, useEffect } from "react";
import { QUESTIONS, BADGES, getRank, getSubQuestion } from "./data/questions";
import { runSimulatedPython, evaluatePythonLocally } from "./utils/interpreter";

// ─── MAIN PYQUEST REACT APPLICATION ──────────────────────────────────────────
export default function App() {
  // Screen resize hook for responsive roadmap path
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute dynamic width and positioning for the path nodes
  const containerWidth = Math.min(600, windowWidth - 32);
  const centerX = containerWidth / 2;
  const horizontalDeviation = Math.min(120, containerWidth * 0.22);

  // Persistence states
  const [theme, setTheme] = useState(() => localStorage.getItem("pyquest_theme") || "dark");
  const [hoveredNode, setHoveredNode] = useState(null);
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

  function handleStart(name) {
    if (!name.trim()) return;
    playSound("click");
    setPlayerName(name.trim());
    setScreen("roadmap");
  }

  function handleSelectLevel(level) {
    // Determine if the selected level/sub-level is unlocked
    let isUnlocked = false;
    if (typeof level.id === "number") {
      if (level.id === 1) {
        isUnlocked = true;
      } else {
        const prevId = level.id - 1;
        isUnlocked =
          completed[prevId] === "correct" &&
          completed[prevId + "-A"] === "correct" &&
          completed[prevId + "-B"] === "correct";
      }
    } else if (typeof level.id === "string" && level.id.includes("-")) {
      // Subpath: unlocked if the main level is unlocked!
      const parentId = Number(level.id.split("-")[0]);
      if (parentId === 1) {
        isUnlocked = true;
      } else {
        const prevId = parentId - 1;
        isUnlocked =
          completed[prevId] === "correct" &&
          completed[prevId + "-A"] === "correct" &&
          completed[prevId + "-B"] === "correct";
      }
    }

    if (!isUnlocked) {
      playSound("error");
      window.alert("Nível ou sub-desafio bloqueado! Conclua o nó principal anterior e ambas as suas sub-fases secundárias para avançar nesta missão. 🔐");
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
    const isAlreadyCompleted = completed[activeLevel.id] === "correct";
    let gainedXp = isAlreadyCompleted ? 0 : activeLevel.xp;
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
      if (!isAlreadyCompleted) {
        setStreak(s => s + 1);
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setCompleted(prev => ({ ...prev, [activeLevel.id]: "correct" }));
      setFeedback({ 
        correct: true, 
        gained: gainedXp, 
        explanation: exp,
        alreadyCompleted: isAlreadyCompleted
      });
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
    const isAlreadyCompleted = completed[activeLevel.id] === "correct";
    const gained = isAlreadyCompleted ? 0 : activeLevel.xp;

    // Call offline evaluator
    const res = evaluatePythonLocally(activeLevel.id, challengeCode);
    
    if (res.aprovado) {
      playSound("success");
      setXp(x => x + gained);
      if (!isAlreadyCompleted) {
        setStreak(s => s + 1);
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setCompleted(prev => ({ ...prev, [activeLevel.id]: "correct" }));
      setFeedback({ 
        correct: true, 
        gained: gained, 
        explanation: res.feedback, 
        note: res.nota,
        alreadyCompleted: isAlreadyCompleted
      });
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
          text = `Professor Cobra diz: 🐍\n\nNesta questão de escolha múltipla, analise com calma a teoria ao lado. A resposta está diretamente ligada ao conceito de que "${activeLevel.explanation ? activeLevel.explanation.split(" ").slice(0, 8).join(" ") : "os fundamentos do Python..."}...". Tente ler o exemplo e eliminar as que violam as regras básicas!`;
        } else if (activeLevel.type === "fill") {
          text = `Professor Cobra diz: 🐍\n\nNo preenchimento de código, preste atenção aos detalhes de sintaxe. A palavra procurada serve para: "${activeLevel.hint}". Lembre-se de escrever exatamente igual ao Python, em letras minúsculas!`;
        } else if (activeLevel.id === 7) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio 'Ficha do Herói', você precisa ter exatamente estas 4 linhas de código:\n1. Criar a variável: nome = "Link"\n2. Criar a variável: moedas = 50\n3. Imprimir o nome: print(nome)\n4. Imprimir as moedas: print(moedas)\n\nLembre-se de não usar aspas no número 50 e usar aspas na palavra "Link"!`;
        } else if (activeLevel.id === 15) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio final, lembre-se da indentação! A estrutura deve ser exatamente assim:\n\ntemperatura = 38.2\nif temperatura >= 37.8:\n    print("Febre")\nelif temperatura >= 37.0:\n    print("Subfebril")\nelse:\n    print("Normal")\n\nPreste muita atenção nos dois pontos ':' no final das linhas de condição e nos 4 espaços à esquerda dentro do print.`;
        } else if (activeLevel.id === 18) {
          text = `Professor Cobra diz: 🐍\n\nNo desafio da Calculadora, você deve definir a função somar(a, b) com recuo e no final chamá-la:\n\ndef somar(a, b):\n    print(a + b)\n\nsomar(10, 20)`;
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

  function getNextLevel(currentLevelId) {
    if (typeof currentLevelId === "number") {
      return getSubQuestion(currentLevelId, "A");
    } else if (typeof currentLevelId === "string" && currentLevelId.includes("-")) {
      const [parentStr, sub] = currentLevelId.split("-");
      const parentId = Number(parentStr);
      if (sub === "A") {
        return getSubQuestion(parentId, "B");
      } else if (sub === "B") {
        const nextMain = QUESTIONS.find(q => q.id === parentId + 1);
        return nextMain || null;
      }
    }
    return null;
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

      {/* TELA B: TRILHA DE APRENDIZADO SINUOSA (Spring Garden Winding Path) */}
      {screen === "roadmap" && (
        <main style={{ ...styles.roadmapScreen, background: activeTheme.bg, padding: "24px 12px 100px" }}>
          {/* Inject dynamic styles */}
          <style>{`
            .pulse-node {
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
              animation: springPulse 2s infinite ease-in-out;
            }
            @keyframes springPulse {
              0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); transform: scale(1); }
              70% { box-shadow: 0 0 20px 8px rgba(16, 185, 129, 0.1); transform: scale(1.08); }
              100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); transform: scale(1); }
            }
            .spring-card {
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.6);
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
              backdrop-filter: blur(10px);
              transition: all 0.3s ease;
            }
            .spring-node-btn {
              width: 76px;
              height: 76px;
              border-radius: 50%;
              border: 4px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: 800;
              color: #ffffff;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
              position: relative;
              z-index: 5;
            }
            .spring-node-btn:hover:not(:disabled) {
              transform: scale(1.12);
              box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25);
            }
            .sub-node-btn {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: 800;
              color: #ffffff;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 4px 10px rgba(59, 130, 246, 0.12);
              position: relative;
              z-index: 5;
            }
            .sub-node-btn:hover:not(:disabled) {
              transform: scale(1.15);
              box-shadow: 0 6px 14px rgba(59, 130, 246, 0.22);
            }
            .tooltip-bubble {
              position: absolute;
              width: 200px;
              padding: 8px 12px;
              background: rgba(255, 255, 255, 0.98);
              border: 2px solid #34d399;
              border-radius: 14px;
              box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15);
              z-index: 20;
              pointer-events: none;
              text-align: center;
              transform: translateY(-10px);
              animation: tooltipAppear 0.2s forwards ease-out;
            }
            .sub-tooltip-bubble {
              position: absolute;
              width: 170px;
              padding: 6px 10px;
              background: rgba(255, 255, 255, 0.98);
              border: 2px solid #60a5fa;
              border-radius: 12px;
              box-shadow: 0 6px 15px rgba(59, 130, 246, 0.12);
              z-index: 20;
              pointer-events: none;
              text-align: center;
              transform: translateY(-8px);
              animation: tooltipAppear 0.2s forwards ease-out;
            }
            @keyframes tooltipAppear {
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>

          <div style={{ ...styles.roadmapContainer, maxWidth: containerWidth }}>
            {/* Header com estilo Primavera Suave */}
            <div className="spring-card" style={{ padding: "24px 20px", marginBottom: 40, textAlign: "center", background: "rgba(255, 255, 255, 0.8)", border: "2px solid #bbf7d0" }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: "#065f46", margin: 0, letterSpacing: "-0.5px" }}>
                Jornada de Aprendizado 🌸
              </h2>
              <p style={{ color: "#047857", fontSize: 14, margin: "6px 0 0", fontWeight: 500 }}>
                Conclua os nós principais e seus subpaths laterais para liberar novas missões!
              </p>
            </div>

            {/* TRILHA SINUOSA (ZIG-ZAG RESPONSIVO) */}
            <div style={{ position: "relative", width: "100%", height: QUESTIONS.length * 140 + 80, margin: "0 auto" }}>
              
              {/* SVG Connecting Vine Line (zIndex: 1, runs UNDER the circles) */}
              <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
                <path
                  d={(() => {
                    let pathD = "";
                    QUESTIONS.forEach((level, idx) => {
                      const x = centerX + Math.sin(idx * 0.8) * horizontalDeviation;
                      const y = idx * 140 + 60;
                      if (idx === 0) {
                        pathD += `M ${x} ${y}`;
                      } else {
                        const prevX = centerX + Math.sin((idx - 1) * 0.8) * horizontalDeviation;
                        const prevY = (idx - 1) * 140 + 60;
                        const cpY1 = prevY + 70;
                        const cpY2 = y - 70;
                        pathD += ` C ${prevX} ${cpY1}, ${x} ${cpY2}, ${x} ${y}`;
                      }
                    });
                    return pathD;
                  })()}
                  fill="none"
                  stroke="#a7f3d0"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="14 10"
                />
              </svg>

              {/* RENDERIZAR OS NÓS E SUB-DESAFIOS */}
              {QUESTIONS.map((level, idx) => {
                const isCompleted = completed[level.id] === "correct";
                
                // Determine lock status: unlocked if N-1 level AND BOTH N-1 sub-levels are completed
                const isUnlocked = level.id === 1 || (
                  completed[level.id - 1] === "correct" &&
                  completed[(level.id - 1) + "-A"] === "correct" &&
                  completed[(level.id - 1) + "-B"] === "correct"
                );
                const isCurrent = isUnlocked && !isCompleted;

                // Sub-fase A & B completions
                const isSubACompleted = completed[level.id + "-A"] === "correct";
                const isSubBCompleted = completed[level.id + "-B"] === "correct";

                const x = centerX + Math.sin(idx * 0.8) * horizontalDeviation;
                const isNodeOnLeft = Math.sin(idx * 0.8) < 0;

                return (
                  <div
                    key={level.id}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: idx * 140,
                      width: "100%",
                      height: 140,
                      zIndex: 2,
                    }}
                  >
                    
                    {/* SVG Branch Lines for Subpaths (zIndex: 1, drawn UNDER buttons) */}
                    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
                      <line x1={x} y1={60} x2={isNodeOnLeft ? x + 65 : x - 65} y2={60 - 40} stroke="#a7f3d0" strokeWidth="4" />
                      <line x1={x} y1={60} x2={isNodeOnLeft ? x + 65 : x - 65} y2={60 + 40} stroke="#a7f3d0" strokeWidth="4" />
                    </svg>

                    {/* A. BOTÃO DO NÍVEL PRINCIPAL */}
                    <button
                      className={`spring-node-btn ${isCurrent ? "pulse-node" : ""}`}
                      onClick={() => handleSelectLevel(level)}
                      disabled={!isUnlocked}
                      onMouseEnter={() => setHoveredNode(String(level.id))}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{
                        position: "absolute",
                        left: x - 38,
                        top: 60 - 38,
                        background: isCompleted
                          ? "linear-gradient(135deg, #a7f3d0, #34d399)" // Completed Green
                          : isCurrent
                            ? "linear-gradient(135deg, #fef08a, #facc15)" // Active pulsing yellow
                            : "#cbd5e1", // Locked gray
                        color: isCompleted
                          ? "#065f46"
                          : isCurrent
                            ? "#854d0e"
                            : "#475569", // High contrast locked
                        borderColor: isCurrent ? "#facc15" : "#ffffff",
                        opacity: isUnlocked ? 1 : 0.75,
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        zIndex: 5,
                      }}
                    >
                      {level.id}
                      
                      {/* Completion check badge */}
                      {isCompleted && (
                        <span style={{ position: "absolute", top: -8, right: -8, background: "#10b981", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #fff", zIndex: 6 }}>
                          🌸
                        </span>
                      )}

                      {/* Locked badge indicator */}
                      {!isUnlocked && (
                        <span style={{ position: "absolute", bottom: -6, right: -6, background: "#6b7280", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, border: "2px solid #fff", zIndex: 6 }}>
                          🔒
                        </span>
                      )}
                    </button>

                    {/* B. SUB-BOTÃO A (Subpath superior) */}
                    <button
                      className="sub-node-btn"
                      onClick={() => handleSelectLevel(getSubQuestion(level.id, "A"))}
                      disabled={!isUnlocked}
                      onMouseEnter={() => setHoveredNode(level.id + "-A")}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{
                        position: "absolute",
                        left: (isNodeOnLeft ? x + 65 : x - 65) - 20,
                        top: (60 - 40) - 20,
                        background: isSubACompleted
                          ? "linear-gradient(135deg, #bbf7d0, #10b981)" // completed
                          : isUnlocked
                            ? "linear-gradient(135deg, #93c5fd, #3b82f6)" // unlocked blue
                            : "#cbd5e1", // locked
                        color: isSubACompleted
                          ? "#065f46"
                          : isUnlocked
                            ? "#1e3a8a"
                            : "#475569",
                        opacity: isUnlocked ? 1 : 0.75,
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        zIndex: 5,
                      }}
                    >
                      A
                      {isSubACompleted && (
                        <span style={{ position: "absolute", top: -6, right: -6, background: "#10b981", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, border: "1px solid #fff", zIndex: 6 }}>
                          🌸
                        </span>
                      )}
                    </button>

                    {/* C. SUB-BOTÃO B (Subpath inferior) */}
                    <button
                      className="sub-node-btn"
                      onClick={() => handleSelectLevel(getSubQuestion(level.id, "B"))}
                      disabled={!isUnlocked}
                      onMouseEnter={() => setHoveredNode(level.id + "-B")}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{
                        position: "absolute",
                        left: (isNodeOnLeft ? x + 65 : x - 65) - 20,
                        top: (60 + 40) - 20,
                        background: isSubBCompleted
                          ? "linear-gradient(135deg, #bbf7d0, #10b981)" // completed
                          : isUnlocked
                            ? "linear-gradient(135deg, #93c5fd, #3b82f6)" // unlocked blue
                            : "#cbd5e1", // locked
                        color: isSubBCompleted
                          ? "#065f46"
                          : isUnlocked
                            ? "#1e3a8a"
                            : "#475569",
                        opacity: isUnlocked ? 1 : 0.75,
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        zIndex: 5,
                      }}
                    >
                      B
                      {isSubBCompleted && (
                        <span style={{ position: "absolute", top: -6, right: -6, background: "#10b981", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, border: "1px solid #fff", zIndex: 6 }}>
                          🌸
                        </span>
                      )}
                    </button>

                    {/* D. FLOATING HOVER TOOLTIPS */}
                    
                    {/* Tooltip para Nó Principal */}
                    {hoveredNode === String(level.id) && (
                      <div
                        className="tooltip-bubble"
                        style={{
                          left: x - 100,
                          top: 60 - 95,
                        }}
                      >
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>
                          {level.topic}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", marginTop: 2 }}>
                          Fase {level.id}: {level.title.split(". ")[1] || level.title}
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                          {isCompleted ? "🌸 Concluído!" : !isUnlocked ? "🔒 Requer fase anterior" : "⚡ Clique para Jogar!"} (+{level.xp} XP)
                        </div>
                      </div>
                    )}

                    {/* Tooltip para Sub-fase A */}
                    {hoveredNode === level.id + "-A" && (
                      <div
                        className="sub-tooltip-bubble"
                        style={{
                          left: (isNodeOnLeft ? x + 65 : x - 65) - 85,
                          top: (60 - 40) - 70,
                        }}
                      >
                        <div style={{ fontSize: 8, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" }}>
                          Fase {level.id} — Subpath A
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#1f2937", marginTop: 1 }}>
                          Desafio Rápido A
                        </div>
                        <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>
                          {isSubACompleted ? "🌸 Prática Concluída!" : !isUnlocked ? "🔒 Bloqueado" : "⚡ Clique para Praticar!"} (+5 XP)
                        </div>
                      </div>
                    )}

                    {/* Tooltip para Sub-fase B */}
                    {hoveredNode === level.id + "-B" && (
                      <div
                        className="sub-tooltip-bubble"
                        style={{
                          left: (isNodeOnLeft ? x + 65 : x - 65) - 85,
                          top: (60 + 40) - 70,
                        }}
                      >
                        <div style={{ fontSize: 8, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" }}>
                          Fase {level.id} — Subpath B
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#1f2937", marginTop: 1 }}>
                          Revisão Relâmpago B
                        </div>
                        <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>
                          {isSubBCompleted ? "🌸 Revisão Concluída!" : !isUnlocked ? "🔒 Bloqueado" : "⚡ Clique para Revisar!"} (+5 XP)
                        </div>
                      </div>
                    )}

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
              {(activeLevel.theory || "Revisão prática rápida baseada nos conceitos fundamentais desta fase.").split("\n\n").map((paragraph, pIdx) => {
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
                            handleSelectLevel(next);
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
                          borderColor: feedback.correct ? activeTheme.divider : activeTheme.divider, 
                          color: activeTheme.text 
                        }} 
                        onClick={() => { playSound("click"); setScreen("roadmap"); }}
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
    bg: "linear-gradient(to bottom, #fffbeb, #f0fdf4, #ecfeff)",
    cardBg: "#ffffff",
    cardBorder: "#bbf7d0",
    text: "#065f46",
    textMuted: "#047857",
    primary: "#059669",
    primaryGlow: "rgba(5, 150, 105, 0.1)",
    success: "#10b981",
    successBg: "#d1fae5",
    successText: "#065f46",
    error: "#ef4444",
    errorBg: "#fee2e2",
    errorText: "#991b1b",
    accent: "#f59e0b",
    accentBg: "#fef3c7",
    pythonGreen: "#10b981",
    pythonBlue: "#0284c7",
    headerBg: "#ffffff",
    divider: "#e2e8f0",
    terminalBg: "#0f172a",
    terminalText: "#38bdf8",
    theoryBg: "#f0fdf4",
    inputBg: "#ffffff",
    inputBorder: "#cbd5e1",
    roadmapLine: "#a7f3d0"
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
    cursor: "pointer",
    textAlign: "center"
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
  },
  divider: {
    height: 1,
    margin: "12px 0",
  }
};
