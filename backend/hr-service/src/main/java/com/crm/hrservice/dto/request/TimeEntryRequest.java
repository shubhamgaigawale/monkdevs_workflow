package com.crm.hrservice.dto.request;

import com.crm.hrservice.entity.TimeEntry;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Time entry request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryRequest {

    @NotNull(message = "Entry type is required")
    private TimeEntry.EntryType entryType;

    private String locationData; // JSON string
    private String deviceInfo;   // JSON string
    private String notes;
}
