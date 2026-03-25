package com.monprojet.supplier.service;

import com.monprojet.supplier.dto.SupplierDto;
import com.monprojet.supplier.model.Supplier;
import com.monprojet.supplier.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<SupplierDto> findAll() {
        return supplierRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public Optional<SupplierDto> findById(Long id) {
        return supplierRepository.findById(id).map(this::toDto);
    }

    public SupplierDto create(SupplierDto dto) {
        Supplier e = toEntity(dto);
        e.setId(null);
        return toDto(supplierRepository.save(e));
    }

    public SupplierDto update(Long id, SupplierDto dto) {
        Supplier e = supplierRepository.findById(id).orElseThrow();
        e.setName(dto.getName());
        e.setEmail(dto.getEmail());
        e.setPhone(dto.getPhone());
        return toDto(supplierRepository.save(e));
    }

    public void delete(Long id) { supplierRepository.deleteById(id); }

    private SupplierDto toDto(Supplier e) {
        SupplierDto dto = new SupplierDto();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setEmail(e.getEmail());
        dto.setPhone(e.getPhone());
        return dto;
    }

    private Supplier toEntity(SupplierDto dto) {
        Supplier e = new Supplier();
        e.setId(dto.getId());
        e.setName(dto.getName());
        e.setEmail(dto.getEmail());
        e.setPhone(dto.getPhone());
        return e;
    }
}


