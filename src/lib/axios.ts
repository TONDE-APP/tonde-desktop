// ============================================================
// TONDE DESKTOP — Axios Client + Intercepteurs JWT
// ============================================================

import axios, { type AxiosInstance, type AxiosError } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "../config/api";
import { useAuthStore } from "../store/authStore";

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
      const token = useAuthStore.getState().user?.token;
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
            _refreshPromise = doRefreshToken().finally(() => {
              _refreshPromise = null;
            });
          }
          const newToken = await _refreshPromise;
          originalRequest.headers!.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch {
          // Refresh échoué → déconnexion
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

async function doRefreshToken(): Promise<string> {
  await useAuthStore.getState().refreshToken();
  const token = useAuthStore.getState().user?.token;
  if (!token) throw new Error("No token after refresh");
  return token;
}

export const httpClient = createAxiosClient();
