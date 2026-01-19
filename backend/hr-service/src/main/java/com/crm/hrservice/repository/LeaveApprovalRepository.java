package com.crm.hrservice.repository;

import com.crm.hrservice.entity.LeaveApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveApprovalRepository extends JpaRepository<LeaveApproval, UUID> {

    List<LeaveApproval> findByLeaveRequestIdOrderByLevelAsc(UUID leaveRequestId);

    Optional<LeaveApproval> findByLeaveRequestIdAndLevel(UUID leaveRequestId, Integer level);

    List<LeaveApproval> findByTenantIdAndApproverIdAndStatusOrderByCreatedAtDesc(
            UUID tenantId, UUID approverId, LeaveApproval.ApprovalStatus status);

    @Query("SELECT la FROM LeaveApproval la JOIN FETCH la.leaveRequest lr " +
            "WHERE la.tenantId = :tenantId AND la.approverId = :approverId " +
            "AND la.status = :status ORDER BY la.createdAt DESC")
    List<LeaveApproval> findPendingApprovalsWithLeaveRequest(
            UUID tenantId, UUID approverId, LeaveApproval.ApprovalStatus status);

    long countByTenantIdAndApproverIdAndStatus(
            UUID tenantId, UUID approverId, LeaveApproval.ApprovalStatus status);
}
