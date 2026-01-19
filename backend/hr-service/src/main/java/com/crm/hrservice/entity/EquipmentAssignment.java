package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Equipment assignment entity - equipment assigned to employees (laptops, phones, etc.)
 */
@Entity
@Table(name = "equipment_assignments", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_equipment_assignment_user", columnList = "tenant_id, user_id"),
                @Index(name = "idx_equipment_assignment_status", columnList = "tenant_id, status"),
                @Index(name = "idx_equipment_assignment_type", columnList = "tenant_id, equipment_type")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentAssignment extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "onboarding_id")
    private EmployeeOnboarding onboarding;

    @Column(name = "equipment_type", nullable = false, length = 100)
    private String equipmentType;

    @Column(name = "equipment_name", nullable = false, length = 200)
    private String equipmentName;

    @Column(name = "serial_number", length = 200)
    private String serialNumber;

    @Column(name = "asset_tag", length = 100)
    private String assetTag;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EquipmentStatus status = EquipmentStatus.ASSIGNED;

    @Column(name = "condition_at_assignment", length = 50)
    private String conditionAtAssignment;

    @Column(name = "condition_at_return", length = 50)
    private String conditionAtReturn;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "assigned_by")
    private UUID assignedBy;

    public enum EquipmentStatus {
        ASSIGNED,
        RETURNED,
        LOST,
        DAMAGED,
        UNDER_REPAIR
    }
}
