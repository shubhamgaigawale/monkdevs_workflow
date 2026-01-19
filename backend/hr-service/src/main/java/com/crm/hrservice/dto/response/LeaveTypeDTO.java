package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Leave type response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeDTO {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String code;
    private String description;
    private Boolean isSystemDefined;
    private BigDecimal daysPerYear;
    private Boolean allowCarryForward;
    private BigDecimal maxCarryForwardDays;
    private Integer minNoticeDays;
    private Integer maxConsecutiveDays;
    private Boolean isPaid;
    private String color;
    private LeaveType.LeaveStatus status;
}
