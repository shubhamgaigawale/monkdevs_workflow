package com.crm.leadservice.repository;

import com.crm.leadservice.entity.LeadAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadAssignmentRepository extends JpaRepository<LeadAssignment, UUID> {

    // Find current assignment for a lead
    Optional<LeadAssignment> findByLeadIdAndIsCurrentTrue(UUID leadId);

    // Find all assignments for a lead (history)
    List<LeadAssignment> findByLeadIdOrderByAssignedAtDesc(UUID leadId);

    // Find all current assignments for a user
    List<LeadAssignment> findByTenantIdAndAssignedToAndIsCurrentTrue(UUID tenantId, UUID assignedTo);

    // Count current assignments per user (for load balancing)
    @Query("""
        SELECT la.assignedTo, COUNT(la)
        FROM LeadAssignment la
        WHERE la.tenantId = :tenantId
        AND la.isCurrent = true
        GROUP BY la.assignedTo
        """)
    List<Object[]> countAssignmentsByUser(@Param("tenantId") UUID tenantId);

    // Find user with least assignments (for round-robin)
    @Query(value = """
        SELECT assigned_to, COUNT(*) as assignment_count
        FROM lead_management.lead_assignments
        WHERE tenant_id = :tenantId
        AND is_current = true
        AND assigned_to IN (:userIds)
        GROUP BY assigned_to
        ORDER BY assignment_count ASC
        LIMIT 1
        """, nativeQuery = true)
    Object[] findUserWithLeastAssignments(@Param("tenantId") UUID tenantId,
                                          @Param("userIds") List<UUID> userIds);
}
