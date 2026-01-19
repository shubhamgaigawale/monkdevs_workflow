package com.crm.callservice.repository;

import com.crm.callservice.entity.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, UUID> {

    // Find logs by call
    List<CallLog> findByCallIdOrderByCreatedAtDesc(UUID callId);

    // Find logs by event type
    List<CallLog> findByTenantIdAndEventTypeOrderByCreatedAtDesc(UUID tenantId, String eventType);

    // Find recent logs for tenant
    List<CallLog> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
