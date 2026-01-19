package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Holiday entity - company holiday calendar
 */
@Entity
@Table(name = "holidays", schema = "hr_workflow",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_holiday_tenant_date", columnNames = {"tenant_id", "date"})
        },
        indexes = {
                @Index(name = "idx_holiday_tenant_date", columnList = "tenant_id, date"),
                @Index(name = "idx_holiday_tenant_type", columnList = "tenant_id, type")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private HolidayType type = HolidayType.PUBLIC;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_optional")
    private Boolean isOptional = false;

    public enum HolidayType {
        PUBLIC,      // Public holiday (all employees off)
        OPTIONAL,    // Optional holiday (employee can choose)
        RESTRICTED   // Restricted holiday (specific to certain locations/teams)
    }
}
