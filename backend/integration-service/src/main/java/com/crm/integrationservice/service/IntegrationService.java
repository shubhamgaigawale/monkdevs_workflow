package com.crm.integrationservice.service;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.integrationservice.dto.response.IntegrationDTO;
import com.crm.integrationservice.entity.IntegrationConfig;
import com.crm.integrationservice.entity.OAuthToken;
import com.crm.integrationservice.repository.IntegrationConfigRepository;
import com.crm.integrationservice.repository.OAuthTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class IntegrationService {

    private final IntegrationConfigRepository configRepository;
    private final OAuthTokenRepository tokenRepository;

    /**
     * Get all integrations for tenant
     */
    @Transactional(readOnly = true)
    public List<IntegrationDTO> getAllIntegrations(UUID tenantId, UUID userId) {
        log.info("Fetching all integrations for tenant: {}", tenantId);

        List<IntegrationConfig> configs = configRepository.findByTenantId(tenantId);

        return configs.stream()
                .map(config -> convertToDTO(config, tenantId, userId))
                .collect(Collectors.toList());
    }

    /**
     * Get integration by type
     */
    @Transactional(readOnly = true)
    public IntegrationDTO getIntegration(UUID tenantId, UUID userId, IntegrationConfig.IntegrationType integrationType) {
        log.info("Fetching integration: {}", integrationType);

        IntegrationConfig config = configRepository.findByTenantIdAndIntegrationType(tenantId, integrationType)
                .orElseThrow(() -> new ResourceNotFoundException("Integration not found"));

        return convertToDTO(config, tenantId, userId);
    }

    /**
     * Enable integration
     */
    public IntegrationDTO enableIntegration(UUID tenantId, IntegrationConfig.IntegrationType integrationType, Map<String, Object> configData) {
        log.info("Enabling integration: {}", integrationType);

        IntegrationConfig config = configRepository.findByTenantIdAndIntegrationType(tenantId, integrationType)
                .orElse(new IntegrationConfig());

        config.setTenantId(tenantId);
        config.setIntegrationType(integrationType);
        config.setIsEnabled(true);
        config.setConfigData(configData);

        config = configRepository.save(config);

        log.info("Integration enabled successfully");
        return convertToDTO(config, tenantId, null);
    }

    /**
     * Disable integration
     */
    public void disableIntegration(UUID tenantId, IntegrationConfig.IntegrationType integrationType) {
        log.info("Disabling integration: {}", integrationType);

        IntegrationConfig config = configRepository.findByTenantIdAndIntegrationType(tenantId, integrationType)
                .orElseThrow(() -> new ResourceNotFoundException("Integration not found"));

        config.setIsEnabled(false);
        configRepository.save(config);

        log.info("Integration disabled successfully");
    }

    /**
     * Convert to DTO
     */
    private IntegrationDTO convertToDTO(IntegrationConfig config, UUID tenantId, UUID userId) {
        boolean hasToken = false;
        if (userId != null) {
            hasToken = tokenRepository.findByTenantIdAndUserIdAndIntegrationType(tenantId, userId, config.getIntegrationType()).isPresent();
        }

        return IntegrationDTO.builder()
                .id(config.getId())
                .tenantId(config.getTenantId())
                .integrationType(config.getIntegrationType())
                .isEnabled(config.getIsEnabled())
                .hasToken(hasToken)
                .configData(config.getConfigData())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
