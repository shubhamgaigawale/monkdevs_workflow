package com.crm.hrservice.dto.tax;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for Tax Slab
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxSlabDTO {
    private UUID id;
    private UUID taxRegimeId;
    private BigDecimal minIncome;
    private BigDecimal maxIncome;
    private BigDecimal taxRate;
    private Integer slabOrder;
}
