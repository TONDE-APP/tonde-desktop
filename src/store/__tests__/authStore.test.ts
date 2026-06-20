// ============================================================
// TONDE DESKTOP — Tests pour authStore
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthUser, LoginCredentials } from "../../types";

// Mock apiService
vi.mock("../../services/api/apiService", () => ({
  apiService: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

// Mock db
vi.mock("../../services/database/db", () => ({
  db: {
    upsertEmployee: vi.fn(),
    getEmployeeByEmail: vi.fn(),
  },
}));

// Import après les mocks
import { useAuthStore } from "../authStore";
import { apiService } from "../../services/api/apiService";
import { db } from "../../services/database/db";

// Données mock
const mockUser: AuthUser = {
  id: "user-001",
  name: "Jean Kamate",
  email: "jean@tonde.app",
  role: "Agent",
  branch_id: "branch-001",
  branch_name: "Agence Bujumbura",
  token: "mock-jwt-token",
  token_expires_at: new Date(Date.now() + 86400000).toISOString(),
};

const mockCredentials: LoginCredentials = {
  email: "jean@tonde.app",
  password: "password123",
};

describe("authStore", () => {
  beforeEach(() => {
    // Reset le store avant chaque test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  // ============================================
  // LOGIN
  // ============================================
  describe("login", () => {
    it("devrait connecter l'utilisateur avec succès", async () => {
      vi.mocked(apiService.login).mockResolvedValue(mockUser);

      await useAuthStore.getState().login(mockCredentials);

      expect(apiService.login).toHaveBeenCalledWith(mockCredentials);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it("devrait sauvegarder l'utilisateur en base offline", async () => {
      vi.mocked(apiService.login).mockResolvedValue(mockUser);

      await useAuthStore.getState().login(mockCredentials);

      expect(db.upsertEmployee).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        is_active: true,
        branch_id: mockUser.branch_id,
      });
    });

    it("devrait retourner une erreur si login échoue", async () => {
      vi.mocked(apiService.login).mockRejectedValue(new Error("Invalid credentials"));

      await useAuthStore.getState().login(mockCredentials);

      expect(useAuthStore.getState().error).toBe("Invalid credentials");
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("devrait permettre login offline si utilisateur en cache", async () => {
      vi.mocked(apiService.login).mockRejectedValue(new Error("Network error"));
      vi.mocked(db.getEmployeeByEmail).mockResolvedValue({
        id: "user-001",
        name: "Jean Kamate",
        email: "jean@tonde.app",
        role: "Agent" as const,
        is_active: true,
        branch_id: "branch-001",
      });

      await useAuthStore.getState().login(mockCredentials);

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.token).toBe("OFFLINE");
    });
  });

  // ============================================
  // LOGOUT
  // ============================================
  describe("logout", () => {
    it("devrait déconnecter l'utilisateur", async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      vi.mocked(apiService.logout).mockResolvedValue(undefined);

      await useAuthStore.getState().logout();

      expect(apiService.logout).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("devrait ne pas appeler API si token OFFLINE", async () => {
      const offlineUser = { ...mockUser, token: "OFFLINE" as const };
      useAuthStore.setState({ user: offlineUser, isAuthenticated: true });

      await useAuthStore.getState().logout();

      expect(apiService.logout).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  // ============================================
  // REFRESH TOKEN
  // ============================================
  describe("refreshToken", () => {
    it("devrait rafraîchir le token", async () => {
      useAuthStore.setState({ user: mockUser });
      vi.mocked(apiService.refreshToken).mockResolvedValue({
        token: "new-jwt-token",
        token_expires_at: new Date(Date.now() + 86400000).toISOString(),
      });

      await useAuthStore.getState().refreshToken();

      expect(apiService.refreshToken).toHaveBeenCalledWith(mockUser.token);
      expect(useAuthStore.getState().user?.token).toBe("new-jwt-token");
    });

    it("devrait ignorer si token OFFLINE", async () => {
      const offlineUser = { ...mockUser, token: "OFFLINE" as const };
      useAuthStore.setState({ user: offlineUser });

      await useAuthStore.getState().refreshToken();

      expect(apiService.refreshToken).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // ROLES
  // ============================================
  describe("roles", () => {
    it("hasRole devrait retourner true si l'utilisateur a le rôle", () => {
      useAuthStore.setState({ user: mockUser });

      expect(useAuthStore.getState().hasRole("Agent")).toBe(true);
      expect(useAuthStore.getState().hasRole("Supervisor")).toBe(false);
    });

    it("isAgent devrait retourner true pour un Agent", () => {
      useAuthStore.setState({ user: mockUser });
      expect(useAuthStore.getState().isAgent()).toBe(true);
    });

    it("isAdmin devrait retourner true pour BranchAdmin", () => {
      const adminUser = { ...mockUser, role: "BranchAdmin" as const };
      useAuthStore.setState({ user: adminUser });
      expect(useAuthStore.getState().isAdmin()).toBe(true);
    });

    it("devrait retourner false si pas d'utilisateur", () => {
      useAuthStore.setState({ user: null });
      expect(useAuthStore.getState().hasRole("Agent")).toBe(false);
      expect(useAuthStore.getState().isAgent()).toBe(false);
    });
  });

  // ============================================
  // ERROR HANDLING
  // ============================================
  describe("clearError", () => {
    it("devrait effacer l'erreur", () => {
      useAuthStore.setState({ error: "Some error" });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
