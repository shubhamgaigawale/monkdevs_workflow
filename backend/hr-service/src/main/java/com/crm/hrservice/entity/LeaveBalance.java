package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Leave balance entity - tracks leave balances per user, per leave type, per year
 */
@Entity
@Table(name = "leave_balances", schema = "hr_workflow",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_leave_balance_user_type_year",
                        columnNames = {"tenant_id", "user_id", "leave_type_id", "year"})
        },
        indexes = {
                @Index(name = "idx_leave_balance_tenant_user", columnList = "tenant_id, user_id"),
                @Index(name = "idx_leave_balance_year", columnList = "tenant_id, user_id, year")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_allocated", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalAllocated;

    @Column(precision = 5, scale = 2)
    private BigDecimal used = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    private BigDecimal pending = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal available;

    @Column(name = "carry_forward", precision = 5, scale = 2)
    private BigDecimal carryForward = BigDecimal.ZERO;
}
