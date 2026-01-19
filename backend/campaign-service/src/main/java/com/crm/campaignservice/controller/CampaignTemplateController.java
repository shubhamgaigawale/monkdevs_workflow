package com.crm.campaignservice.controller;

import com.crm.campaignservice.dto.request.CreateTemplateRequest;
import com.crm.campaignservice.dto.response.CampaignTemplateDTO;
import com.crm.campaignservice.service.CampaignTemplateService;
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
@RequestMapping("/campaigns/templates")
@RequiredArgsConstructor
@Tag(name = "Campaign Templates", description = "Campaign template management")
@SecurityRequirement(name = "bearerAuth")
public class CampaignTemplateController {

    private final CampaignTemplateService templateService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('campaigns:write')")
    @Operation(summary = "Create template", description = "Create a new campaign template")
    public ApiResponse<CampaignTemplateDTO> createTemplate(
            @Valid @RequestBody CreateTemplateRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignTemplateDTO template = templateService.createTemplate(request, tenantId);
        return ApiResponse.success(template);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns:read')")
    @Operation(summary = "Get template", description = "Get campaign template by ID")
    public ApiResponse<CampaignTemplateDTO> getTemplate(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignTemplateDTO template = templateService.getTemplate(id, tenantId);
        return ApiResponse.success(template);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('campaigns:read')")
    @Operation(summary = "Get all templates", description = "Get paginated list of campaign templates")
    public ApiResponse<Page<CampaignTemplateDTO>> getAllTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "true") boolean activeOnly,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        Page<CampaignTemplateDTO> templates = templateService.getAllTemplates(tenantId, page, size, activeOnly);
        return ApiResponse.success(templates);
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAuthority('campaigns:read')")
    @Operation(summary = "Get templates by category", description = "Get templates filtered by category")
    public ApiResponse<List<CampaignTemplateDTO>> getTemplatesByCategory(
            @PathVariable String category,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<CampaignTemplateDTO> templates = templateService.getTemplatesByCategory(tenantId, category);
        return ApiResponse.success(templates);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns:write')")
    @Operation(summary = "Update template", description = "Update campaign template")
    public ApiResponse<CampaignTemplateDTO> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTemplateRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        CampaignTemplateDTO template = templateService.updateTemplate(id, request, tenantId);
        return ApiResponse.success(template);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns:delete')")
    @Operation(summary = "Delete template", description = "Delete campaign template (soft delete)")
    public ApiResponse<Void> deleteTemplate(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        templateService.deleteTemplate(id, tenantId);
        return ApiResponse.success(null);
    }
}
