package com.crm.hrservice.repository;

import com.crm.hrservice.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, UUID> {

    List<EmployeeDocument> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    List<EmployeeDocument> findByOnboardingId(UUID onboardingId);

    List<EmployeeDocument> findByTenantIdAndUserIdAndDocumentType(UUID tenantId, UUID userId, String documentType);

    List<EmployeeDocument> findByTenantIdAndStatus(UUID tenantId, EmployeeDocument.DocumentStatus status);

    Optional<EmployeeDocument> findByTenantIdAndId(UUID tenantId, UUID id);

    boolean existsByTenantIdAndUserIdAndDocumentType(UUID tenantId, UUID userId, String documentType);
}
