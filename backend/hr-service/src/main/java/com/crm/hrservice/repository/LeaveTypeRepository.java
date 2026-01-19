package com.crm.hrservice.repository;

import com.crm.hrservice.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, UUID> {

    List<LeaveType> findByTenantIdAndStatus(UUID tenantId, LeaveType.LeaveStatus status);

    List<LeaveType> findByTenantIdOrderByNameAsc(UUID tenantId);

    Optional<LeaveType> findByTenantIdAndCode(UUID tenantId, String code);

    Optional<LeaveType> findByTenantIdAndId(UUID tenantId, UUID id);

    List<LeaveType> findByTenantIdAndIsSystemDefinedTrue(UUID tenantId);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);
}
