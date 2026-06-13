// ============================================================
// TONDE DESKTOP — Agent Dashboard
// Écran principal de l'agent guichetier
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import { useTicketStore } from "../../store/ticketStore";
import { useCounterStore } from "../../store/counterStore";
import { useQueueStore } from "../../store/queueStore";
import { useOfflineStore } from "../../store/offlineStore";
import { useAuthStore } from "../../store/authStore";
import { useAgentShortcuts, useShortcutAvailability } from "../../hooks/useKeyboardShortcuts";
import { CurrentTicketPanel } from "../../components/ticket/CurrentTicketPanel";
import { QueueOverview } from "../../components/queue/QueueOverview";
import { CounterStatusBadge } from "../../components/counter/CounterStatusBadge";
import { ActionBar } from "../../components/layout/ActionBar";
import { TransferDialog } from "../../components/ticket/TransferDialog";
import { HelpOverlay } from "../../components/ui/HelpOverlay";
import { OfflineBanner } from "../../components/ui/OfflineBanner";
import { AgentMessageToast } from "../../components/ui/AgentMessageToast";

export const AgentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { currentTicket, callNext, recall, markAbsent, complete, isLoading } = useTicketStore();
  const { myCounter, loadMyCounter, pauseCounter, resumeCounter } = useCounterStore();
  const { queues, loadQueues, getTotalWaiting } = useQueueStore();
  const { isOnline, getPendingCount } = useOfflineStore();

  const [showTransfer, setShowTransfer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // ---- Init ----
  useEffect(() => {
    if (!user) return;
    if (user.counter_id) loadMyCounter(user.counter_id);
    loadQueues(user.branch_id);
  }, [user]);

  // ---- Keyboard shortcuts ----
  useAgentShortcuts({
    onOpenTransfer: () => setShowTransfer(true),
    onOpenHelp: () => setShowHelp(true),
    onCloseDialog: () => {
      setShowTransfer(false);
      setShowHelp(false);
    },
  });

  const shortcuts = useShortcutAvailability();

  // ---- Handlers ----
  const handleCallNext = useCallback(() => {
    if (!myCounter || !shortcuts.canCallNext) return;
    callNext(myCounter.id, myCounter.service_ids);
  }, [myCounter, shortcuts.canCallNext, callNext]);

  const handleRecall = useCallback(() => {
    if (!myCounter || !shortcuts.canRecall) return;
    recall(myCounter.id);
  }, [myCounter, shortcuts.canRecall, recall]);

  const handleMarkAbsent = useCallback(() => {
    if (!currentTicket || !myCounter || !shortcuts.canMarkAbsent) return;
    markAbsent(currentTicket.id, myCounter.id);
  }, [currentTicket, myCounter, shortcuts.canMarkAbsent, markAbsent]);

  const handleComplete = useCallback(() => {
    if (!currentTicket || !myCounter) return;
    complete(currentTicket.id, myCounter.id);
  }, [currentTicket, myCounter, complete]);

  const handlePause = useCallback(() => {
    if (!myCounter || !shortcuts.canPause) return;
    if (myCounter.status === "OPEN") {
      pauseCounter(myCounter.id);
    } else if (myCounter.status === "PAUSED") {
      resumeCounter(myCounter.id);
    }
  }, [myCounter, shortcuts.canPause, pauseCounter, resumeCounter]);

  // ---- Render ----
  return (
    <div className="agent-dashboard">
      {/* ---- Top Bar ---- */}
      <header className="dashboard-header">
        <div className="header-left">
          <span className="app-name">TONDE</span>
          {myCounter && (
            <CounterStatusBadge
              number={myCounter.number}
              status={myCounter.status}
            />
          )}
        </div>
        <div className="header-center">
          <span className="queue-summary">
            {getTotalWaiting()} client{getTotalWaiting() !== 1 ? "s" : ""} en attente
          </span>
        </div>
        <div className="header-right">
          {!isOnline && <OfflineBanner pendingCount={getPendingCount()} />}
          <span className="agent-name">{user?.name}</span>
        </div>
      </header>

      {/* ---- Main Layout ---- */}
      <main className="dashboard-main">
        {/* Left — Current Ticket */}
        <section className="panel panel-ticket" aria-label="Ticket en cours">
          <CurrentTicketPanel
            ticket={currentTicket}
            counter={myCounter}
            isLoading={isLoading}
            onComplete={handleComplete}
          />
        </section>

        {/* Right — Queue Overview */}
        <section className="panel panel-queue" aria-label="File d'attente">
          <QueueOverview queues={queues} />
        </section>
      </main>

      {/* ---- Action Bar (bottom) ---- */}
      <footer className="dashboard-footer">
        <ActionBar
          onCallNext={handleCallNext}
          onRecall={handleRecall}
          onMarkAbsent={handleMarkAbsent}
          onTransfer={() => setShowTransfer(true)}
          onPause={handlePause}
          counterStatus={myCounter?.status}
          shortcuts={shortcuts}
          isLoading={isLoading}
        />
      </footer>

      {/* ---- Dialogs ---- */}
      {showTransfer && currentTicket && myCounter && (
        <TransferDialog
          ticket={currentTicket}
          onClose={() => setShowTransfer(false)}
        />
      )}

      {showHelp && (
        <HelpOverlay onClose={() => setShowHelp(false)} />
      )}

      {/* ---- Agent Message Toast (from Supervisor) ---- */}
      <AgentMessageToast />
    </div>
  );
};

export default AgentDashboard;
