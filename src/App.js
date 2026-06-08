import React, { useState, useEffect } from "react";
import { QUESTIONS, MODULES, BADGES, getRank, getSubQuestion } from "./data/questions";
import { playSound, startBackgroundMusic, stopBackgroundMusic } from "./utils/audio";

// Component imports
import Header from "./components/Header";
import Home from "./components/Home";
import ModuleSelector from "./components/ModuleSelector";
import Roadmap from "./components/Roadmap";
import LevelView from "./components/LevelView";
import BadgesModal from "./components/Modals/BadgesModal";
import SettingsModal from "./components/Modals/SettingsModal";
import CastleUnlockAnimation from "./components/CastleUnlockAnimation";

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

  // UI Navigation States
  const [screen, setScreen] = useState(() => (playerName ? "modules" : "home")); // home | modules | roadmap | level
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);

  // Settings / Modals States
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem("pyquest_ai_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [showBadgesPanel, setShowBadgesPanel] = useState(false);
  const [devMode, setDevMode] = useState(() => localStorage.getItem("pyquest_dev_mode") === "true");
  const [bgMusicEnabled, setBgMusicEnabled] = useState(() => localStorage.getItem("pyquest_bg_music") === "true");
  const [loadingSplash, setLoadingSplash] = useState(true);

  // Castle unlock animations states
  const [activeUnlockedAnimation, setActiveUnlockedAnimation] = useState(null);
  const [completedAnimations, setCompletedAnimations] = useState(() => {
    try {
      const saved = localStorage.getItem("pyquest_completed_animations");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("pyquest_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pyquest_bg_music", bgMusicEnabled ? "true" : "false");
  }, [bgMusicEnabled]);

  useEffect(() => {
    const startOnInteraction = () => {
      if (localStorage.getItem("pyquest_bg_music") === "true") {
        startBackgroundMusic();
      }
      document.removeEventListener("click", startOnInteraction);
    };
    document.addEventListener("click", startOnInteraction);
    return () => {
      document.removeEventListener("click", startOnInteraction);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("pyquest_dev_mode", devMode);
  }, [devMode]);

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
    if (screen !== "home") {
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
        playSound("success");
      }
    }
  }, [completed, streak, screen, unlockedBadges]);

  // Module completion/castle door unlock trigger
  useEffect(() => {
    if (screen !== "home" && completed) {
      // Module 1 check (questions 1 to 15)
      const m1Questions = QUESTIONS.filter(q => q.id <= 15);
      const m1Finished = m1Questions.every(q => 
        completed[q.id] === "correct" &&
        completed[q.id + "-A"] === "correct" &&
        completed[q.id + "-B"] === "correct"
      );

      // Module 2 check (questions 16 to 22)
      const m2Questions = QUESTIONS.filter(q => q.id > 15 && q.id <= 22);
      const m2Finished = m2Questions.every(q => 
        completed[q.id] === "correct" &&
        completed[q.id + "-A"] === "correct" &&
        completed[q.id + "-B"] === "correct"
      );

      if (m1Finished && !completedAnimations.includes("m1")) {
        setActiveUnlockedAnimation({ moduleId: "m1", nextModuleTitle: "Módulo 2: Coleções, Repetições & Funções" });
        setCompletedAnimations(prev => {
          const next = [...prev, "m1"];
          localStorage.setItem("pyquest_completed_animations", JSON.stringify(next));
          return next;
        });
      } else if (m2Finished && !completedAnimations.includes("m2")) {
        setActiveUnlockedAnimation({ moduleId: "m2", nextModuleTitle: "Módulo 3: POO, Exceções & Arquivos" });
        setCompletedAnimations(prev => {
          const next = [...prev, "m2"];
          localStorage.setItem("pyquest_completed_animations", JSON.stringify(next));
          return next;
        });
      }
    }
  }, [completed, completedAnimations, screen]);

  const activeTheme = THEMES[theme];

  // Router functions
  function handleStart(name) {
    if (!name.trim()) return;
    setPlayerName(name.trim());
    setScreen("modules");
  }

  function handleSelectModule(module) {
    setSelectedModule(module);
    setScreen("roadmap");
  }

  function handleSelectLevel(level) {
    // Lock logic checks
    let isUnlocked = false;
    
    // Check if level belongs to the selected module
    const currentModule = selectedModule || MODULES.find(m => m.questions.some(q => q.id === level.id || (typeof level.id === "string" && q.id === Number(level.id.split("-")[0]))));
    const moduleQuestions = currentModule ? currentModule.questions : QUESTIONS;

    // Normalizing level structure
    const mainLevelId = typeof level.id === "number" ? level.id : Number(level.id.split("-")[0]);
    const levelIdx = moduleQuestions.findIndex(q => q.id === mainLevelId);

    if (levelIdx === 0) {
      // First level of the module is always unlocked
      isUnlocked = true;
    } else {
      // Unlocked if the previous level and all its subpaths are correct
      const prevLevel = moduleQuestions[levelIdx - 1];
      isUnlocked =
        completed[prevLevel.id] === "correct" &&
        completed[prevLevel.id + "-A"] === "correct" &&
        completed[prevLevel.id + "-B"] === "correct";
    }

    if (devMode) {
      isUnlocked = true;
    }

    if (!isUnlocked) {
      playSound("error");
      window.alert("Nível ou sub-desafio bloqueado! Conclua o nó principal anterior e ambas as suas sub-fases secundárias para avançar nesta missão. 🔐");
      return;
    }

    playSound("click");
    setActiveLevel(level);
    setScreen("level");
  }

  function handleUpdateProgress(levelId, correct, gainedXp, loadNextLevelObj) {
    if (loadNextLevelObj) {
      // Directly loading a next level from LevelView
      setActiveLevel(loadNextLevelObj);
      return;
    }

    if (correct) {
      setXp(x => x + gainedXp);
      setStreak(s => s + 1);
      setCompleted(prev => ({ ...prev, [levelId]: "correct" }));
    } else {
      setStreak(0);
      setCompleted(prev => {
        if (prev[levelId] === "correct") return prev;
        return { ...prev, [levelId]: "wrong" };
      });
    }
  }

  function handleReset() {
    if (window.confirm("Quer mesmo reiniciar sua jornada do zero? Seus pontos, conquistas e fases serão limpos!")) {
      localStorage.clear();
      setXp(0);
      setStreak(0);
      setCompleted({});
      setUnlockedBadges([]);
      setPlayerName("");
      setSelectedModule(null);
      setActiveLevel(null);
      setScreen("home");
      setShowSettings(false);
    }
  }

  function getNextLevel(currentLevelId) {
    // If it's a main level (number), return subpath A
    if (typeof currentLevelId === "number") {
      return getSubQuestion(currentLevelId, "A");
    } 
    // If it's a subpath A, return subpath B
    else if (typeof currentLevelId === "string" && currentLevelId.includes("-")) {
      const [parentStr, sub] = currentLevelId.split("-");
      const parentId = Number(parentStr);
      if (sub === "A") {
        return getSubQuestion(parentId, "B");
      } 
      // If it's a subpath B, return next main level
      else if (sub === "B") {
        const currentModule = selectedModule || MODULES.find(m => m.questions.some(q => q.id === parentId));
        if (currentModule) {
          const idx = currentModule.questions.findIndex(q => q.id === parentId);
          if (idx !== -1 && idx < currentModule.questions.length - 1) {
            return currentModule.questions[idx + 1];
          }
        }
      }
    }
    return null;
  }

  const rank = getRank(xp);
  const maxPossibleXP = QUESTIONS.reduce((sum, q) => sum + q.xp, 0);
  const xpPercentage = Math.min(100, Math.round((xp / maxPossibleXP) * 100));

  if (loadingSplash) {
    return (
      <div style={{ ...styles.root, background: activeTheme.bg, color: activeTheme.text, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          .float-avatar {
            animation: float 3s infinite ease-in-out;
          }
        `}</style>
        <div className="float-avatar" style={{ textAlign: "center" }}>
          <img 
            src={`${process.env.PUBLIC_URL}/logo512.png`} 
            alt="PyQuest Logo" 
            style={{ 
              width: 200, 
              height: 200, 
              borderRadius: "36px", 
              boxShadow: `0 12px 32px ${activeTheme.primaryGlow}, 0 4px 12px rgba(0,0,0,0.25)`,
              border: `3px solid ${activeTheme.pythonGreen}`
            }} 
          />
          <h1 style={{ 
            color: activeTheme.pythonGreen, 
            fontSize: 32, 
            fontWeight: 900, 
            marginTop: 18, 
            letterSpacing: -1 
          }}>PyQuest 2.0</h1>
        </div>
      </div>
    );
  }

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

      {/* HEADER BAR */}
      {screen !== "home" && (
        <Header
          playerName={playerName}
          rank={rank}
          xp={xp}
          xpPercentage={xpPercentage}
          streak={streak}
          theme={theme}
          activeTheme={activeTheme}
          unlockedBadgesCount={unlockedBadges.length}
          onOpenBadges={() => setShowBadgesPanel(true)}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          onOpenSettings={() => setShowSettings(true)}
          onNavigateModules={() => setScreen("modules")}
          playSound={playSound}
        />
      )}

      {/* SCREEN ROUTING */}
      {screen === "home" && (
        <Home
          activeTheme={activeTheme}
          nameInput={nameInput}
          setNameInput={setNameInput}
          handleStart={handleStart}
          playSound={playSound}
        />
      )}

      {screen === "modules" && (
        <ModuleSelector
          MODULES={MODULES}
          completed={completed}
          activeTheme={activeTheme}
          onSelectModule={handleSelectModule}
          playSound={playSound}
          devMode={devMode}
        />
      )}

      {screen === "roadmap" && selectedModule && (
        <Roadmap
          module={selectedModule}
          completed={completed}
          activeTheme={activeTheme}
          onSelectLevel={handleSelectLevel}
          onBackToModules={() => setScreen("modules")}
          playSound={playSound}
          devMode={devMode}
        />
      )}

      {screen === "level" && activeLevel && (
        <LevelView
          activeLevel={activeLevel}
          theme={theme}
          activeTheme={activeTheme}
          aiApiKey={aiApiKey}
          completed={completed}
          onBackToRoadmap={() => setScreen("roadmap")}
          onUpdateProgress={handleUpdateProgress}
          getNextLevel={getNextLevel}
          playSound={playSound}
          devMode={devMode}
        />
      )}

      {/* MODALS */}
      {showBadgesPanel && (
        <BadgesModal
          theme={theme}
          activeTheme={activeTheme}
          unlockedBadges={unlockedBadges}
          BADGES={BADGES}
          onClose={() => setShowBadgesPanel(false)}
          playSound={playSound}
        />
      )}

      {showSettings && (
        <SettingsModal
          activeTheme={activeTheme}
          aiApiKey={aiApiKey}
          setAiApiKey={setAiApiKey}
          devMode={devMode}
          onToggleDevMode={setDevMode}
          bgMusicEnabled={bgMusicEnabled}
          onToggleBgMusic={(enabled) => {
            setBgMusicEnabled(enabled);
            if (enabled) {
              startBackgroundMusic();
            } else {
              stopBackgroundMusic();
            }
          }}
          handleReset={handleReset}
          onClose={() => setShowSettings(false)}
          playSound={playSound}
          onTestCastleAnimation={(mId) => {
            setShowSettings(false);
            setActiveUnlockedAnimation({
              moduleId: mId,
              nextModuleTitle: mId === "m1" 
                ? "Módulo 2: Coleções, Repetições & Funções" 
                : "Módulo 3: POO, Exceções & Arquivos"
            });
          }}
        />
      )}

      {/* CASTLE UNLOCK TRANSITION OVERLAY */}
      {activeUnlockedAnimation && (
        <CastleUnlockAnimation
          moduleId={activeUnlockedAnimation.moduleId}
          nextModuleTitle={activeUnlockedAnimation.nextModuleTitle}
          onClose={() => setActiveUnlockedAnimation(null)}
          playSound={playSound}
        />
      )}
    </div>
  );
}

// THEMES and design system styles
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
  }
};
