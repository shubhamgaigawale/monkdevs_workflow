package com.crm.userservice.repository;

import com.crm.userservice.entity.TenantBranding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TenantBranding entity operations
 */
@Repository
public interface TenantBrandingRepository extends JpaRepository<TenantBranding, UUID> {

    /**
     * Find branding by tenant ID
     */
    Optional<TenantBranding> findByTenantId(UUID tenantId);

    /**
     * Check if branding exists for tenant
     */
    boolean existsByTenantId(UUID tenantId);

    /**
     * Delete branding by tenant ID
     */
    void deleteByTenantId(UUID tenantId);
}
