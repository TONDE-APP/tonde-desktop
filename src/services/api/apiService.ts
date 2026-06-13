// ============================================================
// TONDE DESKTOP — API Service
// Client HTTP vers FastAPI backend
// ============================================================

import type {
  AuthUser,
  LoginCredentials,
  Ticket,
  Counter,
  Queue,
  Service,
  Employee,
  AgentStats,
} from "../../types";

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.tonde.app";
const TIMEOUT_MS = 8000;

// ---- HTTP Client ----

class ApiClient {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Erreur serveur" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}

export const httpClient = new ApiClient();

// ---- API Service ----

export const apiService = {
  // Auth
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const data = await httpClient.post<AuthUser>("/auth/login", credentials);
    httpClient.setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    await httpClient.post("/auth/logout");
    httpClient.clearToken();
  },

  async refreshToken(token: string): Promise<Partial<AuthUser>> {
    return httpClient.post("/auth/refresh", { token });
  },

  // Tickets
  async callNextTicket(counterId: string, serviceIds: string[]): Promise<Ticket> {
    return httpClient.post<Ticket>(`/counters/${counterId}/call-next`, { service_ids: serviceIds });
  },

  async callTicketById(ticketId: string, counterId: string): Promise<Ticket> {
    return httpClient.post<Ticket>(`/tickets/${ticketId}/call`, { counter_id: counterId });
  },

  async recallTicket(ticketId: string, counterId: string): Promise<void> {
    await httpClient.post(`/tickets/${ticketId}/recall`, { counter_id: counterId });
  },

  async markTicketAbsent(ticketId: string, counterId: string): Promise<void> {
    await httpClient.post(`/tickets/${ticketId}/absent`, { counter_id: counterId });
  },

  async completeTicket(ticketId: string, counterId: string): Promise<void> {
    await httpClient.post(`/tickets/${ticketId}/complete`, { counter_id: counterId });
  },

  async transferTicket(
    ticketId: string,
    toCounterId: string,
    toServiceId: string
  ): Promise<void> {
    await httpClient.post(`/tickets/${ticketId}/transfer`, {
      to_counter_id: toCounterId,
      to_service_id: toServiceId,
    });
  },

  // Counters
  async getCounter(counterId: string): Promise<Counter> {
    return httpClient.get<Counter>(`/counters/${counterId}`);
  },

  async getCounters(branchId: string): Promise<Counter[]> {
    return httpClient.get<Counter[]>(`/branches/${branchId}/counters`);
  },

  async pauseCounter(counterId: string): Promise<void> {
    await httpClient.post(`/counters/${counterId}/pause`);
  },

  async resumeCounter(counterId: string): Promise<void> {
    await httpClient.post(`/counters/${counterId}/resume`);
  },

  async closeCounter(counterId: string): Promise<void> {
    await httpClient.post(`/counters/${counterId}/close`);
  },

  async openCounter(counterId: string, agentId: string): Promise<void> {
    await httpClient.post(`/counters/${counterId}/open`, { agent_id: agentId });
  },

  // Queues & Services
  async getQueues(branchId: string): Promise<Queue[]> {
    return httpClient.get<Queue[]>(`/branches/${branchId}/queues`);
  },

  async getServices(branchId: string): Promise<Service[]> {
    return httpClient.get<Service[]>(`/branches/${branchId}/services`);
  },

  // Employees (Admin)
  async getEmployees(branchId: string): Promise<Employee[]> {
    return httpClient.get<Employee[]>(`/branches/${branchId}/employees`);
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    return httpClient.post<Employee>("/employees", data);
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    return httpClient.put<Employee>(`/employees/${id}`, data);
  },

  async deactivateEmployee(id: string): Promise<void> {
    await httpClient.patch(`/employees/${id}`, { is_active: false });
  },

  // Stats
  async getAgentStats(agentId: string, date: string): Promise<AgentStats> {
    return httpClient.get<AgentStats>(`/agents/${agentId}/stats?date=${date}`);
  },

  async getBranchStats(branchId: string, date: string): Promise<unknown> {
    return httpClient.get(`/branches/${branchId}/stats?date=${date}`);
  },
};
