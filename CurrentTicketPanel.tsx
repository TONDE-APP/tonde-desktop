// ============================================================
// TONDE DESKTOP — CurrentTicketPanel
// Affichage du ticket en cours de traitement
// ============================================================

import React, { useState, useEffect } from "react";
import type { Ticket, Counter } from "../../types";

interface CurrentTicketPanelProps {
  ticket: Ticket | null;
  counter: Counter | null;
  isLoading: boolean;
  onComplete: () => void;
}

const PRIORITY_LABELS: Record<number, { label: string; className: string }> = {
  0: { label: "Normal", className: "priority--normal" },
  1: { label: "Prioritaire", className: "priority--medium" },
  2: { label: "Urgent", className: "priority--high" },
};

function useElapsedTime(startISO: string | null): string {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startISO) { setElapsed(0); return; }
    const tick = () =>
      setElapsed(Math.floor((Date.now() - new Date(startISO).getTime()) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startISO]);

  const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export const CurrentTicketPanel: React.FC<CurrentTicketPanelProps> = ({
  ticket,
  counter,
  isLoading,
  onComplete,
}) => {
  const elapsed = useElapsedTime(ticket?.called_at ?? null);
  const priority = ticket ? PRIORITY_LABELS[ticket.priority] : null;

  if (isLoading) {
    return (
      <div className="ticket-panel ticket-panel--loading">
        <div className="skeleton skeleton--ticket" aria-busy="true" aria-label="Chargement..." />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-panel ticket-panel--empty">
        <div className="ticket-panel__empty-state">
          <p className="empty-icon">🎫</p>
          <h2>Aucun ticket en cours</h2>
          <p className="empty-hint">
            Appuyez sur <kbd>ESPACE</kbd> pour appeler le client suivant
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ticket-panel ticket-panel--active ${priority?.className}`}>
      {/* Ticket Number — dominant visually */}
      <div className="ticket-panel__number" aria-label={`Ticket numéro ${ticket.number}`}>
        <span className="ticket-number">{ticket.number}</span>
        {priority && priority.label !== "Normal" && (
          <span className={`priority-badge ${priority.className}`}>{priority.label}</span>
        )}
      </div>

      {/* Status */}
      <div className="ticket-panel__status">
        <span className={`status-pill status--${ticket.status.toLowerCase()}`}>
          {ticket.status === "CALLED" ? "Appelé" : "En traitement"}
        </span>
        <span className="elapsed-time" aria-live="polite" aria-label={`Temps écoulé: ${elapsed}`}>
          ⏱ {elapsed}
        </span>
      </div>

      {/* Meta */}
      <div className="ticket-panel__meta">
        <div className="meta-row">
          <span className="meta-label">Guichet</span>
          <span className="meta-value">N° {counter?.number}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Arrivée</span>
          <span className="meta-value">
            {new Date(ticket.created_at).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {ticket.called_at && (
          <div className="meta-row">
            <span className="meta-label">Appelé à</span>
            <span className="meta-value">
              {new Date(ticket.called_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Complete Button */}
      <div className="ticket-panel__actions">
        <button
          className="btn btn--success btn--lg"
          onClick={onComplete}
          aria-label="Terminer le traitement de ce ticket"
        >
          ✓ Terminer
        </button>
      </div>
    </div>
  );
};
