package com.monprojet.order.repository;

import com.monprojet.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findBySupplierId(Long supplierId);
}


