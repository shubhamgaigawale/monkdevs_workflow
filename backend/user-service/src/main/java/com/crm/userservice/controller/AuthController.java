package com.crm.userservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.userservice.dto.request.LoginRequest;
import com.crm.userservice.dto.request.RefreshTokenRequest;
import com.crm.userservice.dto.request.RegisterRequest;
import com.crm.userservice.dto.response.AuthResponse;
import com.crm.userservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller
 * Handles login, registration, token refresh, and logout
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and get access token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Get new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request");
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @GetMapping("/registration-status")
    @Operation(summary = "Check registration status", description = "Check if registration is allowed (no users exist yet)")
    public ResponseEntity<ApiResponse<Boolean>> getRegistrationStatus() {
        log.info("Registration status check");
        boolean isRegistrationAllowed = authService.isRegistrationAllowed();
        return ResponseEntity.ok(ApiResponse.success(isRegistrationAllowed));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and blacklist token")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        log.info("Logout request");
        String token = extractTokenFromRequest(request);
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
