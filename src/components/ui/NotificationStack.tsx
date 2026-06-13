// ============================================================
// TONDE DESKTOP — NotificationStack
// Toast notifications empilées (coin bas-droit)
// ============================================================

import { useAppStore } from "../../store/app.store";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import type { Notification } from "../../types";

const ICON_MAP = {
  success: <CheckCircle size={16} className="text-emerald shrink-0" />,
  error: <XCircle size={16} className="text-rose shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber shrink-0" />,
  info: <Info size={16} className="text-cyan shrink-0" />,
};

const BORDER_MAP = {
  success: "border-emerald/30",
  error: "border-rose/30",
  warning: "border-amber/30",
  info: "border-cyan/30",
};

function ToastItem({ notification }: { notification: Notification }) {
  const remove = useAppStore((s) => s.removeNotification);

  return (
    <div
      className={`flex items-start gap-3 bg-ink border ${BORDER_MAP[notification.type]}
        rounded-card p-4 shadow-lg min-w-[280px] max-w-[360px] animate-slide-up`}
    >
      {ICON_MAP[notification.type]}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium">{notification.title}</p>
        {notification.message && (
          <p className="text-text-secondary text-xs mt-0.5">{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(notification.id)}
        className="text-text-muted hover:text-text-secondary transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function NotificationStack() {
  const notifications = useAppStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <ToastItem notification={n} />
        </div>
      ))}
    </div>
  );
}
