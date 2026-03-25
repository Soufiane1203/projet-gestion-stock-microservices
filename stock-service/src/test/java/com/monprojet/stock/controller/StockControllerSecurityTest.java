package com.monprojet.stock.controller;

import com.monprojet.stock.security.RoleGuard;
import com.monprojet.stock.service.StockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class StockControllerSecurityTest {

    private MockMvc mockMvc;

    @Mock
    private StockService stockService;

    @Mock
    private JobLauncher jobLauncher;

    @Mock
    private Job criticalStockJob;

    private final RoleGuard roleGuard = new RoleGuard();

    @BeforeEach
    void setUp() {
        StockController controller = new StockController(stockService, jobLauncher, criticalStockJob, roleGuard);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void userCannotTriggerBatch() throws Exception {
        mockMvc.perform(post("/stocks/trigger-batch")
                        .header(RoleGuard.HEADER_NAME, "USER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanTriggerBatch() throws Exception {
        when(jobLauncher.run(any(Job.class), any())).thenReturn(new JobExecution(1L));

        mockMvc.perform(post("/stocks/trigger-batch")
                        .header(RoleGuard.HEADER_NAME, "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
