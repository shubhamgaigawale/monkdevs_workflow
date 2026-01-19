package com.crm.hrservice.service;

import com.crm.hrservice.dto.response.AttendanceDTO;
import com.crm.hrservice.entity.AttendanceRecord;
import com.crm.hrservice.entity.TimeEntry;
import com.crm.hrservice.repository.AttendanceRecordRepository;
import com.crm.hrservice.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Attendance service
 * Calculates and manages daily attendance records
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final TimeEntryRepository timeEntryRepository;

    /**
     * Get attendance for a specific date
     */
    public AttendanceDTO getAttendance(UUID userId, UUID tenantId, LocalDate date) {
        log.debug("Fetching attendance for user: {} on date: {}", userId, date);
        return attendanceRecordRepository.findByTenantIdAndUserIdAndDate(tenantId, userId, date)
                .map(this::toDTO)
                .orElse(null);
    }

    /**
     * Get attendance records for date range
     */
    public List<AttendanceDTO> getAttendanceRange(UUID userId, UUID tenantId,
                                                   LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching attendance for user: {} from {} to {}", userId, startDate, endDate);
        return attendanceRecordRepository
                .findByTenantIdAndUserIdAndDateBetweenOrderByDate(tenantId, userId, startDate, endDate)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all team attendance for a date range (for supervisors)
     */
    public List<AttendanceDTO> getTeamAttendance(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching team attendance for tenant: {} from {} to {}", tenantId, startDate, endDate);
        return attendanceRecordRepository
                .findByTenantIdAndDateBetweenOrderByUserIdAscDateAsc(tenantId, startDate, endDate)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Calculate and save attendance for a specific date
     */
    @Transactional
    public AttendanceDTO calculateAttendance(UUID userId, UUID tenantId, LocalDate date) {
        log.info("Calculating attendance for user: {} on date: {}", userId, date);

        // Get time entries for the date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<TimeEntry> entries = timeEntryRepository
                .findByTenantIdAndUserIdAndTimestampBetweenOrderByTimestamp(
                        tenantId, userId, startOfDay, endOfDay);

        if (entries.isEmpty()) {
            log.debug("No time entries found for user: {} on date: {}", userId, date);
            return createAbsentRecord(userId, tenantId, date);
        }

        // Calculate attendance data
        AttendanceRecord record = attendanceRecordRepository
                .findByTenantIdAndUserIdAndDate(tenantId, userId, date)
                .orElse(new AttendanceRecord());

        record.setTenantId(tenantId);
        record.setUserId(userId);
        record.setDate(date);

        // Find first login and last logout
        LocalTime firstLogin = entries.stream()
                .filter(e -> e.getEntryType() == TimeEntry.EntryType.LOGIN)
                .map(e -> e.getTimestamp().toLocalTime())
                .min(LocalTime::compareTo)
                .orElse(null);

        LocalTime lastLogout = entries.stream()
                .filter(e -> e.getEntryType() == TimeEntry.EntryType.LOGOUT)
                .map(e -> e.getTimestamp().toLocalTime())
                .max(LocalTime::compareTo)
                .orElse(null);

        record.setFirstLogin(firstLogin);
        record.setLastLogout(lastLogout);

        // Calculate total work hours and break hours
        BigDecimal[] hours = calculateHours(entries);
        record.setTotalWorkHours(hours[0]);
        record.setTotalBreakHours(hours[1]);

        // Determine status
        record.setStatus(determineStatus(firstLogin, hours[0]));

        record = attendanceRecordRepository.save(record);
        log.info("Attendance calculated for user: {} on date: {}", userId, date);

        return toDTO(record);
    }

    /**
     * Calculate work hours and break hours from time entries
     */
    private BigDecimal[] calculateHours(List<TimeEntry> entries) {
        BigDecimal totalWorkMinutes = BigDecimal.ZERO;
        BigDecimal totalBreakMinutes = BigDecimal.ZERO;

        LocalDateTime lastLogin = null;
        LocalDateTime lastBreakStart = null;

        for (TimeEntry entry : entries) {
            switch (entry.getEntryType()) {
                case LOGIN:
                    lastLogin = entry.getTimestamp();
                    break;

                case BREAK_START:
                    if (lastLogin != null) {
                        long minutes = Duration.between(lastLogin, entry.getTimestamp()).toMinutes();
                        totalWorkMinutes = totalWorkMinutes.add(BigDecimal.valueOf(minutes));
                    }
                    lastBreakStart = entry.getTimestamp();
                    break;

                case BREAK_END:
                    if (lastBreakStart != null) {
                        long minutes = Duration.between(lastBreakStart, entry.getTimestamp()).toMinutes();
                        totalBreakMinutes = totalBreakMinutes.add(BigDecimal.valueOf(minutes));
                    }
                    lastLogin = entry.getTimestamp(); // Resume work
                    break;

                case LOGOUT:
                    if (lastLogin != null) {
                        long minutes = Duration.between(lastLogin, entry.getTimestamp()).toMinutes();
                        totalWorkMinutes = totalWorkMinutes.add(BigDecimal.valueOf(minutes));
                    }
                    lastLogin = null;
                    break;
            }
        }

        // Convert minutes to hours
        BigDecimal totalWorkHours = totalWorkMinutes
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        BigDecimal totalBreakHours = totalBreakMinutes
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        return new BigDecimal[]{totalWorkHours, totalBreakHours};
    }

    /**
     * Determine attendance status
     */
    private AttendanceRecord.AttendanceStatus determineStatus(LocalTime firstLogin, BigDecimal totalWorkHours) {
        if (firstLogin == null) {
            return AttendanceRecord.AttendanceStatus.ABSENT;
        }

        // Late if login after 9:30 AM
        if (firstLogin.isAfter(LocalTime.of(9, 30))) {
            return AttendanceRecord.AttendanceStatus.LATE;
        }

        // Half day if total work hours < 4
        if (totalWorkHours != null && totalWorkHours.compareTo(BigDecimal.valueOf(4)) < 0) {
            return AttendanceRecord.AttendanceStatus.HALF_DAY;
        }

        return AttendanceRecord.AttendanceStatus.PRESENT;
    }

    /**
     * Create absent record
     */
    private AttendanceDTO createAbsentRecord(UUID userId, UUID tenantId, LocalDate date) {
        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.setUserId(userId);
        record.setDate(date);
        record.setStatus(AttendanceRecord.AttendanceStatus.ABSENT);
        record = attendanceRecordRepository.save(record);
        return toDTO(record);
    }

    /**
     * Convert entity to DTO
     */
    private AttendanceDTO toDTO(AttendanceRecord record) {
        return AttendanceDTO.builder()
                .id(record.getId())
                .tenantId(record.getTenantId())
                .userId(record.getUserId())
                .date(record.getDate())
                .firstLogin(record.getFirstLogin())
                .lastLogout(record.getLastLogout())
                .totalWorkHours(record.getTotalWorkHours())
                .totalBreakHours(record.getTotalBreakHours())
                .status(record.getStatus())
                .notes(record.getNotes())
                .build();
    }
}
