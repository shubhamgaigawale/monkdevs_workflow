package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Performance metric entity - tracks various performance indicators
 */
@Entity
@Table(name = "performance_metrics", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_perf_tenant_user_period", columnList = "tenant_id, user_id, period_start, period_end")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMetric extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "metric_type", length = 50)
    private String metricType; // LEADS_HANDLED, CALLS_MADE, CONVERSION_RATE, etc.

    @Column(name = "metric_value", precision = 10, scale = 2)
    private BigDecimal metricValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", length = 20)
    private PeriodType periodType;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    private String description;

    public enum PeriodType {
        DAILY,
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }
}
