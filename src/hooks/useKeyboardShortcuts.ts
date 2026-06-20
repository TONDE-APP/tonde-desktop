// ============================================================
// TONDE DESKTOP — useKeyboardShortcuts
// Gestion globale des raccourcis clavier (Keyboard First)
// ============================================================

import { useEffect, useCallback, useRef } from "react";
import { useTicketStore } from "../store/ticketStore";
import { useCounterStore } from "../store/counterStore";
import { useAuthStore } from "../store/authStore";

export interface ShortcutHandlers {
  onCallNext?: () => void;
  onRecall?: () => void;
  onMarkAbsent?: () => void;
  onTransfer?: () => void;
  onPause?: () => void;
  onHelp?: () => void;
  onEscape?: () => void;
}

// Tags that should BLOCK shortcuts (user is typing)
const BLOCK_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;

    // Block shortcuts when user is in input fields
    if (BLOCK_TAGS.has(target.tagName)) return;
    if (target.isContentEditable) return;

    // Allow ESC and F1 even in dialogs (they close them)
    const { key } = e;

    switch (key) {
      case " ": // ESPACE — Appeler suivant
        e.preventDefault();
        handlersRef.current.onCallNext?.();
        break;

      case "r":
      case "R": // R — Rappeler
        e.preventDefault();
        handlersRef.current.onRecall?.();
        break;

      case "a":
      case "A": // A — Absent
        e.preventDefault();
        handlersRef.current.onMarkAbsent?.();
        break;

      case "t":
      case "T": // T — Transférer
        e.preventDefault();
        handlersRef.current.onTransfer?.();
        break;

      case "p":
      case "P": // P — Pause
        e.preventDefault();
        handlersRef.current.onPause?.();
        break;

      case "F1": // F1 — Aide
        e.preventDefault();
        handlersRef.current.onHelp?.();
        break;

      case "Escape": // ESC — Fermer dialogue
        handlersRef.current.onEscape?.();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// ---- Agent-specific shortcuts (connected to stores) ----

export function useAgentShortcuts(options: {
  onOpenTransfer: () => void;
  onOpenHelp: () => void;
  onCloseDialog: () => void;
}) {
  const { callNext, recall, markAbsent, currentTicket } = useTicketStore();
  const { myCounter, pauseCounter, resumeCounter } = useCounterStore();
  const { user } = useAuthStore();

  useKeyboardShortcuts({
    onCallNext: () => {
      if (!myCounter || myCounter.status !== "OPEN") return;
      if (!user) return;
      callNext(myCounter.id, myCounter.service_ids);
    },

    onRecall: () => {
      if (!currentTicket || !myCounter) return;
      recall(myCounter.id);
    },

    onMarkAbsent: () => {
      if (!currentTicket || !myCounter) return;
      markAbsent(currentTicket.id, myCounter.id);
    },

    onTransfer: () => {
      if (!currentTicket) return;
      options.onOpenTransfer();
    },

    onPause: () => {
      if (!myCounter) return;
      if (myCounter.status === "OPEN") {
        pauseCounter(myCounter.id);
      } else if (myCounter.status === "PAUSED") {
        resumeCounter(myCounter.id);
      }
    },

    onHelp: options.onOpenHelp,
    onEscape: options.onCloseDialog,
  });
}

// ---- Hook for tracking shortcut availability ----

export function useShortcutAvailability() {
  const { currentTicket, isLoading } = useTicketStore();
  const { myCounter } = useCounterStore();

  const canCallNext =
    !isLoading && !!myCounter && myCounter.status === "OPEN" && !currentTicket;

  const canRecall = !isLoading && !!currentTicket && !!myCounter;
  const canMarkAbsent = !isLoading && !!currentTicket && !!myCounter;
  const canTransfer = !isLoading && !!currentTicket;
  const canPause = !!myCounter && myCounter.status !== "CLOSED";

  return { canCallNext, canRecall, canMarkAbsent, canTransfer, canPause };
}
