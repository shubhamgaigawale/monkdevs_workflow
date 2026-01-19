package com.crm.hrservice.dto.tax;

import com.crm.hrservice.entity.TaxRegime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Tax Regime
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxRegimeDTO {
    private UUID id;
    private String financialYear;
    private TaxRegime.RegimeType regimeType;
    private String description;
    private Boolean isDefault;
    private List<TaxSlabDTO> taxSlabs;
    private LocalDateTime createdAt;
}
