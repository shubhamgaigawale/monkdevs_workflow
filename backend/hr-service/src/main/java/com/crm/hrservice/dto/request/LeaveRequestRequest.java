package com.crm.hrservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Leave request creation DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestRequest {

    @NotNull(message = "Leave type is required")
    private UUID leaveTypeId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String reason;
}
