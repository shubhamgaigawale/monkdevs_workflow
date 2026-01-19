package com.crm.hrservice.repository;

import com.crm.hrservice.entity.TaxCalculation;
import com.crm.hrservice.entity.TaxRegime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TaxCalculation entity
 */
@Repository
public interface TaxCalculationRepository extends JpaRepository<TaxCalculation, UUID> {

    Optional<TaxCalculation> findByTenantIdAndUserIdAndFinancialYearAndRegimeType(
            UUID tenantId, UUID userId, String financialYear, TaxRegime.RegimeType regimeType);

    List<TaxCalculation> findByTenantIdAndUserIdAndFinancialYear(
            UUID tenantId, UUID userId, String financialYear);

    List<TaxCalculation> findByTenantIdAndUserId(UUID tenantId, UUID userId);
}
