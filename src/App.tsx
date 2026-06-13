// ============================================================
// TONDE DESKTOP — App.tsx
// Routeur principal basé sur l'état auth
// ============================================================

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import "./lib/i18n"; // init i18next
import { useAuthStore } from "./store/authStore";
import { useCounterStore } from "./store/counterStore";
import { LoginPage } from "./pages/LoginPage";
import { CounterSelectPage } from "./pages/CounterSelectPage";
import { AgentDashboard } from "./pages/AgentDashboard";

function AppRouter() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const myCounter = useCounterStore((s) => s.myCounter);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!myCounter || myCounter.status === "CLOSED") {
    return (
      <CounterSelectPage onCounterSelected={() => {}} />
    );
  }

  return <AgentDashboard />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}
