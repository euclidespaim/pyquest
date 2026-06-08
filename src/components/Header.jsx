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
    <header className="header-container" style={{ ...styles.header, background: activeTheme.headerBg, borderColor: activeTheme.divider, color: activeTheme.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img 
          src={`${process.env.PUBLIC_URL}/logo192.png`} 
          alt="PyQuest Logo" 
          onClick={() => { playSound("click"); onNavigateModules(); }}
          style={{ 
            width: 32, 
            height: 32, 
            borderRadius: "8px", 
            cursor: "pointer",
            border: `1.5px solid ${activeTheme.pythonGreen}`,
            boxShadow: `0 0 8px ${activeTheme.primaryGlow}`
          }} 
          title="Ver Módulos"
        />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="header-player-name" style={styles.playerName}>{playerName}</span>
            <span style={{ ...styles.rankBadge, background: activeTheme.primaryGlow, color: activeTheme.primary }}>
              {rank.icon} <span className="header-rank-name">{rank.name}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div className="header-player-progress" style={{ ...styles.progressBar, background: activeTheme.divider }}>
              <div style={{ ...styles.progressFill, background: activeTheme.pythonGreen, width: `${xpPercentage}%` }} />
            </div>
            <span className="header-xp-text" style={{ fontSize: 12, fontWeight: 700, color: activeTheme.pythonGreen }}>{xp} XP</span>
          </div>
        </div>
      </div>

      <div className="header-actions-container" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Module Selector Button */}
        <button 
          style={{ ...styles.iconBtn, color: activeTheme.primary }} 
          onClick={() => { playSound("click"); onNavigateModules(); }}
          title="Módulos"
        >
          🏠
        </button>

        {streak >= 2 && (
          <div style={{ 
            ...styles.streakBadge, 
            background: theme === "dark" ? "#78350f" : "#fef3c7", 
            borderColor: "#f59e0b", 
            color: "#f59e0b" 
          }}>
            <span style={{ fontSize: 14, display: "inline-block", lineHeight: "1" }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 800, display: "inline-block", lineHeight: "1" }}>{streak}</span>
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
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "0 10px",
    height: 30,
    borderRadius: "15px",
    border: "1px solid",
    boxSizing: "border-box",
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
