package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Onboarding template entity - defines the onboarding workflow template
 */
@Entity
@Table(name = "onboarding_templates", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_onboarding_template_tenant", columnList = "tenant_id"),
                @Index(name = "idx_onboarding_template_status", columnList = "tenant_id, status")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTemplate extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_days")
    private Integer durationDays = 90;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TemplateStatus status = TemplateStatus.ACTIVE;

    public enum TemplateStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}
