package com.crm.callservice.controller;

import com.crm.callservice.dto.request.AddCallNoteRequest;
import com.crm.callservice.dto.request.LogCallRequest;
import com.crm.callservice.dto.request.UpdateCallRequest;
import com.crm.callservice.dto.response.CallDTO;
import com.crm.callservice.dto.response.CallStatsDTO;
import com.crm.callservice.service.CallService;
import com.crm.common.dto.ApiResponse;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/calls")
@RequiredArgsConstructor
@Tag(name = "Call Management", description = "Call logging and management operations")
@SecurityRequirement(name = "bearerAuth")
public class CallController {

    private final CallService callService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('calls:write')")
    @Operation(summary = "Log a new call", description = "Log an inbound or outbound call")
    public ApiResponse<CallDTO> logCall(
            @Valid @RequestBody LogCallRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        CallDTO call = callService.logCall(request, tenantId, userId);
        return ApiResponse.success(call);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('calls:read')")
    @Operation(summary = "Get call by ID", description = "Retrieve a specific call by ID")
    public ApiResponse<CallDTO> getCallById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CallDTO call = callService.getCallById(id, tenantId);
        return ApiResponse.success(call);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('calls:write')")
    @Operation(summary = "Update a call", description = "Update an existing call")
    public ApiResponse<CallDTO> updateCall(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCallRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CallDTO call = callService.updateCall(id, request, tenantId);
        return ApiResponse.success(call);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('calls:delete')")
    @Operation(summary = "Delete a call", description = "Delete a call from the system")
    public ApiResponse<Void> deleteCall(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        callService.deleteCall(id, tenantId);
        return ApiResponse.success(null);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('calls:read')")
    @Operation(summary = "Get all calls", description = "Get paginated list of calls with role-based filtering")
    public ApiResponse<Page<CallDTO>> getAllCalls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) httpRequest.getAttribute("roles");

        Page<CallDTO> calls = callService.getAllCalls(tenantId, userId, roles, page, size);
        return ApiResponse.success(calls);
    }

    @GetMapping("/lead/{leadId}")
    @PreAuthorize("hasAuthority('calls:read')")
    @Operation(summary = "Get calls by lead", description = "Get all calls for a specific lead")
    public ApiResponse<List<CallDTO>> getCallsByLead(
            @PathVariable UUID leadId,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<CallDTO> calls = callService.getCallsByLead(leadId, tenantId);
        return ApiResponse.success(calls);
    }

    @GetMapping("/phone/{phoneNumber}")
    @PreAuthorize("hasAuthority('calls:read')")
    @Operation(summary = "Get calls by phone", description = "Get all calls for a specific phone number")
    public ApiResponse<List<CallDTO>> getCallsByPhone(
            @PathVariable String phoneNumber,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<CallDTO> calls = callService.getCallsByPhone(phoneNumber, tenantId);
        return ApiResponse.success(calls);
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('calls:write')")
    @Operation(summary = "Add note to call", description = "Add a note to an existing call")
    public ApiResponse<CallDTO> addNote(
            @PathVariable UUID id,
            @Valid @RequestBody AddCallNoteRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CallDTO call = callService.addNote(id, request.getNote(), tenantId);
        return ApiResponse.success(call);
    }

    @GetMapping("/follow-ups")
    @PreAuthorize("hasAuthority('calls:read')")
    @Operation(summary = "Get follow-up calls", description = "Get calls requiring follow-up")
    public ApiResponse<List<CallDTO>> getFollowUpCalls(HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<CallDTO> calls = callService.getCallsRequiringFollowUp(tenantId);
        return ApiResponse.success(calls);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('calls:read')")
    @Operation(summary = "Get call statistics", description = "Get aggregated statistics for calls")
    public ApiResponse<CallStatsDTO> getCallStats(HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CallStatsDTO stats = callService.getCallStats(tenantId);
        return ApiResponse.success(stats);
    }
}
