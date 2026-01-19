package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Leave type entity - defines different types of leaves (CL, SL, EL, custom types)
 */
@Entity
@Table(name = "leave_types", schema = "hr_workflow",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_leave_type_tenant_code", columnNames = {"tenant_id", "code"})
        },
        indexes = {
                @Index(name = "idx_leave_type_tenant", columnList = "tenant_id"),
                @Index(name = "idx_leave_type_tenant_status", columnList = "tenant_id, status")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_system_defined")
    private Boolean isSystemDefined = false;

    @Column(name = "days_per_year", precision = 5, scale = 2)
    private BigDecimal daysPerYear;

    @Column(name = "allow_carry_forward")
    private Boolean allowCarryForward = false;

    @Column(name = "max_carry_forward_days", precision = 5, scale = 2)
    private BigDecimal maxCarryForwardDays;

    @Column(name = "min_notice_days")
    private Integer minNoticeDays = 0;

    @Column(name = "max_consecutive_days")
    private Integer maxConsecutiveDays;

    @Column(name = "is_paid")
    private Boolean isPaid = true;

    @Column(length = 7)
    private String color; // Hex color code for UI display

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeaveStatus status = LeaveStatus.ACTIVE;

    public enum LeaveStatus {
        ACTIVE,
        INACTIVE
    }
}
