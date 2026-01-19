package com.crm.userservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.userservice.dto.request.CreateUserRequest;
import com.crm.userservice.dto.request.UpdateUserRequest;
import com.crm.userservice.dto.response.UserDTO;
import com.crm.userservice.entity.Role;
import com.crm.userservice.entity.User;
import com.crm.userservice.mapper.UserMapper;
import com.crm.userservice.repository.RoleRepository;
import com.crm.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * User service
 * Handles user CRUD operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all users for a tenant
     */
    public List<UserDTO> getAllUsers(UUID tenantId) {
        log.debug("Fetching all users for tenant: {}", tenantId);
        return userRepository.findByTenantId(tenantId)
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public UserDTO getUserById(UUID userId, UUID tenantId) {
        log.debug("Fetching user: {} for tenant: {}", userId, tenantId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify tenant
        if (!user.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("User not found in your organization");
        }

        return userMapper.toDTO(user);
    }

    /**
     * Create new user
     */
    @Transactional
    public UserDTO createUser(CreateUserRequest request, UUID tenantId) {
        log.info("Creating new user: {} for tenant: {}", request.getEmail(), tenantId);

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Create user
        User user = new User();
        user.setTenantId(tenantId);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);

        // Assign roles
        if (request.getRoleNames() != null && !request.getRoleNames().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoleNames()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        } else {
            // Default to AGENT role
            Role agentRole = roleRepository.findByName("AGENT")
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: AGENT"));
            user.setRoles(Set.of(agentRole));
        }

        user = userRepository.save(user);
        log.info("User created successfully: {}", user.getEmail());

        return userMapper.toDTO(user);
    }

    /**
     * Update user
     */
    @Transactional
    public UserDTO updateUser(UUID userId, UpdateUserRequest request, UUID tenantId) {
        log.info("Updating user: {} for tenant: {}", userId, tenantId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify tenant
        if (!user.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("User not found in your organization");
        }

        // Update fields
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        // Update roles if provided
        if (request.getRoleNames() != null && !request.getRoleNames().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoleNames()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        user = userRepository.save(user);
        log.info("User updated successfully: {}", user.getEmail());

        return userMapper.toDTO(user);
    }

    /**
     * Delete user (soft delete by setting isActive to false)
     */
    @Transactional
    public void deleteUser(UUID userId, UUID tenantId) {
        log.info("Deleting user: {} for tenant: {}", userId, tenantId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify tenant
        if (!user.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("User not found in your organization");
        }

        // Soft delete
        user.setIsActive(false);
        userRepository.save(user);

        log.info("User deleted successfully: {}", user.getEmail());
    }

    /**
     * Get current user info
     */
    public UserDTO getCurrentUser(UUID userId) {
        log.debug("Fetching current user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return userMapper.toDTO(user);
    }
}
