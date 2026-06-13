// ============================================================
// TONDE DESKTOP — SQLite Database Service
// Via Tauri invoke calls to Rust SQLite commands
// ============================================================

import { invoke } from "@tauri-apps/api/core";
import type {
  Ticket,
  Counter,
  Employee,
  Queue,
  Service,
  SyncQueueItem,
  SyncStatus,
} from "../../types";

// ---- Tickets ----

export const db = {
  async upsertTicket(ticket: Ticket): Promise<void> {
    await invoke("db_upsert_ticket", { ticket });
  },

  async getTicket(id: string): Promise<Ticket | null> {
    return invoke<Ticket | null>("db_get_ticket", { id });
  },

  async getNextWaitingTicket(serviceIds: string[]): Promise<Ticket | null> {
    return invoke<Ticket | null>("db_get_next_waiting_ticket", { serviceIds });
  },

  async getTicketsByStatus(
    branchId: string,
    status: string
  ): Promise<Ticket[]> {
    return invoke<Ticket[]>("db_get_tickets_by_status", { branchId, status });
  },

  // ---- Counters ----

  async upsertCounter(counter: Counter): Promise<void> {
    await invoke("db_upsert_counter", { counter });
  },

  async getCounter(id: string): Promise<Counter | null> {
    return invoke<Counter | null>("db_get_counter", { id });
  },

  async cacheCounters(counters: Counter[]): Promise<void> {
    await invoke("db_cache_counters", { counters });
  },

  async getCachedCounters(branchId: string): Promise<Counter[]> {
    return invoke<Counter[]>("db_get_cached_counters", { branchId });
  },

  // ---- Employees ----

  async upsertEmployee(employee: Omit<Employee, "counter_id" | "avatar_url">): Promise<void> {
    await invoke("db_upsert_employee", { employee });
  },

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    return invoke<Employee | null>("db_get_employee_by_email", { email });
  },

  async getEmployeesByBranch(branchId: string): Promise<Employee[]> {
    return invoke<Employee[]>("db_get_employees_by_branch", { branchId });
  },

  // ---- Queues ----

  async cacheQueues(queues: Queue[]): Promise<void> {
    await invoke("db_cache_queues", { queues });
  },

  async getCachedQueues(branchId: string): Promise<Queue[]> {
    return invoke<Queue[]>("db_get_cached_queues", { branchId });
  },

  async getCachedServices(branchId: string): Promise<Service[]> {
    return invoke<Service[]>("db_get_cached_services", { branchId });
  },

  // ---- Sync Queue ----

  async insertSyncItem(item: SyncQueueItem): Promise<void> {
    await invoke("db_insert_sync_item", { item });
  },

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return invoke<SyncQueueItem[]>("db_get_sync_queue");
  },

  async updateSyncItemStatus(
    id: string,
    status: SyncStatus,
    syncedAt?: string
  ): Promise<void> {
    await invoke("db_update_sync_item_status", { id, status, syncedAt });
  },

  async clearDoneSyncItems(): Promise<void> {
    await invoke("db_clear_done_sync_items");
  },

  // ---- Maintenance ----

  async runMigrations(): Promise<void> {
    await invoke("db_run_migrations");
  },

  async vacuum(): Promise<void> {
    await invoke("db_vacuum");
  },
};
