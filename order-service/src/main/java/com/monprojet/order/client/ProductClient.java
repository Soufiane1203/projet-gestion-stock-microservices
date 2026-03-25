package com.monprojet.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "product-service", path = "/products")
public interface ProductClient {
    @GetMapping("/{id}")
    Map<String, Object> getProduct(@PathVariable("id") Long id);
}


