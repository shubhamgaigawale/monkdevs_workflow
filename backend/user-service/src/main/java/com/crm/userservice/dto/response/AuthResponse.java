package com.crm.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Authentication response DTO
 * Contains access token, refresh token, and user info
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";

    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private UUID tenantId;
    private String tenantName;

    private List<String> roles;
    private List<String> permissions;
}
