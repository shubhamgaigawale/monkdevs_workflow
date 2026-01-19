package com.crm.hrservice.repository;

import com.crm.hrservice.entity.TaxRegime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TaxRegime entity
 */
@Repository
public interface TaxRegimeRepository extends JpaRepository<TaxRegime, UUID> {

    List<TaxRegime> findByTenantIdAndFinancialYear(UUID tenantId, String financialYear);

    Optional<TaxRegime> findByTenantIdAndFinancialYearAndRegimeType(
            UUID tenantId, String financialYear, TaxRegime.RegimeType regimeType);

    Optional<TaxRegime> findByTenantIdAndFinancialYearAndIsDefaultTrue(UUID tenantId, String financialYear);
}
