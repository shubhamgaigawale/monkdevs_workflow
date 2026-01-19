package com.crm.hrservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Leave approval/rejection DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApprovalRequest {

    private String comments;
}
