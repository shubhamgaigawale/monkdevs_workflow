package com.crm.leadservice.repository;

import com.crm.leadservice.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {

    // Find by tenant
    Page<Lead> findByTenantId(UUID tenantId, Pageable pageable);

    // Find by tenant and status
    Page<Lead> findByTenantIdAndStatus(UUID tenantId, Lead.LeadStatus status, Pageable pageable);

    // Find by phone (for call association)
    Optional<Lead> findByTenantIdAndPhone(UUID tenantId, String phone);

    // Find by email
    Optional<Lead> findByTenantIdAndEmail(UUID tenantId, String email);

    // Full-text search
    @Query(value = """
        SELECT * FROM lead_management.leads
        WHERE tenant_id = :tenantId
        AND to_tsvector('english', COALESCE(first_name, '') || ' ' ||
            COALESCE(last_name, '') || ' ' ||
            COALESCE(company, '') || ' ' ||
            COALESCE(email, ''))
        @@ plainto_tsquery('english', :searchQuery)
        """, nativeQuery = true)
    List<Lead> searchLeads(@Param("tenantId") UUID tenantId, @Param("searchQuery") String searchQuery);

    // Find leads assigned to specific user
    @Query("""
        SELECT l FROM Lead l
        WHERE l.tenantId = :tenantId
        AND l.id IN (
            SELECT la.leadId FROM LeadAssignment la
            WHERE la.assignedTo = :userId
            AND la.isCurrent = true
        )
        """)
    Page<Lead> findAssignedLeads(@Param("tenantId") UUID tenantId,
                                  @Param("userId") UUID userId,
                                  Pageable pageable);

    // Count leads by status for a tenant
    @Query("SELECT l.status, COUNT(l) FROM Lead l WHERE l.tenantId = :tenantId GROUP BY l.status")
    List<Object[]> countLeadsByStatus(@Param("tenantId") UUID tenantId);

    // Find unassigned leads
    @Query("""
        SELECT l FROM Lead l
        WHERE l.tenantId = :tenantId
        AND l.id NOT IN (
            SELECT la.leadId FROM LeadAssignment la
            WHERE la.isCurrent = true
        )
        """)
    Page<Lead> findUnassignedLeads(@Param("tenantId") UUID tenantId, Pageable pageable);
}
