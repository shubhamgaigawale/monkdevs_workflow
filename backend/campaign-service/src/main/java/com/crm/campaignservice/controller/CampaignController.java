package com.crm.campaignservice.controller;

import com.crm.campaignservice.dto.request.CreateCampaignRequest;
import com.crm.campaignservice.dto.request.UpdateCampaignRequest;
import com.crm.campaignservice.dto.response.CampaignDTO;
import com.crm.campaignservice.dto.response.CampaignStatsDTO;
import com.crm.campaignservice.service.CampaignService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/campaigns")
@RequiredArgsConstructor
@Tag(name = "Campaigns", description = "Email campaign management with Mailchimp integration")
@SecurityRequirement(name = "bearerAuth")
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('campaigns:write')")
    @Operation(summary = "Create campaign", description = "Create a new email campaign")
    public ApiResponse<CampaignDTO> createCampaign(
            @Valid @RequestBody CreateCampaignRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        CampaignDTO campaign = campaignService.createCampaign(request, tenantId, userId);
        return ApiResponse.success(campaign);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns:read')")
    @Operation(summary = "Get campaign", description = "Get campaign by ID")
    public ApiResponse<CampaignDTO> getCampaign(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignDTO campaign = campaignService.getCampaign(id, tenantId);
        return ApiResponse.success(campaign);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns:write')")
    @Operation(summary = "Update campaign", description = "Update campaign details")
    public ApiResponse<CampaignDTO> updateCampaign(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCampaignRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignDTO campaign = campaignService.updateCampaign(id, request, tenantId);
        return ApiResponse.success(campaign);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('campaigns:read')")
    @Operation(summary = "Get all campaigns", description = "Get paginated list of campaigns")
    public ApiResponse<Page<CampaignDTO>> getAllCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) httpRequest.getAttribute("roles");

        Page<CampaignDTO> campaigns = campaignService.getAllCampaigns(tenantId, userId, roles, page, size);
        return ApiResponse.success(campaigns);
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasAuthority('campaigns:write')")
    @Operation(summary = "Send campaign", description = "Send campaign to recipients via Mailchimp")
    public ApiResponse<CampaignDTO> sendCampaign(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignDTO campaign = campaignService.sendCampaign(id, tenantId);
        return ApiResponse.success(campaign);
    }

    @PostMapping("/{id}/schedule")
    @PreAuthorize("hasAuthority('campaigns:write')")
    @Operation(summary = "Schedule campaign", description = "Schedule campaign for future sending")
    public ApiResponse<CampaignDTO> scheduleCampaign(
            @PathVariable UUID id,
            @RequestParam LocalDateTime scheduledAt,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignDTO campaign = campaignService.scheduleCampaign(id, scheduledAt, tenantId);
        return ApiResponse.success(campaign);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns:delete')")
    @Operation(summary = "Cancel campaign", description = "Cancel scheduled or draft campaign")
    public ApiResponse<Void> cancelCampaign(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        campaignService.cancelCampaign(id, tenantId);
        return ApiResponse.success(null);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('campaigns:read')")
    @Operation(summary = "Get campaign statistics", description = "Get overall campaign performance statistics")
    public ApiResponse<CampaignStatsDTO> getCampaignStats(HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignStatsDTO stats = campaignService.getCampaignStats(tenantId);
        return ApiResponse.success(stats);
    }
}
