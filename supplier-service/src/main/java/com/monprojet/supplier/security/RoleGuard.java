package com.monprojet.supplier.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class RoleGuard {
    public static final String HEADER_NAME = "X-ROLE";

    public void requireRole(String role) {
        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-ROLE header");
        }
    }

    public void requireAdmin(String role) {
        requireRole(role);
        if (!isAdmin(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }
    }

    public boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }

    public boolean isSupplier(String role) {
        return "SUPPLIER".equalsIgnoreCase(role);
    }

    public boolean isUser(String role) {
        return "USER".equalsIgnoreCase(role);
    }
}
