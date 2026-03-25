package com.monprojet.stock.controller;

import com.monprojet.stock.dto.StockDto;
import com.monprojet.stock.security.RoleGuard;
import com.monprojet.stock.service.StockService;
import jakarta.validation.Valid;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks")
public class StockController {
    private final StockService stockService;
    private final JobLauncher jobLauncher;
    private final Job criticalStockJob;
    private final RoleGuard roleGuard;

    public StockController(StockService stockService,
                          JobLauncher jobLauncher,
                          Job criticalStockJob,
                          RoleGuard roleGuard) {
        this.stockService = stockService;
        this.jobLauncher = jobLauncher;
        this.criticalStockJob = criticalStockJob;
        this.roleGuard = roleGuard;
    }

    @GetMapping
    public List<StockDto> all(@RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        return stockService.findAll();
    }

    @GetMapping("/{id}")
    public StockDto byId(@PathVariable("id") Long id,
                         @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireRole(role);
        return stockService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockDto create(@RequestBody @Valid StockDto dto,
                           @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        return stockService.create(dto);
    }

    @PutMapping("/{id}")
    public StockDto update(@PathVariable("id") Long id,
                           @RequestBody @Valid StockDto dto,
                           @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        return stockService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id,
                       @RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        stockService.delete(id);
    }

    /**
     * Endpoint pour déclencher manuellement le job Spring Batch de vérification des stocks critiques.
     * Utile pour les tests et démonstrations.
     */
    @PostMapping("/trigger-batch")
    public ResponseEntity<String> triggerBatch(@RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(criticalStockJob, params);
            return ResponseEntity.ok("Batch job déclenché avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du déclenchement du batch: " + e.getMessage());
        }
    }

    /**
     * Endpoint pour tester l'émission d'alertes Kafka pour tous les stocks critiques.
     * Utile pour vérifier que Kafka fonctionne correctement.
     */
    @PostMapping("/test-alerts")
    public ResponseEntity<String> testAlerts(@RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        int count = stockService.emitAlertsForAllCriticalStocks();
        return ResponseEntity.ok("Alertes envoyées pour " + count + " stock(s) critique(s)");
    }
}


