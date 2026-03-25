# 🎓 GUIDE COMPLET DE SOUTENANCE - PROJET GESTION DE STOCK

---

## 📚 **INTRODUCTION - Vue d'ensemble du projet**

### **Ce que vous dites à la prof :**

> *"Bonjour Madame/Monsieur. Mon projet est un système complet de gestion de stock et d'approvisionnement basé sur une **architecture microservices**. L'objectif est de permettre à une entreprise de gérer ses produits, ses fournisseurs, ses commandes et son stock de manière distribuée et scalable."*

> *"Le projet se compose de **8 microservices Spring Boot** au backend, d'une **interface Angular** au frontend, et utilise des technologies comme **Kafka** pour la messagerie asynchrone, **Spring Batch** pour les traitements planifiés, et **Resilience4J** pour la tolérance aux pannes."*

---

## 🏗️ **PARTIE 1 : BACKEND - ARCHITECTURE MICROSERVICES**

---

### **1.1 - POM.XML RACINE (Parent POM)**

**📂 Fichier :** `pom.xml` (à la racine)

#### **Ce que vous dites :**

> *"À la racine du projet, j'ai un **POM parent** qui centralise la configuration Maven pour tous mes microservices. C'est un pattern Maven standard qui évite de dupliquer les configurations."*

#### **Rôle de ce fichier :**

- **`<packaging>pom</packaging>`** : Dit que c'est un projet parent qui contient des modules
- **`<modules>`** : Liste tous les microservices du projet (config-server, eureka-server, api-gateway, product-service, etc.)
- **`<dependencyManagement>`** : Centralise les versions de Spring Boot (3.3.5) et Spring Cloud (2023.0.3) pour tous les enfants
- **`<properties>`** : Définit Java 17 comme version cible

#### **Phrase clé pour la soutenance :**

> *"Grâce à ce POM parent, quand je compile avec `mvn clean install`, Maven construit automatiquement tous mes 8 microservices dans le bon ordre. Ça garantit aussi que tous les services utilisent les mêmes versions de Spring."*

---

### **1.2 - CONFIG SERVER (Configuration centralisée)**

**📂 Dossier :** `config-server/`

#### **Ce que vous dites :**

> *"Le **Config Server** est le premier service que je démarre. C'est le serveur de configuration centralisé basé sur Spring Cloud Config. Au lieu d'avoir un `application.yml` différent dans chaque microservice, je centralise toutes les configurations ici."*

#### **Architecture interne :**

**📄 `ConfigServerApplication.java`** :
```java
@EnableConfigServer  // Active le serveur de configuration
@SpringBootApplication
```

**Rôle :** Démarre un serveur HTTP sur le port **8888** qui expose les configurations.

**📄 `application.yml`** :
```yaml
server:
  port: 8888
spring:
  cloud:
    config:
      server:
        native:
          search-locations: classpath:/configs
```

**Rôle :** Configure le serveur pour lire les fichiers de config dans `src/main/resources/configs/`

**📂 `src/main/resources/configs/`** : Contient des fichiers comme `product-service.yml`, `order-service.yml`, etc.

#### **Phrase clé :**

> *"Quand un microservice démarre, il contacte le Config Server sur le port 8888 et récupère sa configuration. Ça permet de changer la config sans recompiler le code."*

---

### **1.3 - EUREKA SERVER (Service Discovery)**

**📂 Dossier :** `eureka-server/`

#### **Ce que vous dites :**

> *"Le **Eureka Server** est le registre de services. C'est l'annuaire téléphonique de mon architecture : tous les microservices s'enregistrent ici au démarrage."*

#### **Architecture interne :**

**📄 `EurekaServerApplication.java`** :
```java
@EnableEurekaServer  // Active le serveur Eureka
@SpringBootApplication
```

**📄 `application.yml`** :
```yaml
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false  # Eureka ne s'enregistre pas lui-même
    fetch-registry: false
```

#### **Pourquoi Eureka ?**

> *"Grâce à Eureka, mes microservices n'ont pas besoin de connaître l'adresse IP des autres services. Quand **order-service** veut appeler **product-service**, il demande à Eureka : 'Où est product-service ?' Eureka répond : 'Sur localhost:8081'. Si j'ai 3 instances de product-service, Eureka fait du **load balancing** automatiquement."*

#### **Console Eureka :**

> *"Je peux ouvrir `http://localhost:8761` dans un navigateur et voir tous les services enregistrés. C'est utile pour vérifier que tout est démarré correctement."*

---

### **1.4 - API GATEWAY (Point d'entrée unique)**

**📂 Dossier :** `api-gateway/`

#### **Ce que vous dites :**

> *"L'**API Gateway** est le **point d'entrée unique** de mon système. C'est la porte d'entrée pour le frontend et les clients externes. Au lieu de donner 5 URLs différentes (une par service), je donne une seule URL : `http://localhost:8080`."*

#### **Architecture interne :**

**📄 `ApiGatewayApplication.java`** :
```java
@EnableDiscoveryClient  // Se connecte à Eureka
@SpringBootApplication
```

**📄 `application.yml`** :
```yaml
server:
  port: 8080
spring:
  cloud:
    gateway:
      routes:
        - id: product-service
          uri: lb://product-service  # lb = load balanced via Eureka
          predicates:
            - Path=/products/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/orders/**
```

#### **Comment ça marche :**

> *"Quand le frontend Angular fait `GET http://localhost:8080/products`, le Gateway voit que `/products/**` correspond à la route `product-service`. Il demande à Eureka l'adresse de product-service et redirige la requête. C'est du **routing dynamique**."*

#### **Avantages :**

1. **Sécurité** : Un seul point d'entrée à sécuriser
2. **Load balancing** : Si j'ai 3 instances de product-service, le Gateway répartit la charge
3. **Simplicité** : Le frontend n'a qu'une seule URL à connaître

---

### **1.5 - PRODUCT SERVICE (Gestion des produits)**

**📂 Dossier :** `product-service/`

#### **Ce que vous dites :**

> *"Le **Product Service** est responsable de la gestion des produits : créer, lire, modifier, supprimer (CRUD). Il a sa propre base de données PostgreSQL appelée `product_db`."*

#### **Architecture interne :**

```
product-service/
├── ProductServiceApplication.java  → Point d'entrée
├── controller/
│   └── ProductController.java       → Endpoints REST
├── service/
│   └── ProductService.java          → Logique métier
├── repository/
│   └── ProductRepository.java       → Accès BDD
├── model/
│   └── Product.java                 → Entité JPA
├── dto/
│   └── ProductDto.java              → Objet de transfert
└── security/
    └── RoleGuard.java               → Vérification des rôles
```

---

#### **📄 ProductServiceApplication.java**

**Ce que vous dites :**

> *"C'est le point d'entrée du microservice. La méthode `main()` démarre l'application Spring Boot."*

```java
@EnableDiscoveryClient  // S'enregistre dans Eureka
@SpringBootApplication  // Active Spring Boot
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}
```

**Annotations importantes :**
- `@SpringBootApplication` : Active l'auto-configuration Spring Boot
- `@EnableDiscoveryClient` : Dit à Eureka : "Je suis product-service, mon port est 8081"

---

#### **📄 model/Product.java (Entité JPA)**

**Ce que vous dites :**

> *"La classe `Product` représente une **table dans PostgreSQL**. Grâce à JPA, je n'écris pas de SQL manuellement, Spring génère les requêtes automatiquement."*

```java
@Entity  // Dit à Spring : "C'est une table en BDD"
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String category;
    private BigDecimal price;
    private Integer minimumQuantity;
    
    // getters/setters
}
```

**Mapping BDD :**
- `@Entity` → Table `products` créée automatiquement
- `@Id` → Colonne clé primaire
- `@GeneratedValue` → Auto-incrémentation

---

#### **📄 dto/ProductDto.java**

**Ce que vous dites :**

> *"Le **DTO** (Data Transfer Object) est l'objet qui circule entre le frontend et le backend. Je ne veux pas exposer directement l'entité `Product` pour des raisons de sécurité. Le DTO ne contient que les champs nécessaires."*

```java
public class ProductDto {
    private Long id;
    private String name;
    private String category;
    private BigDecimal price;
    // Pas de champs sensibles comme createdBy, etc.
}
```

**Pourquoi séparer Entity et DTO ?**
- **Sécurité** : Ne pas exposer tous les champs internes
- **Flexibilité** : L'API peut changer sans toucher la BDD
- **Validation** : Annotations de validation sur le DTO uniquement

---

#### **📄 repository/ProductRepository.java**

**Ce que vous dites :**

> *"Le **Repository** est l'interface qui communique avec la base de données. Grâce à **Spring Data JPA**, je n'écris aucune requête SQL : Spring génère tout automatiquement."*

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Pas besoin d'écrire de code !
    // JpaRepository fournit automatiquement :
    // - findAll()
    // - findById(Long id)
    // - save(Product)
    // - deleteById(Long id)
}
```

**Méthodes automatiques :**
- `findAll()` → `SELECT * FROM products`
- `save(product)` → `INSERT` ou `UPDATE`
- `deleteById(id)` → `DELETE FROM products WHERE id = ?`

---

#### **📄 service/ProductService.java**

**Ce que vous dites :**

> *"La **couche Service** contient la logique métier. C'est ici que je fais la conversion entre **Entity** (BDD) et **DTO** (API)."*

```java
@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    
    public List<ProductDto> findAll() {
        return productRepository.findAll()
            .stream()
            .map(this::toDto)  // Conversion Entity → DTO
            .collect(Collectors.toList());
    }
    
    public ProductDto create(ProductDto dto) {
        Product entity = toEntity(dto);
        entity.setId(null);  // Nouvelle entité
        Product saved = productRepository.save(entity);
        return toDto(saved);
    }
    
    private ProductDto toDto(Product entity) {
        ProductDto dto = new ProductDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        // ...
        return dto;
    }
}
```

**`@Transactional`** : Si une erreur survient, toutes les modifications en BDD sont annulées (rollback).

---

#### **📄 controller/ProductController.java**

**Ce que vous dites :**

> *"Le **Controller** expose les **endpoints REST** accessibles depuis le frontend. C'est la porte d'entrée HTTP du microservice."*

```java
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;
    
    @GetMapping  // GET /products
    public ResponseEntity<List<ProductDto>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }
    
    @PostMapping  // POST /products
    public ResponseEntity<ProductDto> create(@RequestBody ProductDto dto) {
        return ResponseEntity.status(201).body(productService.create(dto));
    }
    
    @PutMapping("/{id}")  // PUT /products/1
    public ResponseEntity<ProductDto> update(@PathVariable Long id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }
    
    @DeleteMapping("/{id}")  // DELETE /products/1
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Flow complet :**
1. Frontend → `GET http://localhost:8080/products`
2. Gateway → redirige vers `product-service:8081/products`
3. Controller → appelle `productService.findAll()`
4. Service → appelle `repository.findAll()` et convertit en DTO
5. Repository → exécute `SELECT * FROM products`
6. Réponse JSON retournée au frontend

---

#### **📄 security/RoleGuard.java**

**Ce que vous dites :**

> *"Le **RoleGuard** vérifie les rôles utilisateur (Admin ou User). Par exemple, seul un Admin peut créer/modifier/supprimer un produit."*

---

### **1.6 - SUPPLIER SERVICE (Gestion des fournisseurs)**

**Ce que vous dites :**

> *"Le **Supplier Service** a exactement la même structure que Product Service, mais pour gérer les fournisseurs. C'est un microservice indépendant avec sa propre base `supplier_db`."*

**Structure identique :**
- Controller → Endpoints REST
- Service → Logique métier
- Repository → Accès BDD
- Model → Entité `Supplier`

**Pourquoi un service séparé ?**

> *"Même si c'est similaire à product-service, séparer les services permet de les déployer, scaler et maintenir indépendamment. Si supplier-service tombe en panne, product-service continue de fonctionner."*

---

### **1.7 - ORDER SERVICE (Gestion des commandes + Communication inter-services)**

**📂 Dossier :** `order-service/`

#### **Ce que vous dites :**

> *"Le **Order Service** est le plus complexe. Il gère les commandes d'approvisionnement et **communique avec d'autres microservices** via **OpenFeign** et **Resilience4J**."*

#### **Architecture spécifique :**

```
order-service/
├── OrderServiceApplication.java  → @EnableFeignClients
├── client/
│   ├── ProductClient.java        → Appel vers product-service
│   └── SupplierClient.java       → Appel vers supplier-service
├── service/
│   └── OrderService.java         → Logique métier + Resilience4J
```

---

#### **📄 OrderServiceApplication.java**

```java
@EnableFeignClients       // Active OpenFeign
@EnableDiscoveryClient
@SpringBootApplication
```

**`@EnableFeignClients`** : Permet d'utiliser des interfaces Java pour appeler d'autres microservices.

---

#### **📄 client/ProductClient.java (OpenFeign)**

**Ce que vous dites :**

> *"**OpenFeign** est un client HTTP déclaratif. Au lieu d'écrire du code avec `RestTemplate` ou `HttpClient`, je définis juste une interface, et Spring génère l'implémentation automatiquement."*

```java
@FeignClient(name = "product-service")  // Cherche dans Eureka
public interface ProductClient {
    
    @GetMapping("/products/{id}")
    Map<String, Object> getProduct(@PathVariable Long id);
}
```

**Comment ça marche :**

1. `@FeignClient(name = "product-service")` → Demande à Eureka l'adresse de `product-service`
2. Eureka répond : `localhost:8081`
3. Feign fait `GET http://localhost:8081/products/{id}`

**Avantage :**

> *"Pas besoin de hardcoder les URLs. Si product-service change de port ou d'IP, Eureka met à jour automatiquement."*

---

#### **📄 service/OrderService.java (Resilience4J)**

**Ce que vous dites :**

> *"Quand je crée une commande, je dois vérifier que le produit et le fournisseur existent. J'utilise **Resilience4J** pour gérer les pannes réseau."*

```java
@CircuitBreaker(name = "defaultCircuit", fallbackMethod = "fallbackCreate")
@Retry(name = "defaultRetry")
public OrderDto create(OrderDto dto) {
    // Appel à product-service via Feign
    Map<String, Object> product = productClient.getProduct(dto.getProductId());
    
    // Appel à supplier-service via Feign
    Map<String, Object> supplier = supplierClient.getSupplier(dto.getSupplierId());
    
    if (product == null || supplier == null) {
        throw new IllegalStateException("Product or Supplier not found");
    }
    
    // Créer la commande
    Order order = toEntity(dto);
    order.setStatus("CREATED");
    return toDto(orderRepository.save(order));
}

// Méthode fallback en cas de panne
private OrderDto fallbackCreate(OrderDto dto, Throwable t) {
    log.warn("Fallback: product-service ou supplier-service indisponible");
    Order order = toEntity(dto);
    order.setStatus("PENDING_APPROVAL");  // Statut différent
    return toDto(orderRepository.save(order));
}
```

**Annotations Resilience4J :**

- **`@CircuitBreaker`** : Si product-service est en panne, après 3 échecs, le circuit s'ouvre et appelle directement le fallback (économise les ressources)
- **`@Retry`** : Retry automatiquement 3 fois avant d'abandonner
- **`fallbackMethod`** : Méthode appelée en cas d'échec → crée la commande avec statut `PENDING_APPROVAL`

**Phrase clé :**

> *"Grâce à Resilience4J, même si product-service est en panne, mon système continue de fonctionner en mode dégradé. La commande est créée mais nécessitera une validation manuelle plus tard."*

---

### **1.8 - STOCK SERVICE (Spring Batch + Kafka Producer)**

**📂 Dossier :** `stock-service/`

#### **Ce que vous dites :**

> *"Le **Stock Service** gère les stocks et intègre **Spring Batch** pour vérifier quotidiennement les stocks critiques. Il publie des alertes dans **Apache Kafka** quand un stock est trop bas."*

#### **Architecture spécifique :**

```
stock-service/
├── StockServiceApplication.java
├── service/
│   └── StockService.java           → Logique + Kafka Producer
├── batch/
│   └── StockBatchConfig.java       → Job Spring Batch
├── config/
│   └── KafkaConfig.java            → Configuration Kafka
```

---

#### **📄 service/StockService.java (Kafka Producer)**

**Ce que vous dites :**

> *"Quand je crée ou modifie un stock, je vérifie si la quantité est inférieure au seuil critique. Si oui, je publie un message dans Kafka."*

```java
@Service
public class StockService {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private static final String ALERT_TOPIC = "stock-alerts";
    
    public void emitAlertIfCritical(Stock stock) {
        if (stock.getQuantity() <= stock.getCriticalThreshold()) {
            String message = "ALERT: productId=" + stock.getProductId() 
                           + ", quantity=" + stock.getQuantity();
            kafkaTemplate.send(ALERT_TOPIC, message);
            log.info("Alert sent to Kafka: {}", message);
        }
    }
}
```

**`KafkaTemplate`** : Objet Spring pour publier des messages dans Kafka.

---

#### **📄 batch/StockBatchConfig.java (Spring Batch)**

**Ce que vous dites :**

> *"**Spring Batch** est un framework pour les traitements planifiés et massifs. J'ai configuré un **job quotidien à 8h du matin** qui vérifie tous les stocks et publie des alertes si nécessaire."*

```java
@Configuration
@EnableScheduling
public class StockBatchConfig {
    
    @Bean
    public Job criticalStockJob() {
        return new JobBuilder("criticalStockJob", jobRepository)
                .start(checkCriticalStockStep())
                .build();
    }
    
    @Bean
    public Step checkCriticalStockStep() {
        Tasklet tasklet = (contribution, chunkContext) -> {
            List<Stock> all = stockRepository.findAll();
            for (Stock s : all) {
                stockService.emitAlertIfCritical(s);
            }
            return RepeatStatus.FINISHED;
        };
        
        return new StepBuilder("checkCriticalStockStep", jobRepository)
                .tasklet(tasklet, transactionManager)
                .build();
    }
    
    @Scheduled(cron = "0 0 8 * * *")  // Tous les jours à 8h
    public void runDaily() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addLong("timestamp", System.currentTimeMillis())
                .toJobParameters();
        jobLauncher.run(criticalStockJob(), params);
    }
}
```

**Architecture Spring Batch :**

1. **Job** : Ensemble de tâches (`criticalStockJob`)
2. **Step** : Une étape du job (`checkCriticalStockStep`)
3. **Tasklet** : Logique exécutée dans le step (ici : lire tous les stocks et publier les alertes)
4. **JobLauncher** : Exécute le job
5. **@Scheduled** : Planification CRON (8h tous les jours)

**CRON expliqué :**

```
0 0 8 * * *
│ │ │ │ │ │
│ │ │ │ │ └─ Jour de la semaine (tous)
│ │ │ │ └─── Mois (tous)
│ │ │ └───── Jour du mois (tous)
│ │ └─────── Heure (8h)
│ └───────── Minute (0)
└─────────── Seconde (0)
```

**Phrase clé :**

> *"Chaque matin à 8h, le job Spring Batch lit tous les stocks en base, filtre ceux qui sont critiques, et publie un message Kafka pour chacun. Le service de notification reçoit ces messages et les affiche sur le dashboard."*

---

### **1.9 - NOTIFICATION SERVICE (Kafka Consumer)**

**📂 Dossier :** `notification-service/`

#### **Ce que vous dites :**

> *"Le **Notification Service** est un **consommateur Kafka**. Il écoute le topic `stock-alerts` et stocke les messages en mémoire pour les afficher sur le frontend."*

#### **📄 service/NotificationService.java**

```java
@Service
public class NotificationService {
    private final LinkedList<String> lastAlerts = new LinkedList<>();
    
    @KafkaListener(topics = "stock-alerts", groupId = "notification-service")
    public void onStockAlert(String message) {
        if (lastAlerts.size() > 50) {
            lastAlerts.removeFirst();  // Garde seulement les 50 dernières
        }
        lastAlerts.add(message);
        log.info("Received alert: {}", message);
    }
    
    public List<String> getLastAlerts() {
        return Collections.unmodifiableList(lastAlerts);
    }
}
```

**`@KafkaListener`** :
- **topics** : Écoute le topic `stock-alerts`
- **groupId** : Identifie le consommateur (permet de faire du load balancing entre plusieurs instances)

**Flow complet Kafka :**

```
Stock-Service → Kafka Topic "stock-alerts" → Notification-Service
(Producer)                                    (Consumer)
```

**Phrase clé :**

> *"Dès que stock-service publie une alerte dans Kafka, notification-service la reçoit instantanément grâce à `@KafkaListener`. C'est de la **communication asynchrone** : stock-service n'attend pas de réponse, il publie et continue."*

---

## 🌐 **PARTIE 2 : COMMUNICATION ENTRE MICROSERVICES**

---

### **2.1 - Communication SYNCHRONE (OpenFeign)**

**Scénario : Création d'une commande**

```
Frontend
   ↓ POST /orders {productId: 1, supplierId: 2}
API Gateway
   ↓
Order-Service
   ↓ Feign GET /products/1
Product-Service → Retourne {id: 1, name: "Laptop"}
   ↓
Order-Service
   ↓ Feign GET /suppliers/2
Supplier-Service → Retourne {id: 2, name: "Dell"}
   ↓
Order-Service → Crée la commande en BDD
   ↓
Frontend ← 201 Created
```

**Ce que vous dites :**

> *"Quand je crée une commande, order-service doit vérifier que le produit et le fournisseur existent. Il utilise **OpenFeign** pour faire des appels HTTP synchrones vers product-service et supplier-service."*

> *"Si product-service ne répond pas, **Resilience4J** déclenche le circuit breaker et appelle la méthode fallback. La commande est créée avec le statut `PENDING_APPROVAL` au lieu de `CREATED`."*

---

### **2.2 - Communication ASYNCHRONE (Kafka)**

**Scénario : Alerte de stock critique**

```
Stock-Service (Job Batch 8h)
   ↓ Lit tous les stocks
   ↓ Filtre ceux où quantity <= threshold
   ↓ kafkaTemplate.send("stock-alerts", message)
Kafka Broker (Topic: stock-alerts)
   ↓
Notification-Service (@KafkaListener)
   ↓ Reçoit le message
   ↓ Stocke en mémoire
Frontend
   ↓ GET /notifications/alerts
   ↓ Affiche la liste des alertes
```

**Ce que vous dites :**

> *"Stock-service ne communique pas directement avec notification-service. Il publie un message dans Kafka et continue son traitement. Notification-service écoute Kafka et traite les messages quand il les reçoit. C'est **asynchrone** : les services ne se bloquent pas mutuellement."*

**Avantages de Kafka :**

1. **Découplage** : Stock-service ne dépend pas de notification-service
2. **Scalabilité** : Je peux avoir 10 consommateurs qui lisent le même topic
3. **Résilience** : Si notification-service est en panne, les messages restent dans Kafka et seront traités plus tard

---

## 🔄 **PARTIE 3 : SPRING BATCH EN DÉTAIL**

---

### **Pourquoi Spring Batch dans ce projet ?**

**Ce que vous dites :**

> *"Spring Batch est utilisé pour les traitements **planifiés et massifs**. Dans mon projet, chaque matin à 8h, je dois vérifier tous les stocks en base de données et envoyer des alertes si la quantité est critique. Sans Spring Batch, je ferais ça avec un simple `@Scheduled`, mais Spring Batch offre des fonctionnalités avancées comme le redémarrage en cas d'échec, le suivi de l'exécution, et la gestion de gros volumes."*

---

### **Architecture Spring Batch - Concepts clés**

#### **1. Job**

**Ce que vous dites :**

> *"Un **Job** est un ensemble de tâches à exécuter. Dans mon projet, j'ai un job appelé `criticalStockJob` qui vérifie les stocks critiques."*

```java
@Bean
public Job criticalStockJob() {
    return new JobBuilder("criticalStockJob", jobRepository)
            .start(checkCriticalStockStep())
            .build();
}
```

---

#### **2. Step**

**Ce que vous dites :**

> *"Un **Step** est une étape dans le job. Mon job a un seul step : `checkCriticalStockStep` qui lit les stocks et publie les alertes."*

```java
@Bean
public Step checkCriticalStockStep() {
    Tasklet tasklet = (contribution, chunkContext) -> {
        List<Stock> all = stockRepository.findAll();
        for (Stock s : all) {
            stockService.emitAlertIfCritical(s);
        }
        return RepeatStatus.FINISHED;
    };
    
    return new StepBuilder("checkCriticalStockStep", jobRepository)
            .tasklet(tasklet, transactionManager)
            .build();
}
```

**Tasklet** : Logique simple exécutée une seule fois (lire tous les stocks, traiter, terminer).

---

#### **3. ItemReader, ItemProcessor, ItemWriter (Pattern classique)**

**Ce que vous dites :**

> *"Dans mon projet, j'utilise un **Tasklet** simple, mais Spring Batch propose aussi un pattern plus avancé avec **Reader → Processor → Writer** pour traiter de gros volumes par batch."*

**Exemple conceptuel :**

```java
@Bean
public Step checkCriticalStockStep() {
    return new StepBuilder("checkCriticalStockStep", jobRepository)
            .<Stock, Stock>chunk(10, transactionManager)  // Traite 10 stocks à la fois
            .reader(stockItemReader())      // Lit 10 stocks
            .processor(stockItemProcessor()) // Filtre les critiques
            .writer(stockItemWriter())       // Publie dans Kafka
            .build();
}
```

**Avantage :** Traite 10 000 stocks par batch de 10 au lieu de tout charger en mémoire.

---

#### **4. JobLauncher**

**Ce que vous dites :**

> *"Le **JobLauncher** est l'objet qui démarre le job. Je l'appelle dans ma méthode `@Scheduled`."*

```java
@Scheduled(cron = "0 0 8 * * *")
public void runDaily() throws Exception {
    JobParameters params = new JobParametersBuilder()
            .addLong("timestamp", System.currentTimeMillis())
            .toJobParameters();
    jobLauncher.run(criticalStockJob(), params);
}
```

**JobParameters** : Chaque exécution du job doit avoir des paramètres uniques (ici le timestamp). Ça permet à Spring Batch de différencier les exécutions.

---

#### **5. À quel moment le batch s'exécute ?**

**Ce que vous dites :**

> *"Le job s'exécute **automatiquement tous les jours à 8h du matin** grâce à `@Scheduled(cron = "0 0 8 * * *")`. Je peux aussi le déclencher manuellement depuis le frontend via un endpoint REST."*

**Endpoint manuel :**

```java
@PostMapping("/stocks/check-critical")
public ResponseEntity<?> triggerBatchManually() {
    stockBatchConfig.runDaily();
    return ResponseEntity.ok("Batch job triggered");
}
```

---

#### **6. Que produit le batch ?**

**Ce que vous dites :**

> *"Le batch produit des **messages Kafka** publiés dans le topic `stock-alerts`. Chaque message contient les informations du stock critique. Notification-service les consomme et les affiche sur le dashboard."*

**Exemple de message :**

```
ALERT: productId=5, quantity=3
```

---

## 🎨 **PARTIE 4 : FRONTEND ANGULAR**

---

### **4.1 - Structure du projet Angular**

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/        → Composants réutilisables
│   │   ├── pages/             → Pages (dashboard, products, orders, etc.)
│   │   ├── services/          → Services Angular (HTTP)
│   │   ├── models/            → Interfaces TypeScript
│   │   ├── auth/              → Authentification (guards, services)
│   │   └── app-routing.module.ts → Routes
│   ├── environments/          → Configuration (dev/prod)
│   └── styles.scss            → Styles globaux
```

---

### **4.2 - Services Angular (Appels HTTP)**

**📄 services/product.service.ts**

**Ce que vous dites :**

> *"Les **services Angular** sont responsables de la communication avec le backend. Ils encapsulent les appels HTTP."*

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;  // http://localhost:8080/products
  
  constructor(private http: HttpClient) { }
  
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  
  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
}
```

**Observable** : Pattern RxJS pour gérer les réponses asynchrones.

---

### **4.3 - Models (Interfaces TypeScript)**

**📄 models/product.model.ts**

```typescript
export interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  minimumQuantity: number;
}
```

**Ce que vous dites :**

> *"Les **models** définissent la structure des données échangées avec le backend. Ça correspond aux DTOs Java."*

---

### **4.4 - Components (Logique UI)**

**📄 pages/products/products.component.ts**

```typescript
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  
  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) { }
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products = data || [],
      error: (err) => console.error('Error loading products', err)
    });
  }
  
  openDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product || {}
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        setTimeout(() => this.loadProducts(), 300);
      }
    });
  }
}
```

**Ce que vous dites :**

> *"Le **component** charge les produits au démarrage avec `ngOnInit()`, affiche la liste, et ouvre un dialog pour créer/modifier un produit."*

---

### **4.5 - Dashboard Admin**

**Ce que vous dites :**

> *"Le **dashboard admin** affiche des statistiques (nombre de produits, commandes, stocks critiques) et les 5 dernières alertes. Il fait 3 appels HTTP parallèles au chargement."*

```typescript
loadStatistics(): void {
  this.productService.getAll().subscribe({
    next: (data) => this.totalProducts = (data || []).length,
    error: () => this.totalProducts = 0
  });
  
  this.orderService.getAll().subscribe({
    next: (data) => this.totalOrders = (data || []).length,
    error: () => this.totalOrders = 0
  });
  
  this.notificationService.getAlerts().subscribe({
    next: (data) => this.recentAlerts = (data || []).slice(0, 5),
    error: () => this.recentAlerts = []
  });
}
```

---

## 🔗 **PARTIE 5 : CONNEXION FRONTEND ↔ BACKEND**

---

### **Flow complet : Créer un produit**

```
1. User clique sur "Créer Produit" dans l'UI
   ↓
2. ProductsComponent.openDialog()
   ↓
3. Dialog s'ouvre (ProductDialogComponent)
   ↓
4. User remplit le formulaire et clique "Sauvegarder"
   ↓
5. productService.create(product).subscribe()
   ↓
6. Angular fait: POST http://localhost:8080/products
   ↓
7. API Gateway reçoit la requête
   ↓
8. Gateway demande à Eureka: "Où est product-service ?"
   ↓
9. Eureka répond: "localhost:8081"
   ↓
10. Gateway redirige: POST http://localhost:8081/products
   ↓
11. ProductController.create() reçoit la requête
   ↓
12. ProductService.create() convertit DTO → Entity
   ↓
13. ProductRepository.save() insère en BDD PostgreSQL
   ↓
14. Réponse JSON retournée au frontend
   ↓
15. Dialog se ferme, loadProducts() recharge la liste
   ↓
16. User voit le nouveau produit dans la liste
```

---

### **Configuration Frontend (environment.ts)**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'  // URL du Gateway
};
```

**Ce que vous dites :**

> *"Le frontend ne connaît qu'une seule URL : celle du Gateway. Tous les appels passent par `http://localhost:8080`. Le Gateway se charge de router vers le bon microservice."*

---

## 🎤 **PARTIE 6 : MODE SOUTENANCE - PHRASES TYPES**

---

### **Introduction du projet**

> *"Mon projet est un système de gestion de stock basé sur une architecture microservices. Il permet de gérer les produits, fournisseurs, commandes et stocks de manière distribuée. J'utilise Spring Boot pour le backend, Angular pour le frontend, Kafka pour la messagerie asynchrone, et Spring Batch pour les traitements planifiés."*

---

### **Question : Pourquoi des microservices ?**

> *"J'ai choisi une architecture microservices pour plusieurs raisons : la scalabilité (je peux déployer 10 instances de product-service si nécessaire), la résilience (si un service tombe, les autres continuent), et la maintenabilité (chaque équipe peut travailler sur un service indépendant)."*

---

### **Question : Comment les services communiquent ?**

> *"J'utilise deux modes : **OpenFeign pour la communication synchrone** (order-service appelle product-service pour valider un produit), et **Kafka pour l'asynchrone** (stock-service publie des alertes que notification-service consomme)."*

---

### **Question : Que se passe-t-il si un service tombe en panne ?**

> *"J'utilise **Resilience4J** avec circuit breaker, retry et fallback. Par exemple, si product-service ne répond pas quand je crée une commande, le circuit breaker s'ouvre et appelle la méthode fallback qui crée la commande avec un statut `PENDING_APPROVAL` au lieu de `CREATED`."*

---

### **Question : Rôle de Spring Batch ?**

> *"Spring Batch exécute un job quotidien à 8h pour vérifier tous les stocks en base. Si un stock est critique, il publie un message dans Kafka. C'est plus robuste qu'un simple `@Scheduled` car Spring Batch gère le redémarrage en cas d'échec et le suivi de l'exécution."*

---

### **Question : Comment fonctionne Kafka ?**

> *"Kafka est un broker de messages. Stock-service publie dans le topic `stock-alerts`, et notification-service écoute ce topic avec `@KafkaListener`. C'est asynchrone : stock-service ne sait même pas que notification-service existe."*

---

### **Question : Comment le frontend communique avec le backend ?**

> *"Le frontend Angular appelle l'API Gateway sur le port 8080. Le Gateway route les requêtes vers les bons microservices en interrogeant Eureka pour obtenir leurs adresses. Le frontend ne connaît qu'une seule URL."*

---

### **Conclusion**

> *"Ce projet m'a permis de maîtriser les technologies Spring Cloud (Config, Eureka, Gateway, Feign), les patterns de résilience (Resilience4J), la messagerie asynchrone (Kafka), et les traitements batch (Spring Batch). C'est une architecture professionnelle scalable et résiliente."*

---

## 🎯 **CONSEILS POUR OBTENIR 20/20**

1. **Maîtrisez le vocabulaire** : Circuit breaker, fallback, discovery, routing, producer, consumer
2. **Dessinez l'architecture** au tableau si possible
3. **Démontrez le projet** : montrez Eureka dashboard, créez une commande, montrez les alertes
4. **Anticipez les questions** :
   - "Pourquoi Kafka et pas REST ?" → Asynchrone, découplage, scalabilité
   - "Pourquoi Eureka ?" → Service discovery dynamique, pas de hard-coded URLs
   - "Avantages de Spring Batch ?" → Gestion d'erreurs, redémarrage, monitoring
5. **Soyez précis** : Citez les ports (8080, 8761, 8888), les annotations (@FeignClient, @KafkaListener)
6. **Parlez des limites** : "En production, j'ajouterais Spring Security avec OAuth2 pour la sécurité"

---

## 📊 **RÉCAPITULATIF DES PORTS**

| Service | Port | Rôle |
|---------|------|------|
| Config Server | 8888 | Configuration centralisée |
| Eureka Server | 8761 | Service Discovery |
| API Gateway | 8080 | Point d'entrée unique |
| Product Service | 8081 | Gestion produits |
| Supplier Service | 8082 | Gestion fournisseurs |
| Order Service | 8083 | Gestion commandes + Feign |
| Stock Service | 8084 | Gestion stocks + Batch + Kafka Producer |
| Notification Service | 8085 | Kafka Consumer |
| PostgreSQL | 5432 | 5 bases de données |
| Kafka | 9092 | Message broker |
| Frontend Angular | 4200 | Interface utilisateur |

---

## 🔑 **ANNOTATIONS CLÉS À CONNAÎTRE**

### **Backend (Spring Boot)**

| Annotation | Rôle |
|------------|------|
| `@SpringBootApplication` | Active Spring Boot |
| `@EnableConfigServer` | Active Config Server |
| `@EnableEurekaServer` | Active Eureka Server |
| `@EnableDiscoveryClient` | Enregistre dans Eureka |
| `@EnableFeignClients` | Active OpenFeign |
| `@FeignClient(name="...")` | Client HTTP déclaratif |
| `@CircuitBreaker` | Circuit breaker Resilience4J |
| `@Retry` | Retry automatique |
| `@Scheduled(cron="...")` | Planification CRON |
| `@KafkaListener` | Consommateur Kafka |
| `@RestController` | Controller REST |
| `@Service` | Couche service |
| `@Repository` | Couche repository |
| `@Entity` | Entité JPA |
| `@Transactional` | Gestion transactions |

### **Frontend (Angular)**

| Élément | Rôle |
|---------|------|
| `@Injectable` | Service Angular |
| `@Component` | Composant Angular |
| `HttpClient` | Appels HTTP |
| `Observable` | Gestion asynchrone (RxJS) |
| `ngOnInit()` | Lifecycle hook (initialisation) |

---

## ✅ **CHECKLIST AVANT LA SOUTENANCE**

- [ ] Je peux expliquer l'architecture globale en 2 minutes
- [ ] Je connais le rôle de chaque microservice
- [ ] Je comprends OpenFeign et Resilience4J
- [ ] Je peux expliquer le flow Kafka (producer → consumer)
- [ ] Je maîtrise Spring Batch (Job, Step, Tasklet)
- [ ] Je peux faire une démo live du projet
- [ ] Je connais tous les ports par cœur
- [ ] Je peux dessiner l'architecture au tableau
- [ ] Je sais répondre aux questions difficiles
- [ ] J'ai relu ce guide au moins 2 fois

---

**Bonne chance pour votre soutenance ! 🚀🎓**
