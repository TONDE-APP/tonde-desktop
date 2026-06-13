# TONDE — Structure du Projet · Desktop Guichetier (Tauri + React)

## Arborescence complète

```
tonde-desktop/
├── src/                               # Frontend React + TypeScript
│   ├── main.tsx                       # Point d'entrée React
│   ├── App.tsx                        # Routes + Providers
│   │
│   ├── config/
│   │   ├── api.ts                     # URLs API par environnement
│   │   └── shortcuts.ts               # Définition raccourcis clavier
│   │
│   ├── lib/
│   │   ├── axios.ts                   # Axios + intercepteurs JWT
│   │   ├── websocket.ts               # CounterWebSocketService + reconnexion
│   │   └── query-client.ts            # TanStack Query configuré
│   │
│   ├── store/
│   │   ├── app.store.ts               # Zustand : état global UI
│   │   │                              # (connectionStatus, selectedCounter...)
│   │   └── auth.store.ts              # Zustand : agent connecté + rôle
│   │
│   ├── services/                      # Couche API
│   │   ├── auth.service.ts            # login, logout, refresh token
│   │   ├── queue.service.ts           # getQueue, callNext, markAbsent
│   │   ├── tickets.service.ts         # getTicket, transfer, done
│   │   └── counter.service.ts         # openCounter, closeCounter, pause
│   │
│   ├── hooks/
│   │   ├── useQueue.ts                # TanStack Query : file temps réel
│   │   ├── useCallNext.ts             # Mutation optimiste : appeler suivant
│   │   ├── useMarkAbsent.ts           # Mutation : marquer absent
│   │   ├── useTransfer.ts             # Mutation : transférer ticket
│   │   └── useNetworkStatus.ts        # Détection online/offline
│   │
│   ├── types/
│   │   ├── ticket.types.ts            # Ticket, TicketStatus, transitions
│   │   ├── counter.types.ts           # Counter, CounterStatus
│   │   └── websocket.types.ts         # QueueUpdate, WsEvent types
│   │
│   ├── utils/
│   │   ├── sound.ts                   # playCallSound(), playAlertSound()
│   │   ├── formatters.ts              # dates, durées
│   │   └── ticket-state-machine.ts    # Transitions autorisées
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AgentLayout.tsx        # Layout principal de l'app
│   │   │   ├── ConnectionStatusBar.tsx # Barre état connexion (online/offline/reconnecting)
│   │   │   └── CounterHeader.tsx      # En-tête guichet (nom, statut, stats jour)
│   │   ├── queue/
│   │   │   ├── QueueDisplay.tsx       # File d'attente temps réel
│   │   │   ├── CurrentTicketCard.tsx  # Ticket en cours de service
│   │   │   ├── NextTicketPreview.tsx  # Prochain ticket (preview)
│   │   │   └── QueueStats.tsx         # Compteurs : en attente, traités, absents
│   │   ├── actions/
│   │   │   ├── CallNextButton.tsx     # Bouton principal — ESPACE
│   │   │   ├── MarkAbsentButton.tsx   # Marquer absent — A
│   │   │   ├── TransferModal.tsx      # Modal transfert vers autre guichet
│   │   │   └── PauseButton.tsx        # Pause / Reprendre guichet
│   │   └── shortcuts/
│   │       └── ShortcutsHelp.tsx      # Overlay aide raccourcis clavier
│   │
│   └── pages/
│       ├── LoginPage.tsx              # Connexion agent
│       ├── CounterSelectPage.tsx      # Choix du guichet à ouvrir
│       ├── AgentDashboard.tsx         # Vue principale guichetier
│       └── StatsPage.tsx             # Statistiques de la journée
│
├── src-tauri/                         # Backend Rust Tauri
│   ├── src/
│   │   ├── main.rs                    # Point d'entrée Tauri
│   │   ├── lib.rs                     # Configuration app + commands
│   │   └── commands/
│   │       ├── auth.rs                # Tauri Command : login sécurisé
│   │       ├── queue.rs               # Tauri Command : call_next_ticket, mark_absent
│   │       └── storage.rs             # Tauri Command : secure token storage
│   ├── Cargo.toml                     # Dépendances Rust
│   └── tauri.conf.json                # Configuration Tauri (permissions, bundle)
│
├── public/
│   └── sounds/
│       ├── tonde-call.mp3             # Son d'appel ticket
│       └── tonde-alert.mp3            # Son d'alerte absent
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Pattern en couches (obligatoire)

```
UI Component → Hook (TanStack Query/Mutation) → Service → Axios → API Backend
                                                     ↓
                                            Tauri invoke() (actions critiques)
                                                     ↓
                                          Rust Command → API Backend
```

## Commandes Tauri (src-tauri/src/commands/)

| Command | Description |
|---------|-------------|
| `call_next_ticket` | Appelle le prochain ticket en file |
| `mark_absent` | Marque un ticket comme absent |
| `transfer_ticket` | Transfère vers un autre guichet |
| `open_counter` | Ouvre un guichet |
| `close_counter` | Ferme un guichet |
| `secure_get_token` | Récupère le JWT depuis le stockage sécurisé |
| `secure_set_token` | Sauvegarde le JWT dans le stockage sécurisé |

## États de connexion WebSocket

```typescript
type ConnectionStatus =
  | 'connected'       // ← Vert : tout fonctionne
  | 'reconnecting'    // ← Orange : en cours de reconnexion
  | 'offline';        // ← Rouge : pas de connexion, dernier état affiché
```

## Modules à créer (MVP restant)

Suivre le pattern `service → hook → composant → page` :

- `src/components/actions/MarkDoneButton.tsx`
- `src/components/actions/IncompleteButton.tsx`
- `src/pages/StatsPage.tsx`
- `src-tauri/src/commands/notifications.rs`
- Support multi-écrans (TV display sur second écran)
