package com.crm.hrservice.repository;

import com.crm.hrservice.entity.EquipmentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentAssignmentRepository extends JpaRepository<EquipmentAssignment, UUID> {

    List<EquipmentAssignment> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    List<EquipmentAssignment> findByTenantIdAndUserIdAndStatus(UUID tenantId, UUID userId, EquipmentAssignment.EquipmentStatus status);

    List<EquipmentAssignment> findByTenantIdAndStatus(UUID tenantId, EquipmentAssignment.EquipmentStatus status);

    Optional<EquipmentAssignment> findByTenantIdAndId(UUID tenantId, UUID id);

    List<EquipmentAssignment> findByOnboardingId(UUID onboardingId);
}
