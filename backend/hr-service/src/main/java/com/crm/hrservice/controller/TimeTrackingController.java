package com.crm.hrservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.hrservice.dto.request.TimeEntryRequest;
import com.crm.hrservice.dto.response.TimeEntryDTO;
import com.crm.hrservice.service.TimeTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Time tracking controller
 * Handles clock in/out, breaks, and time entry queries
 */
@Slf4j
@RestController
@RequestMapping("/time")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Time Tracking", description = "Time tracking and clock in/out operations")
public class TimeTrackingController {

    private final TimeTrackingService timeTrackingService;

    @PostMapping("/clock-in")
    @Operation(summary = "Clock in", description = "Record clock in time")
    public ResponseEntity<ApiResponse<TimeEntryDTO>> clockIn(
            @Valid @RequestBody TimeEntryRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Clock in request for user: {}", userId);
        TimeEntryDTO entry = timeTrackingService.clockIn(userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Clocked in successfully", entry));
    }

    @PostMapping("/clock-out")
    @Operation(summary = "Clock out", description = "Record clock out time")
    public ResponseEntity<ApiResponse<TimeEntryDTO>> clockOut(
            @Valid @RequestBody TimeEntryRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Clock out request for user: {}", userId);
        TimeEntryDTO entry = timeTrackingService.clockOut(userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Clocked out successfully", entry));
    }

    @PostMapping("/break-start")
    @Operation(summary = "Start break", description = "Record break start time")
    public ResponseEntity<ApiResponse<TimeEntryDTO>> startBreak(
            @Valid @RequestBody TimeEntryRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Start break request for user: {}", userId);
        TimeEntryDTO entry = timeTrackingService.startBreak(userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Break started", entry));
    }

    @PostMapping("/break-end")
    @Operation(summary = "End break", description = "Record break end time")
    public ResponseEntity<ApiResponse<TimeEntryDTO>> endBreak(
            @Valid @RequestBody TimeEntryRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("End break request for user: {}", userId);
        TimeEntryDTO entry = timeTrackingService.endBreak(userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Break ended", entry));
    }

    @GetMapping("/status")
    @Operation(summary = "Get current status", description = "Get current clock in/out status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentStatus(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        String status = timeTrackingService.getCurrentStatus(userId, tenantId);
        TimeEntryDTO latestEntry = timeTrackingService.getLatestEntry(userId, tenantId);
        int todayHours = timeTrackingService.getTodayHours(userId, tenantId);
        int breakTime = timeTrackingService.getTodayBreakTime(userId, tenantId);

        Map<String, Object> response = new HashMap<>();
        response.put("currentStatus", status);
        response.put("currentEntry", latestEntry);
        response.put("todayHours", todayHours);
        response.put("breakTime", breakTime);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/entries")
    @Operation(summary = "Get time entries", description = "Get all time entries for current user")
    public ResponseEntity<ApiResponse<List<TimeEntryDTO>>> getTimeEntries(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.debug("Get time entries for user: {}", userId);
        List<TimeEntryDTO> entries = timeTrackingService.getUserTimeEntries(userId, tenantId);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/entries/range")
    @Operation(summary = "Get time entries in range", description = "Get time entries within date range")
    public ResponseEntity<ApiResponse<List<TimeEntryDTO>>> getTimeEntriesInRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.debug("Get time entries for user: {} from {} to {}", userId, start, end);
        List<TimeEntryDTO> entries = timeTrackingService.getUserTimeEntriesInRange(userId, tenantId, start, end);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }
}
