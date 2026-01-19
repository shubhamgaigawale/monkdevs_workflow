package com.crm.userservice.repository;

import com.crm.userservice.entity.TenantEnabledModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TenantEnabledModule entity operations
 */
@Repository
public interface TenantEnabledModuleRepository extends JpaRepository<TenantEnabledModule, UUID> {

    /**
     * Find all enabled modules for a tenant
     */
    List<TenantEnabledModule> findByTenantIdAndIsEnabledTrue(UUID tenantId);

    /**
     * Find all modules (enabled or disabled) for a tenant
     */
    List<TenantEnabledModule> findByTenantId(UUID tenantId);

    /**
     * Find specific module for a tenant
     */
    Optional<TenantEnabledModule> findByTenantIdAndModuleId(UUID tenantId, UUID moduleId);

    /**
     * Check if module is enabled for tenant
     */
    @Query("SELECT CASE WHEN COUNT(tem) > 0 THEN true ELSE false END FROM TenantEnabledModule tem " +
           "WHERE tem.tenantId = :tenantId AND tem.moduleId = :moduleId AND tem.isEnabled = true")
    boolean isModuleEnabledForTenant(@Param("tenantId") UUID tenantId, @Param("moduleId") UUID moduleId);

    /**
     * Check if module is enabled by module code
     */
    @Query("SELECT CASE WHEN COUNT(tem) > 0 THEN true ELSE false END FROM TenantEnabledModule tem " +
           "JOIN Module m ON tem.moduleId = m.id " +
           "WHERE tem.tenantId = :tenantId AND m.code = :moduleCode AND tem.isEnabled = true")
    boolean isModuleCodeEnabledForTenant(@Param("tenantId") UUID tenantId, @Param("moduleCode") String moduleCode);

    /**
     * Count enabled modules for a tenant
     */
    long countByTenantIdAndIsEnabledTrue(UUID tenantId);

    /**
     * Delete all modules for a tenant (used when reassigning modules)
     */
    @Modifying
    @Query("DELETE FROM TenantEnabledModule tem WHERE tem.tenantId = :tenantId")
    void deleteByTenantId(@Param("tenantId") UUID tenantId);

    /**
     * Disable all non-core modules for a tenant (used when license expires)
     */
    @Modifying
    @Query("UPDATE TenantEnabledModule tem SET tem.isEnabled = false, tem.disabledAt = CURRENT_TIMESTAMP " +
           "WHERE tem.tenantId = :tenantId AND tem.moduleId IN " +
           "(SELECT m.id FROM Module m WHERE m.isCoreModule = false)")
    void disableAllNonCoreModulesForTenant(@Param("tenantId") UUID tenantId);

    /**
     * Find all tenants that have a specific module enabled
     */
    @Query("SELECT DISTINCT tem.tenantId FROM TenantEnabledModule tem " +
           "WHERE tem.moduleId = :moduleId AND tem.isEnabled = true")
    List<UUID> findTenantsWithModuleEnabled(@Param("moduleId") UUID moduleId);

    /**
     * Get enabled modules with module details for a tenant
     */
    @Query("SELECT tem FROM TenantEnabledModule tem " +
           "JOIN FETCH Module m ON tem.moduleId = m.id " +
           "WHERE tem.tenantId = :tenantId AND tem.isEnabled = true " +
           "ORDER BY m.displayOrder ASC")
    List<TenantEnabledModule> findEnabledModulesWithDetails(@Param("tenantId") UUID tenantId);
}
