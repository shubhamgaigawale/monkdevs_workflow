package com.crm.hrservice.repository;

import com.crm.hrservice.entity.PerformanceMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceMetricRepository extends JpaRepository<PerformanceMetric, UUID> {

    List<PerformanceMetric> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    List<PerformanceMetric> findByTenantIdAndUserIdAndPeriodType(
            UUID tenantId, UUID userId, PerformanceMetric.PeriodType periodType);

    List<PerformanceMetric> findByTenantIdAndUserIdAndPeriodStartBetween(
            UUID tenantId, UUID userId, LocalDate start, LocalDate end);

    List<PerformanceMetric> findByTenantIdAndPeriodStartBetween(
            UUID tenantId, LocalDate start, LocalDate end);
}
