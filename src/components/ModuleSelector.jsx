import React from "react";

export default function ModuleSelector({ MODULES, completed, activeTheme, onSelectModule, playSound, devMode }) {
  
  // Calculate completion for a module
  function getModuleProgress(module) {
    const questions = module.questions;
    const totalParts = questions.length * 3; // Main node + subA + subB
    let completedParts = 0;
    
    questions.forEach(q => {
      if (completed[q.id] === "correct") completedParts++;
      if (completed[q.id + "-A"] === "correct") completedParts++;
      if (completed[q.id + "-B"] === "correct") completedParts++;
    });
    
    const percentage = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;
    return { completedParts, totalParts, percentage };
  }

  // Determine if a module is unlocked
  function isModuleUnlocked(index) {
    if (devMode) return true;
    if (index === 0) return true;
    const prevModule = MODULES[index - 1];
    
    // Unlocked if all questions in the previous module are fully completed (main + subA + subB)
    return prevModule.questions.every(q => 
      completed[q.id] === "correct" && 
      completed[q.id + "-A"] === "correct" && 
      completed[q.id + "-B"] === "correct"
    );
  }

  return (
    <main style={styles.container}>
      <div style={{ ...styles.headerCard, background: "rgba(255, 255, 255, 0.03)", borderColor: activeTheme.divider }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: activeTheme.pythonGreen, margin: 0 }}>
          Módulos de Aprendizado 🗂️
        </h2>
        <p style={{ color: activeTheme.textMuted, fontSize: 15, margin: "8px 0 0", fontWeight: 500 }}>
          Complete 100% de um módulo e de suas fases secundárias para destrancar a próxima aventura!
        </p>
      </div>

      <div style={styles.grid}>
        {MODULES.map((module, index) => {
          const { completedParts, totalParts, percentage } = getModuleProgress(module);
          const unlocked = isModuleUnlocked(index);
          const isCompleted = percentage === 100;

          return (
            <div 
              key={module.id} 
              className="module-card"
              style={{ 
                ...styles.card, 
                background: activeTheme.cardBg, 
                borderColor: unlocked 
                  ? (isCompleted ? activeTheme.pythonGreen : activeTheme.cardBorder) 
                  : activeTheme.divider,
                opacity: unlocked ? 1 : 0.65
              }}
            >
              <div style={styles.cardHeader}>
                <span style={{ fontSize: 32 }}>{index === 0 ? "🌱" : index === 1 ? "🌀" : "🛡️"}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: activeTheme.text }}>
                    {module.title}
                  </h3>
                  <span style={{ 
                    ...styles.statusTag, 
                    background: unlocked 
                      ? (isCompleted ? "rgba(34, 197, 94, 0.15)" : activeTheme.primaryGlow) 
                      : "rgba(100, 116, 139, 0.15)",
                    color: unlocked 
                      ? (isCompleted ? activeTheme.pythonGreen : activeTheme.primary) 
                      : activeTheme.textMuted
                  }}>
                    {unlocked ? (isCompleted ? "Concluído 🌸" : "Disponível 🔓") : "Bloqueado 🔒"}
                  </span>
                </div>
              </div>

              <p style={{ ...styles.description, color: activeTheme.textMuted }}>
                {module.description}
              </p>

              <div style={{ margin: "20px 0 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6, color: activeTheme.textMuted }}>
                  <span>Progresso do Módulo</span>
                  <span>{percentage}% ({completedParts}/{totalParts})</span>
                </div>
                <div style={{ ...styles.progressBar, background: activeTheme.divider }}>
                  <div style={{ 
                    ...styles.progressFill, 
                    background: isCompleted ? activeTheme.pythonGreen : activeTheme.primary, 
                    width: `${percentage}%` 
                  }} />
                </div>
              </div>

              <button
                disabled={!unlocked}
                onClick={() => {
                  playSound("click");
                  onSelectModule(module);
                }}
                style={{
                  ...styles.actionBtn,
                  background: unlocked 
                    ? (isCompleted ? "linear-gradient(135deg, #10b981, #059669)" : `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.primary}cc)`)
                    : "#cbd5e1",
                  color: unlocked ? "#ffffff" : "#64748b",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  boxShadow: unlocked ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
                }}
              >
                {unlocked ? (isCompleted ? "Revisar Missão ➔" : "Iniciar Jornada ➔") : "Bloqueado 🔒"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
    padding: "32px 16px 80px",
    display: "flex",
    flexDirection: "column",
    gap: 32
  },
  headerCard: {
    padding: "24px 20px",
    borderRadius: 20,
    border: "2px solid",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "center"
  },
  card: {
    flex: "1 1 380px",
    maxWidth: 420,
    borderRadius: 24,
    border: "2px solid",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    marginBottom: 16
  },
  statusTag: {
    display: "inline-block",
    marginTop: 4,
    fontSize: 11,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: "12px",
  },
  description: {
    fontSize: 14,
    lineHeight: 1.5,
    margin: "0 0 16px"
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width .4s ease-out",
  },
  actionBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    fontSize: 14,
    fontWeight: 800,
    textAlign: "center",
    marginTop: 14,
    transition: "transform 0.1s"
  }
};
