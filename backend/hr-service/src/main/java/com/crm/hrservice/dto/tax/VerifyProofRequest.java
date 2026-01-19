package com.crm.hrservice.dto.tax;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for verifying investment proof
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyProofRequest {
    @NotNull(message = "Approval status is required")
    private Boolean approved;

    private String verificationNotes;
}
