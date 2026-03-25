package com.monprojet.stock.batch;

import com.monprojet.stock.model.Stock;
import com.monprojet.stock.repository.StockRepository;
import com.monprojet.stock.service.StockService;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;

@Configuration
@EnableScheduling
public class StockBatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final StockRepository stockRepository;
    private final StockService stockService;
    private final JobLauncher jobLauncher;

    public StockBatchConfig(JobRepository jobRepository,
                            PlatformTransactionManager transactionManager,
                            StockRepository stockRepository,
                            StockService stockService,
                            JobLauncher jobLauncher) {
        this.jobRepository = jobRepository;
        this.transactionManager = transactionManager;
        this.stockRepository = stockRepository;
        this.stockService = stockService;
        this.jobLauncher = jobLauncher;
    }

    @Bean
    public Job criticalStockJob() {
        return new JobBuilder("criticalStockJob", jobRepository)
                .start(checkCriticalStockStep())
                .build();
    }

    @Bean
    public Step checkCriticalStockStep() {
        Tasklet tasklet = (contribution, chunkContext) -> {
            List<Stock> all = stockRepository.findAll();
            for (Stock s : all) {
                stockService.emitAlertIfCritical(s);
            }
            return RepeatStatus.FINISHED;
        };
        
        return new StepBuilder("checkCriticalStockStep", jobRepository)
                .tasklet(tasklet, transactionManager)
                .build();
    }

    // Planification quotidienne à 8h (heure locale)
    @Scheduled(cron = "0 0 8 * * *")
    public void runDaily() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addLong("timestamp", System.currentTimeMillis())
                .toJobParameters();
        jobLauncher.run(criticalStockJob(), params);
    }
}


