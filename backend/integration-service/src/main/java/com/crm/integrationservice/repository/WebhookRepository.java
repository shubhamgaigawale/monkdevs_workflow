package com.crm.integrationservice.repository;

import com.crm.integrationservice.entity.IntegrationConfig;
import com.crm.integrationservice.entity.Webhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, UUID> {

    // Find unprocessed webhooks
    List<Webhook> findByProcessedFalseOrderByCreatedAtAsc();

    // Find by tenant and integration
    List<Webhook> findByTenantIdAndIntegrationTypeOrderByCreatedAtDesc(UUID tenantId, IntegrationConfig.IntegrationType integrationType);

    // Find by webhook ID (for idempotency)
    List<Webhook> findByWebhookId(String webhookId);
}
