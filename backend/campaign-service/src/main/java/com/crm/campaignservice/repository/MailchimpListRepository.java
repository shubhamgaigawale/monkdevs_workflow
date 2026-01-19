package com.crm.campaignservice.repository;

import com.crm.campaignservice.entity.MailchimpList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MailchimpListRepository extends JpaRepository<MailchimpList, UUID> {

    Optional<MailchimpList> findByTenantIdAndId(UUID tenantId, UUID id);

    List<MailchimpList> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    Optional<MailchimpList> findByTenantIdAndMailchimpListId(UUID tenantId, String mailchimpListId);

    Optional<MailchimpList> findByTenantIdAndIsDefaultTrue(UUID tenantId);
}
