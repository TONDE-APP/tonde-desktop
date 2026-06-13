// ============================================================
// TONDE DESKTOP — Axios Client + Intercepteurs JWT
// ============================================================

import axios, { type AxiosInstance, type AxiosError } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "../config/api";

let _refreshPromise: Promise<string> | null = null;

export function createAxiosClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // ── Request interceptor : injecter le JWT ──
  client.interceptors.request.use(
    (config) => {
      // Le token est récupéré dynamiquement depuis le store
      // pour éviter les imports circulaires
      const token = getTokenFromStore();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response interceptor : refresh automatique sur 401 ──
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as typeof error.config & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Déduplique les refreshs simultanés
          if (!_refreshPromise) {
            _refreshPromise = refreshToken().finally(() => {
              _refreshPromise = null;
            });
          }
          const newToken = await _refreshPromise;
          originalRequest.headers!.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch {
          // Refresh échoué → déconnexion
          handleSessionExpired();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// ── Helpers late-bound pour éviter les imports circulaires ──

function getTokenFromStore(): string | null {
  try {
    // Import dynamique pour casser la circularité store ↔ axios
    const { useAuthStore } = require("../store/authStore");
    return useAuthStore.getState().user?.token ?? null;
  } catch {
    return null;
  }
}

async function refreshToken(): Promise<string> {
  const { useAuthStore } = require("../store/authStore");
  await useAuthStore.getState().refreshToken();
  const token = useAuthStore.getState().user?.token;
  if (!token) throw new Error("No token after refresh");
  return token;
}

function handleSessionExpired(): void {
  try {
    const { useAuthStore } = require("../store/authStore");
    useAuthStore.getState().logout();
  } catch {
    // Silencieux
  }
}

export const httpClient = createAxiosClient();
