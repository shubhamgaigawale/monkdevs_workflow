package com.crm.hrservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Leave balance response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceDTO {

    private UUID id;
    private UUID userId;
    private LeaveTypeDTO leaveType;
    private Integer year;
    private BigDecimal totalAllocated;
    private BigDecimal used;
    private BigDecimal pending;
    private BigDecimal available;
    private BigDecimal carryForward;
}
