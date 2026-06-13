// ============================================================
// TONDE DESKTOP — App Store (Zustand)
// État global UI : connexion, notifications, dialogs
// ============================================================

import { create } from "zustand";
import type { ConnectionStatus, Notification } from "../types";
import { nanoid } from "nanoid";

interface AppState {
  connectionStatus: ConnectionStatus;
  notifications: Notification[];
  isShortcutsHelpOpen: boolean;
  isTransferModalOpen: boolean;

  // Connexion
  setConnectionStatus: (status: ConnectionStatus) => void;

  // Notifications toast
  addNotification: (n: Omit<Notification, "id" | "created_at">) => void;
  removeNotification: (id: string) => void;

  // Dialogs
  openShortcutsHelp: () => void;
  closeShortcutsHelp: () => void;
  openTransferModal: () => void;
  closeTransferModal: () => void;
  closeAllDialogs: () => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  connectionStatus: "DISCONNECTED",
  notifications: [],
  isShortcutsHelpOpen: false,
  isTransferModalOpen: false,

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: nanoid(),
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 5),
    }));
    // Auto-remove après duration (défaut 4s)
    const duration = n.duration ?? 4_000;
    setTimeout(() => {
      get().removeNotification(notification.id);
    }, duration);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  openShortcutsHelp: () => set({ isShortcutsHelpOpen: true }),
  closeShortcutsHelp: () => set({ isShortcutsHelpOpen: false }),
  openTransferModal: () => set({ isTransferModalOpen: true }),
  closeTransferModal: () => set({ isTransferModalOpen: false }),
  closeAllDialogs: () =>
    set({ isShortcutsHelpOpen: false, isTransferModalOpen: false }),
}));
