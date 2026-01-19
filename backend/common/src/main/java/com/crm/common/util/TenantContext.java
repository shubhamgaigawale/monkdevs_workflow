package com.crm.common.util;

import java.util.UUID;

/**
 * ThreadLocal based tenant context holder
 * Allows easy access to current tenant ID throughout the request lifecycle
 */
public class TenantContext {

    private static final ThreadLocal<UUID> currentTenant = new ThreadLocal<>();

    public static void setTenantId(UUID tenantId) {
        currentTenant.set(tenantId);
    }

    public static UUID getTenantId() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
