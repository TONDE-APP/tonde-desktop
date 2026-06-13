// ============================================================
// TONDE DESKTOP — Auth Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, LoginCredentials, EmployeeRole } from "../types";
import { apiService } from "../services/api/apiService";
import { db } from "../services/database/db";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;

  // Helpers
  hasRole: (...roles: EmployeeRole[]) => boolean;
  isAgent: () => boolean;
  isSupervisor: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiService.login(credentials);
          // Cache user in SQLite for offline access
          await db.upsertEmployee({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: true,
            branch_id: user.branch_id,
          });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          // Try offline login from SQLite cache
          const cached = await db.getEmployeeByEmail(credentials.email);
          if (cached) {
            set({
              user: {
                ...cached,
                branch_name: "",
                token: "OFFLINE",
                token_expires_at: new Date(Date.now() + 86400000).toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: err instanceof Error ? err.message : "Erreur de connexion",
              isLoading: false,
            });
          }
        }
      },

      logout: async () => {
        const { user } = get();
        if (user && user.token !== "OFFLINE") {
          try {
            await apiService.logout();
          } catch {
            // Silent — we log out locally regardless
          }
        }
        set({ user: null, isAuthenticated: false, error: null });
      },

      refreshToken: async () => {
        const { user } = get();
        if (!user || user.token === "OFFLINE") return;
        try {
          const refreshed = await apiService.refreshToken(user.token);
          set({ user: { ...user, ...refreshed } });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),

      hasRole: (...roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      isAgent: () => get().hasRole("Agent"),
      isSupervisor: () => get().hasRole("Supervisor"),
      isAdmin: () => get().hasRole("BranchAdmin", "OrgAdmin"),
    }),
    {
      name: "tonde-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
