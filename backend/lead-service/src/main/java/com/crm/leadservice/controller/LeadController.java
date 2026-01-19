package com.crm.leadservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.leadservice.dto.request.CreateLeadRequest;
import com.crm.leadservice.dto.request.SearchLeadRequest;
import com.crm.leadservice.dto.request.UpdateLeadRequest;
import com.crm.leadservice.dto.response.LeadDTO;
import com.crm.leadservice.dto.response.LeadHistoryDTO;
import com.crm.leadservice.dto.response.LeadStatsDTO;
import com.crm.leadservice.service.LeadService;
import com.crm.leadservice.service.LeadImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/leads")
@RequiredArgsConstructor
@Tag(name = "Lead Management", description = "Lead CRUD operations")
@SecurityRequirement(name = "bearerAuth")
public class LeadController {

    private final LeadService leadService;
    private final LeadImportService leadImportService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('leads:write')")
    @Operation(summary = "Create a new lead", description = "Create a new lead in the system")
    public ApiResponse<LeadDTO> createLead(
            @Valid @RequestBody CreateLeadRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        LeadDTO lead = leadService.createLead(request, tenantId, userId);
        return ApiResponse.success(lead);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get lead by ID", description = "Retrieve a specific lead by ID with role-based access control")
    public ApiResponse<LeadDTO> getLeadById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) httpRequest.getAttribute("roles");

        LeadDTO lead = leadService.getLeadById(id, tenantId, userId, roles);
        return ApiResponse.success(lead);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('leads:write')")
    @Operation(summary = "Update a lead", description = "Update an existing lead")
    public ApiResponse<LeadDTO> updateLead(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLeadRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        LeadDTO lead = leadService.updateLead(id, request, tenantId, userId);
        return ApiResponse.success(lead);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('leads:delete')")
    @Operation(summary = "Delete a lead", description = "Delete a lead from the system")
    public ApiResponse<Void> deleteLead(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        leadService.deleteLead(id, tenantId, userId);
        return ApiResponse.success(null);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get all leads", description = "Get paginated list of leads with role-based filtering")
    public ApiResponse<Page<LeadDTO>> getAllLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) httpRequest.getAttribute("roles");

        Page<LeadDTO> leads = leadService.getAllLeads(tenantId, userId, roles, page, size);
        return ApiResponse.success(leads);
    }

    @PostMapping("/search")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Search leads", description = "Search leads with filters and full-text search")
    public ApiResponse<Page<LeadDTO>> searchLeads(
            @RequestBody SearchLeadRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) httpRequest.getAttribute("roles");

        Page<LeadDTO> leads = leadService.searchLeads(request, tenantId, userId, roles);
        return ApiResponse.success(leads);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get lead history", description = "Get audit trail for a specific lead")
    public ApiResponse<List<LeadHistoryDTO>> getLeadHistory(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<LeadHistoryDTO> history = leadService.getLeadHistory(id, tenantId);
        return ApiResponse.success(history);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get lead statistics", description = "Get aggregated statistics for leads")
    public ApiResponse<LeadStatsDTO> getLeadStats(HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        LeadStatsDTO stats = leadService.getLeadStats(tenantId);
        return ApiResponse.success(stats);
    }

    @GetMapping("/my-leads")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get my assigned leads", description = "Get leads assigned to the current user (for agents)")
    public ApiResponse<Page<LeadDTO>> getMyLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        List<String> roles = List.of("AGENT"); // Force agent view

        Page<LeadDTO> leads = leadService.getAllLeads(tenantId, userId, roles, page, size);
        return ApiResponse.success(leads);
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('leads:import')")
    @Operation(summary = "Import leads from CSV/Excel", description = "Import leads from a CSV or Excel file")
    public ApiResponse<Map<String, Integer>> importLeads(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        Map<String, Integer> result = leadImportService.importFromFile(file, tenantId, userId);
        return ApiResponse.success(result);
    }
}
