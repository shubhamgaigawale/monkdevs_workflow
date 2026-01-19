package com.crm.billingservice.repository;

import com.crm.billingservice.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByTenantIdAndStatus(UUID tenantId, Subscription.SubscriptionStatus status);
}
