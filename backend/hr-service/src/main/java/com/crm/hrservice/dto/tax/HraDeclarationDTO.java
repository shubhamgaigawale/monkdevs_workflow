package com.crm.hrservice.dto.tax;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for HRA Declaration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HraDeclarationDTO {
    private UUID id;
    private UUID tenantId;
    private UUID declarationId;
    private BigDecimal rentPaidMonthly;
    private String landlordName;
    private String landlordPan;
    private String landlordAddress;
    private Boolean metroCity;
    private String rentReceiptsPath;
    private BigDecimal calculatedExemption;
    private LocalDateTime createdAt;
}
