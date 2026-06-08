import React, { useEffect } from "react";

export default function CastleUnlockAnimation({ moduleId, nextModuleTitle, onClose, playSound }) {
  
  useEffect(() => {
    // Play victory success sound when the animation mounts
    playSound("success");
  }, [playSound]);

  const isModule2 = moduleId === "m2";

  return (
    <div style={styles.overlay}>
      <style>{`
        /* Stars background animation */
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        /* Flags waving animation */
        @keyframes flag-wave {
          0%, 100% { transform: skewY(0deg); }
          50% { transform: skewY(-8deg); }
        }

        /* 3D Gate Open Animations */
        @keyframes left-gate-open {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-110deg); }
        }

        @keyframes right-gate-open {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(110deg); }
        }

        /* Golden portal glow pulse */
        @keyframes portal-glow {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 25px #f59e0b, inset 0 0 15px #f59e0b; }
          50% { opacity: 1; box-shadow: 0 0 55px #fbbf24, inset 0 0 30px #fbbf24; }
        }

        /* Congratulation text slide-up */
        @keyframes text-slide-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        /* Button fade-in delay */
        @keyframes button-fade-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* Fireworks animation keyframes */
        @keyframes firework-shoot {
          0% { transform: translateY(100vh) scale(1); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateY(0) scale(0.2); opacity: 0; }
        }

        @keyframes p-up { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(0, -90px); opacity: 0; } }
        @keyframes p-down { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(0, 90px); opacity: 0; } }
        @keyframes p-left { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(-90px, 0); opacity: 0; } }
        @keyframes p-right { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(90px, 0); opacity: 0; } }
        @keyframes p-upleft { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(-65px, -65px); opacity: 0; } }
        @keyframes p-upright { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(65px, -65px); opacity: 0; } }
        @keyframes p-downleft { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(-65px, 65px); opacity: 0; } }
        @keyframes p-downright { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(65px, 65px); opacity: 0; } }
      `}</style>

      {/* Starry Sky Background */}
      <div style={styles.starrySky}>
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              animation: `star-twinkle ${1.5 + Math.random() * 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Fireworks (Only for Module 2 completion) */}
      {isModule2 && (
        <div style={styles.fireworksWrapper}>
          {/* Firework 1 */}
          <div style={{ ...styles.firework, top: "20%", left: "20%", animationDelay: "0.2s" }}>
            <div style={{ ...styles.particle, animation: "p-up 1.2s forwards 0.8s", background: "#f87171" }} />
            <div style={{ ...styles.particle, animation: "p-down 1.2s forwards 0.8s", background: "#f87171" }} />
            <div style={{ ...styles.particle, animation: "p-left 1.2s forwards 0.8s", background: "#f87171" }} />
            <div style={{ ...styles.particle, animation: "p-right 1.2s forwards 0.8s", background: "#f87171" }} />
            <div style={{ ...styles.particle, animation: "p-upleft 1.2s forwards 0.8s", background: "#fb7185" }} />
            <div style={{ ...styles.particle, animation: "p-upright 1.2s forwards 0.8s", background: "#fb7185" }} />
            <div style={{ ...styles.particle, animation: "p-downleft 1.2s forwards 0.8s", background: "#fb7185" }} />
            <div style={{ ...styles.particle, animation: "p-downright 1.2s forwards 0.8s", background: "#fb7185" }} />
          </div>

          {/* Firework 2 */}
          <div style={{ ...styles.firework, top: "15%", left: "75%", animationDelay: "0.7s" }}>
            <div style={{ ...styles.particle, animation: "p-up 1.2s forwards 1.3s", background: "#60a5fa" }} />
            <div style={{ ...styles.particle, animation: "p-down 1.2s forwards 1.3s", background: "#60a5fa" }} />
            <div style={{ ...styles.particle, animation: "p-left 1.2s forwards 1.3s", background: "#60a5fa" }} />
            <div style={{ ...styles.particle, animation: "p-right 1.2s forwards 1.3s", background: "#60a5fa" }} />
            <div style={{ ...styles.particle, animation: "p-upleft 1.2s forwards 1.3s", background: "#38bdf8" }} />
            <div style={{ ...styles.particle, animation: "p-upright 1.2s forwards 1.3s", background: "#38bdf8" }} />
            <div style={{ ...styles.particle, animation: "p-downleft 1.2s forwards 1.3s", background: "#38bdf8" }} />
            <div style={{ ...styles.particle, animation: "p-downright 1.2s forwards 1.3s", background: "#38bdf8" }} />
          </div>

          {/* Firework 3 */}
          <div style={{ ...styles.firework, top: "10%", left: "48%", animationDelay: "1.2s" }}>
            <div style={{ ...styles.particle, animation: "p-up 1.2s forwards 1.8s", background: "#34d399" }} />
            <div style={{ ...styles.particle, animation: "p-down 1.2s forwards 1.8s", background: "#34d399" }} />
            <div style={{ ...styles.particle, animation: "p-left 1.2s forwards 1.8s", background: "#34d399" }} />
            <div style={{ ...styles.particle, animation: "p-right 1.2s forwards 1.8s", background: "#34d399" }} />
            <div style={{ ...styles.particle, animation: "p-upleft 1.2s forwards 1.8s", background: "#fbbf24" }} />
            <div style={{ ...styles.particle, animation: "p-upright 1.2s forwards 1.8s", background: "#fbbf24" }} />
            <div style={{ ...styles.particle, animation: "p-downleft 1.2s forwards 1.8s", background: "#fbbf24" }} />
            <div style={{ ...styles.particle, animation: "p-downright 1.2s forwards 1.8s", background: "#fbbf24" }} />
          </div>
        </div>
      )}

      {/* Medieval Castle Scene */}
      <div style={styles.sceneWrapper}>
        <div style={styles.castleContainer}>
          {/* Left Tower */}
          <div style={styles.tower}>
            <div style={styles.battlementRow}>
              <div style={styles.battlementBlock} />
              <div style={styles.battlementBlock} />
              <div style={styles.battlementBlock} />
            </div>
            <div style={styles.towerRoof} />
            <div style={{ ...styles.flag, animation: "flag-wave 2s infinite ease-in-out" }} />
            <div style={styles.window} />
          </div>

          {/* Center Gate & Wall */}
          <div style={styles.wallCenter}>
            <div style={styles.wallTopRow}>
              <div style={styles.battlementBlock} />
              <div style={styles.battlementBlock} />
              <div style={styles.battlementBlock} />
              <div style={styles.battlementBlock} />
            </div>

            {/* Archway Portal Gate */}
            <div style={styles.archway}>
              {/* Radial Portal Glow (behind doors) */}
              <div style={{ ...styles.portalGlow, animation: "portal-glow 2s infinite ease-in-out" }} />
              
              {/* Left Door */}
              <div style={{ ...styles.gateDoor, ...styles.gateLeft, animation: "left-gate-open 2.5s forwards 1.2s" }} />

              {/* Right Door */}
              <div style={{ ...styles.gateDoor, ...styles.gateRight, animation: "right-gate-open 2.5s forwards 1.2s" }} />
            </div>
          </div>

          {/* Right Tower */}
          <div style={styles.tower}>
            <div style={styles.battlementRow}>
              <div style={styles.battlementBlock} />
              <div style={styles.battlementBlock} />
              <div style={styles.battlementBlock} />
            </div>
            <div style={styles.towerRoof} />
            <div style={{ ...styles.flag, animation: "flag-wave 2s infinite ease-in-out", animationDelay: "0.5s" }} />
            <div style={styles.window} />
          </div>
        </div>
      </div>

      {/* Congrats Card & Message */}
      <div style={{ ...styles.congratsCard, animation: "text-slide-up 0.8s forwards 2.5s" }}>
        <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>🏆</span>
        <h2 style={styles.congratsTitle}>
          MÓDULO {moduleId === "m1" ? "1" : "2"} CONCLUÍDO!
        </h2>
        <p style={styles.congratsText}>
          O portão da masmorra se abriu revelando novas terras...
        </p>
        <div style={styles.badgeWrapper}>
          <div style={styles.badgeIcon}>🔓</div>
          <div style={styles.badgeLabel}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>PRÓXIMO CAPÍTULO</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b" }}>{nextModuleTitle}</div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          style={{ ...styles.actionButton, animation: "button-fade-in 0.8s forwards 3s" }}
        >
          Continuar Jornada ➔
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, #090d16 0%, #111827 100%)",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "60px 20px 80px",
    boxSizing: "border-box",
    overflow: "hidden"
  },
  starrySky: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none"
  },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    background: "#fff",
    borderRadius: "50%",
  },
  fireworksWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none"
  },
  firework: {
    position: "absolute",
    width: 5,
    height: 5,
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    opacity: 0,
  },
  sceneWrapper: {
    width: "100%",
    maxWidth: 400,
    marginTop: "auto",
    marginBottom: 40,
    display: "flex",
    justifyContent: "center",
  },
  castleContainer: {
    display: "flex",
    alignItems: "flex-end",
    width: 320,
    height: 180,
    position: "relative"
  },
  tower: {
    width: 64,
    height: 150,
    background: "linear-gradient(180deg, #334155 0%, #1e293b 100%)",
    border: "2px solid #0f172a",
    borderBottom: "none",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  battlementRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    height: 12,
    marginTop: -12,
  },
  battlementBlock: {
    width: 14,
    height: 12,
    background: "#334155",
    border: "2px solid #0f172a",
    boxSizing: "border-box"
  },
  towerRoof: {
    width: 68,
    height: 8,
    background: "#0f172a",
    marginBottom: 10
  },
  flag: {
    position: "absolute",
    top: -24,
    left: 30,
    width: 20,
    height: 12,
    background: "#f43f5e",
    border: "1px solid #9f1239",
    borderRadius: "1px 6px 6px 1px",
    transformOrigin: "left center"
  },
  window: {
    width: 12,
    height: 20,
    background: "#fbbf24",
    border: "2px solid #78350f",
    borderRadius: "6px 6px 0 0",
    marginTop: 20,
    boxShadow: "0 0 10px #fbbf24"
  },
  wallCenter: {
    flex: 1,
    height: 110,
    background: "linear-gradient(180deg, #475569 0%, #334155 100%)",
    border: "2px solid #0f172a",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "none",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  wallTopRow: {
    display: "flex",
    justifyContent: "space-evenly",
    width: "100%",
    height: 12,
    marginTop: -12
  },
  archway: {
    position: "absolute",
    bottom: 0,
    width: 72,
    height: 76,
    background: "#1e1b4b",
    border: "3px solid #0f172a",
    borderBottom: "none",
    borderRadius: "36px 36px 0 0",
    overflow: "hidden",
    perspective: "400px",
    transformStyle: "preserve-3d"
  },
  portalGlow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 0,
    background: "radial-gradient(circle, #fbbf24 20%, #f59e0b 60%, transparent 100%)",
    borderRadius: "30px 30px 0 0",
    opacity: 0,
  },
  gateDoor: {
    position: "absolute",
    top: 0,
    width: "50%",
    height: "100%",
    background: "linear-gradient(90deg, #78350f 0%, #451a03 100%)",
    // Vertical wood plank lines
    backgroundImage: "linear-gradient(90deg, transparent 80%, rgba(0,0,0,0.4) 80%)",
    backgroundSize: "8px 100%",
    boxSizing: "border-box",
    border: "1px solid #1e0a00",
  },
  gateLeft: {
    left: 0,
    transformOrigin: "left center",
    borderRight: "2px solid #0f172a"
  },
  gateRight: {
    right: 0,
    transformOrigin: "right center",
    borderLeft: "2px solid #0f172a"
  },
  congratsCard: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: "24px 20px",
    width: "100%",
    maxWidth: 360,
    textAlign: "center",
    backdropFilter: "blur(8px)",
    opacity: 0,
    transform: "translateY(30px)",
    zIndex: 10
  },
  congratsTitle: {
    color: "#f59e0b",
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: "1px",
    margin: "0 0 8px"
  },
  congratsText: {
    color: "#e2e8f0",
    fontSize: 14,
    margin: "0 0 18px",
    lineHeight: 1.4
  },
  badgeWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: "10px 14px",
    textAlign: "left",
    marginBottom: 20
  },
  badgeIcon: {
    fontSize: 24
  },
  badgeLabel: {
    flex: 1
  },
  actionButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: "#1e1b4b",
    border: "none",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
    opacity: 0,
  }
};
