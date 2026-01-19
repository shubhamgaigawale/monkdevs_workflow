package com.crm.reportingservice.repository;

import com.crm.reportingservice.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<Report> findByTenantIdAndType(UUID tenantId, Report.ReportType type);
}
