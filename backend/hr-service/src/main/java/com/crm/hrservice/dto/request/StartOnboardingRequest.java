package com.crm.hrservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Start onboarding request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartOnboardingRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    private UUID templateId; // If null, use default template

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private UUID managerId;

    private UUID buddyId;

    private LocalDate probationEndDate;

    private String notes;
}
