import React, { useState, useEffect } from "react";
import { getSubQuestion } from "../data/questions";

export default function Roadmap({ module, completed, activeTheme, onSelectLevel, onBackToModules, playSound, devMode }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const questions = module.questions;
  const containerWidth = Math.min(600, windowWidth - 32);
  const centerX = containerWidth / 2;
  const horizontalDeviation = Math.min(120, containerWidth * 0.22);

  // Helper to determine lock status
  function isLevelUnlocked(level) {
    if (devMode) return true;
    const levelIdx = questions.findIndex(q => q.id === level.id);
    if (levelIdx === 0) return true; // First node of this module is always unlocked

    const prevLevel = questions[levelIdx - 1];
    return (
      completed[prevLevel.id] === "correct" &&
      completed[prevLevel.id + "-A"] === "correct" &&
      completed[prevLevel.id + "-B"] === "correct"
    );
  }

  return (
    <main style={{ ...styles.roadmapScreen, background: activeTheme.bg }}>
      
      {/* Tooltip & Animations CSS */}
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
          border: 1px solid ${activeTheme.cardBorder};
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
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          z-index: 5;
        }
        .spring-node-btn:hover:not(:disabled) {
          transform: scale(1.12);
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
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          z-index: 5;
        }
        .sub-node-btn:hover:not(:disabled) {
          transform: scale(1.15);
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
        
        {/* Navigation & Header card */}
        <div className="spring-card" style={{ padding: "20px 20px", marginBottom: 30, display: "flex", flexDirection: "column", gap: 12, background: activeTheme.cardBg }}>
          <button 
            style={{ ...styles.backBtn, color: activeTheme.primary }} 
            onClick={() => { playSound("click"); onBackToModules(); }}
          >
            ← Voltar para Módulos
          </button>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
              {module.title} 🌸
            </h2>
            <p style={{ color: activeTheme.textMuted, fontSize: 13, margin: "4px 0 0", fontWeight: 500 }}>
              Conclua cada nível principal e as sub-fases secundárias (A e B) para prosseguir.
            </p>
          </div>
        </div>

        {/* Winding Path Zig Zag container */}
        <div style={{ position: "relative", width: "100%", height: questions.length * 140 + 80, margin: "0 auto" }}>
          
          {/* SVG Vine line (zIndex 1, runs behind buttons) */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
            <path
              d={(() => {
                let pathD = "";
                questions.forEach((level, idx) => {
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
              stroke={activeTheme.roadmapLine}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="14 10"
            />
          </svg>

          {/* Render levels */}
          {questions.map((level, idx) => {
            const isCompleted = completed[level.id] === "correct";
            const unlocked = isLevelUnlocked(level);
            const isCurrent = unlocked && !isCompleted;

            // Subpath completions
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
                {/* SVG Branch Lines for Subpaths */}
                <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
                  <line x1={x} y1={60} x2={isNodeOnLeft ? x + 65 : x - 65} y2={60 - 40} stroke={activeTheme.roadmapLine} strokeWidth="4" />
                  <line x1={x} y1={60} x2={isNodeOnLeft ? x + 65 : x - 65} y2={60 + 40} stroke={activeTheme.roadmapLine} strokeWidth="4" />
                </svg>

                {/* Main Level button */}
                <button
                  className={`spring-node-btn ${isCurrent ? "pulse-node" : ""}`}
                  onClick={() => onSelectLevel(level)}
                  disabled={!unlocked}
                  onMouseEnter={() => setHoveredNode(String(level.id))}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    position: "absolute",
                    left: x - 38,
                    top: 60 - 38,
                    background: isCompleted
                      ? "linear-gradient(135deg, #a7f3d0, #34d399)"
                      : isCurrent
                        ? "linear-gradient(135deg, #fef08a, #facc15)"
                        : "#cbd5e1",
                    color: isCompleted
                      ? "#065f46"
                      : isCurrent
                        ? "#854d0e"
                        : "#475569",
                    borderColor: isCurrent ? "#facc15" : "#ffffff",
                    opacity: unlocked ? 1 : 0.75,
                    cursor: unlocked ? "pointer" : "not-allowed",
                    zIndex: 5,
                  }}
                >
                  {level.id}
                  
                  {isCompleted && (
                    <span style={{ position: "absolute", top: -8, right: -8, background: "#10b981", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #fff", zIndex: 6 }}>
                      🌸
                    </span>
                  )}

                  {!unlocked && (
                    <span style={{ position: "absolute", bottom: -6, right: -6, background: "#6b7280", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, border: "2px solid #fff", zIndex: 6 }}>
                      🔒
                    </span>
                  )}
                </button>

                {/* Subpath A button */}
                <button
                  className="sub-node-btn"
                  onClick={() => {
                    const subQ = getSubQuestion(level.id, "A");
                    if (subQ) onSelectLevel(subQ);
                  }}
                  disabled={!unlocked}
                  onMouseEnter={() => setHoveredNode(level.id + "-A")}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    position: "absolute",
                    left: (isNodeOnLeft ? x + 65 : x - 65) - 20,
                    top: (60 - 40) - 20,
                    background: isSubACompleted
                      ? "linear-gradient(135deg, #bbf7d0, #10b981)"
                      : unlocked
                        ? "linear-gradient(135deg, #93c5fd, #3b82f6)"
                        : "#cbd5e1",
                    color: isSubACompleted
                      ? "#065f46"
                      : unlocked
                        ? "#1e3a8a"
                        : "#475569",
                    opacity: unlocked ? 1 : 0.75,
                    cursor: unlocked ? "pointer" : "not-allowed",
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

                {/* Subpath B button */}
                <button
                  className="sub-node-btn"
                  onClick={() => {
                    const subQ = getSubQuestion(level.id, "B");
                    if (subQ) onSelectLevel(subQ);
                  }}
                  disabled={!unlocked}
                  onMouseEnter={() => setHoveredNode(level.id + "-B")}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    position: "absolute",
                    left: (isNodeOnLeft ? x + 65 : x - 65) - 20,
                    top: (60 + 40) - 20,
                    background: isSubBCompleted
                      ? "linear-gradient(135deg, #bbf7d0, #10b981)"
                      : unlocked
                        ? "linear-gradient(135deg, #93c5fd, #3b82f6)"
                        : "#cbd5e1",
                    color: isSubBCompleted
                      ? "#065f46"
                      : unlocked
                        ? "#1e3a8a"
                        : "#475569",
                    opacity: unlocked ? 1 : 0.75,
                    cursor: unlocked ? "pointer" : "not-allowed",
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

                {/* Main Level Tooltip */}
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
                      {isCompleted ? "🌸 Concluído!" : !unlocked ? "🔒 Requer fase anterior" : "⚡ Clique para Jogar!"} (+{level.xp} XP)
                    </div>
                  </div>
                )}

                {/* Subpath A Tooltip */}
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
                      {isSubACompleted ? "🌸 Prática Concluída!" : !unlocked ? "🔒 Bloqueado" : "⚡ Clique para Praticar!"} (+5 XP)
                    </div>
                  </div>
                )}

                {/* Subpath B Tooltip */}
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
                      {isSubBCompleted ? "🌸 Revisão Concluída!" : !unlocked ? "🔒 Bloqueado" : "⚡ Clique para Revisar!"} (+5 XP)
                    </div>
                  </div>
                )}

              </div>
            );
          })}

        </div>
      </div>
    </main>
  );
}

const styles = {
  roadmapScreen: {
    flex: 1,
    padding: "24px 12px 100px",
    display: "flex",
    justifyContent: "center",
  },
  roadmapContainer: {
    width: "100%",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
    textAlign: "left"
  }
};
