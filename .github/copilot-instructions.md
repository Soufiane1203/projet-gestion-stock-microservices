# Copilot Instructions - Projet Gestion de Stock

## Architecture Overview

This is a **microservices-based inventory management system** with Spring Boot backend and Angular frontend.

### Service Architecture
```
API Gateway (8080) → Eureka Discovery (8761)
                  ├── product-service (PostgreSQL)
                  ├── supplier-service (PostgreSQL)
                  ├── order-service (OpenFeign + Resilience4J)
                  ├── stock-service (Spring Batch + Kafka Producer)
                  └── notification-service (Kafka Consumer)
```

**Key Pattern**: All inter-service communication goes through OpenFeign clients with circuit breaker fallbacks (Resilience4J).

## Role-Based Security Model

### Authentication & Authorization
- **No JWT/OAuth**: Uses simple header-based role checking (`X-ROLE` header)
- **Three Roles**: `ADMIN`, `USER`, `SUPPLIER`
- **Implementation**: `RoleGuard` class in each service (e.g., `order-service/security/RoleGuard.java`)

### Role Permissions
```java
// Example from OrderController.java
@PostMapping
public OrderDto create(@RequestBody OrderDto dto, 
                      @RequestHeader(value = RoleGuard.HEADER_NAME) String role) {
    roleGuard.requireRole(role); // Any authenticated user
    if (!roleGuard.isAdmin(role)) {
        dto.setStatus("PENDING_APPROVAL"); // Users need approval
    }
    return orderService.create(dto);
}
```

**ADMIN**: Full CRUD on all resources  
**USER**: Read-only + create orders (with `PENDING_APPROVAL` status)  
**SUPPLIER**: View orders where `supplierId` matches their ID, update order status only

### Frontend Role Handling
- **AuthService** (`frontend/src/app/services/auth.service.ts`): Stores user in localStorage
- **RoleHeaderInterceptor** (`frontend/src/app/auth/role-header.interceptor.ts`): Injects `X-ROLE` header into all HTTP requests
- **Guards**: `AuthGuard`, `AdminGuard`, `SupplierGuard` protect routes

## Critical Data Flows

### Order Creation with Validation
```
OrderController → OrderService.create()
                ├── productClient.getProduct(productId) [Feign + Circuit Breaker]
                ├── supplierClient.getSupplier(supplierId) [Feign + Circuit Breaker]
                └── orderRepository.save()
```
**Fallback**: If product/supplier validation fails, order is created with `PENDING_APPROVAL` status.

### Stock Alert Pipeline (Kafka)
```
StockService.create/update() → Check criticalThreshold
  → KafkaTemplate.send("stock-alerts", "ALERT: productId=X, quantity=Y")
  → NotificationService.listen() → Store in in-memory list (max 50)
  → Frontend polls GET /notifications/alerts
```
**Configuration**: Kafka broker at `localhost:9092`, topic `stock-alerts` (see `stock-service/config/KafkaConfig.java`)

### Spring Batch for Stock Monitoring
- **Job**: `criticalStockJob` in `stock-service/batch/`
- **Trigger**: Scheduled daily OR manual via `POST /stocks/trigger-batch`
- **Action**: Query stocks where `quantity <= criticalThreshold`, emit Kafka alerts

## Development Conventions

### Service Structure (Consistent Across All Services)
```
src/main/java/com/monprojet/{service}/
├── controller/     # REST endpoints
├── service/        # Business logic
├── repository/     # Spring Data JPA
├── model/          # JPA entities (@Entity)
├── dto/            # Data Transfer Objects
├── config/         # Feign, Kafka, Batch configs
├── security/       # RoleGuard class
└── client/         # OpenFeign interfaces (order-service only)
```

### Testing Patterns
```java
// Example: NotificationControllerSecurityTest.java
@WebMvcTest(NotificationController.class)
@Import(RoleGuard.class)  // Always import RoleGuard for security tests
class NotificationControllerSecurityTest {
    @Test
    void userCannotPurgeAlerts() throws Exception {
        mockMvc.perform(delete("/notifications/alerts")
                .header(RoleGuard.HEADER_NAME, "USER"))
            .andExpect(status().isForbidden());
    }
}
```

### Angular Component Patterns
- **Dialogs**: Use `MatDialog` for create/edit forms (e.g., `ProductDialogComponent`)
- **Tables**: `MatTable` with `displayedColumns` array
- **Role Visibility**: Use `*ngIf="authService.isAdmin()"` in templates
- **Example**: `orders.component.ts` shows conditional UI based on role

## Key Integration Points

### OpenFeign Configuration
```java
// order-service/client/ProductClient.java
@FeignClient(name = "product-service", url = "${product.service.url:http://localhost:8081}")
public interface ProductClient {
    @GetMapping("/products/{id}")
    Map<String, Object> getProduct(@PathVariable("id") Long id);
}
```
**URL Resolution**: Defaults to `localhost:808X`, overrideable via `application.yml`

### API Gateway Routes
```yaml
# api-gateway/src/main/resources/application.yml
spring.cloud.gateway.routes:
  - id: product-service
    uri: lb://product-service  # Load-balanced via Eureka
    predicates:
      - Path=/products/**
```

## Common Tasks & Commands

### Build & Run
```powershell
# Build all services
mvn clean install -DskipTests

# Run specific service (IntelliJ or terminal)
cd product-service ; mvn spring-boot:run

# Frontend
cd frontend ; npm install ; ng serve
```

### Database Setup
Each service expects PostgreSQL database named `{service}_db`:
```sql
CREATE DATABASE product_db;
CREATE DATABASE supplier_db;
-- etc.
```

### Testing Kafka
```powershell
# Manual batch trigger (Admin only)
curl -X POST http://localhost:8080/stocks/trigger-batch -H "X-ROLE: ADMIN"

# Emit test alerts
curl -X POST http://localhost:8080/stocks/test-alerts -H "X-ROLE: ADMIN"
```

## Supplier Role Specifics (Recently Added)

### Backend
- **New Endpoint**: `GET /orders/supplier/{supplierId}` - Returns orders filtered by supplier
- **Update Logic**: `PUT /orders/{id}` allows SUPPLIER to update only `status` field
- **Security**: `roleGuard.isSupplier(role)` checks in `OrderController`

### Frontend
- **Component**: `SupplierOrdersComponent` (`frontend/src/app/components/supplier-orders/`)
- **Route**: `/supplier-orders` (guarded by `SupplierGuard`)
- **Login**: `username: supplier`, `password: supplier` (hardcoded in `AuthService`)
- **UI**: Shows only orders where `supplierId` matches user's `supplierId` property

### Workflow
1. USER creates order → status `PENDING_APPROVAL`
2. ADMIN approves → changes status to `APPROVED`
3. SUPPLIER logs in → sees orders via `/supplier-orders`
4. SUPPLIER updates status → `EN_COURS` → `EXPÉDIÉE` → `LIVRÉE`

## Important Notes

- **No Real Auth**: Demo uses hardcoded users in `AuthService.ts` (admin/admin, user/user, supplier/supplier)
- **Header Injection**: `RoleHeaderInterceptor` automatically adds `X-ROLE` to requests
- **Circuit Breaker**: Fallbacks log warnings but don't block operations (see `OrderService.fallbackCreate`)
- **In-Memory Alerts**: `NotificationService` stores last 50 alerts in `ConcurrentLinkedQueue` (resets on restart)

## When Adding New Features

1. **New Endpoint**: Add to controller → update `RoleGuard` if needed → add tests in `*SecurityTest.java`
2. **New Service**: Copy structure from `product-service` → add Eureka client dependency → register in `api-gateway/application.yml`
3. **New Frontend Component**: Generate with Angular CLI → add to `app.module.ts` → update routing → add guard if restricted
4. **New Role Check**: Update `RoleGuard` in ALL services (product, order, stock, supplier, notification) + `AuthService.ts`

## Reference Files
- Security pattern: `order-service/src/main/java/com/monprojet/order/security/RoleGuard.java`
- Feign + Resilience4J: `order-service/src/main/java/com/monprojet/order/service/OrderService.java`
- Kafka producer: `stock-service/src/main/java/com/monprojet/stock/service/StockService.java`
- Kafka consumer: `notification-service/src/main/java/com/monprojet/notification/service/NotificationService.java`
- Frontend auth: `frontend/src/app/services/auth.service.ts`
- Role interceptor: `frontend/src/app/auth/role-header.interceptor.ts`
