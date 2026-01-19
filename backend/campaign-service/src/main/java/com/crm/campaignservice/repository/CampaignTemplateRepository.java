package com.crm.campaignservice.repository;

import com.crm.campaignservice.entity.CampaignTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignTemplateRepository extends JpaRepository<CampaignTemplate, UUID> {

    Optional<CampaignTemplate> findByTenantIdAndId(UUID tenantId, UUID id);

    Page<CampaignTemplate> findByTenantIdAndIsActiveTrueOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    Page<CampaignTemplate> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    List<CampaignTemplate> findByTenantIdAndCategoryAndIsActiveTrue(UUID tenantId, String category);

    List<CampaignTemplate> findByTenantIdAndIsActiveTrue(UUID tenantId);
}
