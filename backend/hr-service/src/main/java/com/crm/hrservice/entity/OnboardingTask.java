package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Onboarding task entity - template tasks that define the onboarding workflow
 */
@Entity
@Table(name = "onboarding_tasks", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_onboarding_task_template", columnList = "template_id"),
                @Index(name = "idx_onboarding_task_order", columnList = "template_id, task_order")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private OnboardingTemplate template;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "task_order", nullable = false)
    private Integer taskOrder;

    @Column(name = "due_days_from_start", nullable = false)
    private Integer dueDaysFromStart;

    @Column(name = "assigned_to_role", length = 50)
    private String assignedToRole;

    @Column(name = "task_type", length = 50)
    private String taskType;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = true;
}
