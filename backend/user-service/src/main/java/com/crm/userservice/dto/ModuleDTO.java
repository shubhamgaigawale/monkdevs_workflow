package com.crm.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Module information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDTO {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private String icon;
    private Integer displayOrder;
    private Boolean isEnabled;
    private Boolean isCoreModule;
    private BigDecimal basePrice;
    private List<String> requiredPermissions;
}
