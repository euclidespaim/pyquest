import React from "react";

export default function Home({ activeTheme, nameInput, setNameInput, handleStart, playSound }) {
  return (
    <main style={styles.homeScreen}>
      <div style={{ ...styles.homeCard, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder, color: activeTheme.text }}>
        <div className="float-avatar" style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
          <img 
            src={`${process.env.PUBLIC_URL}/logo512.png`} 
            alt="PyQuest Logo" 
            style={{ 
              width: 220, 
              height: 220, 
              borderRadius: "36px", 
              boxShadow: `0 12px 28px ${activeTheme.primaryGlow}, 0 4px 10px rgba(0,0,0,0.15)`,
              border: `3px solid ${activeTheme.pythonGreen}`
            }} 
          />
        </div>
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
            onKeyDown={e => {
              if (e.key === "Enter" && nameInput.trim()) {
                handleStart(nameInput);
              }
            }}
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
          onClick={() => {
            playSound("click");
            handleStart(nameInput);
          }}
        >
          Iniciar Aventura ▶
        </button>
      </div>
    </main>
  );
}

const styles = {
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
  }
};
