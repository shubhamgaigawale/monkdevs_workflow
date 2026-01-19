package com.crm.userservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.userservice.dto.CreateLicenseRequest;
import com.crm.userservice.dto.LicenseInfoDTO;
import com.crm.userservice.entity.TenantLicense;
import com.crm.userservice.service.LicenseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for license management endpoints
 */
@RestController
@RequestMapping("/license")
@RequiredArgsConstructor
@Slf4j
public class LicenseController {

    private final LicenseService licenseService;

    /**
     * Get license information for current tenant
     * Used by frontend to show subscription details and expiry warnings
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<LicenseInfoDTO>> getLicenseInfo(HttpServletRequest request) {
        UUID tenantId = (UUID) request.getAttribute("tenantId");
        log.info("Fetching license info for tenant: {}", tenantId);

        LicenseInfoDTO licenseInfo = licenseService.getLicenseInfo(tenantId);

        return ResponseEntity.ok(ApiResponse.success(licenseInfo));
    }

    /**
     * Create or update license for a tenant (Admin or Super Admin)
     */
    @PostMapping("/admin/tenants/{tenantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantLicense>> createOrUpdateLicense(
        @PathVariable UUID tenantId,
        @Valid @RequestBody CreateLicenseRequest request
    ) {
        log.info("Creating/updating license for tenant: {}", tenantId);

        TenantLicense license = licenseService.createOrUpdateLicense(tenantId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(license));
    }

    /**
     * Get all active licenses (Super Admin only)
     */
    @GetMapping("/admin/active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantLicense>>> getAllActiveLicenses() {
        log.info("Fetching all active licenses");

        List<TenantLicense> licenses = licenseService.getAllActiveLicenses();

        return ResponseEntity.ok(ApiResponse.success(licenses));
    }

    /**
     * Get licenses expiring soon (Super Admin only)
     */
    @GetMapping("/admin/expiring-soon")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantLicense>>> getLicensesExpiringSoon(
        @RequestParam(defaultValue = "30") int days
    ) {
        log.info("Fetching licenses expiring within {} days", days);

        List<TenantLicense> licenses = licenseService.getLicensesExpiringSoon(days);

        return ResponseEntity.ok(ApiResponse.success(licenses));
    }

    /**
     * Deactivate license for a tenant (Super Admin only)
     */
    @PostMapping("/admin/tenants/{tenantId}/deactivate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateLicense(@PathVariable UUID tenantId) {
        log.info("Deactivating license for tenant: {}", tenantId);

        licenseService.deactivateLicense(tenantId);

        return ResponseEntity.ok(ApiResponse.success("License deactivated successfully"));
    }

    /**
     * Check if tenant has reached user limit
     */
    @GetMapping("/user-limit-reached")
    public ResponseEntity<ApiResponse<Boolean>> hasReachedUserLimit(HttpServletRequest request) {
        UUID tenantId = (UUID) request.getAttribute("tenantId");

        boolean hasReached = licenseService.hasReachedUserLimit(tenantId);

        return ResponseEntity.ok(ApiResponse.success(hasReached));
    }
}
