package com.crm.hrservice.repository;

import com.crm.hrservice.entity.KpiData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface KpiDataRepository extends JpaRepository<KpiData, UUID> {

    List<KpiData> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    List<KpiData> findByTenantIdAndUserIdAndPeriodStartBetween(
            UUID tenantId, UUID userId, LocalDate start, LocalDate end);

    List<KpiData> findByTenantIdAndPeriodStartBetween(
            UUID tenantId, LocalDate start, LocalDate end);
}
