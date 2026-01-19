package com.crm.hrservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Equipment assignment request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssignmentRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Equipment type is required")
    private String equipmentType;

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    private String serialNumber;

    private String assetTag;

    @NotNull(message = "Assigned date is required")
    private LocalDate assignedDate;

    private LocalDate expectedReturnDate;

    private String conditionAtAssignment;

    private String notes;
}
