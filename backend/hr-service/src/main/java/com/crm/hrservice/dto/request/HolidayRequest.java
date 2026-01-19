package com.crm.hrservice.dto.request;

import com.crm.hrservice.entity.Holiday;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Holiday creation/update DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayRequest {

    @NotBlank(message = "Holiday name is required")
    private String name;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private Holiday.HolidayType type = Holiday.HolidayType.PUBLIC;
    private String description;
    private Boolean isOptional = false;
}
