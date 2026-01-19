package com.crm.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing which modules are enabled for a specific tenant.
 * Junction table between tenants and modules with additional metadata.
 */
@Entity
@Table(name = "tenant_enabled_modules", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantEnabledModule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "module_id", nullable = false)
    private UUID moduleId;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    @Column(name = "enabled_at", nullable = false)
    private LocalDateTime enabledAt;

    @Column(name = "disabled_at")
    private LocalDateTime disabledAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (enabledAt == null && isEnabled) {
            enabledAt = LocalDateTime.now();
        }
    }

    /**
     * Disable this module for the tenant
     */
    public void disable() {
        this.isEnabled = false;
        this.disabledAt = LocalDateTime.now();
    }

    /**
     * Enable this module for the tenant
     */
    public void enable() {
        this.isEnabled = true;
        this.enabledAt = LocalDateTime.now();
        this.disabledAt = null;
    }
}
