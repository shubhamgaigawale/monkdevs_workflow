package com.crm.userservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.userservice.dto.ModuleDTO;
import com.crm.userservice.service.LicenseService;
import com.crm.userservice.service.ModuleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for module-related endpoints
 */
@RestController
@RequestMapping("/modules")
@RequiredArgsConstructor
@Slf4j
public class ModuleController {

    private final ModuleService moduleService;
    private final LicenseService licenseService;

    /**
     * Get enabled modules for current tenant
     * Used by frontend to dynamically render menu based on subscription
     */
    @GetMapping("/enabled")
    public ResponseEntity<ApiResponse<List<ModuleDTO>>> getEnabledModules(HttpServletRequest request) {
        UUID tenantId = (UUID) request.getAttribute("tenantId");
        log.info("Fetching enabled modules for tenant: {}", tenantId);

        List<ModuleDTO> enabledModules = licenseService.getEnabledModulesWithDetails(tenantId);

        return ResponseEntity.ok(ApiResponse.success(enabledModules));
    }

    /**
     * Get all available modules (for admin/super admin)
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ModuleDTO>>> getAllModules() {
        log.info("Fetching all available modules");

        List<ModuleDTO> modules = moduleService.getAllModules();

        return ResponseEntity.ok(ApiResponse.success(modules));
    }

    /**
     * Get subscribable modules (non-core modules that can be purchased)
     */
    @GetMapping("/subscribable")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ModuleDTO>>> getSubscribableModules() {
        log.info("Fetching subscribable modules");

        List<ModuleDTO> modules = moduleService.getSubscribableModules();

        return ResponseEntity.ok(ApiResponse.success(modules));
    }

    /**
     * Internal endpoint: Check if module is enabled for tenant (used by API Gateway)
     */
    @GetMapping("/internal/tenants/{tenantId}/modules/{moduleCode}/enabled")
    public ResponseEntity<Boolean> isModuleEnabled(
        @PathVariable UUID tenantId,
        @PathVariable String moduleCode
    ) {
        boolean isEnabled = licenseService.isModuleEnabledForTenant(tenantId, moduleCode);
        return ResponseEntity.ok(isEnabled);
    }
}
