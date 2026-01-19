package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Salary Slip - monthly salary slips for employees
 */
@Entity
@Table(name = "salary_slips", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalarySlip extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_salary_id", nullable = false)
    private EmployeeSalary employeeSalary;

    @Column(name = "gross_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "paid_days", precision = 5, scale = 2)
    private BigDecimal paidDays;

    @Column(name = "lop_days", precision = 5, scale = 2)
    private BigDecimal lopDays;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.DRAFT;

    @Column(name = "generated_date")
    private LocalDateTime generatedDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "salarySlip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalarySlipComponent> components;

    public enum Status {
        DRAFT,
        GENERATED,
        PAID,
        CANCELLED
    }
}
