package com.crm.integrationservice.repository;

import com.crm.integrationservice.entity.ESignature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ESignatureRepository extends JpaRepository<ESignature, UUID> {

    // Find by tenant
    Page<ESignature> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    // Find by user
    Page<ESignature> findByTenantIdAndUserIdOrderByCreatedAtDesc(UUID tenantId, UUID userId, Pageable pageable);

    // Find by lead
    List<ESignature> findByTenantIdAndLeadIdOrderByCreatedAtDesc(UUID tenantId, UUID leadId);

    // Find by external ID
    Optional<ESignature> findByExternalId(String externalId);

    // Find by status
    Page<ESignature> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, ESignature.SignatureStatus status, Pageable pageable);

    // Find pending signatures
    List<ESignature> findByTenantIdAndStatusIn(UUID tenantId, List<ESignature.SignatureStatus> statuses);
}
