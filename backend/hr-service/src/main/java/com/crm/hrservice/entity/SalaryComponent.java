package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Salary Component entity - defines reusable salary components like Basic, HRA, PF, etc.
 */
@Entity
@Table(name = "salary_components", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryComponent extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "component_type", nullable = false, length = 20)
    private ComponentType componentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "calculation_type", length = 20)
    private CalculationType calculationType;

    @Column(precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "is_taxable")
    private Boolean isTaxable = true;

    @Column(name = "is_fixed")
    private Boolean isFixed = false;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;

    public enum ComponentType {
        EARNING,
        DEDUCTION
    }

    public enum CalculationType {
        FIXED,
        PERCENTAGE,
        FORMULA
    }

    public enum Status {
        ACTIVE,
        INACTIVE
    }
}
