package com.monprojet.stock.repository;

import com.monprojet.stock.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByQuantityLessThanEqual(Integer quantity);
}


