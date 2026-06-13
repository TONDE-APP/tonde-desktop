// ============================================================
// TONDE DESKTOP — CounterHeader
// En-tête guichet : nom, statut, stats du jour, agent
// ============================================================

import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { useCounterStore } from "../../store/counterStore";
import { Pause, Play, Power, User } from "lucide-react";

interface CounterHeaderProps {
  onPause: () => void;
  onLogout: () => void;
}

const STATUS_CLASSES: Record<string, string> = {
  OPEN: "text-emerald",
  PAUSED: "text-amber",
  CLOSED: "text-rose",
};

export function CounterHeader({ onPause, onLogout }: CounterHeaderProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const myCounter = useCounterStore((s) => s.myCounter);

  const statusClass = myCounter ? STATUS_CLASSES[myCounter.status] : "text-text-muted";
  const statusLabel = myCounter
    ? t(`counter.status.${myCounter.status.toLowerCase()}`)
    : "—";

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-ink border-b border-border-subtle">
      {/* Gauche : branding + guichet */}
      <div className="flex items-center gap-4">
        <span className="font-mono font-bold text-violet text-lg tracking-widest">
          TONDE
        </span>
        {myCounter && (
          <>
            <span className="text-border-strong">|</span>
            <div>
              <p className="text-text-primary font-semibold text-sm">
                {myCounter.name}
              </p>
              <p className={`text-xs font-medium ${statusClass}`}>
                {statusLabel}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Centre : agent */}
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <User size={14} />
        <span>{user?.name ?? "—"}</span>
      </div>

      {/* Droite : actions */}
      <div className="flex items-center gap-2">
        {myCounter && myCounter.status !== "CLOSED" && (
          <button
            onClick={onPause}
            className="btn-ghost text-sm flex items-center gap-1.5"
            title={
              myCounter.status === "PAUSED"
                ? t("counter.resume")
                : t("counter.pause")
            }
          >
            {myCounter.status === "PAUSED" ? (
              <Play size={14} />
            ) : (
              <Pause size={14} />
            )}
            <span className="hidden md:inline">
              {myCounter.status === "PAUSED"
                ? t("counter.resume")
                : t("counter.pause")}
            </span>
            <span className="kbd">P</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="btn-ghost text-sm flex items-center gap-1.5 text-rose/70 hover:text-rose"
          title={t("auth.logout")}
        >
          <Power size={14} />
          <span className="hidden md:inline">{t("auth.logout")}</span>
        </button>
      </div>
    </header>
  );
}
