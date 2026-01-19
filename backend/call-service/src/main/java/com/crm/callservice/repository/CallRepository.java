package com.crm.callservice.repository;

import com.crm.callservice.entity.Call;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CallRepository extends JpaRepository<Call, UUID> {

    // Find by tenant
    Page<Call> findByTenantIdOrderByCallStartTimeDesc(UUID tenantId, Pageable pageable);

    // Find by user
    Page<Call> findByTenantIdAndUserIdOrderByCallStartTimeDesc(UUID tenantId, UUID userId, Pageable pageable);

    // Find by lead
    List<Call> findByTenantIdAndLeadIdOrderByCallStartTimeDesc(UUID tenantId, UUID leadId);

    // Find by phone number (for lead association)
    List<Call> findByTenantIdAndPhoneNumberOrderByCallStartTimeDesc(UUID tenantId, String phoneNumber);

    // Find by direction
    Page<Call> findByTenantIdAndDirectionOrderByCallStartTimeDesc(UUID tenantId, Call.CallDirection direction, Pageable pageable);

    // Find by status
    Page<Call> findByTenantIdAndStatusOrderByCallStartTimeDesc(UUID tenantId, Call.CallStatus status, Pageable pageable);

    // Find by external call ID (for RingCentral integration)
    Optional<Call> findByTenantIdAndExternalCallId(UUID tenantId, String externalCallId);

    // Find calls requiring follow-up
    @Query("""
        SELECT c FROM Call c
        WHERE c.tenantId = :tenantId
        AND c.followUpRequired = true
        AND c.followUpDate <= :date
        ORDER BY c.followUpDate ASC
        """)
    List<Call> findCallsRequiringFollowUp(@Param("tenantId") UUID tenantId, @Param("date") LocalDateTime date);

    // Find calls in date range
    @Query("""
        SELECT c FROM Call c
        WHERE c.tenantId = :tenantId
        AND c.callStartTime BETWEEN :startDate AND :endDate
        ORDER BY c.callStartTime DESC
        """)
    Page<Call> findCallsInDateRange(@Param("tenantId") UUID tenantId,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate,
                                     Pageable pageable);

    // Count calls by direction
    @Query("SELECT c.direction, COUNT(c) FROM Call c WHERE c.tenantId = :tenantId GROUP BY c.direction")
    List<Object[]> countCallsByDirection(@Param("tenantId") UUID tenantId);

    // Count calls by status
    @Query("SELECT c.status, COUNT(c) FROM Call c WHERE c.tenantId = :tenantId GROUP BY c.status")
    List<Object[]> countCallsByStatus(@Param("tenantId") UUID tenantId);

    // Get total call duration by user
    @Query("SELECT c.userId, SUM(c.duration) FROM Call c WHERE c.tenantId = :tenantId GROUP BY c.userId")
    List<Object[]> getTotalDurationByUser(@Param("tenantId") UUID tenantId);
}
