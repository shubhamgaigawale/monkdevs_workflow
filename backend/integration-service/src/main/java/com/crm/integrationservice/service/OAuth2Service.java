package com.crm.integrationservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.integrationservice.dto.response.OAuthUrlResponse;
import com.crm.integrationservice.entity.IntegrationConfig;
import com.crm.integrationservice.entity.OAuthToken;
import com.crm.integrationservice.repository.OAuthTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OAuth2Service {

    private final OAuthTokenRepository tokenRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${oauth.calendly.client-id}")
    private String calendlyClientId;
    @Value("${oauth.calendly.client-secret}")
    private String calendlyClientSecret;
    @Value("${oauth.calendly.redirect-uri}")
    private String calendlyRedirectUri;
    @Value("${oauth.calendly.authorization-url}")
    private String calendlyAuthUrl;
    @Value("${oauth.calendly.token-url}")
    private String calendlyTokenUrl;

    @Value("${oauth.pandadoc.client-id}")
    private String pandadocClientId;
    @Value("${oauth.pandadoc.client-secret}")
    private String pandadocClientSecret;
    @Value("${oauth.pandadoc.redirect-uri}")
    private String pandadocRedirectUri;
    @Value("${oauth.pandadoc.authorization-url}")
    private String pandadocAuthUrl;
    @Value("${oauth.pandadoc.token-url}")
    private String pandadocTokenUrl;

    /**
     * Get OAuth authorization URL
     */
    public OAuthUrlResponse getAuthorizationUrl(IntegrationConfig.IntegrationType integrationType, UUID tenantId, UUID userId) {
        log.info("Generating OAuth URL for integration: {}", integrationType);

        String state = UUID.randomUUID().toString();
        String authUrl;

        switch (integrationType) {
            case CALENDLY:
                authUrl = String.format("%s?client_id=%s&response_type=code&redirect_uri=%s&state=%s",
                        calendlyAuthUrl, calendlyClientId, calendlyRedirectUri, state);
                break;
            case PANDADOC:
                authUrl = String.format("%s?client_id=%s&response_type=code&redirect_uri=%s&state=%s&scope=read+write",
                        pandadocAuthUrl, pandadocClientId, pandadocRedirectUri, state);
                break;
            default:
                throw new BadRequestException("OAuth not supported for integration: " + integrationType);
        }

        return OAuthUrlResponse.builder()
                .authorizationUrl(authUrl)
                .state(state)
                .build();
    }

    /**
     * Handle OAuth callback and exchange code for token
     */
    public void handleOAuthCallback(IntegrationConfig.IntegrationType integrationType, String code, UUID tenantId, UUID userId) {
        log.info("Handling OAuth callback for integration: {}", integrationType);

        String tokenUrl;
        String clientId;
        String clientSecret;
        String redirectUri;

        switch (integrationType) {
            case CALENDLY:
                tokenUrl = calendlyTokenUrl;
                clientId = calendlyClientId;
                clientSecret = calendlyClientSecret;
                redirectUri = calendlyRedirectUri;
                break;
            case PANDADOC:
                tokenUrl = pandadocTokenUrl;
                clientId = pandadocClientId;
                clientSecret = pandadocClientSecret;
                redirectUri = pandadocRedirectUri;
                break;
            default:
                throw new BadRequestException("OAuth not supported for integration: " + integrationType);
        }

        try {
            // Exchange code for token
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("code", code);
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("redirect_uri", redirectUri);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> tokenData = response.getBody();

                // Save token
                OAuthToken token = tokenRepository.findByTenantIdAndUserIdAndIntegrationType(tenantId, userId, integrationType)
                        .orElse(new OAuthToken());

                token.setTenantId(tenantId);
                token.setUserId(userId);
                token.setIntegrationType(integrationType);
                token.setAccessToken((String) tokenData.get("access_token"));
                token.setRefreshToken((String) tokenData.get("refresh_token"));
                token.setTokenType((String) tokenData.getOrDefault("token_type", "Bearer"));

                if (tokenData.containsKey("expires_in")) {
                    int expiresIn = ((Number) tokenData.get("expires_in")).intValue();
                    token.setExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
                }

                if (tokenData.containsKey("scope")) {
                    token.setScope((String) tokenData.get("scope"));
                }

                tokenRepository.save(token);
                log.info("OAuth token saved successfully");
            } else {
                throw new BadRequestException("Failed to exchange OAuth code for token");
            }
        } catch (Exception e) {
            log.error("Error during OAuth callback: {}", e.getMessage(), e);
            throw new BadRequestException("OAuth callback failed: " + e.getMessage());
        }
    }

    /**
     * Get OAuth token for integration
     */
    @Transactional(readOnly = true)
    public OAuthToken getToken(UUID tenantId, UUID userId, IntegrationConfig.IntegrationType integrationType) {
        return tokenRepository.findByTenantIdAndUserIdAndIntegrationType(tenantId, userId, integrationType)
                .orElseThrow(() -> new BadRequestException("No OAuth token found. Please authorize the integration first."));
    }

    /**
     * Revoke OAuth token
     */
    public void revokeToken(UUID tenantId, UUID userId, IntegrationConfig.IntegrationType integrationType) {
        log.info("Revoking OAuth token for integration: {}", integrationType);
        tokenRepository.deleteByTenantIdAndUserIdAndIntegrationType(tenantId, userId, integrationType);
    }

    /**
     * Refresh OAuth token (placeholder - would implement actual refresh logic per provider)
     */
    public void refreshToken(UUID tenantId, UUID userId, IntegrationConfig.IntegrationType integrationType) {
        log.info("Refreshing OAuth token for integration: {}", integrationType);
        // Implementation would depend on specific provider refresh token logic
        // For now, this is a placeholder
    }
}
