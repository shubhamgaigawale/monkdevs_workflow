package com.crm.campaignservice.repository;

import com.crm.campaignservice.entity.CampaignRecipient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, UUID> {

    Optional<CampaignRecipient> findByTenantIdAndId(UUID tenantId, UUID id);

    Page<CampaignRecipient> findByCampaignIdOrderByCreatedAtDesc(UUID campaignId, Pageable pageable);

    List<CampaignRecipient> findByCampaignIdAndStatus(UUID campaignId, CampaignRecipient.RecipientStatus status);

    Optional<CampaignRecipient> findByCampaignIdAndLeadId(UUID campaignId, UUID leadId);

    @Query("SELECT COUNT(r) FROM CampaignRecipient r WHERE r.campaignId = :campaignId AND r.status = :status")
    Long countByCampaignIdAndStatus(@Param("campaignId") UUID campaignId,
                                     @Param("status") CampaignRecipient.RecipientStatus status);

    @Query("SELECT r FROM CampaignRecipient r WHERE r.tenantId = :tenantId AND r.leadId = :leadId")
    List<CampaignRecipient> findByTenantIdAndLeadId(@Param("tenantId") UUID tenantId,
                                                     @Param("leadId") UUID leadId);
}
