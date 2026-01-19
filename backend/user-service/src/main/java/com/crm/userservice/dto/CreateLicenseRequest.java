package com.crm.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Request DTO for creating or updating a tenant license
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLicenseRequest {

    @NotBlank(message = "Plan name is required")
    @Size(max = 100, message = "Plan name must not exceed 100 characters")
    private String planName; // BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM

    @NotEmpty(message = "At least one module must be selected")
    private List<String> modules; // List of module codes

    @NotNull(message = "User limit is required")
    @Min(value = 1, message = "User limit must be at least 1")
    @Max(value = 10000, message = "User limit must not exceed 10000")
    private Integer userLimit;

    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    private LocalDateTime expiryDate;

    @Size(max = 20, message = "Billing cycle must not exceed 20 characters")
    private String billingCycle; // MONTHLY, YEARLY, LIFETIME

    @Min(value = 0, message = "Grace period days must be non-negative")
    @Max(value = 365, message = "Grace period days must not exceed 365")
    private Integer gracePeriodDays = 15;
}
