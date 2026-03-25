package com.monprojet.product.controller;

import com.monprojet.product.dto.ProductDto;
import com.monprojet.product.security.RoleGuard;
import com.monprojet.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;
    private final RoleGuard roleGuard;

    public ProductController(ProductService productService, RoleGuard roleGuard) {
        this.productService = productService;
        this.roleGuard = roleGuard;
    }

    @GetMapping
    public List<ProductDto> all(@RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> byId(@PathVariable("id") Long id,
                                           @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@RequestBody @Valid ProductDto dto,
                             @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        return productService.create(dto);
    }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable("id") Long id,
                             @RequestBody @Valid ProductDto dto,
                             @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        return productService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id,
                       @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        productService.delete(id);
    }
}


