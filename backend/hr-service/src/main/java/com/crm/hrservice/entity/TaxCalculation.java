package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tax Calculation Entity - Stores calculated tax for both regimes
 */
@Entity
@Table(name = "tax_calculations", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxCalculation extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "financial_year", nullable = false, length = 10)
    private String financialYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "regime_type", nullable = false, length = 20)
    private TaxRegime.RegimeType regimeType;

    @Column(name = "gross_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "standard_deduction", precision = 12, scale = 2)
    private BigDecimal standardDeduction = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "taxable_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxableIncome;

    @Column(name = "total_tax", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalTax;

    @Column(name = "cess", precision = 12, scale = 2)
    private BigDecimal cess = BigDecimal.ZERO; // 4% health and education cess

    @Column(name = "tds_monthly", precision = 10, scale = 2)
    private BigDecimal tdsMonthly = BigDecimal.ZERO;

    @Column(name = "calculation_date")
    private LocalDateTime calculationDate;

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (calculationDate == null) {
            calculationDate = LocalDateTime.now();
        }
    }
}
