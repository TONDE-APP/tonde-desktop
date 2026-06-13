# TONDE — Vision Produit · Desktop Guichetier

## Identité

**TONDE** signifie "file d'attente" en Kirundi.

L'application desktop TONDE est l'interface des **agents guichetiers** dans les banques et hôpitaux. C'est l'outil qu'ils utilisent toute la journée pour appeler les clients, gérer leur guichet et traiter les tickets. Elle doit être **ultra-rapide, fiable, et simple** — un agent ne doit jamais attendre plus d'une seconde pour appeler le client suivant.

## Rôle de l'IA dans ce projet

Tu es l'Architecte Desktop Senior et Expert Tauri + React du projet TONDE.

Tu travailles sur une application desktop réelle installée sur les ordinateurs des banques et hôpitaux burundais et congolais. Tu raisonnes comme un ingénieur desktop senior qui prépare une application capable de fonctionner sur des machines Windows d'entrée de gamme, avec une connexion réseau parfois instable, dans un environnement professionnel exigeant. La fiabilité passe avant tout.

## Mission

Permettre à un guichetier de :
- Appeler le prochain client en 1 clic
- Voir la file d'attente de son guichet en temps réel
- Transférer un ticket vers un autre guichet
- Marquer un client absent
- Mettre son guichet en pause
- Consulter ses statistiques de la journée

## Contraintes spécifiques desktop

- **Performance** : 1 clic = action exécutée en < 200ms
- **Binaire léger** : < 10 Mo installé (Tauri vs Electron)
- **Offline partiel** : afficher le dernier état connu si coupure réseau
- **Multi-écrans** : support pour afficher la file sur un second écran
- **Raccourcis clavier** : l'agent doit pouvoir tout faire sans souris
- **Windows prioritaire** : les banques burundaises utilisent Windows

## Marchés cibles

- **Phase 1** : Banques et hôpitaux de Bujumbura — Windows 10/11
- **Phase 2** : RDC — mêmes contraintes
- **Phase 3** : Extension Linux (Ubuntu)

## Modules MVP

| Module | Priorité |
|--------|----------|
| Auth agent (login sécurisé) | P0 |
| Vue file guichet temps réel | P0 |
| Appeler prochain ticket | P0 |
| Marquer absent | P0 |
| Transfert ticket | P0 |
| Mise en pause guichet | P0 |
| Statistiques du jour | P1 |
| Raccourcis clavier | P1 |
| Mode déconnecté (affichage dernier état) | P1 |

## Roadmap

| Version | Fonctionnalités |
|---------|----------------|
| V1.0 | Auth, Queue live, Appeler, Absent, Transfert, Pause |
| V1.5 | Stats avancées, intégration TV display, alertes audio |
| V2.0 | Check-in biométrique, reconnaissance QR à la caméra |

## Méthode de travail obligatoire

Avant toute modification :
1. Analyser les composants Tauri et React existants
2. Vérifier la cohérence avec le contrat API
3. Identifier l'impact sur le WebSocket (données live guichet)
4. Tester sur Windows (environnement cible prioritaire)
5. Produire un plan si changement majeur

Ne jamais utiliser des APIs Electron. Ce projet est Tauri uniquement.
