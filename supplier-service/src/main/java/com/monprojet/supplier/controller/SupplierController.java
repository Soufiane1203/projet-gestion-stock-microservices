package com.monprojet.supplier.controller;

import com.monprojet.supplier.dto.SupplierDto;
import com.monprojet.supplier.security.RoleGuard;
import com.monprojet.supplier.service.SupplierService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
public class SupplierController {
    private static final Logger log = LoggerFactory.getLogger(SupplierController.class);
    private final SupplierService supplierService;
    private final RoleGuard roleGuard;

    public SupplierController(SupplierService supplierService, RoleGuard roleGuard) {
        this.supplierService = supplierService;
        this.roleGuard = roleGuard;
    }

    @GetMapping
    public List<SupplierDto> all(@RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        return supplierService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> byId(@PathVariable("id") Long id,
                                            @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        log.debug("Fetching supplier {}", id);
        return supplierService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierDto create(@RequestBody @Valid SupplierDto dto,
                              @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        return supplierService.create(dto);
    }

    @PutMapping("/{id}")
    public SupplierDto update(@PathVariable("id") Long id,
                              @RequestBody @Valid SupplierDto dto,
                              @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        return supplierService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id,
                       @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        supplierService.delete(id);
    }
}


