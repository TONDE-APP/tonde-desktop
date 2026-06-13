# TONDE — Stack Technique · Desktop Guichetier (Tauri + React)

## Stack principale

| Composant | Choix | Version |
|-----------|-------|---------|
| Framework desktop | Tauri | 2.x |
| Backend natif | Rust | 1.78+ |
| Frontend | React | 18.x |
| Langage frontend | TypeScript | 5.x |
| Build tool | Vite | 5.x |
| Styles | TailwindCSS | 3.x |
| State | Zustand | 4.x |
| Data fetching | TanStack Query | 5.x |
| Client HTTP | Axios (via Tauri fetch) | 1.x |
| WebSocket | native WebSocket API | — |
| Formulaires | React Hook Form + Zod | — |
| Icons | Lucide React | — |
| Notifications desktop | Tauri notification plugin | — |
| Raccourcis clavier | Tauri global shortcut plugin | — |
| Son | Tauri shell / Web Audio API | — |
| Tests frontend | Vitest + Testing Library | — |
| Tests Rust | cargo test | — |

## Pourquoi Tauri et pas Electron

```
Tauri   → binaire < 10 Mo, mémoire < 50 Mo, Rust natif sécurisé
Electron → binaire > 150 Mo, mémoire > 200 Mo, Node.js
```

Sur les machines Windows d'entrée de gamme des banques burundaises,
Tauri est le seul choix acceptable.

## Architecture Tauri

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + TypeScript)                       │
│  Affichage, interactions UI                          │
│  Communication avec le backend via Tauri Commands    │
└──────────────────┬──────────────────────────────────┘
                   │ invoke() / listen()
┌──────────────────▼──────────────────────────────────┐
│  Backend Rust (src-tauri/)                           │
│  Commands : appels API sécurisés, gestion fichiers   │
│  Events : communication bidirectionnelle avec le UI  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP + WebSocket
┌──────────────────▼──────────────────────────────────┐
│  TONDE Backend FastAPI                               │
│  api.tonde.app                                       │
└─────────────────────────────────────────────────────┘
```

## Communication Tauri — Frontend → Backend Rust

```typescript
// ✅ Appel Tauri Command depuis React
import { invoke } from '@tauri-apps/api/core';

// Appeler le prochain ticket
const result = await invoke<CallNextResult>('call_next_ticket', {
  agencyId: selectedAgencyId,
  counterId: myCounterId,
  counterName: myCounterName,
});

// ✅ Écouter un événement Rust → Frontend
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<QueueUpdate>('queue_update', (event) => {
  // Mise à jour de l'affichage
});
```

## WebSocket — connexion directe depuis le frontend

```typescript
// Le desktop se connecte au WebSocket counter pour recevoir les events
const ws = new WebSocket(
  `${WS_BASE_URL}/api/v1/tickets/ws/counter/${counterId}?token=${accessToken}`
);

// Événements reçus :
// - TICKET_CALLED : confirmation qu'un ticket a été appelé
// - QUEUE_UPDATE : nouvelle position dans la file
// - BROADCAST_MESSAGE : message de l'admin
```

## Authentification desktop

- JWT Access Token stocké localement (Tauri secure store)
- Refresh automatique en arrière-plan
- Rôles autorisés : `agent`, `supervisor`, `admin_agency`
- Session persistante entre redémarrages (remember me)

## Environnements

```
DEV     → http://localhost:8000  /  ws://localhost:8000
STAGING → https://api-staging.tonde.app
PROD    → https://api.tonde.app
```

## Raccourcis clavier (MVP)

| Raccourci | Action |
|-----------|--------|
| `Espace` | Appeler le prochain ticket |
| `A` | Marquer absent |
| `T` | Transférer ticket |
| `P` | Mettre en pause / reprendre |
| `Ctrl+L` | Se déconnecter |

## Commandes courantes

```bash
# Installer les dépendances
npm install

# Lancer en développement (fenêtre native Tauri)
npm run tauri dev

# Builder pour Windows (depuis Windows ou cross-compilation)
npm run tauri build

# Lancer uniquement le frontend web (sans Tauri)
npm run dev

# Tests frontend
npm run test

# Tests Rust
cd src-tauri && cargo test
```

## Cibles de build

```
Windows x64  → .msi + .exe (priorité absolue)
Linux x64    → .AppImage + .deb (V1.5)
macOS        → .dmg (si besoin futur)
```
