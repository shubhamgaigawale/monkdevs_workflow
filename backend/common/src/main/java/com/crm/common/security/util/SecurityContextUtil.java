package com.crm.common.security.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.UUID;

public class SecurityContextUtil {

    public static UUID getTenantId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
            Object tenantId = details.get("tenantId");
            if (tenantId != null) {
                return UUID.fromString(tenantId.toString());
            }
        }
        throw new RuntimeException("Tenant ID not found in security context");
    }

    public static UUID getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            return UUID.fromString(authentication.getName());
        }
        throw new RuntimeException("User ID not found in security context");
    }

    public static String getUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }
}
