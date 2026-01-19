package com.crm.billingservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions", schema = "billing_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Builder
public class Subscription extends BaseEntity {

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PlanType planType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BillingCycle billingCycle;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @Column
    private LocalDate nextBillingDate;

    @Column
    private Integer userLimit;

    @Column
    private Integer currentUsers;

    public enum PlanType {
        BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM
    }

    public enum BillingCycle {
        MONTHLY, QUARTERLY, YEARLY
    }

    public enum SubscriptionStatus {
        ACTIVE, CANCELLED, EXPIRED, SUSPENDED, TRIAL
    }
}
