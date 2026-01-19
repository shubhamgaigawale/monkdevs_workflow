package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.AttendanceRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Attendance record response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private LocalDate date;
    private LocalTime firstLogin;
    private LocalTime lastLogout;
    private BigDecimal totalWorkHours;
    private BigDecimal totalBreakHours;
    private AttendanceRecord.AttendanceStatus status;
    private String notes;
}
