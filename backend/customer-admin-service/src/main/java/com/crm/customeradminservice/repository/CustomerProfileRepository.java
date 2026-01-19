package com.crm.customeradminservice.repository;

import com.crm.customeradminservice.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
    Optional<CustomerProfile> findByTenantId(UUID tenantId);
    Optional<CustomerProfile> findByDomain(String domain);
}
