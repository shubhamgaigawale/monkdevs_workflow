package com.crm.hrservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.hrservice.dto.response.AttendanceDTO;
import com.crm.hrservice.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Attendance controller
 * Handles attendance records and reporting
 */
@Slf4j
@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Attendance", description = "Attendance management and reporting")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/today")
    @Operation(summary = "Get today's attendance", description = "Get attendance record for today")
    public ResponseEntity<ApiResponse<AttendanceDTO>> getTodayAttendance(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.debug("Get today's attendance for user: {}", userId);
        AttendanceDTO attendance = attendanceService.getAttendance(userId, tenantId, LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get attendance by date", description = "Get attendance record for specific date")
    public ResponseEntity<ApiResponse<AttendanceDTO>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.debug("Get attendance for user: {} on date: {}", userId, date);
        AttendanceDTO attendance = attendanceService.getAttendance(userId, tenantId, date);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/range")
    @Operation(summary = "Get attendance range", description = "Get attendance records for date range")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.debug("Get attendance for user: {} from {} to {}", userId, startDate, endDate);
        List<AttendanceDTO> attendance = attendanceService.getAttendanceRange(userId, tenantId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Get team attendance", description = "Get attendance for all team members (Admin/Supervisor only)")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getTeamAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.debug("Get team attendance for tenant: {} from {} to {}", tenantId, startDate, endDate);
        List<AttendanceDTO> attendance = attendanceService.getTeamAttendance(tenantId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @PostMapping("/calculate/{date}")
    @Operation(summary = "Calculate attendance", description = "Calculate and save attendance for a specific date")
    public ResponseEntity<ApiResponse<AttendanceDTO>> calculateAttendance(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Calculate attendance for user: {} on date: {}", userId, date);
        AttendanceDTO attendance = attendanceService.calculateAttendance(userId, tenantId, date);
        return ResponseEntity.ok(ApiResponse.success("Attendance calculated", attendance));
    }
}
