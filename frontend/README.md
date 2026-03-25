# Frontend Angular - Gestion de Stock

Interface utilisateur Angular complète pour le système de gestion de stock et approvisionnement.

## Prérequis

- Node.js 18+ et npm
- Angular CLI 17+
- Backend Spring Boot démarré et accessible sur `http://localhost:8080`

## Installation

```bash
cd frontend
npm install
```

## Démarrage

```bash
ng serve
```

L'application sera accessible sur `http://localhost:4200`

## Authentification

- **Admin**: username: `admin`, password: `admin`
- **User**: username: `user`, password: `user`

## Structure

- `/src/app/models/` - Modèles TypeScript
- `/src/app/services/` - Services pour les appels API
- `/src/app/components/` - Composants (produits, fournisseurs, commandes, stocks, notifications)
- `/src/app/pages/` - Pages principales (dashboard, login)
- `/src/app/shared/` - Composants partagés (navbar, sidebar, footer)
- `/src/app/auth/` - Guards d'authentification

## Fonctionnalités

- Dashboard avec statistiques
- CRUD Produits
- CRUD Fournisseurs
- CRUD Commandes
- CRUD Stocks
- Notifications en temps réel (Kafka)
- Authentification et gestion des rôles
- Interface Material Design

## Technologies

- Angular 17
- Angular Material
- RxJS
- TypeScript
