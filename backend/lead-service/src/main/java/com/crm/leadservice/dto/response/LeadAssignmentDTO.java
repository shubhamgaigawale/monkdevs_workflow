package com.crm.leadservice.dto.response;

import com.crm.leadservice.entity.LeadAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadAssignmentDTO {

    private UUID id;

    private UUID leadId;

    private UUID assignedTo;

    private String assignedToName;

    private UUID assignedBy;

    private String assignedByName;

    private LeadAssignment.AssignmentType assignmentType;

    private LocalDateTime assignedAt;

    private Boolean isCurrent;
}
