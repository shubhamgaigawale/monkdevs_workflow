package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.OnboardingTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Onboarding template response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingTemplateDTO {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private Integer durationDays;
    private Boolean isDefault;
    private OnboardingTemplate.TemplateStatus status;
}
