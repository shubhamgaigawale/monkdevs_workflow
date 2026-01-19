package com.crm.hrservice.dto.tax;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

/**
 * Request DTO for adding a declaration item
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddDeclarationItemRequest {
    @NotBlank(message = "Section is required")
    private String section;

    private String subSection;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Declared amount is required")
    @Positive(message = "Declared amount must be positive")
    private BigDecimal declaredAmount;

    private String proofFilePath;
}
