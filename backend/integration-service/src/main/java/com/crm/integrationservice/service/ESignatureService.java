package com.crm.integrationservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.integrationservice.dto.request.SendDocumentRequest;
import com.crm.integrationservice.dto.response.ESignatureDTO;
import com.crm.integrationservice.entity.ESignature;
import com.crm.integrationservice.repository.ESignatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ESignatureService {

    private final ESignatureRepository signatureRepository;
    private final OAuth2Service oauth2Service;

    /**
     * Send document for signature
     */
    public ESignatureDTO sendDocument(SendDocumentRequest request, UUID tenantId, UUID userId) {
        log.info("Sending document for signature: {}", request.getDocumentName());

        // Verify OAuth token exists
        oauth2Service.getToken(tenantId, userId,
            request.getProvider() == ESignature.SignatureProvider.PANDADOC ?
            com.crm.integrationservice.entity.IntegrationConfig.IntegrationType.PANDADOC :
            com.crm.integrationservice.entity.IntegrationConfig.IntegrationType.DOCUSIGN);

        // Create signature record
        ESignature signature = new ESignature();
        signature.setTenantId(tenantId);
        signature.setUserId(userId);
        signature.setLeadId(request.getLeadId());
        signature.setProvider(request.getProvider());
        signature.setDocumentName(request.getDocumentName());
        signature.setRecipientName(request.getRecipientName());
        signature.setRecipientEmail(request.getRecipientEmail());
        signature.setStatus(ESignature.SignatureStatus.DRAFT);
        signature.setSentAt(LocalDateTime.now());

        // In a real implementation, you would call the provider API here
        // For now, we just save the record
        signature = signatureRepository.save(signature);

        log.info("Document sent successfully: {}", signature.getId());
        return convertToDTO(signature);
    }

    /**
     * Get all signatures
     */
    @Transactional(readOnly = true)
    public Page<ESignatureDTO> getAllSignatures(UUID tenantId, UUID userId, List<String> roles, int page, int size) {
        log.info("Fetching signatures for tenant: {}", tenantId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<ESignature> signatures;

        if (roles.contains("AGENT")) {
            signatures = signatureRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId, pageable);
        } else {
            signatures = signatureRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }

        return signatures.map(this::convertToDTO);
    }

    /**
     * Convert to DTO
     */
    private ESignatureDTO convertToDTO(ESignature signature) {
        return ESignatureDTO.builder()
                .id(signature.getId())
                .tenantId(signature.getTenantId())
                .leadId(signature.getLeadId())
                .userId(signature.getUserId())
                .externalId(signature.getExternalId())
                .provider(signature.getProvider())
                .documentName(signature.getDocumentName())
                .status(signature.getStatus())
                .recipientEmail(signature.getRecipientEmail())
                .recipientName(signature.getRecipientName())
                .documentUrl(signature.getDocumentUrl())
                .signedUrl(signature.getSignedUrl())
                .sentAt(signature.getSentAt())
                .viewedAt(signature.getViewedAt())
                .signedAt(signature.getSignedAt())
                .metadata(signature.getMetadata())
                .createdAt(signature.getCreatedAt())
                .build();
    }
}
