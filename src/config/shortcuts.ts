// ============================================================
// TONDE DESKTOP — Définition des raccourcis clavier
// Keyboard-First : l'agent doit tout faire sans souris
// ============================================================

export interface ShortcutDef {
  key: string;
  label: string;
  description: string;
  tauri?: string; // Tauri global shortcut notation
}

export const SHORTCUTS = {
  CALL_NEXT: {
    key: " ",
    label: "Espace",
    description: "Appeler le prochain ticket",
    tauri: "Space",
  },
  CALL_NEXT_F1: {
    key: "F1",
    label: "F1",
    description: "Appeler le prochain ticket (alt)",
    tauri: "F1",
  },
  MARK_ABSENT: {
    key: "a",
    label: "A",
    description: "Marquer client absent",
    tauri: "KeyA",
  },
  MARK_ABSENT_F2: {
    key: "F2",
    label: "F2",
    description: "Marquer client absent (alt)",
    tauri: "F2",
  },
  TRANSFER: {
    key: "t",
    label: "T",
    description: "Transférer le ticket",
    tauri: "KeyT",
  },
  TRANSFER_F3: {
    key: "F3",
    label: "F3",
    description: "Transférer le ticket (alt)",
    tauri: "F3",
  },
  PAUSE: {
    key: "p",
    label: "P",
    description: "Mettre en pause / Reprendre",
    tauri: "KeyP",
  },
  PAUSE_F4: {
    key: "F4",
    label: "F4",
    description: "Mettre en pause / Reprendre (alt)",
    tauri: "F4",
  },
  RECALL: {
    key: "r",
    label: "R",
    description: "Rappeler le ticket en cours",
    tauri: "KeyR",
  },
  HELP: {
    key: "F12",
    label: "F12",
    description: "Afficher l'aide raccourcis",
    tauri: "F12",
  },
  ESCAPE: {
    key: "Escape",
    label: "Échap",
    description: "Fermer dialogue / Annuler",
  },
  LOGOUT: {
    key: "l",
    label: "Ctrl+L",
    description: "Se déconnecter",
  },
} as const satisfies Record<string, ShortcutDef>;

// Tags HTML qui bloquent les raccourcis
export const SHORTCUT_BLOCK_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
