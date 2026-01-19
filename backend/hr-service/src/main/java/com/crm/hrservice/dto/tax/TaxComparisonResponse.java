package com.crm.hrservice.dto.tax;

import com.crm.hrservice.entity.TaxRegime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for comparing tax regimes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxComparisonResponse {
    private String financialYear;

    private RegimeCalculation oldRegime;
    private RegimeCalculation newRegime;

    private BigDecimal savingsAmount;
    private TaxRegime.RegimeType recommendedRegime;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegimeCalculation {
        private TaxRegime.RegimeType regimeType;
        private BigDecimal grossSalary;
        private BigDecimal totalDeductions;
        private BigDecimal taxableIncome;
        private BigDecimal totalTax;
        private BigDecimal cess;
        private BigDecimal netIncome;
    }
}
