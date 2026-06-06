import React from "react";

export default function Header({
  playerName,
  rank,
  xp,
  xpPercentage,
  streak,
  theme,
  activeTheme,
  unlockedBadgesCount,
  onOpenBadges,
  onToggleTheme,
  onOpenSettings,
  onNavigateModules,
  playSound
}) {
  return (
    <header style={{ ...styles.header, background: activeTheme.headerBg, borderColor: activeTheme.divider, color: activeTheme.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span 
          style={{ fontSize: 28, cursor: "pointer" }} 
          onClick={() => { playSound("click"); onNavigateModules(); }}
          title="Ver Módulos"
        >
          🐍
        </span>
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
        {/* Module Selector Button */}
        <button 
          style={{ ...styles.textBtn, color: activeTheme.primary }} 
          onClick={() => { playSound("click"); onNavigateModules(); }}
        >
          🗂️ Módulos
        </button>

        {streak >= 2 && (
          <div style={{ 
            ...styles.streakBadge, 
            background: theme === "dark" ? "#78350f" : "#fef3c7", 
            borderColor: "#f59e0b", 
            color: "#f59e0b" 
          }}>
            🔥 {streak}
          </div>
        )}
        
        {/* Action Buttons */}
        <button 
          style={{ ...styles.iconBtn, color: activeTheme.text }} 
          onClick={() => { playSound("click"); onOpenBadges(); }}
          title="Conquistas"
        >
          🏆 <span style={{ fontSize: 11, marginLeft: 2 }}>{unlockedBadgesCount}</span>
        </button>

        <button 
          style={{ ...styles.iconBtn, color: activeTheme.text }} 
          onClick={() => { playSound("click"); onToggleTheme(); }}
          title="Alternar Tema"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <button 
          style={{ ...styles.iconBtn, color: activeTheme.text }} 
          onClick={() => { playSound("click"); onOpenSettings(); }}
          title="Configurações"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}

const styles = {
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
  textBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: 4
  }
};
