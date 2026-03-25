package com.monprojet.product.service;

import com.monprojet.product.dto.ProductDto;
import com.monprojet.product.model.Product;
import com.monprojet.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDto> findAll() {
        return productRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public Optional<ProductDto> findById(Long id) {
        return productRepository.findById(id).map(this::toDto);
    }

    public ProductDto create(ProductDto dto) {
        Product product = toEntity(dto);
        product.setId(null);
        return toDto(productRepository.save(product));
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product existing = productRepository.findById(id).orElseThrow();
        existing.setName(dto.getName());
        existing.setSku(dto.getSku());
        existing.setPrice(dto.getPrice());
        existing.setCriticalThreshold(dto.getCriticalThreshold());
        return toDto(productRepository.save(existing));
    }

    public void delete(Long id) { productRepository.deleteById(id); }

    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setSku(p.getSku());
        dto.setName(p.getName());
        dto.setPrice(p.getPrice());
        dto.setCriticalThreshold(p.getCriticalThreshold());
        return dto;
    }

    private Product toEntity(ProductDto dto) {
        Product p = new Product();
        p.setId(dto.getId());
        p.setSku(dto.getSku());
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setCriticalThreshold(dto.getCriticalThreshold());
        return p;
    }
}


