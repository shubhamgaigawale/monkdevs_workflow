package com.crm.reportingservice.service;

import com.crm.common.security.util.SecurityContextUtil;
import com.crm.reportingservice.dto.ReportRequest;
import com.crm.reportingservice.entity.Report;
import com.crm.reportingservice.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportingService {

    private final ReportRepository reportRepository;

    @Transactional
    public Report generateReport(ReportRequest request) {
        UUID tenantId = SecurityContextUtil.getTenantId();
        String userId = SecurityContextUtil.getUserId().toString();

        // Mock report generation
        Map<String, Object> results = new HashMap<>();
        results.put("totalRecords", 100);
        results.put("period", request.getStartDate() + " to " + request.getEndDate());
        results.put("summary", "Report generated successfully");

        Report report = Report.builder()
                .name(request.getName())
                .type(request.getType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .results(results.toString())
                .generatedBy(userId)
                .build();

        report.setTenantId(tenantId);
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        UUID tenantId = SecurityContextUtil.getTenantId();
        return reportRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    public Report getReportById(UUID id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public List<Report> getReportsByType(Report.ReportType type) {
        UUID tenantId = SecurityContextUtil.getTenantId();
        return reportRepository.findByTenantIdAndType(tenantId, type);
    }
}
