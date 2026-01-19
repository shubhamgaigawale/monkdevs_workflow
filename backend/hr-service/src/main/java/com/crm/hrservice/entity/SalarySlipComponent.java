package com.crm.hrservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Salary Slip Component - component breakdown for each salary slip
 */
@Entity
@Table(name = "salary_slip_components", schema = "hr_workflow")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalarySlipComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_slip_id", nullable = false)
    private SalarySlip salarySlip;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "component_id", nullable = false)
    private SalaryComponent component;

    @Column(name = "component_name", nullable = false, length = 100)
    private String componentName;

    @Column(name = "component_type", nullable = false, length = 20)
    private String componentType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
