import React from "react";

export default function BadgesModal({ theme, activeTheme, unlockedBadges, BADGES, onClose, playSound }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div 
        style={{ ...styles.modalContent, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder, color: activeTheme.text }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Suas Conquistas 🏆</h3>
          <button style={{ ...styles.closeBtn, color: activeTheme.text }} onClick={() => { playSound("click"); onClose(); }}>✕</button>
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
  badgeCard: {
    display: "flex",
    gap: 16,
    padding: 12,
    border: "1px solid",
    borderRadius: "12px",
    alignItems: "center",
  }
};
