package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Employee onboarding entity - actual onboarding instances for employees
 */
@Entity
@Table(name = "employee_onboarding", schema = "hr_workflow",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_employee_onboarding_tenant_user", columnNames = {"tenant_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_employee_onboarding_user", columnList = "tenant_id, user_id"),
                @Index(name = "idx_employee_onboarding_status", columnList = "tenant_id, status"),
                @Index(name = "idx_employee_onboarding_manager", columnList = "tenant_id, manager_id")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeOnboarding extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private OnboardingTemplate template;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expected_completion_date", nullable = false)
    private LocalDate expectedCompletionDate;

    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OnboardingStatus status = OnboardingStatus.IN_PROGRESS;

    @Column(name = "completion_percentage", precision = 5, scale = 2)
    private BigDecimal completionPercentage = BigDecimal.ZERO;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "buddy_id")
    private UUID buddyId;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Column(name = "confirmation_date")
    private LocalDate confirmationDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum OnboardingStatus {
        IN_PROGRESS,
        COMPLETED,
        ON_HOLD,
        TERMINATED
    }
}
