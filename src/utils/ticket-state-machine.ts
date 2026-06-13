// ============================================================
// TONDE DESKTOP — Machine à états tickets (vue guichetier)
// Toute transition non listée ici est INTERDITE
// ============================================================

import type { TicketStatus } from "../types";

// Transitions autorisées : from → [to, ...]
const TRANSITIONS: Partial<Record<TicketStatus, TicketStatus[]>> = {
  WAITING: ["CALLED"],
  CALLED: ["PROCESSING", "ABSENT", "CANCELLED"],
  PROCESSING: ["COMPLETED", "ABSENT", "CANCELLED"],
};

// Actions disponibles par état
type TicketAction = "call" | "startService" | "markAbsent" | "complete" | "transfer" | "cancel";

const AVAILABLE_ACTIONS: Partial<Record<TicketStatus, TicketAction[]>> = {
  WAITING: ["call"],
  CALLED: ["startService", "markAbsent", "transfer"],
  PROCESSING: ["complete", "markAbsent", "transfer", "cancel"],
};

/**
 * Vérifie si une transition est autorisée
 */
export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Retourne les actions disponibles pour un statut donné
 */
export function getAvailableActions(status: TicketStatus): TicketAction[] {
  return AVAILABLE_ACTIONS[status] ?? [];
}

/**
 * Vérifie si une action est disponible pour un statut donné
 */
export function canPerformAction(status: TicketStatus, action: TicketAction): boolean {
  return getAvailableActions(status).includes(action);
}

/**
 * Lance une erreur si la transition est invalide
 */
export function assertTransition(from: TicketStatus, to: TicketStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `[StateMachine] Transition interdite : ${from} → ${to}`
    );
  }
}
