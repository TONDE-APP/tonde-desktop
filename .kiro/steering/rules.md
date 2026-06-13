# TONDE — Règles de Code · Desktop Guichetier (Tauri + React)

## Règles obligatoires

### 1. Jamais d'APIs Electron ou Node.js natif

```typescript
// ✅ TOUJOURS Tauri APIs
import { invoke } from '@tauri-apps/api/core';
import { listen, emit } from '@tauri-apps/api/event';
import { notification } from '@tauri-apps/plugin-notification';

// ❌ JAMAIS APIs Electron ou Node.js
const { ipcRenderer } = require('electron'); // INTERDIT
const fs = require('fs');                    // INTERDIT
```

### 2. Actions critiques via Tauri Commands Rust (pas fetch direct)

```typescript
// ✅ Actions sensibles passent par Rust
// Le Rust valide, sécurise, puis appelle le backend
const result = await invoke<CallNextResult>('call_next_ticket', {
  agencyId,
  counterId,
  counterName,
});

// Acceptable pour lecture simple (GET non critique)
const queue = await queueService.getQueue(agencyId);

// ❌ Actions d'écriture critiques directement depuis React
await axios.post('/api/v1/tickets/counter/call-next', data); // Préférer invoke()
```

### 3. Feedback immédiat — l'agent ne doit jamais attendre

```typescript
// ✅ Optimistic update : UI mise à jour AVANT la confirmation serveur
function useCallNext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CallNextDto) => invoke('call_next_ticket', data),

    // 1. Mise à jour optimiste IMMÉDIATE
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previous = queryClient.getQueryData(['queue']);
      queryClient.setQueryData(['queue'], (old: Queue) => removeFirstTicket(old));
      return { previous };
    },

    // 2. Si erreur → revenir en arrière
    onError: (err, data, context) => {
      queryClient.setQueryData(['queue'], context?.previous);
      toast.error('Erreur — ticket non appelé');
    },

    // 3. Confirmation serveur
    onSuccess: () => {
      playCallSound(); // Jingle sonore
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

// ❌ Attendre la réponse serveur avant de mettre à jour l'UI
// L'agent clique → 500ms d'attente → INACCEPTABLE
```

### 4. TypeScript strict — jamais de `any`

```typescript
// ✅ Types explicites pour tout
interface QueueUpdate {
  type: 'TICKET_CALLED' | 'QUEUE_UPDATE' | 'TICKET_ABSENT';
  ticketId: string;
  ticketNumber: string;
  position?: number;
  etaMinutes?: number;
}

// ❌ JAMAIS any
const handleWsMessage = (data: any) => { ... }; // INTERDIT
```

### 5. WebSocket — reconnexion automatique obligatoire

```typescript
// ✅ Reconnexion avec backoff exponentiel
class CounterWebSocketService {
  private retryDelay = 1000;
  private maxRetryDelay = 30000;

  connect(counterId: string) {
    this.ws = new WebSocket(`${WS_URL}/ws/counter/${counterId}`);

    this.ws.onclose = () => {
      // Notification visuelle à l'agent
      useAppStore.getState().setConnectionStatus('reconnecting');
      setTimeout(() => {
        this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
        this.connect(counterId);
      }, this.retryDelay);
    };

    this.ws.onopen = () => {
      this.retryDelay = 1000; // Reset du délai
      useAppStore.getState().setConnectionStatus('connected');
    };
  }
}
```

### 6. Raccourcis clavier — accessibilité agent

```typescript
// ✅ Raccourcis clavier via Tauri global shortcut
import { register } from '@tauri-apps/plugin-global-shortcut';

// Appeler le suivant avec Espace — même si l'app n'est pas au premier plan
await register('Space', () => {
  callNextMutation.mutate(currentCounterData);
});

// ✅ Raccourcis locaux dans l'UI
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === ' ' && !e.repeat) callNext();
    if (e.key === 'a' || e.key === 'A') markAbsent();
    if (e.key === 't' || e.key === 'T') openTransferModal();
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, []);
```

### 7. Son et notifications — feedback sensoriel obligatoire

```typescript
// ✅ Jouer un son à chaque appel de ticket
async function playCallSound() {
  const audio = new Audio('/sounds/tonde-call.mp3');
  await audio.play();
}

// ✅ Notification desktop si fenêtre en arrière-plan
import { sendNotification } from '@tauri-apps/plugin-notification';

async function notifyNewTicket(ticket: Ticket) {
  await sendNotification({
    title: 'TONDE — Nouveau ticket',
    body: `Ticket ${ticket.number} en attente`,
  });
}
```

### 8. Gestion de la déconnexion réseau — affichage dégradé

```typescript
// ✅ Toujours afficher le dernier état connu + indicateur offline
function QueueDisplay() {
  const { isOnline } = useNetworkStatus();
  const { data: queue } = useQueue(agencyId);

  return (
    <div>
      {!isOnline && (
        <OfflineBanner message="Connexion perdue — dernier état affiché" />
      )}
      <QueueTable tickets={queue?.tickets ?? cachedTickets} />
    </div>
  );
}
```

---

## Machine à états tickets (vue guichetier)

```
WAITING    → Ticket visible dans la file — prêt à appeler
CALLED     → Guichetier a appelé — timeout 3 min affiché
SERVING    → Client présent — service en cours
DONE       → Bouton "Terminer" pressé — ticket archivé
ABSENT     → Timeout dépassé — ticket sorti de la file active
TRANSFERRED→ Ticket envoyé à un autre guichet
```

Actions disponibles selon l'état :
- `WAITING` → Appeler
- `CALLED` → Marquer absent / Commencer service
- `SERVING` → Terminer / Transférer / Incomplete
- `CALLED` / `SERVING` → Transférer

---

## Ce qu'il ne faut jamais faire

```
❌ APIs Electron / Node.js natif (require, ipcRenderer...)
❌ Action critique sans invoke() Tauri
❌ Attendre réponse serveur avant mise à jour UI (pas d'optimistic)
❌ TypeScript any
❌ WebSocket sans reconnexion automatique
❌ Action sans feedback sonore/visuel à l'agent
❌ Afficher un message d'erreur technique à l'agent
❌ Style hardcodé sans Tailwind
❌ Composant > 200 lignes sans décomposition
❌ Transition ticket non autorisée par la machine à états
```

---

## Contexte business

```
Fondateur / Tech Lead : Vital
GitHub repo           : tonde-app/tonde-desktop
Backend DEV           : http://localhost:8000
Backend PROD          : https://api.tonde.app
Plateforme cible      : Windows 10/11 x64 (priorité), Linux (V1.5)
Utilisateurs          : agents guichetiers, superviseurs
Rôles autorisés       : agent, supervisor, admin_agency
```
