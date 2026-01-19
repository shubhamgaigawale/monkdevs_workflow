package com.crm.hrservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Document verification request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVerificationRequest {

    @NotNull(message = "Approved status is required")
    private Boolean approved;

    private String verificationNotes;
}
