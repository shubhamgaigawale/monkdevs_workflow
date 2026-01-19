package com.crm.hrservice.repository;

import com.crm.hrservice.entity.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    List<TimeEntry> findByTenantIdAndUserIdOrderByTimestampDesc(UUID tenantId, UUID userId);

    List<TimeEntry> findByTenantIdAndUserIdAndTimestampBetweenOrderByTimestamp(
            UUID tenantId, UUID userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT te FROM TimeEntry te WHERE te.tenantId = :tenantId AND te.userId = :userId " +
            "ORDER BY te.timestamp DESC LIMIT 1")
    Optional<TimeEntry> findLatestByTenantIdAndUserId(UUID tenantId, UUID userId);

    @Query("SELECT te FROM TimeEntry te WHERE te.tenantId = :tenantId AND te.userId = :userId " +
            "AND te.entryType = :entryType ORDER BY te.timestamp DESC LIMIT 1")
    Optional<TimeEntry> findLatestByTenantIdAndUserIdAndEntryType(
            UUID tenantId, UUID userId, TimeEntry.EntryType entryType);

    List<TimeEntry> findByTenantIdAndTimestampBetween(UUID tenantId, LocalDateTime start, LocalDateTime end);
}
