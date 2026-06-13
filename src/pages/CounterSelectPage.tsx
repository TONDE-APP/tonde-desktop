// ============================================================
// TONDE DESKTOP — CounterSelectPage
// Choix du guichet à ouvrir après login
// ============================================================

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useCounterStore } from "../store/counterStore";
import { Monitor, Loader2, ChevronRight } from "lucide-react";

interface CounterSelectPageProps {
  onCounterSelected: () => void;
}

export function CounterSelectPage({ onCounterSelected }: CounterSelectPageProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { allCounters, isLoading, loadAllCounters, openCounter } = useCounterStore();

  useEffect(() => {
    if (user?.branch_id) {
      loadAllCounters(user.branch_id);
    }
  }, [user?.branch_id, loadAllCounters]);

  const handleSelect = async (counterId: string) => {
    if (!user) return;
    await openCounter(counterId, user.id);
    onCounterSelected();
  };

  const availableCounters = allCounters.filter((c) => c.status === "CLOSED");

  return (
    <div className="h-screen bg-midnight flex flex-col items-center justify-center p-6">
      {/* Titre */}
      <div className="mb-8 text-center">
        <Monitor size={40} className="text-violet mx-auto mb-3" />
        <h1 className="text-text-primary font-semibold text-xl">
          {t("counter.select")}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Bonjour {user?.name}
        </p>
      </div>

      {/* Liste guichets */}
      <div className="w-full max-w-md">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="text-violet animate-spin" />
          </div>
        ) : availableCounters.length === 0 ? (
          <div className="card text-center text-text-secondary">
            Aucun guichet disponible
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {availableCounters.map((counter) => (
              <button
                key={counter.id}
                onClick={() => handleSelect(counter.id)}
                className="card flex items-center justify-between hover:border-violet/50
                  hover:bg-ink/80 transition-all duration-200 group text-left"
              >
                <div>
                  <p className="text-text-primary font-medium">{counter.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    Guichet {counter.number}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-text-muted group-hover:text-violet transition-colors"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
