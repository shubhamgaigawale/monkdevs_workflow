package com.crm.reportingservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.reportingservice.dto.ReportRequest;
import com.crm.reportingservice.entity.Report;
import com.crm.reportingservice.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Analytics and reporting")
public class ReportingController {

    private final ReportingService reportingService;

    @PostMapping("/generate")
    @Operation(summary = "Generate a new report")
    public ResponseEntity<ApiResponse<Report>> generateReport(@RequestBody ReportRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.generateReport(request)));
    }

    @GetMapping
    @Operation(summary = "Get all reports")
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports() {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getAllReports()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report by ID")
    public ResponseEntity<ApiResponse<Report>> getReportById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getReportById(id)));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get reports by type")
    public ResponseEntity<ApiResponse<List<Report>>> getReportsByType(@PathVariable Report.ReportType type) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getReportsByType(type)));
    }
}
