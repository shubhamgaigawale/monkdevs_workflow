package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Leave approval entity - tracks multi-level approval workflow for leave requests
 */
@Entity
@Table(name = "leave_approvals", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_leave_approval_request", columnList = "leave_request_id"),
                @Index(name = "idx_leave_approval_approver", columnList = "tenant_id, approver_id, status")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveApproval extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_request_id", nullable = false)
    private LeaveRequest leaveRequest;

    @Column(name = "approver_id", nullable = false)
    private UUID approverId;

    @Column(nullable = false)
    private Integer level; // Approval level (1 = Manager, 2 = HR, etc.)

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
