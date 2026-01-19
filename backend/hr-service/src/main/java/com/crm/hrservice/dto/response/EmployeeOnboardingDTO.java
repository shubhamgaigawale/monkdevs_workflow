package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.EmployeeOnboarding;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Employee onboarding response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeOnboardingDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private OnboardingTemplateDTO template;
    private LocalDate startDate;
    private LocalDate expectedCompletionDate;
    private LocalDate actualCompletionDate;
    private EmployeeOnboarding.OnboardingStatus status;
    private BigDecimal completionPercentage;
    private UUID managerId;
    private UUID buddyId;
    private LocalDate probationEndDate;
    private LocalDate confirmationDate;
    private String notes;
    private List<EmployeeOnboardingTaskDTO> tasks;
}
