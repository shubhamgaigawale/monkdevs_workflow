package com.crm.integrationservice.dto.response;

import com.crm.integrationservice.entity.IntegrationConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationDTO {

    private UUID id;
    private UUID tenantId;
    private IntegrationConfig.IntegrationType integrationType;
    private Boolean isEnabled;
    private Boolean hasToken;
    private Map<String, Object> configData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
