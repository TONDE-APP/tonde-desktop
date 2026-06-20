// ============================================================
// TONDE DESKTOP — Tests pour ticketStore
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Ticket } from "../../types";

// Mock apiService
vi.mock("../../services/api/apiService", () => ({
  apiService: {
    callNextTicket: vi.fn(),
    callTicketById: vi.fn(),
    recallTicket: vi.fn(),
    markTicketAbsent: vi.fn(),
    completeTicket: vi.fn(),
    transferTicket: vi.fn(),
  },
}));

// Mock db (Tauri SQLite)
vi.mock("../../services/database/db", () => ({
  db: {
    upsertTicket: vi.fn().mockResolvedValue(undefined),
    getNextWaitingTicket: vi.fn().mockResolvedValue(null),
  },
}));

// Mock offlineStore
vi.mock("../offlineStore", () => ({
  useOfflineStore: {
    getState: vi.fn(() => ({
      isOnline: true,
      enqueue: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Import après les mocks
import { useTicketStore } from "../ticketStore";
import { apiService } from "../../services/api/apiService";
import { db } from "../../services/database/db";
import { useOfflineStore } from "../offlineStore";

// Données mock
const mockTicket: Ticket = {
  id: "ticket-001",
  number: "A-001",
  status: "WAITING",
  priority: 0,
  service_id: "svc-001",
  branch_id: "branch-001",
  created_at: new Date().toISOString(),
};

const calledTicket: Ticket = {
  ...mockTicket,
  id: "ticket-002",
  number: "A-002",
  status: "CALLED",
  called_at: new Date().toISOString(),
};

describe("ticketStore", () => {
  beforeEach(() => {
    // Reset le store avant chaque test
    useTicketStore.setState({
      currentTicket: null,
      processingStartedAt: null,
      recentTickets: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
    // Reset offline store mock
    vi.mocked(useOfflineStore.getState).mockReturnValue({
      isOnline: true,
      enqueue: vi.fn().mockResolvedValue(undefined),
    });
  });

  // ============================================
  // CALL NEXT
  // ============================================
  describe("callNext", () => {
    it("devrait appeler le prochain ticket en ligne", async () => {
      vi.mocked(apiService.callNextTicket).mockResolvedValue(calledTicket);

      await useTicketStore.getState().callNext("counter-001", ["svc-001"]);

      expect(apiService.callNextTicket).toHaveBeenCalledWith("counter-001", ["svc-001"]);
      expect(db.upsertTicket).toHaveBeenCalledWith(calledTicket);
      expect(useTicketStore.getState().currentTicket).toEqual(calledTicket);
    });

    it("devrait retourner une erreur si aucun ticket en ligne", async () => {
      vi.mocked(apiService.callNextTicket).mockRejectedValue(new Error("Aucun ticket en attente"));

      await useTicketStore.getState().callNext("counter-001", ["svc-001"]);

      expect(useTicketStore.getState().error).toBe("Aucun ticket en attente");
    });
  });

  // ============================================
  // RECALL
  // ============================================
  describe("recall", () => {
    it("devrait rappeler le ticket actuel", async () => {
      vi.mocked(apiService.recallTicket).mockResolvedValue(undefined);
      useTicketStore.setState({ currentTicket: calledTicket });

      await useTicketStore.getState().recall("counter-001");

      expect(apiService.recallTicket).toHaveBeenCalledWith("ticket-002", "counter-001");
    });

    it("ne devrait rien faire si pas de ticket actuel", async () => {
      useTicketStore.setState({ currentTicket: null });

      await useTicketStore.getState().recall("counter-001");

      expect(apiService.recallTicket).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // MARK ABSENT
  // ============================================
  describe("markAbsent", () => {
    it("devrait marquer le ticket absent", async () => {
      vi.mocked(apiService.markTicketAbsent).mockResolvedValue(undefined);
      useTicketStore.setState({ currentTicket: calledTicket });

      await useTicketStore.getState().markAbsent("ticket-002", "counter-001");

      expect(apiService.markTicketAbsent).toHaveBeenCalledWith("ticket-002", "counter-001");
      expect(db.upsertTicket).toHaveBeenCalled();
      expect(useTicketStore.getState().currentTicket).toBeNull();
    });
  });

  // ============================================
  // COMPLETE
  // ============================================
  describe("complete", () => {
    it("devrait terminer le ticket actuel", async () => {
      vi.mocked(apiService.completeTicket).mockResolvedValue(undefined);
      useTicketStore.setState({ currentTicket: calledTicket });

      await useTicketStore.getState().complete("ticket-002", "counter-001");

      expect(apiService.completeTicket).toHaveBeenCalledWith("ticket-002", "counter-001");
      expect(db.upsertTicket).toHaveBeenCalled();
      expect(useTicketStore.getState().currentTicket).toBeNull();
    });
  });

  // ============================================
  // TRANSFER
  // ============================================
  describe("transfer", () => {
    it("devrait transférer le ticket", async () => {
      vi.mocked(apiService.transferTicket).mockResolvedValue(undefined);
      useTicketStore.setState({ currentTicket: calledTicket });

      await useTicketStore.getState().transfer("ticket-002", "counter-002", "svc-002");

      expect(apiService.transferTicket).toHaveBeenCalledWith("ticket-002", "counter-002", "svc-002");
      expect(useTicketStore.getState().currentTicket).toBeNull();
    });
  });

  // ============================================
  // SET CURRENT TICKET
  // ============================================
  describe("setCurrentTicket", () => {
    it("devrait définir le ticket actuel", () => {
      useTicketStore.getState().setCurrentTicket(mockTicket);

      expect(useTicketStore.getState().currentTicket).toEqual(mockTicket);
      expect(useTicketStore.getState().processingStartedAt).not.toBeNull();
    });

    it("devrait accepter null pour effacer", () => {
      useTicketStore.setState({ currentTicket: calledTicket });

      useTicketStore.getState().setCurrentTicket(null);

      expect(useTicketStore.getState().currentTicket).toBeNull();
    });
  });

  // ============================================
  // GET PROCESSING DURATION
  // ============================================
  describe("getProcessingDuration", () => {
    it("devrait retourner 0 si pas de ticket", () => {
      useTicketStore.setState({ processingStartedAt: null });

      const duration = useTicketStore.getState().getProcessingDuration();

      expect(duration).toBe(0);
    });

    it("devrait retourner la durée en secondes", () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      useTicketStore.setState({ processingStartedAt: fiveMinutesAgo });

      const duration = useTicketStore.getState().getProcessingDuration();

      expect(duration).toBeGreaterThanOrEqual(299);
      expect(duration).toBeLessThanOrEqual(301);
    });
  });

  // ============================================
  // UPDATE TICKET STATUS
  // ============================================
  describe("updateTicketStatus", () => {
    it("devrait mettre à jour le statut du ticket actuel", () => {
      useTicketStore.setState({ currentTicket: mockTicket });

      useTicketStore.getState().updateTicketStatus("ticket-001", "CALLED");

      expect(useTicketStore.getState().currentTicket?.status).toBe("CALLED");
    });

    it("ne devrait rien faire si ce n'est pas le ticket actuel", () => {
      useTicketStore.setState({ currentTicket: mockTicket });

      useTicketStore.getState().updateTicketStatus("other-ticket", "CALLED");

      expect(useTicketStore.getState().currentTicket?.status).toBe("WAITING");
    });
  });

  // ============================================
  // ERROR HANDLING
  // ============================================
  describe("clearError", () => {
    it("devrait effacer l'erreur", () => {
      useTicketStore.setState({ error: "Some error" });

      useTicketStore.getState().clearError();

      expect(useTicketStore.getState().error).toBeNull();
    });
  });
});
