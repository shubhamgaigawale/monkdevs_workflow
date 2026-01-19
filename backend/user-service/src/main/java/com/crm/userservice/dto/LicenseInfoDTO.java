package com.crm.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for license information displayed to users
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LicenseInfoDTO {
    private String planName;
    private LocalDate expiryDate;
    private Long daysUntilExpiry;
    private Integer userLimit;
    private Integer currentUsers;
    private List<String> enabledModules; // List of module codes
    private String status; // ACTIVE, EXPIRED, GRACE_PERIOD
    private Boolean gracePeriodActive;
    private Long gracePeriodDaysRemaining;
}
