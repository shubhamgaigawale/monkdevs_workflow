package com.crm.campaignservice.repository;

import com.crm.campaignservice.entity.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    Optional<Campaign> findByTenantIdAndId(UUID tenantId, UUID id);

    Page<Campaign> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    Page<Campaign> findByTenantIdAndUserIdOrderByCreatedAtDesc(UUID tenantId, UUID userId, Pageable pageable);

    Page<Campaign> findByTenantIdAndStatusOrderByCreatedAtDesc(
            UUID tenantId, Campaign.CampaignStatus status, Pageable pageable);

    List<Campaign> findByTenantIdAndStatusAndScheduledAtBefore(
            UUID tenantId, Campaign.CampaignStatus status, LocalDateTime scheduledAt);

    @Query("SELECT c FROM Campaign c WHERE c.tenantId = :tenantId AND c.status = :status")
    List<Campaign> findByTenantIdAndStatus(@Param("tenantId") UUID tenantId,
                                           @Param("status") Campaign.CampaignStatus status);

    @Query("SELECT COUNT(c) FROM Campaign c WHERE c.tenantId = :tenantId AND c.status = :status")
    Long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId,
                                   @Param("status") Campaign.CampaignStatus status);
}
