package com.crm.hrservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.hrservice.dto.request.TimeEntryRequest;
import com.crm.hrservice.dto.response.TimeEntryDTO;
import com.crm.hrservice.entity.TimeEntry;
import com.crm.hrservice.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Time tracking service
 * Handles clock in/out, breaks, and time entry management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TimeTrackingService {

    private final TimeEntryRepository timeEntryRepository;

    /**
     * Clock in (Login)
     */
    @Transactional
    public TimeEntryDTO clockIn(UUID userId, UUID tenantId, TimeEntryRequest request) {
        log.info("Clock in for user: {} in tenant: {}", userId, tenantId);

        // Check if already clocked in
        timeEntryRepository.findLatestByTenantIdAndUserId(tenantId, userId)
                .ifPresent(lastEntry -> {
                    if (lastEntry.getEntryType() == TimeEntry.EntryType.LOGIN ||
                            lastEntry.getEntryType() == TimeEntry.EntryType.BREAK_END) {
                        throw new BadRequestException("You are already clocked in");
                    }
                });

        TimeEntry entry = createTimeEntry(userId, tenantId, TimeEntry.EntryType.LOGIN, request);
        entry = timeEntryRepository.save(entry);

        log.info("User {} clocked in successfully", userId);
        return toDTO(entry);
    }

    /**
     * Clock out (Logout)
     */
    @Transactional
    public TimeEntryDTO clockOut(UUID userId, UUID tenantId, TimeEntryRequest request) {
        log.info("Clock out for user: {} in tenant: {}", userId, tenantId);

        // Check if clocked in
        TimeEntry lastEntry = timeEntryRepository.findLatestByTenantIdAndUserId(tenantId, userId)
                .orElseThrow(() -> new BadRequestException("You must clock in first"));

        if (lastEntry.getEntryType() == TimeEntry.EntryType.LOGOUT) {
            throw new BadRequestException("You are already clocked out");
        }

        if (lastEntry.getEntryType() == TimeEntry.EntryType.BREAK_START) {
            throw new BadRequestException("You must end your break before clocking out");
        }

        TimeEntry entry = createTimeEntry(userId, tenantId, TimeEntry.EntryType.LOGOUT, request);
        entry = timeEntryRepository.save(entry);

        log.info("User {} clocked out successfully", userId);
        return toDTO(entry);
    }

    /**
     * Start break
     */
    @Transactional
    public TimeEntryDTO startBreak(UUID userId, UUID tenantId, TimeEntryRequest request) {
        log.info("Start break for user: {} in tenant: {}", userId, tenantId);

        // Check if clocked in
        TimeEntry lastEntry = timeEntryRepository.findLatestByTenantIdAndUserId(tenantId, userId)
                .orElseThrow(() -> new BadRequestException("You must clock in first"));

        if (lastEntry.getEntryType() == TimeEntry.EntryType.LOGOUT) {
            throw new BadRequestException("You are currently clocked out");
        }

        if (lastEntry.getEntryType() == TimeEntry.EntryType.BREAK_START) {
            throw new BadRequestException("You are already on break");
        }

        TimeEntry entry = createTimeEntry(userId, tenantId, TimeEntry.EntryType.BREAK_START, request);
        entry = timeEntryRepository.save(entry);

        log.info("User {} started break", userId);
        return toDTO(entry);
    }

    /**
     * End break
     */
    @Transactional
    public TimeEntryDTO endBreak(UUID userId, UUID tenantId, TimeEntryRequest request) {
        log.info("End break for user: {} in tenant: {}", userId, tenantId);

        // Check if on break
        TimeEntry lastEntry = timeEntryRepository.findLatestByTenantIdAndUserId(tenantId, userId)
                .orElseThrow(() -> new BadRequestException("You must start a break first"));

        if (lastEntry.getEntryType() != TimeEntry.EntryType.BREAK_START) {
            throw new BadRequestException("You are not currently on break");
        }

        TimeEntry entry = createTimeEntry(userId, tenantId, TimeEntry.EntryType.BREAK_END, request);
        entry = timeEntryRepository.save(entry);

        log.info("User {} ended break", userId);
        return toDTO(entry);
    }

    /**
     * Get all time entries for a user
     */
    public List<TimeEntryDTO> getUserTimeEntries(UUID userId, UUID tenantId) {
        log.debug("Fetching time entries for user: {} in tenant: {}", userId, tenantId);
        return timeEntryRepository.findByTenantIdAndUserIdOrderByTimestampDesc(tenantId, userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get time entries for a user within date range
     */
    public List<TimeEntryDTO> getUserTimeEntriesInRange(
            UUID userId, UUID tenantId, LocalDateTime start, LocalDateTime end) {
        log.debug("Fetching time entries for user: {} between {} and {}", userId, start, end);
        return timeEntryRepository.findByTenantIdAndUserIdAndTimestampBetweenOrderByTimestamp(
                        tenantId, userId, start, end)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get latest time entry for a user
     */
    public TimeEntryDTO getLatestEntry(UUID userId, UUID tenantId) {
        return timeEntryRepository.findLatestByTenantIdAndUserId(tenantId, userId)
                .map(this::toDTO)
                .orElse(null);
    }

    /**
     * Get current status of user (clocked in, on break, clocked out)
     */
    public String getCurrentStatus(UUID userId, UUID tenantId) {
        return timeEntryRepository.findLatestByTenantIdAndUserId(tenantId, userId)
                .map(entry -> {
                    switch (entry.getEntryType()) {
                        case LOGIN:
                            return "CLOCKED_IN";
                        case LOGOUT:
                            return "CLOCKED_OUT";
                        case BREAK_START:
                            return "ON_BREAK";
                        case BREAK_END:
                            return "CLOCKED_IN";
                        default:
                            return "UNKNOWN";
                    }
                })
                .orElse("CLOCKED_OUT");
    }

    /**
     * Calculate total hours worked today (in minutes)
     */
    public int getTodayHours(UUID userId, UUID tenantId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<TimeEntry> entries = timeEntryRepository.findByTenantIdAndUserIdAndTimestampBetweenOrderByTimestamp(
                tenantId, userId, startOfDay, endOfDay);

        int totalMinutes = 0;
        LocalDateTime loginTime = null;
        LocalDateTime breakStartTime = null;

        for (TimeEntry entry : entries) {
            switch (entry.getEntryType()) {
                case LOGIN:
                    loginTime = entry.getTimestamp();
                    break;
                case LOGOUT:
                    if (loginTime != null) {
                        totalMinutes += java.time.Duration.between(loginTime, entry.getTimestamp()).toMinutes();
                        loginTime = null;
                    }
                    break;
                case BREAK_START:
                    breakStartTime = entry.getTimestamp();
                    break;
                case BREAK_END:
                    if (breakStartTime != null) {
                        // Subtract break time from total
                        totalMinutes -= java.time.Duration.between(breakStartTime, entry.getTimestamp()).toMinutes();
                        breakStartTime = null;
                    }
                    break;
            }
        }

        // If still clocked in, add time until now
        if (loginTime != null) {
            totalMinutes += java.time.Duration.between(loginTime, LocalDateTime.now()).toMinutes();
        }

        return totalMinutes;
    }

    /**
     * Calculate total break time today (in minutes)
     */
    public int getTodayBreakTime(UUID userId, UUID tenantId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<TimeEntry> entries = timeEntryRepository.findByTenantIdAndUserIdAndTimestampBetweenOrderByTimestamp(
                tenantId, userId, startOfDay, endOfDay);

        int totalBreakMinutes = 0;
        LocalDateTime breakStartTime = null;

        for (TimeEntry entry : entries) {
            if (entry.getEntryType() == TimeEntry.EntryType.BREAK_START) {
                breakStartTime = entry.getTimestamp();
            } else if (entry.getEntryType() == TimeEntry.EntryType.BREAK_END && breakStartTime != null) {
                totalBreakMinutes += java.time.Duration.between(breakStartTime, entry.getTimestamp()).toMinutes();
                breakStartTime = null;
            }
        }

        // If still on break, add time until now
        if (breakStartTime != null) {
            totalBreakMinutes += java.time.Duration.between(breakStartTime, LocalDateTime.now()).toMinutes();
        }

        return totalBreakMinutes;
    }

    /**
     * Create time entry entity
     */
    private TimeEntry createTimeEntry(UUID userId, UUID tenantId,
                                      TimeEntry.EntryType entryType,
                                      TimeEntryRequest request) {
        TimeEntry entry = new TimeEntry();
        entry.setTenantId(tenantId);
        entry.setUserId(userId);
        entry.setEntryType(entryType);
        entry.setTimestamp(LocalDateTime.now());
        entry.setLocationData(request.getLocationData());
        entry.setDeviceInfo(request.getDeviceInfo());
        entry.setNotes(request.getNotes());
        return entry;
    }

    /**
     * Convert entity to DTO
     */
    private TimeEntryDTO toDTO(TimeEntry entry) {
        return TimeEntryDTO.builder()
                .id(entry.getId())
                .tenantId(entry.getTenantId())
                .userId(entry.getUserId())
                .entryType(entry.getEntryType())
                .timestamp(entry.getTimestamp())
                .locationData(entry.getLocationData())
                .deviceInfo(entry.getDeviceInfo())
                .notes(entry.getNotes())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
