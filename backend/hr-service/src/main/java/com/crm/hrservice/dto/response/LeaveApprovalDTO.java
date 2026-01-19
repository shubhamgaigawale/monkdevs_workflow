package com.crm.hrservice.dto.response;

import com.crm.hrservice.entity.LeaveApproval;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Leave approval response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApprovalDTO {

    private UUID id;
    private UUID leaveRequestId;
    private UUID approverId;
    private String approverName; // Will be populated from user service
    private Integer level;
    private LeaveApproval.ApprovalStatus status;
    private String comments;
    private LocalDateTime approvedDate;
}
