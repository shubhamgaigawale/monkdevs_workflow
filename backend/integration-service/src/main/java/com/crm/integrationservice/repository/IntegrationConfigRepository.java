package com.crm.integrationservice.repository;

import com.crm.integrationservice.entity.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, UUID> {

    // Find by tenant and integration type
    Optional<IntegrationConfig> findByTenantIdAndIntegrationType(UUID tenantId, IntegrationConfig.IntegrationType integrationType);

    // Find all integrations for tenant
    List<IntegrationConfig> findByTenantId(UUID tenantId);

    // Find enabled integrations
    List<IntegrationConfig> findByTenantIdAndIsEnabledTrue(UUID tenantId);
}
