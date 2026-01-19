package com.crm.campaignservice.dto.response;

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
public class CampaignTemplateDTO {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private String category;
    private String subject;
    private String previewText;
    private String content;
    private Boolean isActive;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
