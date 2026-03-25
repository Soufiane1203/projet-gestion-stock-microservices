package com.monprojet.notification.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

@Service
public class NotificationService {

    private final LinkedList<String> lastAlerts = new LinkedList<>();

    @KafkaListener(topics = "stock-alerts", groupId = "notification-service")
    public void onStockAlert(String message) {
        if (lastAlerts.size() > 50) {
            lastAlerts.removeFirst();
        }
        lastAlerts.add(message);
    }

    public List<String> getLastAlerts() {
        return Collections.unmodifiableList(lastAlerts);
    }

    public void clearAlerts() {
        lastAlerts.clear();
    }
}


