package com.crm.leadservice.dto.request;

import com.crm.leadservice.entity.LeadAssignment;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkAssignRequest {

    @NotEmpty(message = "Lead IDs are required")
    private List<UUID> leadIds;

    private UUID assignedTo; // Optional: if null, use auto-assignment

    private LeadAssignment.AssignmentType assignmentType;
}
