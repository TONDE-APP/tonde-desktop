// ============================================================
// TONDE DESKTOP — AgentLayout
// Layout principal mono-écran : tout visible en même temps
// ============================================================

import type { ReactNode } from "react";
import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { CounterHeader } from "./CounterHeader";
import { NotificationStack } from "../ui/NotificationStack";
import { useAuthStore } from "../../store/authStore";
import { useCounterStore } from "../../store/counterStore";

interface AgentLayoutProps {
  children: ReactNode;
  onPause: () => void;
}

export function AgentLayout({ children, onPause }: AgentLayoutProps) {
  const logout = useAuthStore((s) => s.logout);
  const closeCounter = useCounterStore((s) => s.closeCounter);
  const myCounter = useCounterStore((s) => s.myCounter);

  const handleLogout = async () => {
    if (myCounter) {
      await closeCounter(myCounter.id);
    }
    await logout();
  };

  return (
    <div className="flex flex-col h-screen bg-midnight text-text-primary overflow-hidden">
      {/* Barre de statut connexion */}
      <ConnectionStatusBar />

      {/* En-tête guichet */}
      <CounterHeader onPause={onPause} onLogout={handleLogout} />

      {/* Contenu principal mono-écran */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Stack de notifications toast */}
      <NotificationStack />
    </div>
  );
}
