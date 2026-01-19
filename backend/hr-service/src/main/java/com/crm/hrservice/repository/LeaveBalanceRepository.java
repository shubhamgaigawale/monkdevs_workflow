package com.crm.hrservice.repository;

import com.crm.hrservice.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    List<LeaveBalance> findByTenantIdAndUserId(UUID tenantId, UUID userId);

    List<LeaveBalance> findByTenantIdAndUserIdAndYear(UUID tenantId, UUID userId, Integer year);

    Optional<LeaveBalance> findByTenantIdAndUserIdAndLeaveTypeIdAndYear(
            UUID tenantId, UUID userId, UUID leaveTypeId, Integer year);

    @Query("SELECT lb FROM LeaveBalance lb JOIN FETCH lb.leaveType " +
            "WHERE lb.tenantId = :tenantId AND lb.userId = :userId AND lb.year = :year")
    List<LeaveBalance> findByTenantIdAndUserIdAndYearWithLeaveType(
            UUID tenantId, UUID userId, Integer year);

    boolean existsByTenantIdAndUserIdAndLeaveTypeIdAndYear(
            UUID tenantId, UUID userId, UUID leaveTypeId, Integer year);
}
