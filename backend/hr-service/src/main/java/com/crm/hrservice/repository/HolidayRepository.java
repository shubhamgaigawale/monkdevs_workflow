package com.crm.hrservice.repository;

import com.crm.hrservice.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, UUID> {

    List<Holiday> findByTenantIdAndDateBetweenOrderByDateAsc(
            UUID tenantId, LocalDate startDate, LocalDate endDate);

    List<Holiday> findByTenantIdAndTypeOrderByDateAsc(
            UUID tenantId, Holiday.HolidayType type);

    Optional<Holiday> findByTenantIdAndDate(UUID tenantId, LocalDate date);

    Optional<Holiday> findByTenantIdAndId(UUID tenantId, UUID id);

    boolean existsByTenantIdAndDate(UUID tenantId, LocalDate date);

    @Query("SELECT h FROM Holiday h WHERE h.tenantId = :tenantId " +
            "AND EXTRACT(YEAR FROM h.date) = :year ORDER BY h.date ASC")
    List<Holiday> findByTenantIdAndYear(UUID tenantId, Integer year);

    @Query("SELECT h FROM Holiday h WHERE h.tenantId = :tenantId " +
            "AND h.date >= CURRENT_DATE ORDER BY h.date ASC")
    List<Holiday> findUpcomingHolidays(UUID tenantId);
}
