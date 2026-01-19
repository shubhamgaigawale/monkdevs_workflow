package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Employee Tax Declaration Entity - Main tax declaration for each employee per financial year
 */
@Entity
@Table(name = "employee_tax_declarations", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeTaxDeclaration extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "financial_year", nullable = false, length = 10)
    private String financialYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "regime_type", nullable = false, length = 20)
    private TaxRegime.RegimeType regimeType;

    @Column(name = "total_declared_amount", precision = 12, scale = 2)
    private BigDecimal totalDeclaredAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private Status status = Status.DRAFT;

    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @OneToMany(mappedBy = "declaration", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaxDeclarationItem> items;

    @OneToOne(mappedBy = "declaration", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private HraDeclaration hraDeclaration;

    public enum Status {
        DRAFT,
        SUBMITTED,
        VERIFIED,
        APPROVED,
        REJECTED
    }
}
