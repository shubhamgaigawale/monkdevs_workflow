package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * HRA Declaration Entity - House Rent Allowance declaration with landlord details
 */
@Entity
@Table(name = "hra_declarations", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HraDeclaration extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaration_id", nullable = false)
    private EmployeeTaxDeclaration declaration;

    @Column(name = "rent_paid_monthly", nullable = false, precision = 10, scale = 2)
    private BigDecimal rentPaidMonthly;

    @Column(name = "landlord_name", nullable = false, length = 200)
    private String landlordName;

    @Column(name = "landlord_pan", length = 20)
    private String landlordPan;

    @Column(name = "landlord_address", columnDefinition = "TEXT")
    private String landlordAddress;

    @Column(name = "metro_city")
    private Boolean metroCity = false;

    @Column(name = "rent_receipts_path", length = 500)
    private String rentReceiptsPath;

    @Column(name = "calculated_exemption", precision = 10, scale = 2)
    private BigDecimal calculatedExemption;
}
