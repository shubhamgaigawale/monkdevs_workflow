package com.crm.integrationservice.dto.request;

import com.crm.integrationservice.entity.ESignature;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendDocumentRequest {

    private UUID leadId;

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Recipient email is required")
    private String recipientEmail;

    private ESignature.SignatureProvider provider = ESignature.SignatureProvider.PANDADOC;

    @NotBlank(message = "Document URL or template ID is required")
    private String documentTemplateId;
}
