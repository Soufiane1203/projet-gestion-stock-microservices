package com.monprojet.stock.service;

import com.monprojet.stock.dto.StockDto;
import com.monprojet.stock.model.Stock;
import com.monprojet.stock.repository.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StockService {
    private static final Logger log = LoggerFactory.getLogger(StockService.class);
    private final StockRepository stockRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private static final String ALERT_TOPIC = "stock-alerts";

    public StockService(StockRepository stockRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.stockRepository = stockRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public List<StockDto> findAll() {
        return stockRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public StockDto findById(Long id) { return toDto(stockRepository.findById(id).orElseThrow()); }

    public StockDto create(StockDto dto) {
        Stock e = toEntity(dto);
        e.setId(null);
        Stock saved = stockRepository.save(e);
        emitAlertIfCritical(saved);
        return toDto(saved);
    }

    public StockDto update(Long id, StockDto dto) {
        Stock e = stockRepository.findById(id).orElseThrow();
        e.setProductId(dto.getProductId());
        e.setQuantity(dto.getQuantity());
        e.setCriticalThreshold(dto.getCriticalThreshold());
        Stock saved = stockRepository.save(e);
        emitAlertIfCritical(saved);
        return toDto(saved);
    }

    public void delete(Long id) { stockRepository.deleteById(id); }

    public void emitAlertIfCritical(Stock stock) {
        if (stock.getQuantity() <= stock.getCriticalThreshold()) {
            String message = "ALERT: productId=" + stock.getProductId() + ", quantity=" + stock.getQuantity();
            try {
                kafkaTemplate.send(ALERT_TOPIC, message);
                log.info("Alert sent to Kafka: {}", message);
            } catch (Exception ex) {
                log.warn("Failed to publish stock alert for product {}", stock.getProductId(), ex);
            }
        }
    }

    public int emitAlertsForAllCriticalStocks() {
        List<Stock> allStocks = stockRepository.findAll();
        int count = 0;
        for (Stock stock : allStocks) {
            if (stock.getQuantity() <= stock.getCriticalThreshold()) {
                emitAlertIfCritical(stock);
                count++;
            }
        }
        log.info("Emitted {} critical stock alerts", count);
        return count;
    }

    private StockDto toDto(Stock e) {
        StockDto dto = new StockDto();
        dto.setId(e.getId());
        dto.setProductId(e.getProductId());
        dto.setQuantity(e.getQuantity());
        dto.setCriticalThreshold(e.getCriticalThreshold());
        return dto;
    }

    private Stock toEntity(StockDto dto) {
        Stock e = new Stock();
        e.setId(dto.getId());
        e.setProductId(dto.getProductId());
        e.setQuantity(dto.getQuantity());
        e.setCriticalThreshold(dto.getCriticalThreshold());
        return e;
    }
}


