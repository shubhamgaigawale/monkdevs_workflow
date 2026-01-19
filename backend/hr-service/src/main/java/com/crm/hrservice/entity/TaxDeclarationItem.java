package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tax Declaration Item Entity - Individual investment/deduction items
 */
@Entity
@Table(name = "tax_declaration_items", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxDeclarationItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaration_id", nullable = false)
    private EmployeeTaxDeclaration declaration;

    @Column(name = "section", nullable = false, length = 20)
    private String section; // 80C, 80D, 80G, etc.

    @Column(name = "sub_section", length = 100)
    private String subSection; // PPF, ELSS, LIC Premium, etc.

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "declared_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal declaredAmount;

    @Column(name = "proof_file_path", length = 500)
    private String proofFilePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "verified_date")
    private LocalDateTime verifiedDate;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }
}
