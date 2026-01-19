package com.crm.leadservice.dto.request;

import com.crm.leadservice.entity.Lead;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLeadRequest {

    private String firstName;

    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    private String company;

    private String source;

    private Lead.LeadStatus status;

    private Lead.LeadPriority priority;

    private Map<String, Object> customFields;

    private String notes;
}
