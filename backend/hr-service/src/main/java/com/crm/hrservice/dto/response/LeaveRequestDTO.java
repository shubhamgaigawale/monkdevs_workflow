package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.LeaveRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Leave request response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private String userName;  // Employee name (firstName lastName)
    private String userEmail; // Employee email
    private LeaveTypeDTO leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private LeaveRequest.RequestStatus status;
    private UUID currentApproverId;
    private LocalDateTime appliedDate;
    private LocalDateTime approvedDate;
    private LocalDateTime rejectedDate;
    private String rejectionReason;
    private List<LeaveApprovalDTO> approvals;
}
