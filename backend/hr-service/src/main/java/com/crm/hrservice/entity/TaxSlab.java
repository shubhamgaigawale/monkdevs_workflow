package com.crm.hrservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tax Slab Entity - Stores tax slab details for each regime
 */
@Entity
@Table(name = "tax_slabs", schema = "hr_workflow")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_regime_id", nullable = false)
    private TaxRegime taxRegime;

    @Column(name = "min_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal minIncome;

    @Column(name = "max_income", precision = 12, scale = 2)
    private BigDecimal maxIncome; // NULL for highest slab

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate; // Percentage

    @Column(name = "slab_order", nullable = false)
    private Integer slabOrder;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
