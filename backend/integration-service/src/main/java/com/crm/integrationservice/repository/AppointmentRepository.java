package com.crm.integrationservice.repository;

import com.crm.integrationservice.entity.Appointment;
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
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Find by tenant
    Page<Appointment> findByTenantIdOrderByStartTimeDesc(UUID tenantId, Pageable pageable);

    // Find by user
    Page<Appointment> findByTenantIdAndUserIdOrderByStartTimeDesc(UUID tenantId, UUID userId, Pageable pageable);

    // Find by lead
    List<Appointment> findByTenantIdAndLeadIdOrderByStartTimeDesc(UUID tenantId, UUID leadId);

    // Find by external ID (Calendly ID)
    Optional<Appointment> findByExternalId(String externalId);

    // Find upcoming appointments
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.tenantId = :tenantId
        AND a.startTime > :now
        AND a.status = 'SCHEDULED'
        ORDER BY a.startTime ASC
        """)
    List<Appointment> findUpcomingAppointments(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    // Find appointments in date range
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.tenantId = :tenantId
        AND a.startTime BETWEEN :startDate AND :endDate
        ORDER BY a.startTime ASC
        """)
    List<Appointment> findAppointmentsInRange(@Param("tenantId") UUID tenantId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
}
