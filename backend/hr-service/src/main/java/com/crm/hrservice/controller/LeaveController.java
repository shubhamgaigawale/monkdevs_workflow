package com.crm.hrservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.hrservice.dto.request.HolidayRequest;
import com.crm.hrservice.dto.request.LeaveApprovalRequest;
import com.crm.hrservice.dto.request.LeaveRequestRequest;
import com.crm.hrservice.dto.request.LeaveTypeRequest;
import com.crm.hrservice.dto.response.*;
import com.crm.hrservice.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Leave management controller
 * Handles leave types, balances, requests, approvals, and holidays
 */
@Slf4j
@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Leave Management", description = "Leave management operations - types, balances, requests, approvals, holidays")
public class LeaveController {

    private final LeaveService leaveService;

    // ==================== Leave Type Endpoints ====================

    @GetMapping("/types")
    @Operation(summary = "Get all leave types", description = "Get all active leave types for the tenant")
    public ResponseEntity<ApiResponse<List<LeaveTypeDTO>>> getAllLeaveTypes(HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get all leave types for tenant: {}", tenantId);

        List<LeaveTypeDTO> leaveTypes = leaveService.getAllLeaveTypes(tenantId);
        return ResponseEntity.ok(ApiResponse.success(leaveTypes));
    }

    @PostMapping("/types")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Create leave type", description = "Create a new custom leave type (Admin/HR only)")
    public ResponseEntity<ApiResponse<LeaveTypeDTO>> createLeaveType(
            @Valid @RequestBody LeaveTypeRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Create leave type request: {}", request.getCode());

        LeaveTypeDTO leaveType = leaveService.createLeaveType(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Leave type created successfully", leaveType));
    }

    // ==================== Leave Balance Endpoints ====================

    @GetMapping("/balance")
    @Operation(summary = "Get my leave balances", description = "Get leave balances for current user for current year")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDTO>>> getMyLeaveBalances(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get leave balances for user: {}", userId);

        List<LeaveBalanceDTO> balances = leaveService.getLeaveBalances(userId, tenantId);
        return ResponseEntity.ok(ApiResponse.success(balances));
    }

    // ==================== Leave Request Endpoints ====================

    @PostMapping("/apply")
    @Operation(summary = "Apply for leave", description = "Submit a new leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> applyLeave(
            @Valid @RequestBody LeaveRequestRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Apply leave request from user: {}", userId);

        LeaveRequestDTO leaveRequest = leaveService.applyLeave(userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted successfully", leaveRequest));
    }

    @GetMapping("/requests")
    @Operation(summary = "Get my leave requests", description = "Get all leave requests for current user")
    public ResponseEntity<ApiResponse<Page<LeaveRequestDTO>>> getMyLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get leave requests for user: {}", userId);

        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveRequestDTO> requests = leaveService.getMyLeaveRequests(userId, tenantId, pageable);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PutMapping("/requests/{id}/cancel")
    @Operation(summary = "Cancel leave request", description = "Cancel a pending leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> cancelLeaveRequest(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Cancel leave request: {} by user: {}", id, userId);

        LeaveRequestDTO leaveRequest = leaveService.cancelLeave(id, userId, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled successfully", leaveRequest));
    }

    // ==================== Leave Approval Endpoints (Manager/HR) ====================

    @GetMapping("/pending-approvals")
    @PreAuthorize("hasAnyAuthority('manager:access', 'hr:manage')")
    @Operation(summary = "Get pending approvals", description = "Get all pending leave approvals for current manager/HR")
    public ResponseEntity<ApiResponse<Page<LeaveRequestDTO>>> getPendingApprovals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get pending approvals for approver: {}", userId);

        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveRequestDTO> requests = leaveService.getPendingApprovals(userId, tenantId, pageable);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/approve/{id}")
    @PreAuthorize("hasAnyAuthority('manager:access', 'hr:manage')")
    @Operation(summary = "Approve leave request", description = "Approve a pending leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> approveLeaveRequest(
            @PathVariable UUID id,
            @Valid @RequestBody LeaveApprovalRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Approve leave request: {} by approver: {}", id, userId);

        LeaveRequestDTO leaveRequest = leaveService.approveLeave(id, userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved successfully", leaveRequest));
    }

    @PostMapping("/reject/{id}")
    @PreAuthorize("hasAnyAuthority('manager:access', 'hr:manage')")
    @Operation(summary = "Reject leave request", description = "Reject a pending leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDTO>> rejectLeaveRequest(
            @PathVariable UUID id,
            @Valid @RequestBody LeaveApprovalRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Reject leave request: {} by approver: {}", id, userId);

        LeaveRequestDTO leaveRequest = leaveService.rejectLeave(id, userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected", leaveRequest));
    }

    // ==================== Team Calendar Endpoints (Manager) ====================

    @GetMapping("/team-calendar")
    @PreAuthorize("hasAnyAuthority('manager:access', 'hr:manage')")
    @Operation(summary = "Get team leave calendar", description = "Get all approved leaves for team in date range")
    public ResponseEntity<ApiResponse<List<LeaveRequestDTO>>> getTeamLeaveCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get team calendar from {} to {}", startDate, endDate);

        List<LeaveRequestDTO> leaves = leaveService.getTeamLeaveCalendar(tenantId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    // ==================== Holiday Calendar Endpoints ====================

    @GetMapping("/holidays")
    @Operation(summary = "Get holidays", description = "Get all holidays for current year")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getHolidays(HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get holidays for tenant: {}", tenantId);

        List<HolidayDTO> holidays = leaveService.getHolidays(tenantId);
        return ResponseEntity.ok(ApiResponse.success(holidays));
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Create holiday", description = "Add a new holiday to calendar (Admin/HR only)")
    public ResponseEntity<ApiResponse<HolidayDTO>> createHoliday(
            @Valid @RequestBody HolidayRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Create holiday: {} on {}", request.getName(), request.getDate());

        HolidayDTO holiday = leaveService.createHoliday(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Holiday created successfully", holiday));
    }

    @PutMapping("/holidays/{id}")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Update holiday", description = "Update an existing holiday (Admin/HR only)")
    public ResponseEntity<ApiResponse<HolidayDTO>> updateHoliday(
            @PathVariable UUID id,
            @Valid @RequestBody HolidayRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Update holiday: {}", id);

        HolidayDTO holiday = leaveService.updateHoliday(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Holiday updated successfully", holiday));
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Delete holiday", description = "Delete a holiday from calendar (Admin/HR only)")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Delete holiday: {}", id);

        leaveService.deleteHoliday(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success("Holiday deleted successfully", null));
    }
}
