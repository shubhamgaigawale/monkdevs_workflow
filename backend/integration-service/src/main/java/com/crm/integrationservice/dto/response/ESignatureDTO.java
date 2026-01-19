package com.crm.integrationservice.dto.response;

import com.crm.integrationservice.entity.ESignature;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ESignatureDTO {

    private UUID id;
    private UUID tenantId;
    private UUID leadId;
    private UUID userId;
    private String externalId;
    private ESignature.SignatureProvider provider;
    private String documentName;
    private ESignature.SignatureStatus status;
    private String recipientEmail;
    private String recipientName;
    private String documentUrl;
    private String signedUrl;
    private LocalDateTime sentAt;
    private LocalDateTime viewedAt;
    private LocalDateTime signedAt;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}
