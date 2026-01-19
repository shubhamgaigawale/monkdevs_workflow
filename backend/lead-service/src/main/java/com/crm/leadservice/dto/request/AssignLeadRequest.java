package com.crm.leadservice.dto.request;

import com.crm.leadservice.entity.LeadAssignment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignLeadRequest {

    @NotNull(message = "Assigned user ID is required")
    private UUID assignedTo;

    private LeadAssignment.AssignmentType assignmentType;
}
