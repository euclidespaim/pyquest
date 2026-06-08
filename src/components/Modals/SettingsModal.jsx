import React from "react";

export default function SettingsModal({ activeTheme, aiApiKey, setAiApiKey, devMode, onToggleDevMode, bgMusicEnabled, onToggleBgMusic, handleReset, onClose, playSound, onTestCastleAnimation }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div 
        style={{ ...styles.modalContent, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder, color: activeTheme.text }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Configurações ⚙️</h3>
          <button style={{ ...styles.closeBtn, color: activeTheme.text }} onClick={() => { playSound("click"); onClose(); }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Claude API Key input */}
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

          {/* Developer Mode */}
          <div style={styles.settingsSection}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800 }}>Modo Desenvolvedor ⚙️</h4>
                <p style={{ margin: 0, fontSize: 12, color: activeTheme.textMuted }}>
                  Desbloqueia todos os módulos e fases para facilitar testes de desenvolvimento.
                </p>
              </div>
              <input
                type="checkbox"
                checked={devMode}
                onChange={e => {
                  playSound("click");
                  onToggleDevMode(e.target.checked);
                }}
                style={styles.checkbox}
              />
            </div>
          </div>

          <div style={{ ...styles.divider, background: activeTheme.divider }} />

          {/* Test Castle Animation (Dev mode helper) */}
          {devMode && (
            <>
              <div style={styles.settingsSection}>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800 }}>Testar Animação do Castelo 🏰</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <button 
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid", borderRadius: 12, cursor: "pointer", background: "none", color: activeTheme.text, borderColor: activeTheme.divider }} 
                    onClick={() => {
                      playSound("click");
                      onTestCastleAnimation("m1");
                    }}
                  >
                    Módulo 1 (Sem Fogos)
                  </button>
                  <button 
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid", borderRadius: 12, cursor: "pointer", background: "none", color: activeTheme.text, borderColor: activeTheme.divider }} 
                    onClick={() => {
                      playSound("click");
                      onTestCastleAnimation("m2");
                    }}
                  >
                    Módulo 2 (Com Fogos)
                  </button>
                </div>
              </div>
              <div style={{ ...styles.divider, background: activeTheme.divider }} />
            </>
          )}

          {/* Background Music Toggle */}
          <div style={styles.settingsSection}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800 }}>Música de Fundo 🎵</h4>
                <p style={{ margin: 0, fontSize: 12, color: activeTheme.textMuted }}>
                  Trilha sonora retro 8-bits instrumental para a sua aventura de programação.
                </p>
              </div>
              <input
                type="checkbox"
                checked={bgMusicEnabled}
                onChange={e => {
                  playSound("click");
                  onToggleBgMusic(e.target.checked);
                }}
                style={styles.checkbox}
              />
            </div>
          </div>

          <div style={{ ...styles.divider, background: activeTheme.divider }} />

          {/* Reset progress */}
          <div style={styles.settingsSection}>
            <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: activeTheme.error }}>Área de Perigo</h4>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: activeTheme.textMuted }}>Apagar todos os dados do aluno do computador.</p>
            <button 
              style={{ ...styles.primaryBtn, background: activeTheme.error }} 
              onClick={() => {
                playSound("click");
                handleReset();
              }}
            >
              Reiniciar Progresso do Zero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backdropFilter: "blur(4px)"
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
  settingsSection: {
    display: "flex",
    flexDirection: "column",
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
    cursor: "pointer",
    textAlign: "center"
  },
  divider: {
    height: 1,
    margin: "12px 0",
  },
  checkbox: {
    width: 20,
    height: 20,
    cursor: "pointer"
  }
};
