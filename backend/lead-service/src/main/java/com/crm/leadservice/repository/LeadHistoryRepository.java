package com.crm.leadservice.repository;

import com.crm.leadservice.entity.LeadHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadHistoryRepository extends JpaRepository<LeadHistory, UUID> {

    // Find history for a specific lead
    List<LeadHistory> findByLeadIdOrderByTimestampDesc(UUID leadId);

    // Find history for a specific lead with pagination
    Page<LeadHistory> findByLeadIdOrderByTimestampDesc(UUID leadId, Pageable pageable);

    // Find all history for a tenant
    Page<LeadHistory> findByTenantIdOrderByTimestampDesc(UUID tenantId, Pageable pageable);

    // Find history by action type
    List<LeadHistory> findByTenantIdAndActionOrderByTimestampDesc(UUID tenantId, String action);
}
