package com.crm.userservice.dto.request;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Update user request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Email(message = "Email must be valid")
    private String email;

    private String firstName;
    private String lastName;
    private String phone;
    private Boolean isActive;
    private List<String> roleNames;
}
