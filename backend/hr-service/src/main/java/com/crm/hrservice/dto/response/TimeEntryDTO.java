package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.TimeEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Time entry response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryDTO {

    private UUID id;
    private UUID tenantId;
    private UUID userId;
    private TimeEntry.EntryType entryType;
    private LocalDateTime timestamp;
    private String locationData;
    private String deviceInfo;
    private String notes;
    private LocalDateTime createdAt;
}
