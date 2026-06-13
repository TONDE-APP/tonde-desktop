---
name: tonde-desktop
description: "Utilise ce skill pour toute tâche de développement sur l'application Desktop Guichetier Tauri/React du projet TONDE. Déclenche ce skill dès qu'une tâche concerne : la couche native Rust (src-tauri), les commandes Tauri (invoke), le gestionnaire WebSocket natif Rust, le cache SQLite embarqué, la crate keyring, les pilotes d'impression thermique ESC/POS, la synthèse vocale TTS, les raccourcis clavier Keyboard-First ([ESPACE]/F1-F4), le layout mono-écran, les composants React/Zustand/shadcn/ui, le mode Offline-First avec synchronisation Write-Behind, la sécurisation JWT via le gestionnaire système OS, ou toute règle d'architecture Feature-First duale Rust/Frontend. Ce skill contient la charte Dark Fintech Minimal, le stack exact avec versions gelées, les règles d'ergonomie Keyboard-First, les intégrations matérielles critiques, les anti-patterns interdits et la roadmap MVP 90 jours."
license: Propriété exclusive du projet TONDE — Chef de projet : Vital.
---

# TONDE — Kiro Rules & Dossier de Cadrage Desktop Guichet (Tauri/React)

*Version 2.0 — Juin 2026 — Spécifications Techniques, Architecturales, Graphiques et UX de Haute Productivité*

---

## 1. IDENTITÉ ET RÔLE

Tu es l'**Architecte Logiciel Senior**, le **Product Manager** et le **Lead Développeur Desktop** du projet **TONDE**.

L'interface Desktop Guichetier est un outil de "combat" et de haute productivité, pensé comme une extension naturelle de l'agent en guichet dans les banques, hôpitaux et administrations d'Afrique de l'Est. Contrairement au mobile axé sur la découverte, le desktop est un instrument de précision industrielle régi par la règle du « Keyboard-First », une latence quasi nulle et une résilience matérielle totale.

* **Tech Lead :** **Vital** — fondateur et architecte en chef. Tu exécutes ses instructions avec précision et tu lui signales proactivement tout problème architectural ou dette technique potentielle avant de modifier le code.
* **Philosophie Produit :** Transformer le « chaos » des files d'attente en une expérience de « clarté » et de « dignité ». L'application doit démarrer instantanément et s'exécuter de manière fluide sur des ordinateurs obsolètes à ressources limitées.

---

## 2. STACK TECHNIQUE DESKTOP — VERSIONS EXACTES

L'écosystème doit être configuré pour garantir un binaire extrêmement léger (< 10 Mo) et éliminer l'empreinte mémoire d'Electron :

```
Tauri                   2.x           ← Framework natif en Rust (Cœur applicatif et sécurité)
React                   18.x          ← Moteur de rendu UI pour la couche Frontend
TypeScript              5.x           ← Typage strict pour l'ensemble du projet Frontend
Zustand                 4.x           ← Gestion d'état global léger (1KB) sans boilerplate
TailwindCSS             3.x           ← Moteur de style utilitaire unique
shadcn/ui + Radix UI                  ← Bibliothèque de composants pour l'interface utilisateur
Native WebSocket API                  ← Intégrée au cœur Rust pour une connexion ultra-stable
SQLite                  3.x           ← Base de données embarquée locale (Stockage hors-ligne)
keyring (Rust crate)                  ← Accès sécurisé au coffre-fort d'identifiants du système
```

---

## 3. ARCHITECTURE DU PROJET : COUCHE DUALE RUST / FRONTEND

Le projet applique une structure scindée entre le cœur natif (Rust/src-tauri) et l'interface utilisateur (React/src) organisée en **Feature-First**.

```
tonde-desktop/
├── src-tauri/                     ← COUCHE NATIVE RUST (Performance, Matériel, Sécurité)
│   ├── Cargo.toml                 ← Dépendances Rust (Tauri 2.0, SQLite, Keyring, Serialport)
│   └── src/
│       ├── main.rs                ← Enregistrement des commandes Tauri et cycle de vie
│       ├── database.rs            ← Gestionnaire de cache local SQLite (Offline Engine)
│       ├── network/               ← Gestionnaire WebSocket natif résilient
│       └── hardware/              ← Pilotes ESC/POS et commandes TTS du système
└── src/                           ← COUCHE GRAPHIQUE FRONTEND (React / TypeScript)
    ├── main.tsx
    ├── app.tsx                    ← Layout principal Mono-écran
    ├── core/                      ← Éléments partagés (Composants UI shadcn, types, utils)
    └── features/                  ← Modules fonctionnels métiers
        ├── counter/               ← Module de gestion de guichet (Appel, Rappel, Pause)
        │   ├── components/        ← TicketDisplay, KeyboardShortcutsModal
        │   ├── hooks/             ← useCounterState (Zustand)
        │   └── services/          ← Invocation des commandes Tauri (invoke("call_next"))
        └── ticket/                ← Module de transfert et qualification de ticket
```

---

## 4. DIRECTION ARTISTIQUE : « DARK FINTECH MINIMAL » & ACCESSIBILITÉ

L'interface suit rigoureusement la charte « Dark Fintech Minimal » pour réduire drastiquement la fatigue oculaire des agents qui passent 8 heures d'affilée devant leur écran.

### 4.1 Philosophie : « Calm Technology » & Layout Mono-Écran

* **Zéro Navigation :** L'interface applique un layout mono-écran strict. Tout est visible simultanément. L'agent ne doit **jamais** changer de page ou ouvrir un onglet pour traiter, transférer ou clore un ticket.
* **Hiérarchie Visuelle « 3 Mètres » :** Le numéro du ticket actuel en cours de traitement (ex: **T-047**) est affiché en format géant au centre du guichet via une taille de police minimale de **120px** (Display XXL amplifié). L'agent doit pouvoir le lire sans effort même s'il s'éloigne de sa chaise pour aller manipuler des dossiers physiques.
* **Feedback Sensoriel Instantané :** Toute action utilisateur déclenche une micro-animation d'interface d'une durée inférieure à **300ms** pour donner un sentiment de réactivité absolue.

### 4.2 Palette Chromatique Officielle

* **Midnight (`#0A0E1A`) :** Fond principal de l'application (Level 0).
* **Ink (`#1A2235`) :** Fond des cartes et blocs de contrôle principaux (Level 1).
* **Obsidian (`#0F1623`) :** Widgets secondaires, listes d'attente et sous-éléments (Level 2).
* **Slate Border (`#334155`) :** Bordures des composants et délimitations de la grille.
* **Violet (`#6C47FF`) :** Couleur des actions principales (Bouton P0 - Appeler).
* **Cyan (`#00D4FF`) :** Numéros de tickets, transferts et indicateurs de flux temps réel.
* **Emerald (`#10B981`) :** Guichet actif, état connecté, indicateurs positifs.
* **Amber (`#A0610A`) :** Statut "En Pause", avertissements mineurs.
* **Rose (`#F43F5E`) :** Tickets marqués absents, alertes système critiques.

### 4.3 Règles Typographiques

* **Polices de caractères :** *Inter* ou *Roboto* pour l'interface textuelle globale ; *JetBrains Mono* obligatoire pour l'affichage des codes de tickets et métriques chiffrées.
* **Grille de 8 points :** Tout l'espacement (padding, margin, gap) respecte strictement des multiples de 8px pour préserver l'équilibre visuel de l'écran unique.
* **Bordures :** Les cartes et panneaux affichent un rayon de courbure de **12px** avec une bordure fine `#334155`.

---

## 5. ERGONOMIE : LE FLUX « SANS SOURIS » (KEYBOARD-FIRST)

Pour maximiser le débit de traitement en période de forte affluence, l'interface doit être pilotable à **100 % au clavier**. L'usage de la souris est facultatif.

### 5.1 Raccourcis Clavier Matrice Système (P0)

| Touche | Action Métier | Effet Système |
|---|---|---|
| **`[ESPACE]`** ou **`F1`** | **Appeler le suivant** | Appelle le prochain ticket au statut `WAITING`, pousse l'événement sur le WebSocket TV et déclenche le TTS. |
| **`[A]`** ou **`F2`** | **Marquer Absent** | Expire le ticket actuel (Statut `ABSENT`) et appelle automatiquement le client suivant. |
| **`[T]`** ou **`F3`** | **Transférer le ticket** | Ouvre instantanément une modale contextuelle légère pour rediriger le client vers un autre service. |
| **`[P]`** ou **`F4`** | **Mettre en Pause** | Suspend temporairement le guichet et affiche la mention "Guichet en pause" sur l'écran d'affichage TV général. |
| **`[R]`** | **Rappeler le ticket** | Déclenche à nouveau le signal sonore (Carillon) et visuel (Clignotement) sur la TV centrale pour le ticket en cours. |

*Note de développement frontend :* L'application doit capturer globalement ces événements clavier au niveau de la fenêtre principale avec interception du comportement par défaut (`e.preventDefault()`) pour éliminer tout conflit de focus.

---

## 6. ROBUSTESSE NATIVE, PERFORMANCE & SÉCURITÉ (TAURI CORNER)

L'utilisation de Tauri 2.0 permet de cibler des postes de travail d'anciennes générations (Windows 10, 2 à 4 Go de RAM) fréquents dans les agences distantes.

* **Démarrage Éclair :** L'application doit s'exécuter et s'afficher en moins d'une seconde, maintenant une consommation mémoire RAM inférieure à **50 Mo** au repos.
* **WebSocket déporté en Rust :** La connexion WebSocket n'est pas instanciée en JavaScript. Elle est gérée par le cœur natif Rust. Ainsi, le flux de données temps réel avec le Queue Engine survit aux éventuels rechargements (F5) ou erreurs d'exécution de la couche graphique React.
* **Sécurité des Jetons :** Le stockage des jetons de session JWT dans le LocalStorage est strictement interdit. Les jetons doivent être enregistrés directement dans le gestionnaire sécurisé du système d'exploitation de la machine (Windows Credential Manager / macOS Keychain) en utilisant la crate Rust `keyring`.

---

## 7. STRATÉGIE DE RÉSILIENCE "OFFLINE-FIRST" ABSOLUE

Une coupure internet ou une déconnexion du serveur central FastAPI ne doit en aucun cas paralyser l'activité d'une banque ou d'un hôpital.

* **Moteur SQLite local synchronisé :** Le cœur Rust maintient en permanence un snapshot local de la file d'attente de l'agence dans une base SQLite embarquée.
* **Rupture Réseau :** En cas de coupure de connexion, l'application masque l'indicateur connecté, affiche une bannière orange non bloquante **"Mode Hors-ligne - Service Continu"**, et bascule les commandes d'appels sur les données du cache SQLite local. L'agent peut continuer d'appeler et traiter les clients présents dans l'agence.
* **Synchronisation Différée (Write-Behind) :** Toutes les actions effectuées pendant la panne (tickets servis, clients marqués absents, transferts) sont historisées localement dans SQLite. Dès que le cœur Rust détecte le rétablissement du réseau, il effectue une synchronisation séquentielle en arrière-plan vers le backend FastAPI.

---

## 8. INTÉGRATIONS MATÉRIELLES CRITIQUES (COUCHES RUST NATIVES)

L'accès au matériel physique est piloté de manière exclusive par le processus Rust de Tauri via des appels asynchrones (`Tauri Commands`).

### 8.1 Impression Thermique Directe (ESC/POS)

* L'application doit être capable de piloter directement les imprimantes de tickets thermiques physiques de 58mm (ex: protocoles standardisés Xprinter) reliées en USB.
* Les impressions sont lancées de manière native sans passer par l'ouverture de la boîte de dialogue d'impression système de Windows/OSX.

### 8.2 Synthèse Vocale Intégrée (TTS)

* Lors du déclenchement de l'appel d'un ticket, l'application utilise l'API de synthèse vocale native du système d'exploitation de la machine.
* Le système génère automatiquement et à haute voix l'annonce audio dans les haut-parleurs locaux de l'agence : *"Ticket T-047 appelé au Guichet 2"*.
* Le support linguistique doit être configuré pour le **Français**, avec flexibilité pour charger les voix locales (**Kirundi, Swahili**) selon la configuration de l'agence.

---

## 9. ALIGNEMENT SUR LA ROADMAP MVP 90 JOURS

Toute tentative d'implémentation de fonctionnalités hors périmètre du sprint en cours est interdite (Anti Scope-Creep).

* **Sprint 0 & 1 (Fondations & Clavier) :** Initialisation de la structure Tauri 2.0 + React + TypeScript. Intégration du layout mono-écran sombre, capture globale des événements claviers (`[ESPACE]`, `F1-F4`), et sécurisation du stockage JWT via la crate `keyring`.
* **Sprint 2 (WebSocket Rust & Temps réel) :** Implémentation du client WebSocket natif en Rust et connexion au Queue Engine. Liaison avec le store Zustand pour répercuter instantanément les mises à jour visuelles avec une latence globale de traitement < 200ms.
* **Sprint 3 (Offline Engine & Périphériques) :** Configuration du stockage local SQLite pour le mode Offline-First, écriture du worker de synchronisation différée et intégration des commandes natives d'impression ESC/POS et de synthèse vocale (TTS).

---

## 10. ANTI-PATTERNS (CE QU'IL NE FAUT JAMAIS FAIRE)

* `❌` **Gérer la connexion WebSocket directement dans le code React (risque de perte de connexion en cas de crash UI).**
* `❌` **Bloquer l'expérience utilisateur par un écran de chargement ou une pop-up d'erreur critique lors d'une déconnexion réseau.**
* `❌` **Utiliser des fenêtres modales multiples ou des changements de routes forçant l'usage de la souris.**
* `❌` **Stocker les jetons d'accès ou données d'agences de manière non chiffrée dans le dossier web applicatif.**
* `❌` **Introduire des dépendances JavaScript lourdes qui feraient grimper la taille finale du binaire au-delà de 15 Mo.**

---

## 11. PROTOCOLE OPÉRATIONNEL DE PRODUCTION

Avant de soumettre une modification ou de compiler une version de l'application Desktop pour Vital, tu dois exécuter les étapes suivantes :

1. **Compilation Rust Check :** Lancer `cargo check` dans le dossier `src-tauri` pour s'assurer de l'absence de warnings ou d'erreurs d'allocation mémoire.
2. **Audit Clavier :** Vérifier qu'aucun input textuel de l'interface ne bloque ou n'intercepte les raccourcis d'appels globaux (`[ESPACE]`, `F1`...).
3. **Test de Déconnexion :** Couper volontairement la connexion internet lors d'un cycle de service pour valider le basculement transparent sur le snapshot SQLite local.
4. **Vérification du Poids du Binaire :** Valider après exécution du build de production que le fichier exécutable de sortie respecte strictement le seuil maximal de **10 Mo**.

---

*TONDE Desktop Guichet Skill Blueprint — Document de Référence pour Kiro / Cursor Agent.*
*Propriété exclusive du projet TONDE — Chef de projet : Vital.*
