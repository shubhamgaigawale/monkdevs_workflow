package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee document entity - documents uploaded by employees during onboarding and later
 */
@Entity
@Table(name = "employee_documents", schema = "hr_workflow",
        indexes = {
                @Index(name = "idx_employee_document_user", columnList = "tenant_id, user_id"),
                @Index(name = "idx_employee_document_onboarding", columnList = "onboarding_id"),
                @Index(name = "idx_employee_document_status", columnList = "tenant_id, status"),
                @Index(name = "idx_employee_document_type", columnList = "tenant_id, document_type")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocument extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "onboarding_id")
    private EmployeeOnboarding onboarding;

    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;

    @Column(name = "document_name", nullable = false, length = 200)
    private String documentName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DocumentStatus status = DocumentStatus.PENDING_VERIFICATION;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "verified_date")
    private LocalDateTime verifiedDate;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = false;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    public enum DocumentStatus {
        PENDING_VERIFICATION,
        VERIFIED,
        REJECTED,
        EXPIRED
    }
}
