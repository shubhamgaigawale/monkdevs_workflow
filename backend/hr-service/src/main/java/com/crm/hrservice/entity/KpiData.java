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
 * KPI data entity - tracks Key Performance Indicators with targets
 */
@Entity
@Table(name = "kpi_data", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_kpi_tenant_user_period", columnList = "tenant_id, user_id, period_start, period_end")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class KpiData extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "kpi_name", length = 100)
    private String kpiName; // e.g., "Monthly Sales Target", "Lead Conversion Rate"

    @Column(name = "target_value", precision = 10, scale = 2)
    private BigDecimal targetValue;

    @Column(name = "actual_value", precision = 10, scale = 2)
    private BigDecimal actualValue;

    @Column(name = "achievement_percentage", precision = 5, scale = 2)
    private BigDecimal achievementPercentage;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    private String unit; // e.g., "leads", "calls", "hours", "%"

    private String notes;

    /**
     * Calculate achievement percentage
     */
    public void calculateAchievementPercentage() {
        if (targetValue != null && targetValue.compareTo(BigDecimal.ZERO) > 0 && actualValue != null) {
            this.achievementPercentage = actualValue
                    .divide(targetValue, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, BigDecimal.ROUND_HALF_UP);
        }
    }
}
