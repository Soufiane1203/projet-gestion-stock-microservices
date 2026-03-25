package com.monprojet.notification.controller;

import com.monprojet.notification.security.RoleGuard;
import com.monprojet.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@Import(RoleGuard.class)
class NotificationControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @Test
    void userCannotPurgeAlerts() throws Exception {
        mockMvc.perform(delete("/notifications/alerts")
                        .header(RoleGuard.HEADER_NAME, "USER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanPurgeAlerts() throws Exception {
        mockMvc.perform(delete("/notifications/alerts")
                        .header(RoleGuard.HEADER_NAME, "ADMIN"))
                .andExpect(status().isOk());
    }
}
