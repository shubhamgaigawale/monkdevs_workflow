package com.crm.integrationservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.integrationservice.dto.response.IntegrationDTO;
import com.crm.integrationservice.dto.response.OAuthUrlResponse;
import com.crm.integrationservice.entity.IntegrationConfig;
import com.crm.integrationservice.service.IntegrationService;
import com.crm.integrationservice.service.OAuth2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/integrations")
@RequiredArgsConstructor
@Tag(name = "Integrations", description = "Third-party integration management")
@SecurityRequirement(name = "bearerAuth")
public class IntegrationController {

    private final IntegrationService integrationService;
    private final OAuth2Service oauth2Service;

    @GetMapping
    @PreAuthorize("hasAuthority('integrations:read')")
    @Operation(summary = "Get all integrations", description = "Get all available integrations for tenant")
    public ApiResponse<List<IntegrationDTO>> getAllIntegrations(HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        List<IntegrationDTO> integrations = integrationService.getAllIntegrations(tenantId, userId);
        return ApiResponse.success(integrations);
    }

    @GetMapping("/{type}")
    @PreAuthorize("hasAuthority('integrations:read')")
    @Operation(summary = "Get integration by type", description = "Get specific integration details")
    public ApiResponse<IntegrationDTO> getIntegration(
            @PathVariable IntegrationConfig.IntegrationType type,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        IntegrationDTO integration = integrationService.getIntegration(tenantId, userId, type);
        return ApiResponse.success(integration);
    }

    @PostMapping("/{type}/enable")
    @PreAuthorize("hasAuthority('integrations:write')")
    @Operation(summary = "Enable integration", description = "Enable an integration for the tenant")
    public ApiResponse<IntegrationDTO> enableIntegration(
            @PathVariable IntegrationConfig.IntegrationType type,
            @RequestBody(required = false) Map<String, Object> configData,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        IntegrationDTO integration = integrationService.enableIntegration(tenantId, type, configData);
        return ApiResponse.success(integration);
    }

    @PostMapping("/{type}/disable")
    @PreAuthorize("hasAuthority('integrations:write')")
    @Operation(summary = "Disable integration", description = "Disable an integration")
    public ApiResponse<Void> disableIntegration(
            @PathVariable IntegrationConfig.IntegrationType type,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        integrationService.disableIntegration(tenantId, type);
        return ApiResponse.success(null);
    }

    @GetMapping("/{type}/oauth/authorize")
    @PreAuthorize("hasAuthority('integrations:write')")
    @Operation(summary = "Get OAuth URL", description = "Get OAuth authorization URL for integration")
    public ApiResponse<OAuthUrlResponse> getOAuthUrl(
            @PathVariable IntegrationConfig.IntegrationType type,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        OAuthUrlResponse response = oauth2Service.getAuthorizationUrl(type, tenantId, userId);
        return ApiResponse.success(response);
    }

    @GetMapping("/{type}/oauth/callback")
    @Operation(summary = "OAuth callback", description = "Handle OAuth callback from provider")
    public RedirectView handleOAuthCallback(
            @PathVariable IntegrationConfig.IntegrationType type,
            @RequestParam String code,
            @RequestParam(required = false) String state,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        // In production, tenant and user would be extracted from state parameter or session
        UUID tenantId = tenantIdHeader != null ? UUID.fromString(tenantIdHeader) : UUID.randomUUID();
        UUID userId = userIdHeader != null ? UUID.fromString(userIdHeader) : UUID.randomUUID();

        oauth2Service.handleOAuthCallback(type, code, tenantId, userId);

        // Redirect to frontend success page
        return new RedirectView("/integrations/" + type.name().toLowerCase() + "/success");
    }

    @DeleteMapping("/{type}/oauth/revoke")
    @PreAuthorize("hasAuthority('integrations:write')")
    @Operation(summary = "Revoke OAuth token", description = "Revoke OAuth token for integration")
    public ApiResponse<Void> revokeOAuthToken(
            @PathVariable IntegrationConfig.IntegrationType type,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        oauth2Service.revokeToken(tenantId, userId, type);
        return ApiResponse.success(null);
    }
}
