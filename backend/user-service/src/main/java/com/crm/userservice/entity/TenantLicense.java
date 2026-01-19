package com.crm.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a tenant's license information.
 * Each tenant has one license that determines which modules they can access,
 * how many users they can have, and when their subscription expires.
 */
@Entity
@Table(name = "tenant_licenses", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Column(name = "license_key", unique = true, nullable = false)
    private String licenseKey;

    @Column(name = "plan_name", length = 100)
    private String planName; // BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM

    @Column(name = "user_limit", nullable = false)
    private Integer userLimit = 10;

    @Column(name = "issue_date", nullable = false)
    private LocalDateTime issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "grace_period_days")
    private Integer gracePeriodDays = 15;

    @Column(name = "billing_cycle", length = 20)
    private String billingCycle; // MONTHLY, YEARLY, LIFETIME

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (issueDate == null) {
            issueDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if license is expired (past expiry date)
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    /**
     * Check if license is in grace period (expired but within grace days)
     */
    public boolean isInGracePeriod() {
        if (!isExpired()) {
            return false;
        }
        LocalDateTime gracePeriodEnd = expiryDate.plusDays(gracePeriodDays != null ? gracePeriodDays : 0);
        return LocalDateTime.now().isBefore(gracePeriodEnd);
    }

    /**
     * Get days remaining in grace period (negative if expired beyond grace period)
     */
    public long getGracePeriodDaysRemaining() {
        if (!isExpired()) {
            return gracePeriodDays != null ? gracePeriodDays : 0;
        }
        LocalDateTime gracePeriodEnd = expiryDate.plusDays(gracePeriodDays != null ? gracePeriodDays : 0);
        long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), gracePeriodEnd);
        return Math.max(0, daysRemaining);
    }

    /**
     * Get days until expiry (negative if already expired)
     */
    public long getDaysUntilExpiry() {
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now().toLocalDate(), expiryDate.toLocalDate());
    }
}
