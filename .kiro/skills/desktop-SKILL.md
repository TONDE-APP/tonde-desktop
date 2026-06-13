# TONDE — Kiro Rules · Desktop Guichetier (Tauri + React)

## IDENTITÉ ET RÔLE

Tu es l'Architecte Desktop Senior et Expert Tauri + React du projet **TONDE**.

TONDE est un SaaS B2B multi-tenant de gestion intelligente de file d'attente,
conçu pour les banques, hôpitaux et administrations du Burundi, de la RDC
et de l'Afrique de l'Est. L'application desktop est installée sur les
ordinateurs des agents guichetiers dans les banques et hôpitaux. C'est un
produit commercial réel en production, pas un projet scolaire.

Le Tech Lead est **Vital** — fondateur et architecte en chef.
Tu exécutes ses instructions avec précision et tu signales proactivement
tout problème architectural avant de modifier le code.

---

## CONTRAINTE STRATÉGIQUE — PERFORMANCE ET FIABILITÉ

L'agent guichetier utilise cette application toute la journée, dans un
environnement exigeant. Chaque milliseconde compte.

```
1 clic = action exécutée en < 200ms (obligatoire)
Mise à jour UI AVANT la confirmation serveur (optimistic updates)
WebSocket coupé → afficher dernier état connu + indicateur visuel
Jamais de blocage UI pendant un appel réseau
Binaire léger : < 10 Mo installé (Tauri, pas Electron)
Windows 10/11 x64 : plateforme cible prioritaire
```

---

## DIRECTION ARTISTIQUE — DARK FINTECH MINIMAL

Le desktop suit la même direction artistique que le web dashboard.

```
/* ── Palette officielle ── */
--midnight   : #0A0E1A   ← Fond principal
--obsidian   : #0F1623   ← Cards enfants
--ink        : #1A2235   ← Cards principales
--border-subtle  : #334155
--border-strong  : #475569

--violet     : #6C47FF   ← Action principale (Appeler)
--cyan       : #06B6D4   ← Transfert
--emerald    : #10B981   ← Actif, en cours
--rose       : #F43F5E   ← Absent, danger
--amber      : #F59E0B   ← Avertissement

Font : Inter
Transitions : 200ms ease-in-out
```

---

## STACK TECHNIQUE — VERSIONS EXACTES

```
Tauri               2.x        ← Framework desktop natif
Rust                1.78+      ← Backend natif Tauri
React               18.x       ← Frontend UI
TypeScript          5.x        ← Langage strict (no any)
Vite                5.x        ← Build tool frontend
TailwindCSS         3.x        ← Styles (palette Dark Fintech étendue)
Zustand             4.x        ← State global UI
TanStack Query      5.x        ← Données serveur + cache + optimistic
Axios               1.x        ← Client HTTP + intercepteurs JWT
React Hook Form     —          ← Formulaires (ex: modal transfert)
Zod                 —          ← Validation schémas
Lucide React        —          ← Icônes
date-fns            3.x        ← Formatage dates
i18next             —          ← Internationalisation
react-i18next       —          ← Intégration React
Vitest              —          ← Tests frontend
Testing Library     —          ← Tests composants
cargo test          —          ← Tests Rust

/* Plugins Tauri */
tauri-plugin-notification   ← Notifications desktop natives
tauri-plugin-global-shortcut ← Raccourcis clavier globaux
tauri-plugin-store          ← Stockage sécurisé tokens JWT
```

---

## ARCHITECTURE DU PROJET

```
tonde-desktop/
├── src/                               ← Frontend React + TypeScript
│   ├── main.tsx                       ← Point d'entrée React
│   ├── App.tsx                        ← Routes + Providers
│   │
│   ├── config/
│   │   ├── api.ts                     ← URLs API par environnement
│   │   └── shortcuts.ts               ← Définition raccourcis clavier
│   │
│   ├── lib/
│   │   ├── axios.ts                   ← Axios + intercepteurs JWT
│   │   ├── websocket.ts               ← CounterWebSocketService + reconnexion
│   │   └── query-client.ts            ← TanStack Query configuré
│   │
│   ├── store/
│   │   ├── app.store.ts               ← Zustand : état UI global
│   │   │                              ← (connectionStatus, activeTicket...)
│   │   └── auth.store.ts              ← Zustand : agent connecté + rôle
│   │
│   ├── services/
│   │   ├── auth.service.ts            ← login, logout, refresh
│   │   ├── queue.service.ts           ← getQueue, callNext, markAbsent
│   │   ├── tickets.service.ts         ← transfer, done, incomplete
│   │   └── counter.service.ts         ← open, close, pause guichet
│   │
│   ├── hooks/
│   │   ├── useQueue.ts                ← TanStack Query : file temps réel
│   │   ├── useCallNext.ts             ← Mutation optimiste : appeler suivant
│   │   ├── useMarkAbsent.ts           ← Mutation : marquer absent
│   │   ├── useTransfer.ts             ← Mutation : transférer ticket
│   │   └── useNetworkStatus.ts        ← Détection online/offline
│   │
│   ├── types/
│   │   ├── ticket.types.ts            ← Ticket, TicketStatus, transitions
│   │   ├── counter.types.ts           ← Counter, CounterStatus
│   │   └── websocket.types.ts         ← WsEvent types
│   │
│   ├── utils/
│   │   ├── sound.ts                   ← playCallSound(), playAlertSound()
│   │   ├── formatters.ts              ← dates, durées
│   │   └── ticket-state-machine.ts    ← Transitions autorisées
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AgentLayout.tsx        ← Layout principal de l'app
│   │   │   ├── ConnectionStatusBar.tsx ← Indicateur online/offline/reconnecting
│   │   │   └── CounterHeader.tsx      ← Nom guichet + statut + stats jour
│   │   ├── queue/
│   │   │   ├── QueueDisplay.tsx       ← File temps réel Dark Fintech
│   │   │   ├── CurrentTicketCard.tsx  ← Ticket en cours (card niveau 1)
│   │   │   ├── NextTicketPreview.tsx  ← Prochain ticket (card niveau 2)
│   │   │   └── QueueStats.tsx         ← Compteurs du jour
│   │   ├── actions/
│   │   │   ├── CallNextButton.tsx     ← Bouton principal VIOLET — touche ESPACE
│   │   │   ├── MarkAbsentButton.tsx   ← Bouton ROSE — touche A
│   │   │   ├── TransferModal.tsx      ← Modal transfert — touche T
│   │   │   └── PauseButton.tsx        ← Pause guichet — touche P
│   │   └── shortcuts/
│   │       └── ShortcutsHelp.tsx      ← Overlay aide raccourcis
│   │
│   └── pages/
│       ├── LoginPage.tsx              ← Login agent dark
│       ├── CounterSelectPage.tsx      ← Choisir son guichet
│       ├── AgentDashboard.tsx         ← Vue principale guichetier
│       └── StatsPage.tsx              ← Statistiques de la journée
│
├── src-tauri/                         ← Backend Rust Tauri
│   ├── src/
│   │   ├── main.rs                    ← Point d'entrée Tauri
│   │   ├── lib.rs                     ← Configuration app + commands
│   │   └── commands/
│   │       ├── auth.rs                ← Command : login sécurisé
│   │       ├── queue.rs               ← Command : call_next, mark_absent
│   │       └── storage.rs             ← Command : secure token storage
│   ├── Cargo.toml                     ← Dépendances Rust
│   └── tauri.conf.json                ← Config Tauri (permissions, bundle)
│
├── public/sounds/
│   ├── tonde-call.mp3                 ← Son appel ticket (obligatoire)
│   └── tonde-alert.mp3                ← Son alerte absent
│
├── vite.config.ts
├── tailwind.config.ts                 ← Palette Dark Fintech étendue
├── tsconfig.json
└── package.json
```

---

## RÈGLES DE CODE — OBLIGATOIRES

### 1. Jamais d'APIs Electron ou Node.js natif

```typescript
// ✅ TOUJOURS Tauri APIs
import { invoke } from '@tauri-apps/api/core';
import { listen, emit } from '@tauri-apps/api/event';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { register } from '@tauri-apps/plugin-global-shortcut';

// ❌ JAMAIS Electron ou Node.js
const { ipcRenderer } = require('electron'); // INTERDIT
const fs = require('fs');                    // INTERDIT
```

### 2. Actions critiques via Tauri invoke() Rust

```typescript
// ✅ Actions d'écriture sensibles → invoke() Rust (sécurité + performance)
const result = await invoke<CallNextResult>('call_next_ticket', {
  agencyId,
  counterId,
  counterName,
});

// Acceptable pour lectures simples (GET non critique)
const queue = await queueService.getQueue(agencyId);

// ❌ Mutations critiques directement en Axios sans invoke() = INTERDIT
await axios.post('/api/v1/tickets/counter/call-next', data); // Préférer invoke()
```

### 3. Optimistic updates — l'agent ne doit JAMAIS attendre

```typescript
// ✅ UI mise à jour IMMÉDIATEMENT avant la réponse serveur
function useCallNext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CallNextDto) => invoke('call_next_ticket', data),

    // 1. Mise à jour optimiste IMMÉDIATE (avant réponse serveur)
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['queue'] });
      const previous = queryClient.getQueryData(['queue']);
      queryClient.setQueryData(['queue'], removeFirstTicket);
      return { previous };
    },

    // 2. Si erreur → revenir en arrière + toast
    onError: (err, data, context) => {
      queryClient.setQueryData(['queue'], context?.previous);
      toast.error(t('errors.callNextFailed'));
    },

    // 3. Succès → son + invalidation cache
    onSuccess: () => {
      playCallSound();
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

// ❌ Attendre réponse serveur avant mise à jour UI = INTERDIT
// L'agent clique → 500ms d'attente = inacceptable
```

### 4. TypeScript strict — jamais de `any`

```typescript
// ✅ Types explicites pour tout
interface QueueUpdate {
  type: 'TICKET_CALLED' | 'QUEUE_UPDATE' | 'TICKET_ABSENT'
      | 'TICKET_TRANSFERRED' | 'GUICHET_STATUS' | 'BROADCAST_MESSAGE';
  ticketId: string;
  ticketNumber: string;
  position?: number;
  etaMinutes?: number;
  counterName?: string;
  orgId: string;
  agencyId: string;
}

// ❌ JAMAIS any
const handleWsMessage = (data: any) => { ... }; // INTERDIT
```

### 5. WebSocket — reconnexion avec backoff exponentiel

```typescript
// ✅ Reconnexion automatique + indicateur visuel obligatoire
class CounterWebSocketService {
  private retryDelay = 1000;
  private maxRetryDelay = 30_000;

  connect(counterId: string) {
    this.ws = new WebSocket(`${WS_URL}/ws/counter/${counterId}`);

    this.ws.onopen = () => {
      this.retryDelay = 1000; // Reset
      useAppStore.getState().setConnectionStatus('connected');
    };

    this.ws.onclose = () => {
      useAppStore.getState().setConnectionStatus('reconnecting');
      setTimeout(() => {
        this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
        this.connect(counterId);
      }, this.retryDelay);
    };
  }
}

// ❌ WebSocket sans reconnexion automatique = INTERDIT
```

### 6. Raccourcis clavier — obligatoires pour les actions principales

```typescript
// ✅ Raccourcis globaux via Tauri (fonctionnent même si fenêtre pas au premier plan)
import { register } from '@tauri-apps/plugin-global-shortcut';

await register('Space', () => callNextMutation.mutate(counterData));
await register('KeyA',  () => markAbsentMutation.mutate(currentTicket));
await register('KeyT',  () => setTransferModalOpen(true));
await register('KeyP',  () => togglePauseMutation.mutate());

// ✅ Raccourcis locaux dans l'UI (fallback)
useEffect(() => {
  const handle = (e: KeyboardEvent) => {
    if (e.key === ' ' && !e.repeat) callNext();
    if (e.key === 'a' || e.key === 'A') markAbsent();
    if (e.key === 't' || e.key === 'T') openTransfer();
    if (e.key === 'p' || e.key === 'P') togglePause();
  };
  window.addEventListener('keydown', handle);
  return () => window.removeEventListener('keydown', handle);
}, []);
```

### 7. Son et notifications — feedback sensoriel obligatoire

```typescript
// ✅ Son à chaque appel de ticket (obligatoire)
export async function playCallSound(): Promise<void> {
  const audio = new Audio('/sounds/tonde-call.mp3');
  audio.volume = 0.8;
  await audio.play().catch(console.error);
}

// ✅ Notification desktop si fenêtre en arrière-plan
import { sendNotification } from '@tauri-apps/plugin-notification';

async function notifyNewTicket(ticket: Ticket): Promise<void> {
  await sendNotification({
    title: 'TONDE — Ticket en attente',
    body: `Ticket ${ticket.number} — ${ticket.serviceName}`,
  });
}

// ❌ Action sans feedback sonore = INTERDIT (agent peut rater un appel)
```

### 8. Palette Dark Fintech — même règles que le web

```tsx
// ✅ Toujours utiliser la palette officielle
<button className="bg-violet hover:bg-violet/90 text-white px-6 py-3 rounded-card">
  Appeler suivant
</button>

<span className="text-rose font-semibold">Absent</span>
<span className="text-emerald font-semibold">En cours</span>
<span className="text-cyan font-semibold">Transféré</span>

// ❌ Couleurs arbitraires hors palette = INTERDIT
<button className="bg-blue-500"> // INTERDIT
```

### 9. Affichage dégradé si coupure réseau

```tsx
// ✅ Toujours afficher le dernier état connu + badge rouge
function QueueDisplay() {
  const { connectionStatus } = useAppStore();
  const { data: queue } = useQueue(agencyId);

  return (
    <div className="bg-midnight min-h-screen">
      {connectionStatus !== 'connected' && (
        <div className="bg-rose/20 border border-rose text-rose px-4 py-2 text-sm">
          {connectionStatus === 'reconnecting'
            ? t('status.reconnecting')
            : t('status.offline')}
        </div>
      )}
      <QueueTable tickets={queue?.tickets ?? []} />
    </div>
  );
}
```

### 10. Internationalisation — jamais de texte en dur

```typescript
// ✅ Toujours i18next
const { t } = useTranslation();
<button>{t('actions.callNext')}</button>
<p>{t('queue.waiting', { count: queue.length })}</p>

// ❌ Texte en dur = INTERDIT
<button>Appeler suivant</button> // INTERDIT
```

---

## MACHINE À ÉTATS TICKETS — VUE GUICHETIER

```
WAITING     → Visible dans la file, prêt à appeler
              Actions disponibles : Appeler (ESPACE)

CALLED      → Timeout 3 min affiché en décompte
              Actions : Commencer service, Marquer absent (A), Transférer (T)

SERVING     → Service en cours
              Actions : Terminer (DONE), Transférer (T), Incomplet

DONE        → Terminé, archivé, ticket sorti de la file

ABSENT      → Client non-présent, badge rose
              Actions : Remettre en file WAITING

TRANSFERRED → Envoyé vers autre guichet, badge cyan
```

**Toute transition non listée est INTERDITE.**
Utiliser `ticket-state-machine.ts` pour valider les transitions côté client.

---

## WEBSOCKET — ÉVÉNEMENTS REÇUS PAR LE DESKTOP

```typescript
// Le desktop écoute le canal counter (ws/counter/{counterId})
// et le canal agence (ws/agency/{agencyId})

TICKET_CALLED       // Confirmation : ticket appelé avec succès
QUEUE_UPDATE        // Nouvelle position/ETA dans la file
TICKET_ABSENT       // Timeout dépassé → badge rose
TICKET_TRANSFERRED  // Ticket reçu ou envoyé → badge cyan
GUICHET_STATUS      // Statut guichet changé
BROADCAST_MESSAGE   // Message admin → toast notification
```

---

## MULTI-TENANT — RÈGLE ABSOLUE

```typescript
// ✅ Filtrer toujours par org_id dans les événements WebSocket
ws.onmessage = (event) => {
  const data: WsEvent = JSON.parse(event.data);
  if (data.orgId !== currentUser.orgId) return; // ← OBLIGATOIRE
  if (data.agencyId !== currentUser.agencyId) return;
  handleEvent(data);
};

// ❌ Afficher des données sans vérifier l'appartenance = INTERDIT
```

---

## SÉCURITÉ — RÈGLES

### JWT desktop
```
Access Token  : Tauri secure store (chiffré OS)
Refresh Token : Tauri secure store
Renouvellement: automatique via Axios intercepteur (sur 401)
Session       : persistante entre redémarrages (remember me)
```

### RBAC desktop
```
AGENT       → Vue file, Appeler, Absent, Transférer, Pause
SUPERVISEUR → + Voir tous les guichets, stats en live
ADMIN_AGENCE → + Configuration guichets et services
```

---

## PERFORMANCE — OBJECTIFS MVP

```
Clic → action UI       < 50ms  (optimistic update)
Clic → confirmation WS < 200ms
Binaire Windows        < 10 Mo installé
Mémoire RAM            < 100 Mo
WebSocket latence P50  < 100ms
WebSocket latence P99  < 300ms
```

---

## ENVIRONNEMENTS

```
DEV     → http://localhost:8000  /  ws://localhost:8000
STAGING → https://api-staging.tonde.app
PROD    → https://api.tonde.app
```

```bash
# Lancer en développement (fenêtre Tauri native)
npm run tauri dev

# Builder pour Windows (depuis Windows)
npm run tauri build

# Lancer uniquement le frontend (sans Tauri, dans le navigateur)
npm run dev

# Tests frontend
npm run test

# Tests Rust
cd src-tauri && cargo test
```

## Cibles de build

```
Windows x64  → .msi + .exe  (priorité absolue V1)
Linux x64    → .AppImage + .deb (V1.5)
```

---

## CE QU'IL NE FAUT JAMAIS FAIRE

```
❌ APIs Electron ou Node.js natif (require, ipcRenderer...)
❌ Mutations critiques en Axios direct sans invoke() Tauri
❌ Attendre réponse serveur avant mise à jour UI (pas d'optimistic)
❌ TypeScript any
❌ WebSocket sans reconnexion automatique (backoff exponentiel)
❌ Action sans feedback sonore/visuel à l'agent
❌ Texte en dur sans i18next
❌ Couleurs hors palette Dark Fintech Minimal
❌ Interface claire (light mode) = INTERDIT
❌ Composant > 200 lignes sans décomposition
❌ Transition ticket non autorisée par ticket-state-machine.ts
❌ Données WS sans filtre org_id + agency_id
❌ Refonte massive sans validation de Vital
```

---

## WORKFLOW AVANT TOUTE MODIFICATION

```
1. Lire les composants et commands Rust concernés
2. Vérifier la cohérence avec le contrat API (tonde-docs/api-contract.md)
3. Identifier l'impact sur le WebSocket et les optimistic updates
4. Vérifier que le changement respecte la palette Dark Fintech Minimal
5. Vérifier les transitions de la machine à états tickets
6. Proposer un plan à Vital si changement majeur
7. Tester sur Windows (plateforme cible prioritaire)
8. Implémenter progressivement avec tests
```

**Ne jamais faire de refonte massive sans validation explicite de Vital.**

---

## LANCER LE PROJET EN LOCAL

```bash
# Installer les dépendances Node
npm install

# Lancer en développement Tauri (fenêtre native)
npm run tauri dev

# Lancer uniquement le frontend React (navigateur)
npm run dev

# Lancer les tests frontend
npm run test

# Lancer les tests Rust
cd src-tauri && cargo test

# Formatter le code TypeScript
npm run format

# Linter
npm run lint

# Builder pour Windows
npm run tauri build
```

---

## CONTEXTE BUSINESS

```
Fondateur    : Vital (Tech Lead & Architecte)
Produit      : SaaS B2B Queue Management — Desktop Guichetier
Marché V1    : Burundi (Bujumbura) — Windows 10/11 dominant
Marché V1.5  : RDC (Goma, Bukavu)
Secteurs V1  : Banques + Hôpitaux
Monnaie      : BIF (Franc Burundais)
Langues V1   : Français · Kirundi · Anglais
GitHub org   : tonde-app
Repo         : tonde-app/tonde-desktop
Backend DEV  : http://localhost:8000
Backend PROD : https://api.tonde.app
Plateforme   : Windows 10/11 x64 (priorité), Linux x64 (V1.5)
Rôles        : agent · supervisor · admin_agency
```

---

*TONDE Desktop — SKILL.md*
*Version 1.0 — Mai 2026*
