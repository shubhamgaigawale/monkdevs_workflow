package com.crm.hrservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Complete task request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteTaskRequest {

    private String notes;
}
