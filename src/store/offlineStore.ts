// ============================================================
// TONDE DESKTOP — Offline Store (Zustand)
// Gestion des actions hors ligne et synchronisation
// ============================================================

import { create } from "zustand";
import type { SyncQueueItem, SyncActionType, ConnectionStatus } from "../types";
import { db } from "../services/database/db";
import { apiService } from "../services/api/apiService";
import { nanoid } from "nanoid";

interface OfflineState {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncAt: string | null;

  // Actions
  setOnline: (online: boolean) => Promise<void>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  enqueue: (action: SyncActionType, payload: Record<string, unknown>) => Promise<void>;
  syncPending: () => Promise<void>;
  loadSyncQueue: () => Promise<void>;
  clearCompleted: () => Promise<void>;

  // Helpers
  getPendingCount: () => number;
  hasPending: () => boolean;
}

export const useOfflineStore = create<OfflineState>()((set, get) => ({
  isOnline: navigator.onLine,
  connectionStatus: "DISCONNECTED",
  syncQueue: [],
  isSyncing: false,
  lastSyncAt: null,

  setOnline: async (online) => {
    const wasOffline = !get().isOnline;
    set({ isOnline: online, connectionStatus: online ? "CONNECTED" : "DISCONNECTED" });
    // Auto-sync when coming back online
    if (online && wasOffline) {
      await get().syncPending();
    }
  },

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  enqueue: async (action, payload) => {
    const item: SyncQueueItem = {
      id: nanoid(),
      action,
      payload,
      created_at: new Date().toISOString(),
      status: "PENDING",
      retry_count: 0,
    };
    await db.insertSyncItem(item);
    set((state) => ({ syncQueue: [...state.syncQueue, item] }));
  },

  syncPending: async () => {
    const { isSyncing, syncQueue } = get();
    if (isSyncing) return;

    const pending = syncQueue.filter((i) => i.status === "PENDING" || i.status === "FAILED");
    if (pending.length === 0) return;

    set({ isSyncing: true });

    for (const item of pending) {
      // Mark as syncing
      set((state) => ({
        syncQueue: state.syncQueue.map((i) =>
          i.id === item.id ? { ...i, status: "SYNCING" } : i
        ),
      }));
      await db.updateSyncItemStatus(item.id, "SYNCING");

      try {
        await dispatchSyncAction(item);
        // Mark as done
        const done: SyncQueueItem = {
          ...item,
          status: "DONE",
          synced_at: new Date().toISOString(),
        };
        await db.updateSyncItemStatus(item.id, "DONE", done.synced_at);
        set((state) => ({
          syncQueue: state.syncQueue.map((i) => (i.id === item.id ? done : i)),
        }));
      } catch (err) {
        const failed: SyncQueueItem = {
          ...item,
          status: item.retry_count >= 3 ? "FAILED" : "PENDING",
          retry_count: item.retry_count + 1,
          error: err instanceof Error ? err.message : "Sync failed",
        };
        await db.updateSyncItemStatus(item.id, failed.status);
        set((state) => ({
          syncQueue: state.syncQueue.map((i) => (i.id === item.id ? failed : i)),
        }));
      }
    }

    set({ isSyncing: false, lastSyncAt: new Date().toISOString() });
  },

  loadSyncQueue: async () => {
    const items = await db.getSyncQueue();
    set({ syncQueue: items });
  },

  clearCompleted: async () => {
    await db.clearDoneSyncItems();
    set((state) => ({
      syncQueue: state.syncQueue.filter((i) => i.status !== "DONE"),
    }));
  },

  getPendingCount: () =>
    get().syncQueue.filter((i) => i.status === "PENDING" || i.status === "SYNCING").length,

  hasPending: () => get().getPendingCount() > 0,
}));

// ---- Dispatch individual sync actions to API ----
async function dispatchSyncAction(item: SyncQueueItem): Promise<void> {
  const p = item.payload;
  switch (item.action) {
    case "CALL_TICKET":
      await apiService.callTicketById(p.ticket_id as string, p.counter_id as string);
      break;
    case "RECALL_TICKET":
      await apiService.recallTicket(p.ticket_id as string, p.counter_id as string);
      break;
    case "MARK_ABSENT":
      await apiService.markTicketAbsent(p.ticket_id as string, p.counter_id as string);
      break;
    case "COMPLETE_TICKET":
      await apiService.completeTicket(p.ticket_id as string, p.counter_id as string);
      break;
    case "TRANSFER_TICKET":
      await apiService.transferTicket(
        p.ticket_id as string,
        p.to_counter_id as string,
        p.to_service_id as string
      );
      break;
    case "PAUSE_COUNTER":
      await apiService.pauseCounter(p.counter_id as string);
      break;
    case "RESUME_COUNTER":
      await apiService.resumeCounter(p.counter_id as string);
      break;
    default:
      throw new Error(`Unknown sync action: ${item.action}`);
  }
}
