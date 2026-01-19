package com.crm.hrservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee Salary Component - stores calculated component amounts
 */
@Entity
@Table(name = "employee_salary_components", schema = "hr_workflow")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSalaryComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_salary_id", nullable = false)
    private EmployeeSalary employeeSalary;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "component_id", nullable = false)
    private SalaryComponent component;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
