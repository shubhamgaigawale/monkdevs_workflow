package com.crm.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing custom branding settings for a tenant.
 * Allows each tenant to customize the look and feel of their portal.
 */
@Entity
@Table(name = "tenant_branding", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantBranding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Column(name = "portal_name")
    private String portalName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "favicon_url", length = 500)
    private String faviconUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor; // Hex color code (e.g., #0066CC)

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor;

    @Column(name = "font_family", length = 100)
    private String fontFamily;

    @Column(name = "timezone", length = 100)
    private String timezone = "UTC";

    @Column(name = "date_format", length = 20)
    private String dateFormat = "YYYY-MM-DD";

    @Column(name = "time_format", length = 20)
    private String timeFormat = "HH:mm";

    @Column(name = "currency", length = 10)
    private String currency = "USD";

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if custom colors are configured
     */
    public boolean hasCustomColors() {
        return primaryColor != null && !primaryColor.isEmpty();
    }

    /**
     * Check if custom logo is configured
     */
    public boolean hasCustomLogo() {
        return logoUrl != null && !logoUrl.isEmpty();
    }
}
