package com.crm.reportingservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "reports", schema = "reporting_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Builder
public class Report extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ReportType type;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String parameters;

    @Column(columnDefinition = "TEXT")
    private String results;

    @Column
    private String generatedBy;

    public enum ReportType {
        LEAD_CONVERSION,
        CALL_ACTIVITY,
        CAMPAIGN_PERFORMANCE,
        SALES_REVENUE,
        USER_ACTIVITY,
        CUSTOM
    }
}
