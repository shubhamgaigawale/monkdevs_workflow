package com.crm.userservice.repository;

import com.crm.userservice.entity.TenantLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TenantLicense entity operations
 */
@Repository
public interface TenantLicenseRepository extends JpaRepository<TenantLicense, UUID> {

    /**
     * Find license by tenant ID
     */
    Optional<TenantLicense> findByTenantId(UUID tenantId);

    /**
     * Find license by license key
     */
    Optional<TenantLicense> findByLicenseKey(String licenseKey);

    /**
     * Find all active licenses
     */
    List<TenantLicense> findByIsActiveTrue();

    /**
     * Find licenses expiring within given days
     */
    @Query("SELECT tl FROM TenantLicense tl WHERE tl.expiryDate BETWEEN :now AND :endDate AND tl.isActive = true")
    List<TenantLicense> findLicensesExpiringBetween(
        @Param("now") LocalDateTime now,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find expired licenses (past expiry date but still active)
     */
    @Query("SELECT tl FROM TenantLicense tl WHERE tl.expiryDate < :now AND tl.isActive = true")
    List<TenantLicense> findExpiredActiveLicenses(@Param("now") LocalDateTime now);

    /**
     * Check if tenant has active license
     */
    @Query("SELECT CASE WHEN COUNT(tl) > 0 THEN true ELSE false END FROM TenantLicense tl " +
           "WHERE tl.tenantId = :tenantId AND tl.isActive = true AND tl.expiryDate > :now")
    boolean hasActiveLicense(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    /**
     * Count active licenses
     */
    long countByIsActiveTrue();

    /**
     * Find licenses by plan name
     */
    List<TenantLicense> findByPlanName(String planName);

    /**
     * Find licenses by billing cycle
     */
    List<TenantLicense> findByBillingCycle(String billingCycle);
}
