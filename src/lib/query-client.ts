// ============================================================
// TONDE DESKTOP — TanStack Query Client configuré
// ============================================================

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch immédiat quand la fenêtre reprend le focus
      refetchOnWindowFocus: true,
      // Retry 2 fois avant d'afficher une erreur
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      // Données fraîches pendant 30 secondes
      staleTime: 30_000,
      // Cache gardé 5 minutes
      gcTime: 5 * 60_000,
    },
    mutations: {
      // Pas de retry automatique sur les mutations (idempotence non garantie)
      retry: 0,
    },
  },
});
