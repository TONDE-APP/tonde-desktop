// ============================================================
// TONDE DESKTOP — WebSocket Manager
// Reconnection exponentielle + Fallback Polling
// ============================================================

import type {
  WebSocketEvent,
  WebSocketEventType,
  QueueUpdatePayload,
  CounterStatusPayload,
} from "../types";
import { useOfflineStore } from "../store/offlineStore";
import { useQueueStore } from "../store/queueStore";
import { useCounterStore } from "../store/counterStore";

type EventHandler<T = unknown> = (payload: T) => void;

const WS_BASE_URL = "ws://api.tonde.app/ws/queue";
const MAX_RETRIES = 10;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
const POLL_INTERVAL_MS = 5000;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private branchId: string | null = null;
  private token: string | null = null;
  private retryCount = 0;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private isIntentionallyClosed = false;
  private handlers = new Map<WebSocketEventType, Set<EventHandler>>();
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  // ---- Public API ----

  connect(branchId: string, token: string): void {
    this.branchId = branchId;
    this.token = token;
    this.isIntentionallyClosed = false;
    this.retryCount = 0;
    this._connect();
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    this._clearTimers();
    this.ws?.close(1000, "User disconnect");
    this.ws = null;
    useOfflineStore.getState().setConnectionStatus("DISCONNECTED");
  }

  on<T>(event: WebSocketEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler);
    // Return unsubscribe function
    return () => this.handlers.get(event)?.delete(handler as EventHandler);
  }

  send(type: string, payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  // ---- Internal ----

  private _connect(): void {
    if (!this.branchId || !this.token) return;

    useOfflineStore.getState().setConnectionStatus("RECONNECTING");

    const url = `${WS_BASE_URL}/${this.branchId}?token=${this.token}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retryCount = 0;
      this._stopPolling();
      useOfflineStore.getState().setOnline(true);
      useOfflineStore.getState().setConnectionStatus("CONNECTED");
      this._startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WebSocketEvent;
        this._dispatch(msg);
      } catch (e) {
        console.error("[WS] Failed to parse message", e);
      }
    };

    this.ws.onclose = (event) => {
      this._stopPing();
      if (this.isIntentionallyClosed) return;

      useOfflineStore.getState().setOnline(false);

      // Start polling fallback
      this._startPolling();

      if (event.code !== 1000) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror — nothing extra needed
    };
  }

  private _dispatch(event: WebSocketEvent): void {
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;

    switch (event.type) {
      case "QUEUE_UPDATE": {
        const p = event.payload as QueueUpdatePayload;
        useQueueStore.getState().updateQueueFromWS(p.service_id, p.tickets, p.waiting_count);
        break;
      }
      case "COUNTER_STATUS": {
        const p = event.payload as CounterStatusPayload;
        useCounterStore.getState().updateCounterFromWS(p.counter);
        break;
      }
    }

    handlers.forEach((h) => h(event.payload));
  }

  private _scheduleReconnect(): void {
    if (this.retryCount >= MAX_RETRIES) {
      console.warn("[WS] Max retries reached. Staying in polling fallback.");
      return;
    }

    // Exponential backoff with jitter
    const delay = Math.min(
      BASE_DELAY_MS * Math.pow(2, this.retryCount) + Math.random() * 1000,
      MAX_DELAY_MS
    );

    this.retryCount++;
    console.info(`[WS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.retryCount})`);

    this.retryTimeout = setTimeout(() => {
      this._connect();
    }, delay);
  }

  private _startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "PING" }));
      }
    }, 25000); // Every 25 seconds
  }

  private _stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // ---- Polling fallback when WS is down ----

  private _startPolling(): void {
    if (this.pollInterval) return;
    console.info("[WS] Switching to polling fallback");
    this.pollInterval = setInterval(() => this._poll(), POLL_INTERVAL_MS);
  }

  private _stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async _poll(): Promise<void> {
    if (!this.branchId) return;
    try {
      const { loadQueues } = useQueueStore.getState();
      await loadQueues(this.branchId);
    } catch {
      // Still offline — polling will retry
    }
  }

  private _clearTimers(): void {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    this._stopPolling();
    this._stopPing();
  }
}

// Singleton
export const wsManager = new WebSocketManager();
