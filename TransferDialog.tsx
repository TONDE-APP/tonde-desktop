// ============================================================
// TONDE DESKTOP — TransferDialog
// Dialogue de transfert de ticket (raccourci T)
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import type { Ticket, Counter, Service } from "../../types";
import { useTicketStore } from "../../store/ticketStore";
import { useCounterStore } from "../../store/counterStore";
import { useQueueStore } from "../../store/queueStore";

interface TransferDialogProps {
  ticket: Ticket;
  onClose: () => void;
}

export const TransferDialog: React.FC<TransferDialogProps> = ({ ticket, onClose }) => {
  const { transfer, isLoading } = useTicketStore();
  const { allCounters } = useCounterStore();
  const { services } = useQueueStore();

  const [selectedServiceId, setSelectedServiceId] = useState(ticket.service_id);
  const [selectedCounterId, setSelectedCounterId] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  // Focus first element on open
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Filter available counters by selected service
  const availableCounters = allCounters.filter(
    (c) =>
      c.service_ids.includes(selectedServiceId) &&
      c.status === "OPEN"
  );

  // Trap focus inside dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, select, input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    dialog.addEventListener("keydown", trap);
    return () => dialog.removeEventListener("keydown", trap);
  }, []);

  const handleConfirm = async () => {
    if (!selectedCounterId) return;
    await transfer(ticket.id, selectedCounterId, selectedServiceId);
    onClose();
  };

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="dialog transfer-dialog" ref={dialogRef}>
        <header className="dialog__header">
          <h2 id="transfer-title">Transférer le ticket</h2>
          <span className="dialog__ticket-number">{ticket.number}</span>
          <button
            className="dialog__close"
            onClick={onClose}
            aria-label="Fermer (Échap)"
          >
            ✕
          </button>
        </header>

        <div className="dialog__body">
          {/* Service selection */}
          <label className="field">
            <span className="field__label">Service</span>
            <select
              ref={firstInputRef}
              className="field__select"
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setSelectedCounterId(""); // Reset counter
              }}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          {/* Counter selection */}
          <label className="field">
            <span className="field__label">Guichet</span>
            <select
              className="field__select"
              value={selectedCounterId}
              onChange={(e) => setSelectedCounterId(e.target.value)}
              disabled={availableCounters.length === 0}
            >
              <option value="">-- Sélectionner un guichet --</option>
              {availableCounters.map((c) => (
                <option key={c.id} value={c.id}>
                  Guichet {c.number}
                  {c.agent_name ? ` — ${c.agent_name}` : ""}
                </option>
              ))}
            </select>
            {availableCounters.length === 0 && (
              <p className="field__hint field__hint--error">
                Aucun guichet ouvert pour ce service
              </p>
            )}
          </label>
        </div>

        <footer className="dialog__footer">
          <button
            className="btn btn--ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler <kbd>Échap</kbd>
          </button>
          <button
            className="btn btn--primary"
            onClick={handleConfirm}
            disabled={!selectedCounterId || isLoading}
          >
            {isLoading ? "Transfert..." : "Confirmer le transfert"}
          </button>
        </footer>
      </div>
    </div>
  );
};
