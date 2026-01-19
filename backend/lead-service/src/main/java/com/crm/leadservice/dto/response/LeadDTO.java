package com.crm.leadservice.dto.response;

import com.crm.leadservice.entity.Lead;
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
public class LeadDTO {

    private UUID id;

    private UUID tenantId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String company;

    private String source;

    private Lead.LeadStatus status;

    private Lead.LeadPriority priority;

    private Map<String, Object> customFields;

    private String notes;

    private UUID assignedTo;

    private String assignedToName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
