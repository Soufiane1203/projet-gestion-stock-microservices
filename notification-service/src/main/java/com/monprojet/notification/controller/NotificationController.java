package com.monprojet.notification.controller;

import com.monprojet.notification.security.RoleGuard;
import com.monprojet.notification.service.NotificationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final RoleGuard roleGuard;

    public NotificationController(NotificationService notificationService, RoleGuard roleGuard) {
        this.notificationService = notificationService;
        this.roleGuard = roleGuard;
    }

    @GetMapping("/alerts")
    public List<String> lastAlerts() {
        return notificationService.getLastAlerts();
    }

    @DeleteMapping("/alerts")
    public void clearAlerts(@RequestHeader(value = RoleGuard.HEADER_NAME, required = false) String role) {
        roleGuard.requireAdmin(role);
        notificationService.clearAlerts();
    }
}


