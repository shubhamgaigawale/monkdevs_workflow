package com.crm.leadservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadHistoryDTO {

    private UUID id;

    private UUID leadId;

    private String action;

    private UUID performedBy;

    private String performedByName;

    private Map<String, Object> oldValue;

    private Map<String, Object> newValue;

    private LocalDateTime timestamp;
}
