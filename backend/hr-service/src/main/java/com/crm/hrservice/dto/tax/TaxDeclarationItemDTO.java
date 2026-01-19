package com.crm.hrservice.dto.tax;

import com.crm.hrservice.entity.TaxDeclarationItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Tax Declaration Item
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxDeclarationItemDTO {
    private UUID id;
    private UUID declarationId;
    private String section;
    private String subSection;
    private String description;
    private BigDecimal declaredAmount;
    private String proofFilePath;
    private TaxDeclarationItem.VerificationStatus verificationStatus;
    private UUID verifiedBy;
    private LocalDateTime verifiedDate;
    private String verificationNotes;
    private LocalDateTime createdAt;
}
