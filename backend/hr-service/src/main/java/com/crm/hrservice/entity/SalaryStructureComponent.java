package com.crm.hrservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Salary Structure Component - links components to salary structures
 */
@Entity
@Table(name = "salary_structure_components", schema = "hr_workflow")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructureComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_structure_id", nullable = false)
    private SalaryStructure salaryStructure;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "component_id", nullable = false)
    private SalaryComponent component;

    @Column(precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "fixed_amount", precision = 12, scale = 2)
    private BigDecimal fixedAmount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
