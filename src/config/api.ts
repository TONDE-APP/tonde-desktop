// ============================================================
// TONDE DESKTOP — Config API · Environnements
// ============================================================

type Environment = "development" | "staging" | "production";

const ENV: Environment =
  (import.meta.env.VITE_ENV as Environment) ?? "development";

const API_URLS: Record<Environment, string> = {
  development: "http://localhost:8000",
  staging: "https://api-staging.tonde.app",
  production: "https://api.tonde.app",
};

const WS_URLS: Record<Environment, string> = {
  development: "ws://localhost:8000/ws",
  staging: "wss://api-staging.tonde.app/ws",
  production: "wss://api.tonde.app/ws",
};

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? API_URLS[ENV];
export const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? WS_URLS[ENV];

export const API_TIMEOUT_MS = 8_000;

// OTP universel DEV uniquement
export const DEV_OTP = ENV === "development" ? "123456" : null;
