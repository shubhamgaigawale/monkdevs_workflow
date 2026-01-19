package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee onboarding task entity - actual task instances for each employee onboarding
 */
@Entity
@Table(name = "employee_onboarding_tasks", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_employee_onboarding_task_onboarding", columnList = "onboarding_id"),
                @Index(name = "idx_employee_onboarding_task_status", columnList = "tenant_id, status"),
                @Index(name = "idx_employee_onboarding_task_assigned", columnList = "assigned_to_user_id, status")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeOnboardingTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "onboarding_id", nullable = false)
    private EmployeeOnboarding onboarding;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private OnboardingTask task;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "assigned_to_role", length = 50)
    private String assignedToRole;

    @Column(name = "assigned_to_user_id")
    private UUID assignedToUserId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(name = "completed_by")
    private UUID completedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "task_order")
    private Integer taskOrder;

    public enum TaskStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        SKIPPED
    }
}
