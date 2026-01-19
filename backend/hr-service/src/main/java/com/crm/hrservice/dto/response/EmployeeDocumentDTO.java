package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.EmployeeDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee document response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocumentDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private UUID onboardingId;
    private String documentType;
    private String documentName;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private EmployeeDocument.DocumentStatus status;
    private UUID verifiedBy;
    private LocalDateTime verifiedDate;
    private String verificationNotes;
    private Boolean isMandatory;
    private LocalDate expiryDate;
    private UUID uploadedBy;
    private LocalDateTime createdAt;
}
