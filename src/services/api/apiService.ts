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
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || import.meta.env.VITE_USE_MOCK === "1";

// ---- Mock Data ----

const MOCK_BRANCH_ID = "branch-mock-001";
const MOCK_BRANCH_NAME = "Agence Principale Bujumbura";
const MOCK_USER_ID = "agent-mock-001";

const MOCK_SERVICES: Service[] = [
  { id: "svc-001", name: "Dépôts & Retraits", code: "DEP", branch_id: MOCK_BRANCH_ID, is_active: true },
  { id: "svc-002", name: "Virements", code: "VIR", branch_id: MOCK_BRANCH_ID, is_active: true },
  { id: "svc-003", name: "Change", code: "CHG", branch_id: MOCK_BRANCH_ID, is_active: true },
];

const MOCK_COUNTERS: Counter[] = [
  { id: "counter-001", number: 1, name: "Guichet 1", status: "CLOSED", service_ids: ["svc-001"], branch_id: MOCK_BRANCH_ID },
  { id: "counter-002", number: 2, name: "Guichet 2", status: "CLOSED", service_ids: ["svc-001"], branch_id: MOCK_BRANCH_ID },
  { id: "counter-003", number: 3, name: "Guichet 3", status: "CLOSED", service_ids: ["svc-002"], branch_id: MOCK_BRANCH_ID },
  { id: "counter-004", number: 4, name: "Guichet 4", status: "CLOSED", service_ids: ["svc-003"], branch_id: MOCK_BRANCH_ID },
];

let mockTickets: Ticket[] = [
  { id: "ticket-001", number: "A-001", status: "WAITING", priority: 0, service_id: "svc-001", branch_id: MOCK_BRANCH_ID, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: "ticket-002", number: "A-002", status: "WAITING", priority: 1, service_id: "svc-001", branch_id: MOCK_BRANCH_ID, created_at: new Date(Date.now() - 240000).toISOString() },
  { id: "ticket-003", number: "A-003", status: "WAITING", priority: 0, service_id: "svc-001", branch_id: MOCK_BRANCH_ID, created_at: new Date(Date.now() - 180000).toISOString() },
  { id: "ticket-004", number: "B-001", status: "WAITING", priority: 0, service_id: "svc-002", branch_id: MOCK_BRANCH_ID, created_at: new Date(Date.now() - 150000).toISOString() },
  { id: "ticket-005", number: "B-002", status: "WAITING", priority: 0, service_id: "svc-002", branch_id: MOCK_BRANCH_ID, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: "ticket-006", number: "C-001", status: "WAITING", priority: 1, service_id: "svc-003", branch_id: MOCK_BRANCH_ID, created_at: new Date(Date.now() - 60000).toISOString() },
];

// ---- Mock API Implementation ----

const mockApi = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay(500);
    if (credentials.email && credentials.password) {
      return {
        id: MOCK_USER_ID,
        name: credentials.email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
        email: credentials.email,
        role: "Agent",
        branch_id: MOCK_BRANCH_ID,
        branch_name: MOCK_BRANCH_NAME,
        token: "mock-jwt-token-" + Date.now(),
        token_expires_at: new Date(Date.now() + 86400000).toISOString(),
      };
    }
    throw new Error("Email et mot de passe requis");
  },

  async logout(): Promise<void> {
    await delay(200);
  },

  async refreshToken(_token: string): Promise<Partial<AuthUser>> {
    await delay(200);
    return { token: "mock-refreshed-token-" + Date.now() };
  },

  async callNextTicket(_counterId: string, serviceIds: string[]): Promise<Ticket> {
    await delay(300);
    const availableTickets = mockTickets.filter(
      t => t.status === "WAITING" && serviceIds.includes(t.service_id)
    );
    if (availableTickets.length === 0) {
      throw new Error("Aucun ticket en attente");
    }
    const ticket = availableTickets[0];
    ticket.status = "CALLED";
    ticket.called_at = new Date().toISOString();
    return ticket;
  },

  async callTicketById(ticketId: string, _counterId: string): Promise<Ticket> {
    await delay(200);
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket non trouvé");
    ticket.status = "CALLED";
    ticket.called_at = new Date().toISOString();
    return ticket;
  },

  async recallTicket(_ticketId: string, _counterId: string): Promise<void> {
    await delay(200);
  },

  async markTicketAbsent(ticketId: string, _counterId: string): Promise<void> {
    await delay(200);
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = "ABSENT";
      ticket.closed_at = new Date().toISOString();
    }
  },

  async completeTicket(ticketId: string, _counterId: string): Promise<void> {
    await delay(200);
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = "COMPLETED";
      ticket.closed_at = new Date().toISOString();
    }
  },

  async transferTicket(
    ticketId: string,
    _toCounterId: string,
    _toServiceId: string
  ): Promise<void> {
    await delay(300);
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = "CALLED";
    }
  },

  async getCounter(counterId: string): Promise<Counter> {
    await delay(200);
    const counter = MOCK_COUNTERS.find(c => c.id === counterId);
    if (!counter) throw new Error("Guichet non trouvé");
    return counter;
  },

  async getCounters(_branchId: string): Promise<Counter[]> {
    await delay(200);
    return [...MOCK_COUNTERS];
  },

  async pauseCounter(counterId: string): Promise<void> {
    await delay(200);
    const counter = MOCK_COUNTERS.find(c => c.id === counterId);
    if (counter) counter.status = "PAUSED";
  },

  async resumeCounter(counterId: string): Promise<void> {
    await delay(200);
    const counter = MOCK_COUNTERS.find(c => c.id === counterId);
    if (counter) counter.status = "OPEN";
  },

  async closeCounter(counterId: string): Promise<void> {
    await delay(200);
    const counter = MOCK_COUNTERS.find(c => c.id === counterId);
    if (counter) counter.status = "CLOSED";
  },

  async openCounter(counterId: string, _agentId: string): Promise<void> {
    await delay(300);
    const counter = MOCK_COUNTERS.find(c => c.id === counterId);
    if (counter) {
      counter.status = "OPEN";
      counter.agent_id = _agentId;
    }
  },

  async getQueues(_branchId: string): Promise<Queue[]> {
    await delay(200);
    return MOCK_SERVICES.map(service => ({
      service_id: service.id,
      service_name: service.name,
      waiting_count: mockTickets.filter(t => t.service_id === service.id && t.status === "WAITING").length,
      called_count: mockTickets.filter(t => t.service_id === service.id && t.status === "CALLED").length,
      tickets: mockTickets.filter(t => t.service_id === service.id),
    }));
  },

  async getServices(_branchId: string): Promise<Service[]> {
    await delay(200);
    return [...MOCK_SERVICES];
  },

  async getEmployees(_branchId: string): Promise<Employee[]> {
    await delay(200);
    return [];
  },

  async createEmployee(_data: Partial<Employee>): Promise<Employee> {
    await delay(300);
    return _data as Employee;
  },

  async updateEmployee(id: string, _data: Partial<Employee>): Promise<Employee> {
    await delay(300);
    return { id, name: "", email: "", role: "Agent", is_active: true, branch_id: MOCK_BRANCH_ID };
  },

  async deactivateEmployee(_id: string): Promise<void> {
    await delay(200);
  },

  async getAgentStats(_agentId: string, _date: string): Promise<AgentStats> {
    await delay(200);
    return {
      agent_id: _agentId,
      date: _date,
      tickets_served: 12,
      avg_processing_time_minutes: 4.5,
      total_processing_time_minutes: 54,
      absent_count: 1,
      transferred_count: 2,
    };
  },

  async getBranchStats(_branchId: string, _date: string): Promise<unknown> {
    await delay(200);
    return { total_served: 45, avg_wait_time: 8.2 };
  },
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

// Export mock API pour les tests
export const mockApiService = mockApi;

// Si VITE_USE_MOCK=true, on utilise le mock
const apiImpl = USE_MOCK ? mockApi : null;

export const apiService = {
  // Auth
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    if (apiImpl) return apiImpl.login(credentials);
    const data = await httpClient.post<AuthUser>("/auth/login", credentials);
    httpClient.setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    if (apiImpl) return apiImpl.logout();
    await httpClient.post("/auth/logout");
    httpClient.clearToken();
  },

  async refreshToken(token: string): Promise<Partial<AuthUser>> {
    if (apiImpl) return apiImpl.refreshToken(token);
    return httpClient.post("/auth/refresh", { token });
  },

  // Tickets
  async callNextTicket(counterId: string, serviceIds: string[]): Promise<Ticket> {
    if (apiImpl) return apiImpl.callNextTicket(counterId, serviceIds);
    return httpClient.post<Ticket>(`/counters/${counterId}/call-next`, { service_ids: serviceIds });
  },

  async callTicketById(ticketId: string, counterId: string): Promise<Ticket> {
    if (apiImpl) return apiImpl.callTicketById(ticketId, counterId);
    return httpClient.post<Ticket>(`/tickets/${ticketId}/call`, { counter_id: counterId });
  },

  async recallTicket(ticketId: string, counterId: string): Promise<void> {
    if (apiImpl) return apiImpl.recallTicket(ticketId, counterId);
    await httpClient.post(`/tickets/${ticketId}/recall`, { counter_id: counterId });
  },

  async markTicketAbsent(ticketId: string, counterId: string): Promise<void> {
    if (apiImpl) return apiImpl.markTicketAbsent(ticketId, counterId);
    await httpClient.post(`/tickets/${ticketId}/absent`, { counter_id: counterId });
  },

  async completeTicket(ticketId: string, counterId: string): Promise<void> {
    if (apiImpl) return apiImpl.completeTicket(ticketId, counterId);
    await httpClient.post(`/tickets/${ticketId}/complete`, { counter_id: counterId });
  },

  async transferTicket(
    ticketId: string,
    toCounterId: string,
    toServiceId: string
  ): Promise<void> {
    if (apiImpl) return apiImpl.transferTicket(ticketId, toCounterId, toServiceId);
    await httpClient.post(`/tickets/${ticketId}/transfer`, {
      to_counter_id: toCounterId,
      to_service_id: toServiceId,
    });
  },

  // Counters
  async getCounter(counterId: string): Promise<Counter> {
    if (apiImpl) return apiImpl.getCounter(counterId);
    return httpClient.get<Counter>(`/counters/${counterId}`);
  },

  async getCounters(branchId: string): Promise<Counter[]> {
    if (apiImpl) return apiImpl.getCounters(branchId);
    return httpClient.get<Counter[]>(`/branches/${branchId}/counters`);
  },

  async pauseCounter(counterId: string): Promise<void> {
    if (apiImpl) return apiImpl.pauseCounter(counterId);
    await httpClient.post(`/counters/${counterId}/pause`);
  },

  async resumeCounter(counterId: string): Promise<void> {
    if (apiImpl) return apiImpl.resumeCounter(counterId);
    await httpClient.post(`/counters/${counterId}/resume`);
  },

  async closeCounter(counterId: string): Promise<void> {
    if (apiImpl) return apiImpl.closeCounter(counterId);
    await httpClient.post(`/counters/${counterId}/close`);
  },

  async openCounter(counterId: string, agentId: string): Promise<void> {
    if (apiImpl) return apiImpl.openCounter(counterId, agentId);
    await httpClient.post(`/counters/${counterId}/open`, { agent_id: agentId });
  },

  // Queues & Services
  async getQueues(branchId: string): Promise<Queue[]> {
    if (apiImpl) return apiImpl.getQueues(branchId);
    return httpClient.get<Queue[]>(`/branches/${branchId}/queues`);
  },

  async getServices(branchId: string): Promise<Service[]> {
    if (apiImpl) return apiImpl.getServices(branchId);
    return httpClient.get<Service[]>(`/branches/${branchId}/services`);
  },

  // Employees (Admin)
  async getEmployees(branchId: string): Promise<Employee[]> {
    if (apiImpl) return apiImpl.getEmployees(branchId);
    return httpClient.get<Employee[]>(`/branches/${branchId}/employees`);
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    if (apiImpl) return apiImpl.createEmployee(data);
    return httpClient.post<Employee>("/employees", data);
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    if (apiImpl) return apiImpl.updateEmployee(id, data);
    return httpClient.put<Employee>(`/employees/${id}`, data);
  },

  async deactivateEmployee(id: string): Promise<void> {
    if (apiImpl) return apiImpl.deactivateEmployee(id);
    await httpClient.patch(`/employees/${id}`, { is_active: false });
  },

  // Stats
  async getAgentStats(agentId: string, date: string): Promise<AgentStats> {
    if (apiImpl) return apiImpl.getAgentStats(agentId, date);
    return httpClient.get<AgentStats>(`/agents/${agentId}/stats?date=${date}`);
  },

  async getBranchStats(branchId: string, date: string): Promise<unknown> {
    if (apiImpl) return apiImpl.getBranchStats(branchId, date);
    return httpClient.get(`/branches/${branchId}/stats?date=${date}`);
  },
};
