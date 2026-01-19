package com.crm.integrationservice.repository;

import com.crm.integrationservice.entity.IntegrationConfig;
import com.crm.integrationservice.entity.OAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuthTokenRepository extends JpaRepository<OAuthToken, UUID> {

    // Find token by tenant, user, and integration
    Optional<OAuthToken> findByTenantIdAndUserIdAndIntegrationType(UUID tenantId, UUID userId, IntegrationConfig.IntegrationType integrationType);

    // Find all tokens for user
    List<OAuthToken> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    // Find expired tokens
    @Query("SELECT t FROM OAuthToken t WHERE t.expiresAt < :now")
    List<OAuthToken> findExpiredTokens(@Param("now") LocalDateTime now);

    // Delete token
    void deleteByTenantIdAndUserIdAndIntegrationType(UUID tenantId, UUID userId, IntegrationConfig.IntegrationType integrationType);
}
