// ============================================================
// TONDE DESKTOP — Supervisor Dashboard
// Monitoring temps réel de tous les guichets et files
// ============================================================

import React, { useEffect, useState } from "react";
import { useCounterStore } from "../../store/counterStore";
import { useQueueStore } from "../../store/queueStore";
import { useAuthStore } from "../../store/authStore";
import { useOfflineStore } from "../../store/offlineStore";
import { wsManager } from "../../services/websocket/WebSocketManager";
import type { Counter, Queue, AgentMessagePayload } from "../../types";

// ---- Counter Card ----

interface CounterCardProps {
  counter: Counter;
  onMessage: (counter: Counter) => void;
  onClose: (counterId: string) => void;
  onOpen: (counterId: string) => void;
}

const CounterCard: React.FC<CounterCardProps> = ({
  counter,
  onMessage,
  onClose,
  onOpen,
}) => (
  <div className={`counter-card counter-card--${counter.status.toLowerCase()}`}>
    <div className="counter-card__header">
      <span className="counter-card__number">Guichet {counter.number}</span>
      <span className={`status-dot status-dot--${counter.status.toLowerCase()}`} />
    </div>
    <div className="counter-card__agent">
      {counter.agent_name ?? <em>Sans agent</em>}
    </div>
    <div className="counter-card__ticket">
      {counter.current_ticket ? (
        <span className="ticket-badge">{counter.current_ticket.number}</span>
      ) : (
        <span className="counter-card__idle">Libre</span>
      )}
    </div>
    <div className="counter-card__actions">
      <button
        className="btn btn--sm btn--ghost"
        onClick={() => onMessage(counter)}
        disabled={counter.status === "CLOSED"}
        aria-label={`Envoyer un message à l'agent du guichet ${counter.number}`}
      >
        💬
      </button>
      {counter.status !== "CLOSED" ? (
        <button
          className="btn btn--sm btn--danger"
          onClick={() => onClose(counter.id)}
          aria-label={`Fermer le guichet ${counter.number}`}
        >
          Fermer
        </button>
      ) : (
        <button
          className="btn btn--sm btn--primary"
          onClick={() => onOpen(counter.id)}
          aria-label={`Ouvrir le guichet ${counter.number}`}
        >
          Ouvrir
        </button>
      )}
    </div>
  </div>
);

// ---- Queue Row ----

interface QueueRowProps {
  queue: Queue;
}

const QueueRow: React.FC<QueueRowProps> = ({ queue }) => (
  <div className="queue-row">
    <div className="queue-row__service">{queue.service_name}</div>
    <div className="queue-row__waiting">
      <span className={`waiting-badge ${queue.waiting_count > 10 ? "waiting-badge--critical" : ""}`}>
        {queue.waiting_count}
      </span>
    </div>
    <div className="queue-row__bar">
      <div
        className="queue-bar"
        style={{ width: `${Math.min((queue.waiting_count / 20) * 100, 100)}%` }}
        role="progressbar"
        aria-valuenow={queue.waiting_count}
        aria-valuemax={20}
      />
    </div>
  </div>
);

// ---- Send Message Dialog ----

interface MessageDialogProps {
  counter: Counter;
  onSend: (message: string) => void;
  onClose: () => void;
}

const MessageDialog: React.FC<MessageDialogProps> = ({ counter, onSend, onClose }) => {
  const [message, setMessage] = useState("");
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true">
      <div className="dialog">
        <header className="dialog__header">
          <h2>Message → Guichet {counter.number}</h2>
          <button className="dialog__close" onClick={onClose}>✕</button>
        </header>
        <div className="dialog__body">
          <textarea
            className="field__textarea"
            placeholder="Écrivez votre message à l'agent..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            autoFocus
          />
        </div>
        <footer className="dialog__footer">
          <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button
            className="btn btn--primary"
            onClick={() => { onSend(message); onClose(); }}
            disabled={!message.trim()}
          >
            Envoyer
          </button>
        </footer>
      </div>
    </div>
  );
};

// ---- Main Dashboard ----

export const SupervisorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { allCounters, loadAllCounters, openCounter, closeCounter } = useCounterStore();
  const { queues, loadQueues, getTotalWaiting } = useQueueStore();
  const { isOnline } = useOfflineStore();

  const [messageTarget, setMessageTarget] = useState<Counter | null>(null);

  useEffect(() => {
    if (!user) return;
    loadAllCounters(user.branch_id);
    loadQueues(user.branch_id);
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    const unsub = wsManager.on<AgentMessagePayload>("COUNTER_STATUS", () => {
      if (user) loadAllCounters(user.branch_id);
    });
    return () => unsub();
  }, [user]);

  const handleSendMessage = (counter: Counter) => {
    setMessageTarget(counter);
  };

  const handleMessageSend = (message: string) => {
    if (!messageTarget) return;
    wsManager.send("SUPERVISOR_MESSAGE", {
      counter_id: messageTarget.id,
      message,
    });
  };

  const openCounters = allCounters.filter((c) => c.status === "OPEN");
  const pausedCounters = allCounters.filter((c) => c.status === "PAUSED");
  const closedCounters = allCounters.filter((c) => c.status === "CLOSED");

  return (
    <div className="supervisor-dashboard">
      <header className="dashboard-header">
        <h1>Supervision — {user?.branch_name}</h1>
        <div className="header-stats">
          <span className="stat">
            <strong>{getTotalWaiting()}</strong> en attente
          </span>
          <span className="stat">
            <strong>{openCounters.length}</strong> guichets actifs
          </span>
          {!isOnline && <span className="offline-badge">🟠 Hors ligne</span>}
        </div>
      </header>

      <main className="supervisor-main">
        {/* ---- Counters Section ---- */}
        <section className="supervisor-section">
          <h2 className="section-title">
            Guichets
            <span className="section-badge">
              {openCounters.length}/{allCounters.length} ouverts
            </span>
          </h2>
          <div className="counters-grid">
            {allCounters.map((counter) => (
              <CounterCard
                key={counter.id}
                counter={counter}
                onMessage={handleSendMessage}
                onClose={closeCounter}
                onOpen={(id) => openCounter(id, "")}
              />
            ))}
          </div>
        </section>

        {/* ---- Queues Section ---- */}
        <section className="supervisor-section">
          <h2 className="section-title">Files d'attente</h2>
          <div className="queues-list">
            {queues.map((queue) => (
              <QueueRow key={queue.service_id} queue={queue} />
            ))}
          </div>
        </section>

        {/* ---- Summary Stats ---- */}
        <section className="supervisor-section supervisor-section--stats">
          <h2 className="section-title">Résumé</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__value">{openCounters.length}</div>
              <div className="stat-card__label">Guichets ouverts</div>
            </div>
            <div className="stat-card stat-card--warning">
              <div className="stat-card__value">{pausedCounters.length}</div>
              <div className="stat-card__label">En pause</div>
            </div>
            <div className="stat-card stat-card--muted">
              <div className="stat-card__value">{closedCounters.length}</div>
              <div className="stat-card__label">Fermés</div>
            </div>
            <div className="stat-card stat-card--info">
              <div className="stat-card__value">{getTotalWaiting()}</div>
              <div className="stat-card__label">Total en attente</div>
            </div>
          </div>
        </section>
      </main>

      {/* ---- Message Dialog ---- */}
      {messageTarget && (
        <MessageDialog
          counter={messageTarget}
          onSend={handleMessageSend}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
