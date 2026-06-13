// ============================================================
// TONDE DESKTOP — Ticket Store (Zustand)
// ============================================================

import { create } from "zustand";
import type { Ticket, TicketStatus } from "../types";
import { apiService } from "../services/api/apiService";
import { useOfflineStore } from "./offlineStore";
import { db } from "../services/database/db";

interface TicketState {
  currentTicket: Ticket | null;
  processingStartedAt: string | null;
  recentTickets: Ticket[];
  isLoading: boolean;
  error: string | null;

  // Core Agent Actions
  callNext: (counterId: string, serviceIds: string[]) => Promise<void>;
  recall: (counterId: string) => Promise<void>;
  markAbsent: (ticketId: string, counterId: string) => Promise<void>;
  complete: (ticketId: string, counterId: string) => Promise<void>;
  transfer: (ticketId: string, toCounterId: string, toServiceId: string) => Promise<void>;

  // State helpers
  setCurrentTicket: (ticket: Ticket | null) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  clearError: () => void;
  getProcessingDuration: () => number;
}

const executeWithOfflineFallback = async (
  onlineAction: () => Promise<Ticket | void>,
  offlineAction: () => Promise<void>
): Promise<void> => {
  const { isOnline, enqueue } = useOfflineStore.getState();
  if (isOnline) {
    try {
      return await onlineAction() as undefined;
    } catch {
      await offlineAction();
    }
  } else {
    await offlineAction();
  }
};

export const useTicketStore = create<TicketState>()((set, get) => ({
  currentTicket: null,
  processingStartedAt: null,
  recentTickets: [],
  isLoading: false,
  error: null,

  callNext: async (counterId, serviceIds) => {
    set({ isLoading: true, error: null });
    await executeWithOfflineFallback(
      async () => {
        const ticket = await apiService.callNextTicket(counterId, serviceIds);
        await db.upsertTicket(ticket);
        set({
          currentTicket: ticket,
          processingStartedAt: new Date().toISOString(),
          isLoading: false,
        });
      },
      async () => {
        // Get next from local SQLite
        const ticket = await db.getNextWaitingTicket(serviceIds);
        if (ticket) {
          const updated: Ticket = {
            ...ticket,
            status: "CALLED",
            called_at: new Date().toISOString(),
          };
          await db.upsertTicket(updated);
          await useOfflineStore.getState().enqueue("CALL_TICKET", {
            ticket_id: ticket.id,
            counter_id: counterId,
          });
          set({
            currentTicket: updated,
            processingStartedAt: new Date().toISOString(),
            isLoading: false,
          });
        } else {
          set({ isLoading: false, error: "Aucun ticket en attente" });
        }
      }
    );
  },

  recall: async (counterId) => {
    const { currentTicket } = get();
    if (!currentTicket) return;
    set({ isLoading: true });
    await executeWithOfflineFallback(
      async () => {
        await apiService.recallTicket(currentTicket.id, counterId);
        set({ isLoading: false });
      },
      async () => {
        await useOfflineStore.getState().enqueue("RECALL_TICKET", {
          ticket_id: currentTicket.id,
          counter_id: counterId,
        });
        set({ isLoading: false });
      }
    );
  },

  markAbsent: async (ticketId, counterId) => {
    set({ isLoading: true });
    await executeWithOfflineFallback(
      async () => {
        await apiService.markTicketAbsent(ticketId, counterId);
        const updated: Ticket = {
          ...get().currentTicket!,
          status: "ABSENT",
          closed_at: new Date().toISOString(),
        };
        await db.upsertTicket(updated);
        set({ currentTicket: null, processingStartedAt: null, isLoading: false });
      },
      async () => {
        const ticket = get().currentTicket!;
        const updated: Ticket = { ...ticket, status: "ABSENT", closed_at: new Date().toISOString() };
        await db.upsertTicket(updated);
        await useOfflineStore.getState().enqueue("MARK_ABSENT", { ticket_id: ticketId, counter_id: counterId });
        set({ currentTicket: null, processingStartedAt: null, isLoading: false });
      }
    );
  },

  complete: async (ticketId, counterId) => {
    set({ isLoading: true });
    const ticket = get().currentTicket!;
    await executeWithOfflineFallback(
      async () => {
        await apiService.completeTicket(ticketId, counterId);
        const updated: Ticket = {
          ...ticket,
          status: "COMPLETED",
          closed_at: new Date().toISOString(),
        };
        await db.upsertTicket(updated);
        set({
          currentTicket: null,
          processingStartedAt: null,
          recentTickets: [updated, ...get().recentTickets.slice(0, 9)],
          isLoading: false,
        });
      },
      async () => {
        const updated: Ticket = { ...ticket, status: "COMPLETED", closed_at: new Date().toISOString() };
        await db.upsertTicket(updated);
        await useOfflineStore.getState().enqueue("COMPLETE_TICKET", { ticket_id: ticketId, counter_id: counterId });
        set({
          currentTicket: null,
          processingStartedAt: null,
          recentTickets: [updated, ...get().recentTickets.slice(0, 9)],
          isLoading: false,
        });
      }
    );
  },

  transfer: async (ticketId, toCounterId, toServiceId) => {
    set({ isLoading: true });
    await executeWithOfflineFallback(
      async () => {
        await apiService.transferTicket(ticketId, toCounterId, toServiceId);
        set({ currentTicket: null, processingStartedAt: null, isLoading: false });
      },
      async () => {
        await useOfflineStore.getState().enqueue("TRANSFER_TICKET", {
          ticket_id: ticketId,
          to_counter_id: toCounterId,
          to_service_id: toServiceId,
        });
        set({ currentTicket: null, processingStartedAt: null, isLoading: false });
      }
    );
  },

  setCurrentTicket: (ticket) =>
    set({ currentTicket: ticket, processingStartedAt: ticket ? new Date().toISOString() : null }),

  updateTicketStatus: (ticketId, status) =>
    set((state) => ({
      currentTicket:
        state.currentTicket?.id === ticketId
          ? { ...state.currentTicket, status }
          : state.currentTicket,
    })),

  clearError: () => set({ error: null }),

  getProcessingDuration: () => {
    const { processingStartedAt } = get();
    if (!processingStartedAt) return 0;
    return Math.floor((Date.now() - new Date(processingStartedAt).getTime()) / 1000);
  },
}));
