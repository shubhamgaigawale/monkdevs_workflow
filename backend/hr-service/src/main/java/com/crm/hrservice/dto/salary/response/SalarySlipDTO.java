package com.crm.hrservice.dto.salary.response;

import com.crm.hrservice.entity.SalarySlip;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalarySlipDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private String userName;
    private Integer month;
    private Integer year;
    private BigDecimal grossSalary;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    private BigDecimal paidDays;
    private BigDecimal lopDays;
    private SalarySlip.Status status;
    private LocalDateTime generatedDate;
    private LocalDate paidDate;
    private String filePath;
    private String notes;
    private List<ComponentBreakdown> earnings;
    private List<ComponentBreakdown> deductions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComponentBreakdown {
        private String name;
        private BigDecimal amount;
    }
}
