package com.crm.hrservice.repository;

import com.crm.hrservice.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    Optional<AttendanceRecord> findByTenantIdAndUserIdAndDate(UUID tenantId, UUID userId, LocalDate date);

    List<AttendanceRecord> findByTenantIdAndUserIdAndDateBetweenOrderByDate(
            UUID tenantId, UUID userId, LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> findByTenantIdAndDateBetweenOrderByUserIdAscDateAsc(
            UUID tenantId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.tenantId = :tenantId " +
            "AND ar.date BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findAllByTenantIdAndDateRange(
            UUID tenantId, LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> findByTenantIdAndUserId(UUID tenantId, UUID userId);
}
