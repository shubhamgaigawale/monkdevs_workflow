package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.Holiday;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Holiday response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDTO {

    private UUID id;
    private UUID tenantId;
    private String name;
    private LocalDate date;
    private Holiday.HolidayType type;
    private String description;
    private Boolean isOptional;
}
