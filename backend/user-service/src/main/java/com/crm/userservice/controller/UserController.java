package com.crm.userservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.userservice.dto.request.CreateUserRequest;
import com.crm.userservice.dto.request.UpdateUserRequest;
import com.crm.userservice.dto.response.UserDTO;
import com.crm.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * User management controller
 * Handles user CRUD operations
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User Management", description = "User CRUD operations")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get authenticated user information")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        log.info("Get current user: {}", userId);
        UserDTO user = userService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Get all users", description = "Get all users in the organization (Admin/Supervisor only)")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers(HttpServletRequest request) {
        UUID tenantId = (UUID) request.getAttribute("tenantId");
        log.info("Get all users for tenant: {}", tenantId);
        List<UserDTO> users = userService.getAllUsers(tenantId);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Get user by ID", description = "Get specific user details (Admin/Supervisor only)")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID tenantId = (UUID) request.getAttribute("tenantId");
        log.info("Get user: {} for tenant: {}", id, tenantId);
        UserDTO user = userService.getUserById(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user", description = "Create new user (Admin only)")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Create user: {} for tenant: {}", request.getEmail(), tenantId);
        UserDTO user = userService.createUser(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user", description = "Update user details (Admin only)")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Update user: {} for tenant: {}", id, tenantId);
        UserDTO user = userService.updateUser(id, request, tenantId);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID tenantId = (UUID) request.getAttribute("tenantId");
        log.info("Delete user: {} for tenant: {}", id, tenantId);
        userService.deleteUser(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
}
