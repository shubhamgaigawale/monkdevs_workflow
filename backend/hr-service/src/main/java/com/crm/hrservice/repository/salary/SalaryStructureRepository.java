package com.crm.hrservice.repository.salary;

import com.crm.hrservice.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, UUID> {

    List<SalaryStructure> findByTenantIdAndStatus(UUID tenantId, SalaryStructure.Status status);

    List<SalaryStructure> findByTenantId(UUID tenantId);

    Optional<SalaryStructure> findByTenantIdAndId(UUID tenantId, UUID id);

    List<SalaryStructure> findByTenantIdAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(
            UUID tenantId, LocalDate effectiveFrom, LocalDate effectiveTo);
}
