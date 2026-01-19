package com.crm.hrservice.dto.tax;

import com.crm.hrservice.entity.TaxRegime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating a tax declaration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeclarationRequest {
    @NotBlank(message = "Financial year is required")
    private String financialYear;

    @NotNull(message = "Regime type is required")
    private TaxRegime.RegimeType regimeType;
}
