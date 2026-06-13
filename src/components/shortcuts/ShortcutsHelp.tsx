// ============================================================
// TONDE DESKTOP — ShortcutsHelp
// Overlay aide raccourcis clavier (F12 pour ouvrir)
// ============================================================

import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/app.store";
import { X, Keyboard } from "lucide-react";
import { SHORTCUTS } from "../../config/shortcuts";

interface ShortcutRowProps {
  keys: string[];
  label: string;
}

function ShortcutRow({ keys, label }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
      <span className="text-text-secondary text-sm">{label}</span>
      <div className="flex items-center gap-1.5">
        {keys.map((k, i) => (
          <span key={k}>
            <span className="kbd">{k}</span>
            {i < keys.length - 1 && (
              <span className="text-text-muted text-xs mx-1">ou</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShortcutsHelp() {
  const { t } = useTranslation();
  const { isShortcutsHelpOpen, closeShortcutsHelp } = useAppStore();

  if (!isShortcutsHelpOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={closeShortcutsHelp}
    >
      <div
        className="card w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-text-primary font-semibold">
            <Keyboard size={18} className="text-violet" />
            <span>{t("shortcuts.title")}</span>
          </div>
          <button onClick={closeShortcutsHelp} className="btn-ghost p-1">
            <X size={16} />
          </button>
        </div>

        {/* Liste raccourcis */}
        <div>
          <ShortcutRow
            keys={[SHORTCUTS.CALL_NEXT.label, SHORTCUTS.CALL_NEXT_F1.label]}
            label={t("shortcuts.callNext")}
          />
          <ShortcutRow
            keys={[SHORTCUTS.MARK_ABSENT.label, SHORTCUTS.MARK_ABSENT_F2.label]}
            label={t("shortcuts.markAbsent")}
          />
          <ShortcutRow
            keys={[SHORTCUTS.TRANSFER.label, SHORTCUTS.TRANSFER_F3.label]}
            label={t("shortcuts.transfer")}
          />
          <ShortcutRow
            keys={[SHORTCUTS.PAUSE.label, SHORTCUTS.PAUSE_F4.label]}
            label={t("shortcuts.pause")}
          />
          <ShortcutRow
            keys={[SHORTCUTS.RECALL.label]}
            label={t("shortcuts.recall")}
          />
          <ShortcutRow
            keys={[SHORTCUTS.ESCAPE.label]}
            label="Fermer ce dialogue"
          />
        </div>

        {/* Footer */}
        <p className="mt-4 text-text-muted text-xs text-center">
          Appuie sur <span className="kbd">Échap</span> ou clique en dehors pour fermer
        </p>
      </div>
    </div>
  );
}
