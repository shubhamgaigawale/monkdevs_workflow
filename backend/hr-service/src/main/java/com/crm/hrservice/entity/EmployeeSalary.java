package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Employee Salary - assigns salary structures to employees
 */
@Entity
@Table(name = "employee_salaries", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSalary extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "salary_structure_id", nullable = false)
    private SalaryStructure salaryStructure;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal ctc;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;

    @OneToMany(mappedBy = "employeeSalary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeSalaryComponent> components;

    public enum Status {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}
