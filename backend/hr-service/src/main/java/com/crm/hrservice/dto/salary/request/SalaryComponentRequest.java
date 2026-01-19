package com.crm.hrservice.dto.salary.request;

import com.crm.hrservice.entity.SalaryComponent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryComponentRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Code is required")
    private String code;

    @NotNull(message = "Component type is required")
    private SalaryComponent.ComponentType componentType;

    private SalaryComponent.CalculationType calculationType;

    private BigDecimal percentage;

    private Boolean isTaxable = true;

    private Boolean isFixed = false;

    private Integer displayOrder;
}
