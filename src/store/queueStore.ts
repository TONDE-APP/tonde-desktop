// ============================================================
// TONDE DESKTOP — Queue Store (Zustand)
// ============================================================

import { create } from "zustand";
import type { Queue, Ticket, Service } from "../types";
import { apiService } from "../services/api/apiService";
import { db } from "../services/database/db";

interface QueueState {
  queues: Queue[];
  services: Service[];
  isLoading: boolean;
  lastUpdated: string | null;

  // Actions
  loadQueues: (branchId: string) => Promise<void>;
  updateQueueFromWS: (serviceId: string, tickets: Ticket[], waitingCount: number) => void;
  getQueueByService: (serviceId: string) => Queue | undefined;
  getTotalWaiting: () => number;
  getNextTicket: (serviceIds: string[]) => Ticket | undefined;
}

export const useQueueStore = create<QueueState>()((set, get) => ({
  queues: [],
  services: [],
  isLoading: false,
  lastUpdated: null,

  loadQueues: async (branchId) => {
    set({ isLoading: true });
    try {
      const [queues, services] = await Promise.all([
        apiService.getQueues(branchId),
        apiService.getServices(branchId),
      ]);
      // Persist to SQLite for offline access
      await db.cacheQueues(queues);
      set({ queues, services, isLoading: false, lastUpdated: new Date().toISOString() });
    } catch {
      // Fallback to SQLite cache
      const cachedQueues = await db.getCachedQueues(branchId);
      const cachedServices = await db.getCachedServices(branchId);
      set({ queues: cachedQueues, services: cachedServices, isLoading: false });
    }
  },

  updateQueueFromWS: (serviceId, tickets, waitingCount) => {
    set((state) => ({
      queues: state.queues.map((q) =>
        q.service_id === serviceId
          ? { ...q, tickets, waiting_count: waitingCount }
          : q
      ),
      lastUpdated: new Date().toISOString(),
    }));
  },

  getQueueByService: (serviceId) =>
    get().queues.find((q) => q.service_id === serviceId),

  getTotalWaiting: () =>
    get().queues.reduce((sum, q) => sum + q.waiting_count, 0),

  getNextTicket: (serviceIds) => {
    const { queues } = get();
    const relevant = queues.filter((q) => serviceIds.includes(q.service_id));
    const allWaiting = relevant
      .flatMap((q) => q.tickets)
      .filter((t) => t.status === "WAITING")
      .sort((a, b) => {
        // Priority first (2 = highest), then creation time
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    return allWaiting[0];
  },
}));
