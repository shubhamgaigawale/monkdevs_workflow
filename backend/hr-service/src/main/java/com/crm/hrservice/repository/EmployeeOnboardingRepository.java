package com.crm.hrservice.repository;

import com.crm.hrservice.entity.EmployeeOnboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeOnboardingRepository extends JpaRepository<EmployeeOnboarding, UUID> {

    Optional<EmployeeOnboarding> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    Optional<EmployeeOnboarding> findByTenantIdAndId(UUID tenantId, UUID id);

    List<EmployeeOnboarding> findByTenantIdAndStatus(UUID tenantId, EmployeeOnboarding.OnboardingStatus status);

    List<EmployeeOnboarding> findByTenantIdAndManagerId(UUID tenantId, UUID managerId);

    boolean existsByTenantIdAndUserId(UUID tenantId, UUID userId);

    @Query("SELECT eo FROM EmployeeOnboarding eo JOIN FETCH eo.template WHERE eo.tenantId = :tenantId AND eo.userId = :userId")
    Optional<EmployeeOnboarding> findByTenantIdAndUserIdWithTemplate(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);
}
