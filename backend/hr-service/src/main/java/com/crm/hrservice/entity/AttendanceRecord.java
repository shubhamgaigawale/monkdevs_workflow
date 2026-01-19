package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Attendance record entity - daily aggregation of time entries
 */
@Entity
@Table(name = "attendance_records", schema = "hr_workflow",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tenant_user_date", columnNames = {"tenant_id", "user_id", "date"})
        },
        indexes = {
                @Index(name = "idx_attendance_tenant_user_date", columnList = "tenant_id, user_id, date")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "first_login")
    private LocalTime firstLogin;

    @Column(name = "last_logout")
    private LocalTime lastLogout;

    @Column(name = "total_work_hours", precision = 5, scale = 2)
    private BigDecimal totalWorkHours;

    @Column(name = "total_break_hours", precision = 5, scale = 2)
    private BigDecimal totalBreakHours;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AttendanceStatus status;

    private String notes;

    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        HALF_DAY,
        LATE,
        LEAVE
    }
}
