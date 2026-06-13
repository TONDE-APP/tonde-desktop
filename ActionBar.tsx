// ============================================================
// TONDE DESKTOP — ActionBar
// Barre d'actions agent avec raccourcis clavier visibles
// ============================================================

import React from "react";
import type { CounterStatus } from "../../types";

interface ActionBarProps {
  onCallNext: () => void;
  onRecall: () => void;
  onMarkAbsent: () => void;
  onTransfer: () => void;
  onPause: () => void;
  counterStatus?: CounterStatus;
  shortcuts: {
    canCallNext: boolean;
    canRecall: boolean;
    canMarkAbsent: boolean;
    canTransfer: boolean;
    canPause: boolean;
  };
  isLoading: boolean;
}

interface ActionButtonProps {
  label: string;
  shortcut: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "warning" | "secondary";
  isLoading?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  shortcut,
  onClick,
  disabled,
  variant = "secondary",
  isLoading,
}) => (
  <button
    className={`action-btn action-btn--${variant}`}
    onClick={onClick}
    disabled={disabled || isLoading}
    aria-label={`${label} (${shortcut})`}
    title={`${label} — Raccourci : ${shortcut}`}
  >
    <span className="action-btn__label">{label}</span>
    <kbd className="action-btn__shortcut">{shortcut}</kbd>
  </button>
);

export const ActionBar: React.FC<ActionBarProps> = ({
  onCallNext,
  onRecall,
  onMarkAbsent,
  onTransfer,
  onPause,
  counterStatus,
  shortcuts,
  isLoading,
}) => {
  const isPaused = counterStatus === "PAUSED";

  return (
    <nav className="action-bar" role="toolbar" aria-label="Actions agent">
      <div className="action-bar__group action-bar__group--primary">
        <ActionButton
          label="Appeler suivant"
          shortcut="ESPACE"
          onClick={onCallNext}
          disabled={!shortcuts.canCallNext}
          variant="primary"
          isLoading={isLoading}
        />
      </div>

      <div className="action-bar__group action-bar__group--secondary">
        <ActionButton
          label="Rappeler"
          shortcut="R"
          onClick={onRecall}
          disabled={!shortcuts.canRecall}
          variant="secondary"
        />
        <ActionButton
          label="Absent"
          shortcut="A"
          onClick={onMarkAbsent}
          disabled={!shortcuts.canMarkAbsent}
          variant="danger"
        />
        <ActionButton
          label="Transférer"
          shortcut="T"
          onClick={onTransfer}
          disabled={!shortcuts.canTransfer}
          variant="warning"
        />
      </div>

      <div className="action-bar__group action-bar__group--meta">
        <ActionButton
          label={isPaused ? "Reprendre" : "Pause"}
          shortcut="P"
          onClick={onPause}
          disabled={!shortcuts.canPause}
          variant={isPaused ? "primary" : "secondary"}
        />
      </div>
    </nav>
  );
};
