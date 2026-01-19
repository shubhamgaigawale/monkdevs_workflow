package com.crm.hrservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.hrservice.dto.request.HolidayRequest;
import com.crm.hrservice.dto.request.LeaveApprovalRequest;
import com.crm.hrservice.dto.request.LeaveRequestRequest;
import com.crm.hrservice.dto.request.LeaveTypeRequest;
import com.crm.hrservice.dto.response.*;
import com.crm.hrservice.entity.*;
import com.crm.hrservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Leave management service
 * Handles leave types, balances, requests, approvals, and holiday calendar
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveApprovalRepository leaveApprovalRepository;
    private final HolidayRepository holidayRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    // ==================== Leave Type Management ====================

    /**
     * Create a new leave type (Admin only)
     */
    @Transactional
    public LeaveTypeDTO createLeaveType(UUID tenantId, LeaveTypeRequest request) {
        log.info("Creating leave type: {} for tenant: {}", request.getCode(), tenantId);

        // Check if code already exists
        if (leaveTypeRepository.existsByTenantIdAndCode(tenantId, request.getCode())) {
            throw new BadRequestException("Leave type with code '" + request.getCode() + "' already exists");
        }

        LeaveType leaveType = LeaveType.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .isSystemDefined(false) // Custom leave type
                .daysPerYear(request.getDaysPerYear())
                .allowCarryForward(request.getAllowCarryForward())
                .maxCarryForwardDays(request.getMaxCarryForwardDays())
                .minNoticeDays(request.getMinNoticeDays())
                .maxConsecutiveDays(request.getMaxConsecutiveDays())
                .isPaid(request.getIsPaid())
                .color(request.getColor())
                .status(LeaveType.LeaveStatus.ACTIVE)
                .build();
        leaveType.setTenantId(tenantId);

        leaveType = leaveTypeRepository.save(leaveType);
        log.info("Leave type created successfully: {}", leaveType.getId());

        return toLeaveTypeDTO(leaveType);
    }

    /**
     * Get all active leave types for tenant
     */
    public List<LeaveTypeDTO> getAllLeaveTypes(UUID tenantId) {
        log.info("Fetching all active leave types for tenant: {}", tenantId);
        List<LeaveType> leaveTypes = leaveTypeRepository.findByTenantIdAndStatus(
                tenantId, LeaveType.LeaveStatus.ACTIVE);
        return leaveTypes.stream()
                .map(this::toLeaveTypeDTO)
                .collect(Collectors.toList());
    }

    // ==================== Leave Balance Management ====================

    /**
     * Get leave balances for a user for current year
     */
    public List<LeaveBalanceDTO> getLeaveBalances(UUID userId, UUID tenantId) {
        int currentYear = LocalDate.now().getYear();
        log.info("Fetching leave balances for user: {} in year: {}", userId, currentYear);

        List<LeaveBalance> balances = leaveBalanceRepository
                .findByTenantIdAndUserIdAndYearWithLeaveType(tenantId, userId, currentYear);

        // If no balances exist for current year, allocate them
        if (balances.isEmpty()) {
            log.info("No balances found for user: {}, allocating leaves", userId);
            allocateLeaves(userId, tenantId, currentYear);
            balances = leaveBalanceRepository
                    .findByTenantIdAndUserIdAndYearWithLeaveType(tenantId, userId, currentYear);
        }

        return balances.stream()
                .map(this::toLeaveBalanceDTO)
                .collect(Collectors.toList());
    }

    /**
     * Allocate leaves for a user for a specific year
     */
    @Transactional
    public void allocateLeaves(UUID userId, UUID tenantId, Integer year) {
        log.info("Allocating leaves for user: {} for year: {}", userId, year);

        List<LeaveType> leaveTypes = leaveTypeRepository.findByTenantIdAndStatus(
                tenantId, LeaveType.LeaveStatus.ACTIVE);

        for (LeaveType leaveType : leaveTypes) {
            // Skip if balance already exists
            if (leaveBalanceRepository.existsByTenantIdAndUserIdAndLeaveTypeIdAndYear(
                    tenantId, userId, leaveType.getId(), year)) {
                continue;
            }

            BigDecimal allocated = leaveType.getDaysPerYear() != null
                    ? leaveType.getDaysPerYear()
                    : BigDecimal.ZERO;

            // Add carry forward from previous year if applicable
            BigDecimal carryForward = BigDecimal.ZERO;
            if (leaveType.getAllowCarryForward() && year > 2020) {
                carryForward = calculateCarryForward(userId, tenantId, leaveType.getId(), year - 1);
            }

            LeaveBalance balance = LeaveBalance.builder()
                    .userId(userId)
                    .leaveType(leaveType)
                    .year(year)
                    .totalAllocated(allocated)
                    .used(BigDecimal.ZERO)
                    .pending(BigDecimal.ZERO)
                    .available(allocated.add(carryForward))
                    .carryForward(carryForward)
                    .build();
            balance.setTenantId(tenantId);

            leaveBalanceRepository.save(balance);
            log.info("Allocated {} days of {} for user: {}", allocated, leaveType.getCode(), userId);
        }
    }

    /**
     * Calculate carry forward from previous year
     */
    private BigDecimal calculateCarryForward(UUID userId, UUID tenantId, UUID leaveTypeId, Integer previousYear) {
        return leaveBalanceRepository
                .findByTenantIdAndUserIdAndLeaveTypeIdAndYear(tenantId, userId, leaveTypeId, previousYear)
                .map(prevBalance -> {
                    BigDecimal unused = prevBalance.getAvailable();
                    LeaveType leaveType = prevBalance.getLeaveType();
                    BigDecimal maxCarryForward = leaveType.getMaxCarryForwardDays() != null
                            ? leaveType.getMaxCarryForwardDays()
                            : BigDecimal.ZERO;
                    return unused.min(maxCarryForward);
                })
                .orElse(BigDecimal.ZERO);
    }

    // ==================== Leave Request Management ====================

    /**
     * Apply for leave
     */
    @Transactional
    public LeaveRequestDTO applyLeave(UUID userId, UUID tenantId, LeaveRequestRequest request) {
        log.info("User: {} applying for leave from {} to {}", userId, request.getStartDate(), request.getEndDate());

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        // Get leave type
        LeaveType leaveType = leaveTypeRepository.findByTenantIdAndId(tenantId, request.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found"));

        // Calculate total days (excluding weekends and holidays)
        BigDecimal totalDays = calculateLeaveDays(tenantId, request.getStartDate(), request.getEndDate());

        // Check minimum notice period
        if (leaveType.getMinNoticeDays() != null && leaveType.getMinNoticeDays() > 0) {
            long daysUntilStart = ChronoUnit.DAYS.between(LocalDate.now(), request.getStartDate());
            if (daysUntilStart < leaveType.getMinNoticeDays()) {
                throw new BadRequestException(
                        "Minimum notice period of " + leaveType.getMinNoticeDays() + " days is required");
            }
        }

        // Check maximum consecutive days
        if (leaveType.getMaxConsecutiveDays() != null
                && totalDays.compareTo(new BigDecimal(leaveType.getMaxConsecutiveDays())) > 0) {
            throw new BadRequestException(
                    "Maximum consecutive days allowed is " + leaveType.getMaxConsecutiveDays());
        }

        // Check available balance
        int currentYear = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByTenantIdAndUserIdAndLeaveTypeIdAndYear(tenantId, userId, request.getLeaveTypeId(), currentYear)
                .orElseThrow(() -> new BadRequestException("No leave balance found for this leave type"));

        if (balance.getAvailable().compareTo(totalDays) < 0) {
            throw new BadRequestException(
                    "Insufficient leave balance. Available: " + balance.getAvailable() + ", Requested: " + totalDays);
        }

        // Check for overlapping leaves
        List<LeaveRequest> overlappingLeaves = leaveRequestRepository.findUserLeavesInRange(
                tenantId, userId, request.getStartDate(), request.getEndDate(),
                List.of(LeaveRequest.RequestStatus.PENDING, LeaveRequest.RequestStatus.APPROVED));

        if (!overlappingLeaves.isEmpty()) {
            throw new BadRequestException("You already have a leave request for these dates");
        }

        // Create leave request
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .userId(userId)
                .leaveType(leaveType)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveRequest.RequestStatus.PENDING)
                .appliedDate(LocalDateTime.now())
                .build();
        leaveRequest.setTenantId(tenantId);

        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update balance - mark as pending
        balance.setPending(balance.getPending().add(totalDays));
        balance.setAvailable(balance.getAvailable().subtract(totalDays));
        leaveBalanceRepository.save(balance);

        log.info("Leave request created successfully: {}", leaveRequest.getId());

        // TODO: Send email notification to approver
        // TODO: Create approval workflow entries

        return toLeaveRequestDTO(leaveRequest);
    }

    /**
     * Get user's leave requests
     */
    public Page<LeaveRequestDTO> getMyLeaveRequests(UUID userId, UUID tenantId, Pageable pageable) {
        log.info("Fetching leave requests for user: {}", userId);
        Page<LeaveRequest> requests = leaveRequestRepository
                .findByTenantIdAndUserIdOrderByAppliedDateDesc(tenantId, userId, pageable);
        return requests.map(this::toLeaveRequestDTO);
    }

    /**
     * Get pending approvals for a manager
     *
Shows ALL pending leave requests for the tenant (since approval workflow is not yet implemented)
     */
    public Page<LeaveRequestDTO> getPendingApprovals(UUID approverId, UUID tenantId, Pageable pageable) {
        log.info("Fetching pending approvals for approver: {} (showing all pending requests)", approverId);
        // TODO: Once approval workflow is implemented, filter by currentApproverId
        // For now, show ALL pending requests to managers/HR
        Page<LeaveRequest> requests = leaveRequestRepository
                .findByTenantIdAndStatusOrderByAppliedDateDesc(
                        tenantId, LeaveRequest.RequestStatus.PENDING, pageable);
        return requests.map(this::toLeaveRequestDTO);
    }

    /**
     * Approve leave request
     */
    @Transactional
    public LeaveRequestDTO approveLeave(UUID requestId, UUID approverId, UUID tenantId,
                                        LeaveApprovalRequest request) {
        log.info("Approving leave request: {} by approver: {}", requestId, approverId);

        LeaveRequest leaveRequest = leaveRequestRepository.findByTenantIdAndIdWithLeaveType(tenantId, requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveRequest.RequestStatus.PENDING) {
            throw new BadRequestException("Leave request is not in pending status");
        }

        // Update leave request status
        leaveRequest.setStatus(LeaveRequest.RequestStatus.APPROVED);
        leaveRequest.setApprovedDate(LocalDateTime.now());
        leaveRequestRepository.save(leaveRequest);

        // Update balance - move from pending to used
        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByTenantIdAndUserIdAndLeaveTypeIdAndYear(
                        tenantId, leaveRequest.getUserId(), leaveRequest.getLeaveType().getId(), year)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        balance.setPending(balance.getPending().subtract(leaveRequest.getTotalDays()));
        balance.setUsed(balance.getUsed().add(leaveRequest.getTotalDays()));
        leaveBalanceRepository.save(balance);

        log.info("Leave request approved successfully: {}", requestId);

        // TODO: Send email notification to user
        // TODO: Update approval workflow

        return toLeaveRequestDTO(leaveRequest);
    }

    /**
     * Reject leave request
     */
    @Transactional
    public LeaveRequestDTO rejectLeave(UUID requestId, UUID approverId, UUID tenantId,
                                       LeaveApprovalRequest request) {
        log.info("Rejecting leave request: {} by approver: {}", requestId, approverId);

        LeaveRequest leaveRequest = leaveRequestRepository.findByTenantIdAndIdWithLeaveType(tenantId, requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveRequest.RequestStatus.PENDING) {
            throw new BadRequestException("Leave request is not in pending status");
        }

        // Update leave request status
        leaveRequest.setStatus(LeaveRequest.RequestStatus.REJECTED);
        leaveRequest.setRejectedDate(LocalDateTime.now());
        leaveRequest.setRejectionReason(request.getComments());
        leaveRequestRepository.save(leaveRequest);

        // Restore balance - move from pending back to available
        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByTenantIdAndUserIdAndLeaveTypeIdAndYear(
                        tenantId, leaveRequest.getUserId(), leaveRequest.getLeaveType().getId(), year)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        balance.setPending(balance.getPending().subtract(leaveRequest.getTotalDays()));
        balance.setAvailable(balance.getAvailable().add(leaveRequest.getTotalDays()));
        leaveBalanceRepository.save(balance);

        log.info("Leave request rejected successfully: {}", requestId);

        // TODO: Send email notification to user

        return toLeaveRequestDTO(leaveRequest);
    }

    /**
     * Cancel leave request (by user)
     */
    @Transactional
    public LeaveRequestDTO cancelLeave(UUID requestId, UUID userId, UUID tenantId) {
        log.info("Cancelling leave request: {} by user: {}", requestId, userId);

        LeaveRequest leaveRequest = leaveRequestRepository.findByTenantIdAndIdWithLeaveType(tenantId, requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        // Verify ownership
        if (!leaveRequest.getUserId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own leave requests");
        }

        // Can only cancel pending requests
        if (leaveRequest.getStatus() != LeaveRequest.RequestStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be cancelled");
        }

        // Update leave request status
        leaveRequest.setStatus(LeaveRequest.RequestStatus.CANCELLED);
        leaveRequestRepository.save(leaveRequest);

        // Restore balance
        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByTenantIdAndUserIdAndLeaveTypeIdAndYear(
                        tenantId, userId, leaveRequest.getLeaveType().getId(), year)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        balance.setPending(balance.getPending().subtract(leaveRequest.getTotalDays()));
        balance.setAvailable(balance.getAvailable().add(leaveRequest.getTotalDays()));
        leaveBalanceRepository.save(balance);

        log.info("Leave request cancelled successfully: {}", requestId);

        return toLeaveRequestDTO(leaveRequest);
    }

    /**
     * Get team leave calendar (for managers)
     */
    public List<LeaveRequestDTO> getTeamLeaveCalendar(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        log.info("Fetching team leave calendar from {} to {}", startDate, endDate);
        List<LeaveRequest> leaves = leaveRequestRepository.findOverlappingLeaves(tenantId, startDate, endDate);
        return leaves.stream()
                .filter(lr -> lr.getStatus() == LeaveRequest.RequestStatus.APPROVED)
                .map(this::toLeaveRequestDTO)
                .collect(Collectors.toList());
    }

    // ==================== Holiday Management ====================

    /**
     * Create a holiday
     */
    @Transactional
    public HolidayDTO createHoliday(UUID tenantId, HolidayRequest request) {
        log.info("Creating holiday: {} on {}", request.getName(), request.getDate());

        if (holidayRepository.existsByTenantIdAndDate(tenantId, request.getDate())) {
            throw new BadRequestException("A holiday already exists on this date");
        }

        Holiday holiday = Holiday.builder()
                .name(request.getName())
                .date(request.getDate())
                .type(request.getType())
                .description(request.getDescription())
                .isOptional(request.getIsOptional())
                .build();
        holiday.setTenantId(tenantId);

        holiday = holidayRepository.save(holiday);
        log.info("Holiday created successfully: {}", holiday.getId());

        return toHolidayDTO(holiday);
    }

    /**
     * Get holidays for current year
     */
    public List<HolidayDTO> getHolidays(UUID tenantId) {
        int currentYear = LocalDate.now().getYear();
        log.info("Fetching holidays for year: {}", currentYear);
        List<Holiday> holidays = holidayRepository.findByTenantIdAndYear(tenantId, currentYear);
        return holidays.stream()
                .map(this::toHolidayDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update a holiday
     */
    @Transactional
    public HolidayDTO updateHoliday(UUID tenantId, UUID holidayId, HolidayRequest request) {
        log.info("Updating holiday: {}", holidayId);

        Holiday holiday = holidayRepository.findById(holidayId)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found"));

        if (!holiday.getTenantId().equals(tenantId)) {
            throw new BadRequestException("Holiday not found for this tenant");
        }

        // Check if date changed and if new date already has a holiday
        if (!holiday.getDate().equals(request.getDate())) {
            if (holidayRepository.existsByTenantIdAndDate(tenantId, request.getDate())) {
                throw new BadRequestException("A holiday already exists on this date");
            }
        }

        holiday.setName(request.getName());
        holiday.setDate(request.getDate());
        holiday.setType(request.getType());
        holiday.setDescription(request.getDescription());
        holiday.setIsOptional(request.getIsOptional());

        holiday = holidayRepository.save(holiday);
        log.info("Holiday updated successfully: {}", holiday.getId());

        return toHolidayDTO(holiday);
    }

    /**
     * Delete a holiday
     */
    @Transactional
    public void deleteHoliday(UUID tenantId, UUID holidayId) {
        log.info("Deleting holiday: {}", holidayId);

        Holiday holiday = holidayRepository.findById(holidayId)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found"));

        if (!holiday.getTenantId().equals(tenantId)) {
            throw new BadRequestException("Holiday not found for this tenant");
        }

        holidayRepository.delete(holiday);
        log.info("Holiday deleted successfully: {}", holidayId);
    }

    // ==================== Helper Methods ====================

    /**
     * Calculate working days between two dates (excluding weekends and holidays)
     */
    private BigDecimal calculateLeaveDays(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        List<Holiday> holidays = holidayRepository.findByTenantIdAndDateBetweenOrderByDateAsc(
                tenantId, startDate, endDate);

        long totalDays = 0;
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            // Skip weekends
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                // Skip holidays
                LocalDate finalCurrent = current;
                boolean isHoliday = holidays.stream()
                        .anyMatch(h -> h.getDate().equals(finalCurrent) && !h.getIsOptional());
                if (!isHoliday) {
                    totalDays++;
                }
            }
            current = current.plusDays(1);
        }

        return new BigDecimal(totalDays);
    }

    // ==================== DTO Converters ====================

    private LeaveTypeDTO toLeaveTypeDTO(LeaveType leaveType) {
        return LeaveTypeDTO.builder()
                .id(leaveType.getId())
                .tenantId(leaveType.getTenantId())
                .name(leaveType.getName())
                .code(leaveType.getCode())
                .description(leaveType.getDescription())
                .isSystemDefined(leaveType.getIsSystemDefined())
                .daysPerYear(leaveType.getDaysPerYear())
                .allowCarryForward(leaveType.getAllowCarryForward())
                .maxCarryForwardDays(leaveType.getMaxCarryForwardDays())
                .minNoticeDays(leaveType.getMinNoticeDays())
                .maxConsecutiveDays(leaveType.getMaxConsecutiveDays())
                .isPaid(leaveType.getIsPaid())
                .color(leaveType.getColor())
                .status(leaveType.getStatus())
                .build();
    }

    private LeaveBalanceDTO toLeaveBalanceDTO(LeaveBalance balance) {
        return LeaveBalanceDTO.builder()
                .id(balance.getId())
                .userId(balance.getUserId())
                .leaveType(toLeaveTypeDTO(balance.getLeaveType()))
                .year(balance.getYear())
                .totalAllocated(balance.getTotalAllocated())
                .used(balance.getUsed())
                .pending(balance.getPending())
                .available(balance.getAvailable())
                .carryForward(balance.getCarryForward())
                .build();
    }

    private LeaveRequestDTO toLeaveRequestDTO(LeaveRequest request) {
        // Fetch user information
        String userName = null;
        String userEmail = null;
        try {
            String sql = "SELECT first_name, last_name, email FROM user_management.users WHERE id = ?";
            var userInfo = jdbcTemplate.queryForMap(sql, request.getUserId());
            userName = userInfo.get("first_name") + " " + userInfo.get("last_name");
            userEmail = (String) userInfo.get("email");
        } catch (Exception e) {
            log.warn("Failed to fetch user info for user: {}", request.getUserId());
            userName = "Unknown User";
            userEmail = null;
        }

        return LeaveRequestDTO.builder()
                .id(request.getId())
                .tenantId(request.getTenantId())
                .userId(request.getUserId())
                .userName(userName)
                .userEmail(userEmail)
                .leaveType(toLeaveTypeDTO(request.getLeaveType()))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(request.getTotalDays())
                .reason(request.getReason())
                .status(request.getStatus())
                .currentApproverId(request.getCurrentApproverId())
                .appliedDate(request.getAppliedDate())
                .approvedDate(request.getApprovedDate())
                .rejectedDate(request.getRejectedDate())
                .rejectionReason(request.getRejectionReason())
                .approvals(new ArrayList<>()) // TODO: Map approvals
                .build();
    }

    private HolidayDTO toHolidayDTO(Holiday holiday) {
        return HolidayDTO.builder()
                .id(holiday.getId())
                .tenantId(holiday.getTenantId())
                .name(holiday.getName())
                .date(holiday.getDate())
                .type(holiday.getType())
                .description(holiday.getDescription())
                .isOptional(holiday.getIsOptional())
                .build();
    }
}
