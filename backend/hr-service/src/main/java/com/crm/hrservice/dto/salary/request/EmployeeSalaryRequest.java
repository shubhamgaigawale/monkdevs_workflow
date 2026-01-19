package com.crm.hrservice.dto.salary.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalaryRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Salary structure ID is required")
    private UUID salaryStructureId;

    @NotNull(message = "CTC is required")
    private BigDecimal ctc;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;
}
