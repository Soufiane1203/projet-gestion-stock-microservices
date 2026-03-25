package com.monprojet.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "supplier-service", path = "/suppliers")
public interface SupplierClient {
    @GetMapping("/{id}")
    Map<String, Object> getSupplier(@PathVariable("id") Long id);
}


