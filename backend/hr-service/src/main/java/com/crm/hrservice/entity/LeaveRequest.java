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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Leave request entity - stores all leave applications from employees
 */
@Entity
@Table(name = "leave_requests", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_leave_request_tenant_user", columnList = "tenant_id, user_id"),
                @Index(name = "idx_leave_request_status", columnList = "tenant_id, status"),
                @Index(name = "idx_leave_request_dates", columnList = "tenant_id, start_date, end_date"),
                @Index(name = "idx_leave_request_approver", columnList = "tenant_id, current_approver_id, status")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_days", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalDays;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "current_approver_id")
    private UUID currentApproverId;

    @Column(name = "applied_date", nullable = false)
    private LocalDateTime appliedDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "rejected_date")
    private LocalDateTime rejectedDate;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @OneToMany(mappedBy = "leaveRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LeaveApproval> approvals = new ArrayList<>();

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }
}
