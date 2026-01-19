package com.crm.hrservice.repository;

import com.crm.hrservice.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    Page<LeaveRequest> findByTenantIdAndUserIdOrderByAppliedDateDesc(
            UUID tenantId, UUID userId, Pageable pageable);

    Page<LeaveRequest> findByTenantIdAndStatusOrderByAppliedDateDesc(
            UUID tenantId, LeaveRequest.RequestStatus status, Pageable pageable);

    Page<LeaveRequest> findByTenantIdAndCurrentApproverIdAndStatusOrderByAppliedDateDesc(
            UUID tenantId, UUID currentApproverId, LeaveRequest.RequestStatus status, Pageable pageable);

    List<LeaveRequest> findByTenantIdAndStartDateBetween(
            UUID tenantId, LocalDate start, LocalDate end);

    List<LeaveRequest> findByTenantIdAndEndDateBetween(
            UUID tenantId, LocalDate start, LocalDate end);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.tenantId = :tenantId " +
            "AND ((lr.startDate BETWEEN :startDate AND :endDate) " +
            "OR (lr.endDate BETWEEN :startDate AND :endDate) " +
            "OR (lr.startDate <= :startDate AND lr.endDate >= :endDate))")
    List<LeaveRequest> findOverlappingLeaves(
            UUID tenantId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.tenantId = :tenantId " +
            "AND lr.userId = :userId AND lr.status IN :statuses " +
            "AND ((lr.startDate BETWEEN :startDate AND :endDate) " +
            "OR (lr.endDate BETWEEN :startDate AND :endDate))")
    List<LeaveRequest> findUserLeavesInRange(
            UUID tenantId, UUID userId, LocalDate startDate, LocalDate endDate,
            List<LeaveRequest.RequestStatus> statuses);

    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.leaveType " +
            "WHERE lr.tenantId = :tenantId AND lr.id = :id")
    Optional<LeaveRequest> findByTenantIdAndIdWithLeaveType(UUID tenantId, UUID id);

    Optional<LeaveRequest> findByTenantIdAndId(UUID tenantId, UUID id);

    long countByTenantIdAndStatus(UUID tenantId, LeaveRequest.RequestStatus status);

    long countByTenantIdAndUserIdAndStatus(
            UUID tenantId, UUID userId, LeaveRequest.RequestStatus status);
}
