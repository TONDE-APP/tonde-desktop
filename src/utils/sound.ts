// ============================================================
// TONDE DESKTOP — Sound Utils
// Feedback sonore obligatoire sur chaque action agent
// ============================================================

let _callAudio: HTMLAudioElement | null = null;
let _alertAudio: HTMLAudioElement | null = null;

/** Son joué à chaque appel de ticket (carillon) */
export async function playCallSound(): Promise<void> {
  try {
    if (!_callAudio) {
      _callAudio = new Audio("/sounds/tonde-call.mp3");
      _callAudio.volume = 0.8;
    }
    _callAudio.currentTime = 0;
    await _callAudio.play();
  } catch (e) {
    console.warn("[Sound] playCallSound failed:", e);
  }
}

/** Son joué quand un client est marqué absent */
export async function playAlertSound(): Promise<void> {
  try {
    if (!_alertAudio) {
      _alertAudio = new Audio("/sounds/tonde-alert.mp3");
      _alertAudio.volume = 0.6;
    }
    _alertAudio.currentTime = 0;
    await _alertAudio.play();
  } catch (e) {
    console.warn("[Sound] playAlertSound failed:", e);
  }
}

/** Précharge les sons au démarrage pour éviter la latence */
export function preloadSounds(): void {
  _callAudio = new Audio("/sounds/tonde-call.mp3");
  _callAudio.preload = "auto";
  _alertAudio = new Audio("/sounds/tonde-alert.mp3");
  _alertAudio.preload = "auto";
}
