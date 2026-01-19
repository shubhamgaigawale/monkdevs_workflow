package com.crm.leadservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lead_assignments", schema = "lead_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LeadAssignment extends BaseEntity {

    @Column(name = "lead_id", nullable = false)
    private UUID leadId;

    @Column(name = "assigned_to", nullable = false)
    private UUID assignedTo;

    @Column(name = "assigned_by", nullable = false)
    private UUID assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", length = 20, nullable = false)
    private AssignmentType assignmentType = AssignmentType.MANUAL;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = true;

    public enum AssignmentType {
        AUTO,
        MANUAL
    }
}
