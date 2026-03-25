package com.monprojet.order.service;

import com.monprojet.order.client.ProductClient;
import com.monprojet.order.client.SupplierClient;
import com.monprojet.order.dto.OrderDto;
import com.monprojet.order.model.Order;
import com.monprojet.order.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final SupplierClient supplierClient;

    public OrderService(OrderRepository orderRepository, ProductClient productClient, SupplierClient supplierClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.supplierClient = supplierClient;
    }

    public List<OrderDto> findAll() {
        return orderRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<OrderDto> findBySupplierId(Long supplierId) {
        return orderRepository.findBySupplierId(supplierId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto findById(Long id) { return toDto(orderRepository.findById(id).orElseThrow()); }

    @CircuitBreaker(name = "defaultCircuit", fallbackMethod = "fallbackCreate")
    @Retry(name = "defaultRetry")
    public OrderDto create(OrderDto dto) {
        // Validation des dépendances via Feign
        log.debug("Validating order dependencies for product {} and supplier {}", dto.getProductId(), dto.getSupplierId());
        Map<String, Object> product = productClient.getProduct(dto.getProductId());
        Map<String, Object> supplier = supplierClient.getSupplier(dto.getSupplierId());
        log.debug("Dependencies resolved. product={} supplier={} ", product != null ? product.get("id") : null, supplier != null ? supplier.get("id") : null);
        if (product == null || supplier == null) {
            throw new IllegalStateException("Product or Supplier not found");
        }
        Order e = toEntity(dto);
        e.setId(null);
        String targetStatus = (dto.getStatus() == null || dto.getStatus().isBlank()) ? "CREATED" : dto.getStatus();
        e.setStatus(targetStatus);
        return toDto(orderRepository.save(e));
    }

    public OrderDto update(Long id, OrderDto dto) {
        Order e = orderRepository.findById(id).orElseThrow();
        e.setProductId(dto.getProductId());
        e.setSupplierId(dto.getSupplierId());
        e.setQuantity(dto.getQuantity());
        e.setStatus(dto.getStatus());
        return toDto(orderRepository.save(e));
    }

    public void delete(Long id) { orderRepository.deleteById(id); }

    // Fallback en cas de panne réseau entre microservices
    @SuppressWarnings("unused")
    private OrderDto fallbackCreate(OrderDto dto, Throwable t) {
        log.warn("Falling back order creation for product {} / supplier {} due to {}", dto.getProductId(), dto.getSupplierId(), t.getMessage(), t);
        Order e = toEntity(dto);
        e.setId(null);
        String targetStatus = (dto.getStatus() == null || dto.getStatus().isBlank()) ? "PENDING_APPROVAL" : dto.getStatus();
        e.setStatus(targetStatus);
        return toDto(orderRepository.save(e));
    }

    private OrderDto toDto(Order e) {
        OrderDto dto = new OrderDto();
        dto.setId(e.getId());
        dto.setProductId(e.getProductId());
        dto.setSupplierId(e.getSupplierId());
        dto.setQuantity(e.getQuantity());
        dto.setStatus(e.getStatus());
        return dto;
    }

    private Order toEntity(OrderDto dto) {
        Order e = new Order();
        e.setId(dto.getId());
        e.setProductId(dto.getProductId());
        e.setSupplierId(dto.getSupplierId());
        e.setQuantity(dto.getQuantity());
        e.setStatus(dto.getStatus());
        return e;
    }
}


