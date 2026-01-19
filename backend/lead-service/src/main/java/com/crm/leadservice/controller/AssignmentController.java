package com.crm.leadservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.leadservice.dto.request.AssignLeadRequest;
import com.crm.leadservice.dto.request.BulkAssignRequest;
import com.crm.leadservice.dto.response.LeadAssignmentDTO;
import com.crm.leadservice.service.LeadAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/leads")
@RequiredArgsConstructor
@Tag(name = "Lead Assignment", description = "Lead assignment and reassignment operations")
@SecurityRequirement(name = "bearerAuth")
public class AssignmentController {

    private final LeadAssignmentService assignmentService;

    @PostMapping("/{leadId}/assign")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('leads:assign')")
    @Operation(summary = "Assign a lead", description = "Assign a lead to a specific user")
    public ApiResponse<LeadAssignmentDTO> assignLead(
            @PathVariable UUID leadId,
            @Valid @RequestBody AssignLeadRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID assignedBy = (UUID) httpRequest.getAttribute("userId");

        LeadAssignmentDTO assignment = assignmentService.assignLead(leadId, request, tenantId, assignedBy);
        return ApiResponse.success(assignment);
    }

    @PostMapping("/{leadId}/reassign")
    @PreAuthorize("hasAuthority('leads:assign')")
    @Operation(summary = "Reassign a lead", description = "Reassign a lead to a different user")
    public ApiResponse<LeadAssignmentDTO> reassignLead(
            @PathVariable UUID leadId,
            @Valid @RequestBody AssignLeadRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID reassignedBy = (UUID) httpRequest.getAttribute("userId");

        LeadAssignmentDTO assignment = assignmentService.reassignLead(leadId, request, tenantId, reassignedBy);
        return ApiResponse.success(assignment);
    }

    @DeleteMapping("/{leadId}/assign")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('leads:assign')")
    @Operation(summary = "Unassign a lead", description = "Remove current assignment from a lead")
    public ApiResponse<Void> unassignLead(
            @PathVariable UUID leadId,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID unassignedBy = (UUID) httpRequest.getAttribute("userId");

        assignmentService.unassignLead(leadId, tenantId, unassignedBy);
        return ApiResponse.success(null);
    }

    @PostMapping("/bulk-assign")
    @PreAuthorize("hasAuthority('leads:assign')")
    @Operation(summary = "Bulk assign leads", description = "Assign multiple leads at once (auto or manual)")
    public ApiResponse<List<LeadAssignmentDTO>> bulkAssignLeads(
            @Valid @RequestBody BulkAssignRequest request,
            @RequestParam(required = false) List<UUID> agentIds,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID assignedBy = (UUID) httpRequest.getAttribute("userId");

        List<LeadAssignmentDTO> assignments = assignmentService.bulkAssignLeads(
                request, tenantId, assignedBy, agentIds);
        return ApiResponse.success(assignments);
    }

    @GetMapping("/{leadId}/assignments")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get lead assignment history", description = "Get all assignments for a specific lead")
    public ApiResponse<List<LeadAssignmentDTO>> getLeadAssignmentHistory(
            @PathVariable UUID leadId,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<LeadAssignmentDTO> assignments = assignmentService.getLeadAssignmentHistory(leadId, tenantId);
        return ApiResponse.success(assignments);
    }

    @GetMapping("/{leadId}/current-assignment")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get current assignment", description = "Get the current assignment for a lead")
    public ApiResponse<LeadAssignmentDTO> getCurrentAssignment(@PathVariable UUID leadId) {

        return assignmentService.getCurrentAssignment(leadId)
                .map(ApiResponse::success)
                .orElse(ApiResponse.success(null));
    }

    @GetMapping("/assignments/user/{userId}")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get user assignments", description = "Get all leads assigned to a specific user")
    public ApiResponse<List<LeadAssignmentDTO>> getUserAssignments(
            @PathVariable UUID userId,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<LeadAssignmentDTO> assignments = assignmentService.getUserAssignments(userId, tenantId);
        return ApiResponse.success(assignments);
    }
}
