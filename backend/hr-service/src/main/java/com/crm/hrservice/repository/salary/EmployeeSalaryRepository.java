package com.crm.hrservice.repository.salary;

import com.crm.hrservice.entity.EmployeeSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeSalaryRepository extends JpaRepository<EmployeeSalary, UUID> {

    List<EmployeeSalary> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    @Query("SELECT es FROM EmployeeSalary es WHERE es.tenantId = :tenantId AND es.userId = :userId " +
           "AND es.status = 'ACTIVE' AND es.effectiveFrom <= :date " +
           "AND (es.effectiveTo IS NULL OR es.effectiveTo >= :date)")
    Optional<EmployeeSalary> findActiveByUserIdAndDate(UUID tenantId, UUID userId, LocalDate date);

    Optional<EmployeeSalary> findByTenantIdAndUserIdAndStatus(
            UUID tenantId, UUID userId, EmployeeSalary.Status status);

    List<EmployeeSalary> findByTenantIdAndStatus(UUID tenantId, EmployeeSalary.Status status);
}
