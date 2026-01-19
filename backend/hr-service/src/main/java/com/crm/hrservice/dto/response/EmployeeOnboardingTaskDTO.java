package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.EmployeeOnboardingTask;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee onboarding task response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeOnboardingTaskDTO {

    private UUID id;
    private UUID tenantId;
    private UUID onboardingId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String assignedToRole;
    private UUID assignedToUserId;
    private EmployeeOnboardingTask.TaskStatus status;
    private LocalDateTime completedDate;
    private UUID completedBy;
    private String notes;
    private Integer taskOrder;
}
