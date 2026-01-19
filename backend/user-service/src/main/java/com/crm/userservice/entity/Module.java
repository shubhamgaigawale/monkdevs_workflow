package com.crm.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a module available in the system.
 * Modules are shared across all tenants but can be enabled/disabled per tenant.
 * Examples: HRMS, SALES, BILLING, REPORTS, SUPPORT, INTEGRATIONS
 */
@Entity
@Table(name = "modules", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code; // DASHBOARD, HRMS, SALES, etc.

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "icon", length = 100)
    private String icon; // Lucide icon name

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_core_module", nullable = false)
    private Boolean isCoreModule = false;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice; // Monthly price

    @Column(name = "required_permissions", columnDefinition = "jsonb")
    private String requiredPermissionsString; // JSONB stored as String

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private List<String> requiredPermissions;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        // Convert list to string before persisting
        if (requiredPermissions != null) {
            requiredPermissionsString = String.join(",", requiredPermissions);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Convert list to string before updating
        if (requiredPermissions != null) {
            requiredPermissionsString = String.join(",", requiredPermissions);
        }
    }

    @PostLoad
    protected void onLoad() {
        // Convert string to list after loading
        if (requiredPermissionsString != null && !requiredPermissionsString.isEmpty()) {
            requiredPermissions = Arrays.asList(requiredPermissionsString.split(","));
        } else {
            requiredPermissions = Collections.emptyList();
        }
    }

    /**
     * Check if this module requires specific permissions
     */
    public boolean hasRequiredPermissions() {
        return requiredPermissions != null && !requiredPermissions.isEmpty();
    }

    /**
     * Check if a given permission is required for this module
     */
    public boolean requiresPermission(String permission) {
        return requiredPermissions != null && requiredPermissions.contains(permission);
    }
}
