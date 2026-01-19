package com.crm.hrservice.repository;

import com.crm.hrservice.entity.OnboardingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OnboardingTemplateRepository extends JpaRepository<OnboardingTemplate, UUID> {

    List<OnboardingTemplate> findByTenantIdAndStatus(UUID tenantId, OnboardingTemplate.TemplateStatus status);

    Optional<OnboardingTemplate> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<OnboardingTemplate> findByTenantIdAndIsDefaultTrue(UUID tenantId);

    List<OnboardingTemplate> findByTenantIdOrderByNameAsc(UUID tenantId);
}
