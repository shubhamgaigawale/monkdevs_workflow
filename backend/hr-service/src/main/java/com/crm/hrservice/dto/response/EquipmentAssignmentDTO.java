package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.EquipmentAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Equipment assignment response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssignmentDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private UUID onboardingId;
    private String equipmentType;
    private String equipmentName;
    private String serialNumber;
    private String assetTag;
    private LocalDate assignedDate;
    private LocalDate returnDate;
    private LocalDate expectedReturnDate;
    private EquipmentAssignment.EquipmentStatus status;
    private String conditionAtAssignment;
    private String conditionAtReturn;
    private String notes;
    private UUID assignedBy;
}
