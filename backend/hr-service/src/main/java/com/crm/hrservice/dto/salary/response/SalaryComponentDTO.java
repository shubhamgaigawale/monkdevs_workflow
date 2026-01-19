package com.crm.hrservice.dto.salary.response;

import com.crm.hrservice.entity.SalaryComponent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryComponentDTO {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String code;
    private SalaryComponent.ComponentType componentType;
    private SalaryComponent.CalculationType calculationType;
    private BigDecimal percentage;
    private Boolean isTaxable;
    private Boolean isFixed;
    private Integer displayOrder;
    private SalaryComponent.Status status;
}
