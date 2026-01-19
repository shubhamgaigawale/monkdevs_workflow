package com.crm.hrservice.repository.salary;

import com.crm.hrservice.entity.SalarySlip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalarySlipRepository extends JpaRepository<SalarySlip, UUID> {

    Page<SalarySlip> findByTenantIdAndUserId(UUID tenantId, UUID userId, Pageable pageable);

    List<SalarySlip> findByTenantIdAndUserIdOrderByYearDescMonthDesc(UUID tenantId, UUID userId);

    Optional<SalarySlip> findByTenantIdAndUserIdAndMonthAndYear(
            UUID tenantId, UUID userId, Integer month, Integer year);

    List<SalarySlip> findByTenantIdAndMonthAndYearAndStatus(
            UUID tenantId, Integer month, Integer year, SalarySlip.Status status);

    List<SalarySlip> findByTenantIdAndStatus(UUID tenantId, SalarySlip.Status status);

    boolean existsByTenantIdAndUserIdAndMonthAndYear(
            UUID tenantId, UUID userId, Integer month, Integer year);
}
