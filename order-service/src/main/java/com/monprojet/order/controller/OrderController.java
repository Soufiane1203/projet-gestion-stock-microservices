package com.monprojet.order.controller;

import com.monprojet.order.dto.OrderDto;
import com.monprojet.order.security.RoleGuard;
import com.monprojet.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;
    private final RoleGuard roleGuard;

    public OrderController(OrderService orderService, RoleGuard roleGuard) {
        this.orderService = orderService;
        this.roleGuard = roleGuard;
    }

    @GetMapping
    public List<OrderDto> all(@RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        return orderService.findAll();
    }

    @GetMapping("/supplier/{supplierId}")
    public List<OrderDto> bySupplier(@PathVariable("supplierId") Long supplierId,
                                      @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        // Seul ADMIN ou SUPPLIER peuvent accéder aux commandes d'un fournisseur spécifique
        if (!roleGuard.isAdmin(role) && !roleGuard.isSupplier(role)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, 
                "Only ADMIN or SUPPLIER can access supplier orders"
            );
        }
        return orderService.findBySupplierId(supplierId);
    }

    @GetMapping("/{id}")
    public OrderDto byId(@PathVariable("id") Long id,
                         @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        return orderService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto create(@RequestBody @Valid OrderDto dto,
                           @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        if (!roleGuard.isAdmin(role)) {
            dto.setStatus("PENDING_APPROVAL");
        }
        return orderService.create(dto);
    }

    @PutMapping("/{id}")
    public OrderDto update(@PathVariable("id") Long id,
                           @RequestBody @Valid OrderDto dto,
                           @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role,
                           @RequestHeader(value = "X-SUPPLIER-ID", required = false) String supplierIdHeader) {
        roleGuard.requireRole(role);
        
        // ADMIN peut tout modifier
        if (roleGuard.isAdmin(role)) {
            return orderService.update(id, dto);
        }
        
        // SUPPLIER peut uniquement modifier le statut de ses commandes
        if (roleGuard.isSupplier(role)) {
            OrderDto existing = orderService.findById(id);
            
            // Vérifier que la commande appartient au fournisseur
            if (supplierIdHeader != null) {
                try {
                    Long supplierId = Long.parseLong(supplierIdHeader);
                    if (!existing.getSupplierId().equals(supplierId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.FORBIDDEN, 
                            "You can only update your own orders"
                        );
                    }
                } catch (NumberFormatException e) {
                    throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, 
                        "Invalid supplier ID"
                    );
                }
            }
            
            // SUPPLIER peut uniquement modifier le statut
            existing.setStatus(dto.getStatus());
            return orderService.update(id, existing);
        }
        
        throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.FORBIDDEN, 
            "Insufficient privileges to update order"
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id,
                       @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        orderService.delete(id);
    }
}


