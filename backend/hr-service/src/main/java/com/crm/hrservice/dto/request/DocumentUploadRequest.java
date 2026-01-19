package com.crm.hrservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Document upload request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadRequest {

    @NotBlank(message = "Document type is required")
    private String documentType;

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotBlank(message = "File path is required")
    private String filePath;

    private Long fileSize;

    private String mimeType;

    private Boolean isMandatory = false;

    private LocalDate expiryDate;
}
