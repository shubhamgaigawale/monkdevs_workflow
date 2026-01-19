package com.crm.hrservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Leave type creation/update DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeRequest {

    @NotBlank(message = "Leave type name is required")
    private String name;

    @NotBlank(message = "Leave type code is required")
    private String code;

    private String description;

    @NotNull(message = "Days per year is required")
    private BigDecimal daysPerYear;

    private Boolean allowCarryForward = false;
    private BigDecimal maxCarryForwardDays;
    private Integer minNoticeDays = 0;
    private Integer maxConsecutiveDays;
    private Boolean isPaid = true;
    private String color;
}
