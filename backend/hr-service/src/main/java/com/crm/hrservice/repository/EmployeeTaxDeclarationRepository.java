package com.crm.hrservice.repository;

import com.crm.hrservice.entity.EmployeeTaxDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for EmployeeTaxDeclaration entity
 */
@Repository
public interface EmployeeTaxDeclarationRepository extends JpaRepository<EmployeeTaxDeclaration, UUID> {

    Optional<EmployeeTaxDeclaration> findByTenantIdAndUserIdAndFinancialYear(
            UUID tenantId, UUID userId, String financialYear);

    List<EmployeeTaxDeclaration> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    List<EmployeeTaxDeclaration> findByTenantIdAndFinancialYear(UUID tenantId, String financialYear);

    List<EmployeeTaxDeclaration> findByTenantIdAndStatus(UUID tenantId, EmployeeTaxDeclaration.Status status);
}
