package com.crm.userservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.userservice.dto.CreateLicenseRequest;
import com.crm.userservice.dto.LicenseInfoDTO;
import com.crm.userservice.dto.ModuleDTO;
import com.crm.userservice.entity.Module;
import com.crm.userservice.entity.TenantEnabledModule;
import com.crm.userservice.entity.TenantLicense;
import com.crm.userservice.repository.ModuleRepository;
import com.crm.userservice.repository.TenantEnabledModuleRepository;
import com.crm.userservice.repository.TenantLicenseRepository;
import com.crm.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing tenant licenses
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LicenseService {

    private final TenantLicenseRepository licenseRepository;
    private final ModuleRepository moduleRepository;
    private final TenantEnabledModuleRepository enabledModuleRepository;
    private final UserRepository userRepository;

    /**
     * Create or update license for a tenant
     */
    @Transactional
    public TenantLicense createOrUpdateLicense(UUID tenantId, CreateLicenseRequest request) {
        log.info("Creating/updating license for tenant: {}", tenantId);

        // Validate modules exist
        List<Module> requestedModules = moduleRepository.findByCodeIn(request.getModules());
        if (requestedModules.size() != request.getModules().size()) {
            throw new BadRequestException("One or more invalid module codes provided");
        }

        // Generate license key
        String licenseKey = generateLicenseKey(tenantId);

        // Create or update license
        TenantLicense license = licenseRepository.findByTenantId(tenantId)
            .orElse(new TenantLicense());

        license.setTenantId(tenantId);
        license.setLicenseKey(licenseKey);
        license.setPlanName(request.getPlanName());
        license.setUserLimit(request.getUserLimit());
        license.setIssueDate(LocalDateTime.now());
        license.setExpiryDate(request.getExpiryDate());
        license.setIsActive(true);
        license.setGracePeriodDays(request.getGracePeriodDays());
        license.setBillingCycle(request.getBillingCycle());

        license = licenseRepository.save(license);
        log.info("License saved with ID: {} for tenant: {}", license.getId(), tenantId);

        // Enable requested modules
        enableModulesForTenant(tenantId, request.getModules());

        return license;
    }

    /**
     * Enable modules for a tenant
     */
    @Transactional
    public void enableModulesForTenant(UUID tenantId, List<String> moduleCodes) {
        log.info("Enabling modules for tenant {}: {}", tenantId, moduleCodes);

        // Disable all existing modules
        enabledModuleRepository.deleteByTenantId(tenantId);

        // Enable core modules (always enabled)
        List<Module> coreModules = moduleRepository.findByIsCoreModuleTrue();
        for (Module module : coreModules) {
            enableModule(tenantId, module.getId());
        }

        // Enable requested modules
        for (String code : moduleCodes) {
            Module module = moduleRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + code));

            // Don't re-enable core modules
            if (!module.getIsCoreModule()) {
                enableModule(tenantId, module.getId());
            }
        }

        log.info("Enabled {} modules for tenant {}", moduleCodes.size(), tenantId);
    }

    /**
     * Enable a single module for a tenant
     */
    private void enableModule(UUID tenantId, UUID moduleId) {
        TenantEnabledModule enabledModule = new TenantEnabledModule();
        enabledModule.setTenantId(tenantId);
        enabledModule.setModuleId(moduleId);
        enabledModule.setIsEnabled(true);
        enabledModule.setEnabledAt(LocalDateTime.now());
        enabledModule.setCreatedAt(LocalDateTime.now());
        enabledModuleRepository.save(enabledModule);
    }

    /**
     * Get license info for current tenant
     */
    public LicenseInfoDTO getLicenseInfo(UUID tenantId) {
        log.debug("Fetching license info for tenant: {}", tenantId);

        TenantLicense license = licenseRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("No license found for tenant"));

        LicenseInfoDTO dto = new LicenseInfoDTO();
        dto.setPlanName(license.getPlanName());
        dto.setExpiryDate(license.getExpiryDate().toLocalDate());
        dto.setDaysUntilExpiry(license.getDaysUntilExpiry());
        dto.setUserLimit(license.getUserLimit());
        dto.setCurrentUsers(countUsersForTenant(tenantId));

        // Get enabled module codes
        List<String> enabledModuleCodes = getEnabledModuleCodesForTenant(tenantId);
        dto.setEnabledModules(enabledModuleCodes);

        // Determine status
        if (license.isExpired()) {
            if (license.isInGracePeriod()) {
                dto.setStatus("GRACE_PERIOD");
                dto.setGracePeriodActive(true);
                dto.setGracePeriodDaysRemaining(license.getGracePeriodDaysRemaining());
            } else {
                dto.setStatus("EXPIRED");
                dto.setGracePeriodActive(false);
                dto.setGracePeriodDaysRemaining(0L);
            }
        } else {
            dto.setStatus("ACTIVE");
            dto.setGracePeriodActive(false);
            dto.setGracePeriodDaysRemaining((long) license.getGracePeriodDays());
        }

        return dto;
    }

    /**
     * Get enabled module codes for a tenant
     */
    public List<String> getEnabledModuleCodesForTenant(UUID tenantId) {
        List<TenantEnabledModule> enabledModules = enabledModuleRepository.findByTenantIdAndIsEnabledTrue(tenantId);

        return enabledModules.stream()
            .map(em -> {
                return moduleRepository.findById(em.getModuleId())
                    .map(Module::getCode)
                    .orElse(null);
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    /**
     * Get enabled modules with full details for a tenant
     */
    public List<ModuleDTO> getEnabledModulesWithDetails(UUID tenantId) {
        log.debug("Fetching enabled modules for tenant: {}", tenantId);

        List<TenantEnabledModule> enabledModules = enabledModuleRepository.findByTenantIdAndIsEnabledTrue(tenantId);

        return enabledModules.stream()
            .map(em -> {
                Module module = moduleRepository.findById(em.getModuleId()).orElse(null);
                if (module == null) return null;

                ModuleDTO dto = new ModuleDTO();
                dto.setId(module.getId());
                dto.setCode(module.getCode());
                dto.setName(module.getName());
                dto.setDescription(module.getDescription());
                dto.setIcon(module.getIcon());
                dto.setDisplayOrder(module.getDisplayOrder());
                dto.setIsEnabled(em.getIsEnabled());
                dto.setIsCoreModule(module.getIsCoreModule());
                dto.setBasePrice(module.getBasePrice());
                dto.setRequiredPermissions(module.getRequiredPermissions());
                return dto;
            })
            .filter(Objects::nonNull)
            .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
            .collect(Collectors.toList());
    }

    /**
     * Check if a module is enabled for a tenant by module code
     */
    public boolean isModuleEnabledForTenant(UUID tenantId, String moduleCode) {
        return enabledModuleRepository.isModuleCodeEnabledForTenant(tenantId, moduleCode);
    }

    /**
     * Disable all non-core modules for a tenant (used when license expires)
     */
    @Transactional
    public void disableNonCoreModules(UUID tenantId) {
        log.warn("Disabling all non-core modules for tenant: {}", tenantId);
        enabledModuleRepository.disableAllNonCoreModulesForTenant(tenantId);
    }

    /**
     * Deactivate license (mark as inactive)
     */
    @Transactional
    public void deactivateLicense(UUID tenantId) {
        log.warn("Deactivating license for tenant: {}", tenantId);

        TenantLicense license = licenseRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("No license found for tenant"));

        license.setIsActive(false);
        licenseRepository.save(license);

        // Also disable all non-core modules
        disableNonCoreModules(tenantId);
    }

    /**
     * Check if tenant has reached user limit
     */
    public boolean hasReachedUserLimit(UUID tenantId) {
        TenantLicense license = licenseRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("No license found for tenant"));

        int currentUsers = countUsersForTenant(tenantId);
        return currentUsers >= license.getUserLimit();
    }

    /**
     * Get all active licenses (for admin)
     */
    public List<TenantLicense> getAllActiveLicenses() {
        return licenseRepository.findByIsActiveTrue();
    }

    /**
     * Get licenses expiring soon (within given days)
     */
    public List<TenantLicense> getLicensesExpiringSoon(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(days);
        return licenseRepository.findLicensesExpiringBetween(now, endDate);
    }

    /**
     * Get expired licenses (past expiry but still active)
     */
    public List<TenantLicense> getExpiredActiveLicenses() {
        return licenseRepository.findExpiredActiveLicenses(LocalDateTime.now());
    }

    /**
     * Generate a unique license key for a tenant
     */
    private String generateLicenseKey(UUID tenantId) {
        String tenantPrefix = tenantId.toString().substring(0, 8).toUpperCase();
        long timestamp = System.currentTimeMillis();
        return String.format("LIC-%s-%d", tenantPrefix, timestamp);
    }

    /**
     * Count active users for a tenant
     */
    private int countUsersForTenant(UUID tenantId) {
        return userRepository.findActiveUsersByTenantId(tenantId).size();
    }
}
