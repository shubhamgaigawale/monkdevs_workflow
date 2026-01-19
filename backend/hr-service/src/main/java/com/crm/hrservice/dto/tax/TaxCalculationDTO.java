package com.crm.hrservice.dto.tax;

import com.crm.hrservice.entity.TaxRegime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Tax Calculation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxCalculationDTO {
    private UUID id;
    private UUID userId;
    private String financialYear;
    private TaxRegime.RegimeType regimeType;
    private BigDecimal grossSalary;
    private BigDecimal totalDeductions;
    private BigDecimal taxableIncome;
    private BigDecimal totalTax;
    private BigDecimal cess;
    private BigDecimal tdsMonthly;
    private LocalDateTime calculationDate;
}
