// ============================================================
// TONDE DESKTOP — Formatters · Dates, durées, tickets
// ============================================================

import { formatDistanceToNow, format, differenceInSeconds } from "date-fns";
import { fr } from "date-fns/locale";

/** Format HH:mm */
export function formatTime(isoDate: string): string {
  return format(new Date(isoDate), "HH:mm");
}

/** Format "il y a X min" */
export function formatRelative(isoDate: string): string {
  return formatDistanceToNow(new Date(isoDate), {
    addSuffix: true,
    locale: fr,
  });
}

/** Durée en secondes → "2m 34s" */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/** Durée depuis une date ISO */
export function durationSince(isoDate: string): string {
  const secs = differenceInSeconds(new Date(), new Date(isoDate));
  return formatDuration(secs);
}

/** Numéro ticket toujours affiché en majuscule */
export function formatTicketNumber(number: string): string {
  return number.toUpperCase();
}

/** Temps d'attente estimé "~5 min" */
export function formatEta(minutes: number): string {
  if (minutes <= 0) return "immédiat";
  if (minutes < 1) return "< 1 min";
  return `~${Math.round(minutes)} min`;
}
