package com.crm.customeradminservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_profiles", schema = "customer_admin_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Builder
public class CustomerProfile extends BaseEntity {

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false, unique = true)
    private String domain;

    @Column
    private String industry;

    @Column
    private String contactPerson;

    @Column
    private String contactEmail;

    @Column
    private String contactPhone;

    @Column
    private String address;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "jsonb")
    private String customSettings;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus;

    public enum AccountStatus {
        ACTIVE, SUSPENDED, TRIAL, CLOSED
    }
}
