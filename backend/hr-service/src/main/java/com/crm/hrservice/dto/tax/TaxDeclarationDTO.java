package com.crm.hrservice.dto.tax;

import com.crm.hrservice.entity.EmployeeTaxDeclaration;
import com.crm.hrservice.entity.TaxRegime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Employee Tax Declaration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxDeclarationDTO {
    private UUID id;
    private UUID userId;
    private String financialYear;
    private TaxRegime.RegimeType regimeType;
    private BigDecimal totalDeclaredAmount;
    private EmployeeTaxDeclaration.Status status;
    private LocalDateTime submittedDate;
    private LocalDateTime approvedDate;
    private UUID approvedBy;
    private String rejectionReason;
    private List<TaxDeclarationItemDTO> items;
    private HraDeclarationDTO hraDeclaration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
