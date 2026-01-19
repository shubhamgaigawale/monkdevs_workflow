package com.crm.hrservice.dto.salary.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructureRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @NotNull(message = "Components are required")
    private List<StructureComponentRequest> components;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StructureComponentRequest {
        @NotNull(message = "Component ID is required")
        private String componentId;

        private java.math.BigDecimal percentage;
        private java.math.BigDecimal fixedAmount;
    }
}
