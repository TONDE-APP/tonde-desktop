// ============================================================
// TONDE DESKTOP — Counter Store (Zustand)
// ============================================================

import { create } from "zustand";
import type { Counter, CounterStatus } from "../types";
import { apiService } from "../services/api/apiService";
import { useOfflineStore } from "./offlineStore";
import { db } from "../services/database/db";

interface CounterState {
  myCounter: Counter | null;
  allCounters: Counter[];
  isLoading: boolean;

  // Actions
  loadMyCounter: (counterId: string) => Promise<void>;
  loadAllCounters: (branchId: string) => Promise<void>;
  pauseCounter: (counterId: string) => Promise<void>;
  resumeCounter: (counterId: string) => Promise<void>;
  closeCounter: (counterId: string) => Promise<void>;
  openCounter: (counterId: string, agentId: string) => Promise<void>;
  updateCounterFromWS: (counter: Counter) => void;
  getCountersByService: (serviceId: string) => Counter[];
}

export const useCounterStore = create<CounterState>()((set, get) => ({
  myCounter: null,
  allCounters: [],
  isLoading: false,

  loadMyCounter: async (counterId) => {
    set({ isLoading: true });
    try {
      const counter = await apiService.getCounter(counterId);
      await db.upsertCounter(counter);
      set({ myCounter: counter, isLoading: false });
    } catch {
      const cached = await db.getCounter(counterId);
      set({ myCounter: cached, isLoading: false });
    }
  },

  loadAllCounters: async (branchId) => {
    set({ isLoading: true });
    try {
      const counters = await apiService.getCounters(branchId);
      await db.cacheCounters(counters);
      set({ allCounters: counters, isLoading: false });
    } catch {
      const cached = await db.getCachedCounters(branchId);
      set({ allCounters: cached, isLoading: false });
    }
  },

  pauseCounter: async (counterId) => {
    const { isOnline, enqueue } = useOfflineStore.getState();
    const updateLocal = (status: CounterStatus) =>
      set((state) => ({
        myCounter: state.myCounter ? { ...state.myCounter, status } : null,
        allCounters: state.allCounters.map((c) =>
          c.id === counterId ? { ...c, status } : c
        ),
      }));

    updateLocal("PAUSED");

    if (isOnline) {
      try {
        await apiService.pauseCounter(counterId);
      } catch {
        await enqueue("PAUSE_COUNTER", { counter_id: counterId });
      }
    } else {
      await enqueue("PAUSE_COUNTER", { counter_id: counterId });
    }
  },

  resumeCounter: async (counterId) => {
    const { isOnline, enqueue } = useOfflineStore.getState();
    const updateLocal = (status: CounterStatus) =>
      set((state) => ({
        myCounter: state.myCounter ? { ...state.myCounter, status } : null,
        allCounters: state.allCounters.map((c) =>
          c.id === counterId ? { ...c, status } : c
        ),
      }));

    updateLocal("OPEN");

    if (isOnline) {
      try {
        await apiService.resumeCounter(counterId);
      } catch {
        await enqueue("RESUME_COUNTER", { counter_id: counterId });
      }
    } else {
      await enqueue("RESUME_COUNTER", { counter_id: counterId });
    }
  },

  closeCounter: async (counterId) => {
    try {
      await apiService.closeCounter(counterId);
      set((state) => ({
        myCounter: state.myCounter ? { ...state.myCounter, status: "CLOSED" } : null,
        allCounters: state.allCounters.map((c) =>
          c.id === counterId ? { ...c, status: "CLOSED" } : c
        ),
      }));
    } catch (err) {
      console.error("closeCounter error:", err);
    }
  },

  openCounter: async (counterId, agentId) => {
    try {
      await apiService.openCounter(counterId, agentId);
      set((state) => ({
        allCounters: state.allCounters.map((c) =>
          c.id === counterId ? { ...c, status: "OPEN", agent_id: agentId } : c
        ),
      }));
    } catch (err) {
      console.error("openCounter error:", err);
    }
  },

  updateCounterFromWS: (counter) =>
    set((state) => ({
      myCounter:
        state.myCounter?.id === counter.id ? { ...state.myCounter, ...counter } : state.myCounter,
      allCounters: state.allCounters.map((c) =>
        c.id === counter.id ? { ...c, ...counter } : c
      ),
    })),

  getCountersByService: (serviceId) =>
    get().allCounters.filter((c) => c.service_ids.includes(serviceId)),
}));
