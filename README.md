# Projet Gestion de Stock - Backend (Microservices)

## Video de demonstration

[![Voir la demo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://github.com/Soufiane1203/projet-gestion-stock-microservices/tree/main/docs/video)

Ce dépôt contient un système de gestion de stock et approvisionnement basé sur une architecture microservices, prêt à être importé et exécuté dans IntelliJ IDEA.

## Modules
- `config-server` : Spring Cloud Config Server
- `eureka-server` : Service Discovery (Eureka)
- `api-gateway` : Spring Cloud Gateway (point d’entrée unique)
- `product-service` : CRUD Produits (Spring Web, JPA, PostgreSQL)
- `supplier-service` : CRUD Fournisseurs (Spring Web, JPA, PostgreSQL)
- `order-service` : CRUD Commandes + appels OpenFeign vers Produits/Fournisseurs avec Resilience4J
- `stock-service` : Suivi stock + Spring Batch quotidien pour alerte de stock critique (Kafka Producer)
- `notification-service` : Kafka Consumer/Producer pour notifications d’alertes

## Prérequis
- JDK 17+
- Maven 3.9+
- PostgreSQL installé et démarré (port 5432)
- Kafka installé et démarré (port 9092) - ou utiliser Docker si vous préférez

## Démarrage rapide
1. Cloner ce dépôt et ouvrir le dossier racine dans IntelliJ.
2. Construire tous les modules:
   ```bash
   mvn clean install -DskipTests
   ```
3. Démarrer PostgreSQL et Kafka localement (ou via Docker si vous préférez).
4. Démarrer les services dans l’ordre:
   1) `config-server`
   2) `eureka-server`
   3) `api-gateway`
   4) microservices métier (`product-service`, `supplier-service`, `order-service`, `stock-service`, `notification-service`)

Chaque microservice dispose d’un `application.yml` avec profils `dev` et `prod`. Ajustez les URLs, credentials DB, Kafka et Eureka si nécessaire.

## Technologies principales
- Spring Boot 3.x, Spring Web, Spring Data JPA, PostgreSQL
- Spring Cloud: Config Client/Server, Eureka Discovery, Gateway, OpenFeign
- Resilience4J (circuit breaker, retry, fallback)
- Spring Batch (job quotidien)
- Spring for Apache Kafka (Producer/Consumer)

## Tests
Chaque microservice inclut des tests unitaires simples (context load).

## Notes pédagogiques
- Les contrôleurs `controller` exposent les APIs REST et utilisent des DTOs.
- La logique métier est dans `service`.
- L’accès aux données est géré par `repository` (Spring Data JPA) et `model` (entités).
- `config` contient la configuration (Feign, Resilience4J, Kafka, Batch, etc.).
- `batch` (dans `stock-service`) contient le job Spring Batch pour vérifier les stocks critiques et publier une alerte Kafka.

## Exemples d’URLs (via Gateway)
- Produits: `http://localhost:8080/products`
- Fournisseurs: `http://localhost:8080/suppliers`
- Commandes: `http://localhost:8080/orders`
- Stock: `http://localhost:8080/stocks`
- Notifications: `http://localhost:8080/notifications/alerts`

> Ajustez les ports/hostnames selon votre environnement.

## Frontend Angular

Le projet inclut un frontend Angular complet dans le dossier `frontend/`.

### Prérequis Frontend
- Node.js 18+
- npm ou yarn
- Angular CLI 17+

### Démarrage du Frontend
```bash
cd frontend
npm install
ng serve
```

L'application sera accessible sur `http://localhost:4200`

### Authentification Frontend
- **Admin**: username: `admin`, password: `admin`
- **User**: username: `user`, password: `user`
- **Supplier (DELL)**: username: `supplier`, password: `supplier` → **Lié au fournisseur DELL (ID: 1)**

> **Note importante** : Le compte `supplier/supplier` est configuré pour représenter le fournisseur **DELL Technologies**. Ce compte ne peut voir et gérer que les commandes où `supplier_id = 1` (DELL). Les autres fournisseurs continuent d'être gérés normalement par l'admin sans compte de connexion dédié.

### Rôles & permissions (Frontend)
- **Dashboard** :
   - Admin : accès complet aux indicateurs (produits, commandes, stocks critiques) + raccourcis de gestion.
   - User : indicateurs lecture seule limités aux commandes/stocks et alertes récentes.
   - Supplier (DELL) : accès limité au dashboard avec vue uniquement sur les commandes DELL.

- **Notifications** :
   - Admin : lecture + purge des alertes Kafka directement depuis l'IHM.
   - User : lecture seule avec rafraîchissement manuel possible.
   - Supplier : pas d'accès aux notifications.

- **Stocks / Commandes** :
   - Admin : CRUD complet.
   - User : visualisation des listes + demandes d'approvisionnement (workflow de validation).
   - Supplier (DELL) : consultation des commandes DELL uniquement (`supplierId = 1`) + mise à jour du statut uniquement.

- **Produits / Fournisseurs** :
   - Admin : CRUD complet sur tous les fournisseurs (DELL, HP, etc.).
   - User / Supplier : pas d'accès.

### Fonctionnalités Frontend
- Dashboard avec statistiques globales
- CRUD complet pour Produits, Fournisseurs, Commandes, Stocks
- Notifications en temps réel (Kafka)
- Authentification et gestion des rôles (ADMIN, USER, SUPPLIER)
- Demandes d'approvisionnement (lecture user + validation admin)
- Interface dédiée pour les fournisseurs (consultation et mise à jour du statut des commandes)
- Interface Material Design moderne

---

## 🎯 Démonstration du Rôle SUPPLIER

### Initialisation des Données DELL

Pour préparer une démonstration complète avec le fournisseur DELL :

```powershell
cd scripts
.\init-demo-simple.ps1
```

**Ce script crée :**
- Fournisseur **DELL Technologies** (ID: 1)
- 5 Produits DELL (XPS 13, Monitor, Server, Keyboard, Mouse)
- Stocks associés
- 5 Commandes DELL avec différents statuts

### Workflow de Démonstration

1. **USER** (`user/user`) : Crée une demande d'approvisionnement DELL
2. **ADMIN** (`admin/admin`) : Valide la demande (status → APPROVED)
3. **SUPPLIER** (`supplier/supplier`) : Se connecte et voit uniquement les commandes DELL
4. **SUPPLIER** : Met à jour le statut (EN_COURS → EXPÉDIÉE → LIVRÉE)

📖 **Guide complet de démonstration** : Consultez `GUIDE_DEMO_SUPPLIER.md` pour un scénario détaillé.

### Vérification de la Configuration

```powershell
cd scripts
.\verify-supplier-config.ps1
```

---

## 📚 Guides de Lancement

Le projet inclut plusieurs guides détaillés pour faciliter le démarrage :

### 🎬 Guide de Démonstration
- **`GUIDE_DEMO_SUPPLIER.md`** : Scénario complet pour présenter le rôle SUPPLIER

### 🚀 Guide Rapide
- **`LANCEMENT_RAPIDE.md`** : Guide ultra-rapide pour démarrer en 5 minutes

### ✅ Checklist Complète
- **`CHECKLIST_LANCEMENT.md`** : Checklist détaillée avec toutes les vérifications

### 📖 Guide Détaillé IntelliJ
- **`GUIDE_SIMPLE_INTELLIJ.md`** : Guide pas-à-pas pour IntelliJ (débutants)
- **`GUIDE_INTELLIJ.md`** : Guide complet avec toutes les explications

### 🧪 Guide de Test
- **`GUIDE_LANCEMENT_TEST.md`** : Guide complet pour tester toutes les fonctionnalités

**Recommandation :** Commencez par `LANCEMENT_RAPIDE.md` pour un démarrage rapide !

---

## 🎯 Ordre de Lancement (Résumé)

1. **Config Server** (port 8888)
2. **Eureka Server** (port 8761) → Vérifier `http://localhost:8761`
3. **API Gateway** (port 8080)
4. **Microservices** : Product, Supplier, Order, Stock, Notification
5. **Frontend** : `cd frontend && ng serve` → `http://localhost:4200`

---

## 🔍 Vérifications Rapides

- **Eureka Dashboard** : `http://localhost:8761` → Tous les services doivent être UP
- **API Gateway** : `http://localhost:8080/products` → Doit retourner `[]`
- **Frontend** : `http://localhost:4200` → Page de login

---

## ❓ Support

Si vous rencontrez des problèmes :
1. Consultez `CHECKLIST_LANCEMENT.md` pour les vérifications
2. Consultez `GUIDE_SIMPLE_INTELLIJ.md` pour les instructions détaillées
3. Vérifiez que PostgreSQL et Kafka sont démarrés
4. Vérifiez l'ordre de lancement des services

---

## 🔄 Intégration Kafka - Alertes de Stock

### Architecture du flux Kafka

Le système utilise Apache Kafka pour la gestion asynchrone des alertes de stock critique :

```
Stock Service (Producer) 
    ↓
[Topic: stock-alerts]
    ↓
Notification Service (Consumer)
```

### Producteur : Stock Service

Le `stock-service` publie automatiquement un message Kafka lorsqu'un stock atteint son seuil critique :

**Déclenchement** :
- Lors de la création d'un stock (`POST /stocks`)
- Lors de la mise à jour d'un stock (`PUT /stocks/{id}`)
- Condition : `quantity <= criticalThreshold`

**Format du message** :
```
ALERT: productId={id}, quantity={qty}
```

**Configuration** :
- Topic : `stock-alerts`
- Broker : `localhost:9092` (configurable dans `application.yml`)
- Producer configuré dans `stock-service/config/KafkaConfig.java`

### Consommateur : Notification Service

Le `notification-service` écoute le topic `stock-alerts` et stocke les 50 dernières alertes en mémoire.

**Endpoints disponibles** :

1. **GET /notifications/alerts** - Récupérer les alertes
   - Rôle : Admin et User (lecture seule)
   - Retourne : Liste des dernières alertes de stock

2. **DELETE /notifications/alerts** - Purger les alertes
   - Rôle : Admin uniquement
   - Action : Vide la liste des alertes

**Configuration** :
- Group ID : `notification-service`
- Auto-commit : désactivé (manuel)
- Consumer configuré dans `notification-service/config/KafkaConfig.java`

### Scénario de Test End-to-End

#### Prérequis
1. Kafka démarré sur `localhost:9092`
2. Tous les services backend lancés (voir ordre ci-dessus)
3. Frontend Angular démarré sur `http://localhost:4200`

#### Test complet du workflow

**Étape 1 : Connexion Admin**
```
1. Ouvrir http://localhost:4200
2. Se connecter avec : admin / admin
3. Accéder au Dashboard
```

**Étape 2 : Créer un produit**
```
1. Menu "Produits" → "Nouveau Produit"
2. Remplir : name="Laptop Dell", category="Electronique", price=1200
3. Cliquer "Enregistrer"
4. Noter l'ID du produit créé (ex: 1)
```

**Étape 3 : Créer un stock critique**
```
1. Menu "Stocks" → "Nouveau Stock"
2. Remplir :
   - Product ID: 1
   - Quantity: 3
   - Critical Threshold: 5
3. Cliquer "Enregistrer"

→ Le stock-service publie automatiquement sur Kafka car 3 <= 5
```

**Étape 4 : Vérifier la notification Kafka**
```
1. Menu "Notifications"
2. Observer l'alerte affichée : "ALERT: productId=1, quantity=3"
3. Vérifier le timestamp de réception
```

**Étape 5 : Test des permissions User**
```
1. Se déconnecter (icône profil → Déconnexion)
2. Se reconnecter avec : user / user
3. Menu "Notifications" → User peut lire les alertes
4. Tenter de purger → Bouton "Purger" masqué (réservé Admin)
5. Menu "Stocks" → User voit la liste mais ne peut pas modifier
6. Créer une "Demande d'approvisionnement" via le bouton dédié
```

**Étape 6 : Admin valide la demande**
```
1. Se reconnecter en admin / admin
2. Menu "Commandes" → Voir la nouvelle demande (status: PENDING_APPROVAL)
3. Modifier le status en APPROVED
4. Enregistrer
```

**Étape 7 : Admin purge les notifications**
```
1. Menu "Notifications"
2. Cliquer sur "Purger toutes les alertes"
3. Confirmer → Liste vidée
```

### Vérification manuelle via API REST

**Test Producteur (Stock Service)** :
```bash
# Créer un stock critique
curl -X POST http://localhost:8080/stocks \
  -H "Content-Type: application/json" \
  -H "X-ROLE: ADMIN" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "criticalThreshold": 10
  }'

# Kafka publie automatiquement : "ALERT: productId=1, quantity=2"
```

**Test Consommateur (Notification Service)** :
```bash
# Lire les alertes (Admin ou User)
curl -X GET http://localhost:8080/notifications/alerts \
  -H "X-ROLE: USER"

# Purger les alertes (Admin uniquement)
curl -X DELETE http://localhost:8080/notifications/alerts \
  -H "X-ROLE: ADMIN"
```

### Monitoring Kafka

**Vérifier le topic** :
```bash
# Lister les topics
kafka-topics.sh --list --bootstrap-server localhost:9092

# Afficher les messages du topic
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic stock-alerts --from-beginning
```

### Dépannage Kafka

**Kafka ne démarre pas** :
- Vérifier Zookeeper : `zkServer.sh status` (Linux/Mac) ou service Windows
- Vérifier port 9092 disponible : `netstat -an | grep 9092`

**Aucun message reçu** :
- Logs stock-service : rechercher "Failed to publish stock alert"
- Logs notification-service : rechercher "onStockAlert"
- Vérifier consumer group : `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group notification-service`

**Services déconnectés** :
- Les warnings Eureka en tests sont normaux (pas de serveur Eureka lancé)
- En production, vérifier `http://localhost:8761` pour voir tous les services enregistrés

---

## 🧪 Tests Automatisés

### Tests Frontend (Angular)

```bash
cd frontend
npx ng test --watch=false --browsers=ChromeHeadless
```

**Résultat attendu** : TOTAL: 1 SUCCESS (test de bootstrap)

### Tests Backend (Maven)

**Test d'un service spécifique** :
```bash
.\mvnw.cmd -pl notification-service test
.\mvnw.cmd -pl stock-service test
.\mvnw.cmd -pl product-service test
.\mvnw.cmd -pl order-service test
```

**Tests complets** :
```bash
.\mvnw.cmd test
```

**Résultats attendus** :
- Tous les services : BUILD SUCCESS
- Tests de contexte + tests de sécurité passent
- Warnings Eureka normaux (pas de serveur en tests unitaires)

### Tests de Sécurité des Rôles

Les tests backend vérifient automatiquement :
- ✅ Admin peut exécuter toutes les opérations CRUD
- ✅ User ne peut pas déclencher le batch de stock
- ✅ User ne peut pas purger les notifications
- ✅ Headers `X-ROLE` correctement validés

**Exemple de test (ProductControllerSecurityTest.java)** :
```java
@Test
void userCannotDeleteProduct() throws Exception {
    mockMvc.perform(delete("/products/1")
            .header("X-ROLE", "USER"))
        .andExpect(status().isForbidden());
}
```

---

## 📊 Validation Complète

### Checklist de Validation Finale

- [x] **Infrastructure**
  - [x] PostgreSQL démarré et bases créées
  - [x] Kafka + Zookeeper démarrés
  - [x] Eureka Server UP sur :8761
  - [x] Config Server UP sur :8888

- [x] **Services Backend**
  - [x] Tous les microservices enregistrés dans Eureka
  - [x] API Gateway route correctement sur :8080
  - [x] Tests Maven passent pour tous les services

- [x] **Frontend Angular**
  - [x] npm install sans erreur
  - [x] ng serve démarre sur :4200
  - [x] Tests Karma passent (1 SUCCESS)

- [x] **Fonctionnalités Métier**
  - [x] CRUD Produits fonctionnel
  - [x] CRUD Fournisseurs fonctionnel
  - [x] CRUD Commandes fonctionnel
  - [x] CRUD Stocks fonctionnel
  - [x] Dashboard affiche les statistiques

- [x] **Intégration Kafka**
  - [x] Stock Service publie alertes critiques
  - [x] Notification Service consomme et stocke alertes
  - [x] API GET /notifications/alerts retourne les messages
  - [x] API DELETE /notifications/alerts purge (Admin only)

- [x] **Gestion des Rôles**
  - [x] Admin : CRUD complet + purge notifications
  - [x] User : lecture seule + demandes d'approvisionnement
  - [x] Guards frontend bloquent accès non autorisé
  - [x] Backend valide header X-ROLE sur chaque requête

- [x] **Tests End-to-End**
  - [x] Scénario Admin : créer produit → stock critique → voir notification
  - [x] Scénario User : voir données → créer demande → notification refus CRUD
  - [x] Workflow Kafka bout-en-bout validé

---

## 🎓 Projet Pédagogique - Points Clés

### Architecture Microservices
- **Discovery** : Eureka pour enregistrement automatique des services
- **Configuration centralisée** : Config Server avec profils dev/prod
- **API Gateway** : Point d'entrée unique avec routage intelligent
- **Resilience** : Circuit breaker et fallback sur appels inter-services

### Patterns Implémentés
- **Repository Pattern** : Abstraction de la couche données
- **DTO Pattern** : Séparation entités / objets de transfert
- **Service Layer** : Logique métier isolée des contrôleurs
- **Security by Design** : Validation des rôles à chaque niveau

### Technologies Cloud-Native
- **Spring Cloud** : Ecosystem complet pour microservices
- **Apache Kafka** : Messaging asynchrone et event-driven
- **Spring Batch** : Jobs planifiés pour tâches périodiques
- **Docker-ready** : Architecture conteneurisable

### Bonnes Pratiques
- Tests automatisés (unitaires + intégration)
- Documentation complète et guides de démarrage
- Gestion des erreurs et logs structurés
- Séparation des préoccupations (frontend/backend)

---

