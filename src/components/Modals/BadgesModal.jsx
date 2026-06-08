import React, { useState } from "react";

export default function BadgesModal({ theme, activeTheme, unlockedBadges, BADGES, onClose, playSound }) {
  const [selectedBadgeId, setSelectedBadgeId] = useState(BADGES[0]?.id);

  const module1Badges = BADGES.filter(b => ["primeiros_passos", "var_expert", "decision_maker", "black_knight", "pythonista_supremo"].includes(b.id));
  const module2Badges = BADGES.filter(b => ["shrubbery", "loop_master", "ninja_calculator"].includes(b.id));
  const module3Badges = BADGES.filter(b => ["oop_master", "dead_parrot", "npc_creator"].includes(b.id));
  const generalBadges = BADGES.filter(b => ["streak_3"].includes(b.id));

  const selectedBadge = BADGES.find(b => b.id === selectedBadgeId) || BADGES[0];
  const isSelectedUnlocked = unlockedBadges.includes(selectedBadge?.id);

  function renderBadgeNode(badge) {
    const isUnlocked = unlockedBadges.includes(badge.id);
    const isSelected = selectedBadgeId === badge.id;

    return (
      <button
        key={badge.id}
        onClick={() => { playSound("click"); setSelectedBadgeId(badge.id); }}
        style={{
          ...styles.badgeNode,
          background: isSelected 
            ? activeTheme.primaryGlow 
            : (isUnlocked ? activeTheme.cardBg : (theme === "dark" ? "#1e293b" : "#cbd5e1")),
          borderColor: isSelected 
            ? activeTheme.primary 
            : (isUnlocked ? activeTheme.pythonGreen : activeTheme.divider),
          opacity: isUnlocked ? 1 : 0.6,
          boxShadow: isSelected ? `0 0 12px ${activeTheme.primary}` : "none"
        }}
        title={badge.name}
      >
        <span style={{ fontSize: 28, filter: isUnlocked ? "none" : "grayscale(100%)" }}>{badge.icon}</span>
        {!isUnlocked && (
          <span style={styles.lockIcon}>🔒</span>
        )}
      </button>
    );
  }

  function renderBranch(title, badges) {
    return (
      <div style={styles.branchContainer}>
        <div style={{ ...styles.branchTitle, color: activeTheme.textMuted }}>{title}</div>
        <div style={styles.nodesRow}>
          {badges.map((badge, idx) => (
            <React.Fragment key={badge.id}>
              {renderBadgeNode(badge)}
              {idx < badges.length - 1 && (
                <div style={{ ...styles.connectorLine, background: activeTheme.divider }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div 
        style={{ ...styles.modalContent, background: activeTheme.cardBg, borderColor: activeTheme.cardBorder, color: activeTheme.text }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Árvore de Conquistas 🏆</h3>
          <button style={{ ...styles.closeBtn, color: activeTheme.text }} onClick={() => { playSound("click"); onClose(); }}>✕</button>
        </div>

        {/* Achievement Trees Scrollable Panel */}
        <div style={styles.treeScrollContainer}>
          {renderBranch("Módulo 1: Fundamentos & Condicionais", module1Badges)}
          {renderBranch("Módulo 2: Coleções, Repetições & Funções", module2Badges)}
          {renderBranch("Módulo 3: POO, Exceções & Arquivos", module3Badges)}
          {renderBranch("Missões Especiais", generalBadges)}
        </div>

        {/* Selected Badge Detail Card */}
        {selectedBadge && (
          <div style={{ 
            ...styles.detailCard, 
            background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            borderColor: isSelectedUnlocked ? activeTheme.pythonGreen : activeTheme.divider
          }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 48, filter: isSelectedUnlocked ? "none" : "grayscale(100%)" }}>
                {selectedBadge.icon}
              </span>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                  {selectedBadge.name}
                </h4>
                <span style={{ 
                  ...styles.statusTag, 
                  background: isSelectedUnlocked ? activeTheme.successBg : activeTheme.errorBg,
                  color: isSelectedUnlocked ? activeTheme.pythonGreen : activeTheme.error
                }}>
                  {isSelectedUnlocked ? "Conquistado ✅" : "Bloqueado 🔒"}
                </span>
              </div>
            </div>
            <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.5, color: activeTheme.textMuted }}>
              <strong>Objetivo:</strong> {selectedBadge.desc}
            </p>
          </div>
        )}
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
    padding: 16,
    backdropFilter: "blur(4px)"
  },
  modalContent: {
    maxWidth: 480,
    width: "100%",
    borderRadius: 24,
    border: "2px solid",
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    padding: 4,
  },
  treeScrollContainer: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 6,
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  branchContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  branchTitle: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nodesRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 4px",
    overflowX: "auto",
  },
  badgeNode: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    transition: "transform 0.15s, border-color 0.15s, background-color 0.15s",
  },
  lockIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    fontSize: 10,
    background: "#64748b",
    borderRadius: "50%",
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #fff",
  },
  connectorLine: {
    width: 20,
    height: 2,
    flexShrink: 0,
  },
  detailCard: {
    padding: 16,
    border: "1px solid",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
  },
  statusTag: {
    display: "inline-block",
    marginTop: 4,
    fontSize: 11,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: "12px",
  }
};
