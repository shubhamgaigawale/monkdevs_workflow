package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * Tax Regime Entity - Stores tax regime definitions (Old/New)
 */
@Entity
@Table(name = "tax_regimes", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxRegime extends BaseEntity {

    @Column(name = "financial_year", nullable = false, length = 10)
    private String financialYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "regime_type", nullable = false, length = 20)
    private RegimeType regimeType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @OneToMany(mappedBy = "taxRegime", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaxSlab> taxSlabs;

    public enum RegimeType {
        OLD, // Old regime with deductions
        NEW  // New regime without deductions
    }
}
