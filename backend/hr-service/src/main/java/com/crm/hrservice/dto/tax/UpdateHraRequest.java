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
 * Request DTO for updating HRA declaration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHraRequest {
    @NotNull(message = "Monthly rent is required")
    @Positive(message = "Monthly rent must be positive")
    private BigDecimal rentPaidMonthly;

    @NotBlank(message = "Landlord name is required")
    private String landlordName;

    private String landlordPan;

    @NotBlank(message = "Landlord address is required")
    private String landlordAddress;

    @NotNull(message = "Metro city flag is required")
    private Boolean metroCity;

    private String rentReceiptsPath;
}
