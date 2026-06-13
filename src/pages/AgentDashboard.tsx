// ============================================================
// TONDE DESKTOP — AgentDashboard
// Vue principale guichetier — layout mono-écran
// Sprint 0 : squelette avec zones définies
// ============================================================

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AgentLayout } from "../components/layout/AgentLayout";
import { ShortcutsHelp } from "../components/shortcuts/ShortcutsHelp";
import { useAppStore } from "../store/app.store";
import { useCounterStore } from "../store/counterStore";
import { useTicketStore } from "../store/ticketStore";
import { useQueueStore } from "../store/queueStore";
import { useAuthStore } from "../store/authStore";
import { useAgentShortcuts } from "../hooks/useKeyboardShortcuts";
import { wsManager } from "../lib/WebSocketManager";
import { preloadSounds } from "../utils/sound";
import { formatTicketNumber } from "../utils/formatters";
import {
  Phone,
  UserX,
  ArrowRightLeft,
  CheckSquare,
  RotateCcw,
  Loader2,
  Inbox,
} from "lucide-react";

export function AgentDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const myCounter = useCounterStore((s) => s.myCounter);
  const { currentTicket, isLoading, callNext, markAbsent, recall, complete } =
    useTicketStore();
  const { queues, loadQueues } = useQueueStore();
  const { openTransferModal, openShortcutsHelp, closeAllDialogs } = useAppStore();

  // Préchargement sons au montage
  useEffect(() => {
    preloadSounds();
  }, []);

  // Chargement initial de la file
  useEffect(() => {
    if (user?.branch_id) {
      loadQueues(user.branch_id);
    }
  }, [user?.branch_id, loadQueues]);

  // Connexion WebSocket
  useEffect(() => {
    if (user?.token && user?.branch_id) {
      wsManager.connect(user.branch_id, user.token);
    }
    return () => wsManager.disconnect();
  }, [user?.token, user?.branch_id]);

  // Raccourcis clavier
  useAgentShortcuts({
    onOpenTransfer: openTransferModal,
    onOpenHelp: openShortcutsHelp,
    onCloseDialog: closeAllDialogs,
  });

  const totalWaiting = queues.reduce((s, q) => s + q.waiting_count, 0);
  const serviceIds = myCounter?.service_ids ?? [];

  const handleCallNext = () => {
    if (!myCounter || myCounter.status !== "OPEN") return;
    callNext(myCounter.id, serviceIds);
  };

  const handleMarkAbsent = () => {
    if (!currentTicket || !myCounter) return;
    markAbsent(currentTicket.id, myCounter.id);
  };

  const handleRecall = () => {
    if (!myCounter) return;
    recall(myCounter.id);
  };

  const handleComplete = () => {
    if (!currentTicket || !myCounter) return;
    complete(currentTicket.id, myCounter.id);
  };

  return (
    <AgentLayout onPause={() => {}}>
      <div className="h-full grid grid-cols-[1fr_320px] gap-0">
        {/* ── Zone principale : ticket en cours ── */}
        <div className="flex flex-col items-center justify-center gap-8 px-8 border-r border-border-subtle">
          {currentTicket ? (
            <>
              {/* Numéro ticket géant */}
              <div className="text-center">
                <p className="text-text-muted text-sm uppercase tracking-widest mb-2">
                  {t("ticket.currentTicket")}
                </p>
                <p className="font-mono font-bold text-cyan leading-none"
                   style={{ fontSize: "120px" }}>
                  {formatTicketNumber(currentTicket.number)}
                </p>
                <p className="text-text-secondary text-sm mt-2">
                  {t(`ticket.status.${currentTicket.status.toLowerCase()}`)}
                </p>
              </div>

              {/* Actions sur le ticket en cours */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckSquare size={16} />
                  {t("ticket.complete")}
                </button>
                <button
                  onClick={handleMarkAbsent}
                  disabled={isLoading}
                  className="btn-danger flex items-center gap-2"
                >
                  <UserX size={16} />
                  {t("ticket.markAbsent")}
                  <span className="kbd">A</span>
                </button>
                <button
                  onClick={() => openTransferModal()}
                  disabled={isLoading}
                  className="btn-ghost border border-border-subtle flex items-center gap-2"
                >
                  <ArrowRightLeft size={16} />
                  {t("ticket.transfer")}
                  <span className="kbd">T</span>
                </button>
                <button
                  onClick={handleRecall}
                  disabled={isLoading}
                  className="btn-ghost flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  {t("ticket.recall")}
                  <span className="kbd">R</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Aucun ticket — bouton Appeler */}
              <div className="text-center">
                <Inbox size={48} className="text-text-muted mx-auto mb-4" />
                <p className="text-text-muted text-base">
                  {totalWaiting > 0
                    ? t("queue.waiting", { count: totalWaiting })
                    : t("ticket.noTicket")}
                </p>
              </div>

              <button
                onClick={handleCallNext}
                disabled={
                  isLoading ||
                  !myCounter ||
                  myCounter.status !== "OPEN" ||
                  totalWaiting === 0
                }
                className="btn-primary text-xl px-12 py-5 flex items-center gap-3
                  shadow-[0_0_30px_rgba(108,71,255,0.3)] hover:shadow-[0_0_40px_rgba(108,71,255,0.5)]"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Phone size={20} />
                )}
                {t("ticket.callNext")}
                <span className="kbd text-white/70">Espace</span>
              </button>
            </>
          )}
        </div>

        {/* ── Zone droite : file d'attente ── */}
        <div className="flex flex-col bg-obsidian overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle">
            <p className="text-text-secondary text-sm font-medium">
              {t("queue.title")}
            </p>
            <p className="text-cyan font-mono font-bold text-2xl mt-0.5">
              {totalWaiting}
            </p>
          </div>

          {/* Liste tickets en attente */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {queues
              .flatMap((q) => q.tickets)
              .filter((t) => t.status === "WAITING")
              .slice(0, 15)
              .map((ticket, i) => (
                <div
                  key={ticket.id}
                  className="card-secondary flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted text-xs font-mono w-4">
                      {i + 1}
                    </span>
                    <span className="font-mono font-semibold text-cyan text-sm">
                      {formatTicketNumber(ticket.number)}
                    </span>
                  </div>
                  {ticket.priority > 0 && (
                    <span className="text-amber text-xs font-medium">
                      Priorité
                    </span>
                  )}
                </div>
              ))}

            {totalWaiting === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-muted text-sm">{t("queue.empty")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay aide raccourcis */}
      <ShortcutsHelp />
    </AgentLayout>
  );
}
