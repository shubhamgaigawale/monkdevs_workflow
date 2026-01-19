package com.crm.userservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.common.exception.UnauthorizedException;
import com.crm.common.security.jwt.JwtUtil;
import com.crm.common.security.jwt.TokenBlacklistService;
import com.crm.userservice.dto.request.LoginRequest;
import com.crm.userservice.dto.request.RefreshTokenRequest;
import com.crm.userservice.dto.request.RegisterRequest;
import com.crm.userservice.dto.response.AuthResponse;
import com.crm.userservice.entity.Permission;
import com.crm.userservice.entity.Role;
import com.crm.userservice.entity.Tenant;
import com.crm.userservice.entity.User;
import com.crm.userservice.repository.RoleRepository;
import com.crm.userservice.repository.TenantRepository;
import com.crm.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Authentication service
 * Handles login, registration, token refresh, and logout
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * User login
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Check if user is active
        if (!user.getIsActive()) {
            throw new UnauthorizedException("User account is inactive");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Get tenant info
        Tenant tenant = tenantRepository.findById(user.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        // Generate tokens
        return generateAuthResponse(user, tenant);
    }

    /**
     * User registration
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Find or create tenant
        Tenant tenant = tenantRepository.findBySubdomain(request.getTenantSubdomain())
                .orElseGet(() -> createTenant(request.getTenantSubdomain()));

        // Determine role: First user in tenant becomes ADMIN, others default to AGENT
        String roleName;
        if (request.getRoleName() != null) {
            // Explicit role provided (e.g., by admin inviting users)
            roleName = request.getRoleName();
        } else {
            // Check if this is the first user in the tenant
            boolean isFirstUser = userRepository.findByTenantId(tenant.getId()).isEmpty();
            if (isFirstUser) {
                roleName = "ADMIN";  // First user is always ADMIN
                log.info("First user in tenant, assigning ADMIN role");
            } else {
                roleName = "AGENT";  // Subsequent users default to AGENT
            }
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        // Create user
        User user = new User();
        user.setTenantId(tenant.getId());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        // Generate tokens
        return generateAuthResponse(user, tenant);
    }

    /**
     * Refresh access token
     */
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Validate refresh token
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        // Check if token is blacklisted
        if (tokenBlacklistService.isTokenBlacklisted(refreshToken)) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        // Get user ID from token
        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user is active
        if (!user.getIsActive()) {
            throw new UnauthorizedException("User account is inactive");
        }

        // Get tenant
        Tenant tenant = tenantRepository.findById(user.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        // Generate new tokens
        return generateAuthResponse(user, tenant);
    }

    /**
     * Logout user (blacklist token)
     */
    public void logout(String token) {
        log.info("Logout request");

        if (token != null && jwtUtil.validateToken(token)) {
            tokenBlacklistService.blacklistToken(token);
            log.info("Token blacklisted successfully");
        }
    }

    /**
     * Create new tenant
     */
    private Tenant createTenant(String subdomain) {
        Tenant tenant = new Tenant();
        tenant.setName(subdomain.substring(0, 1).toUpperCase() + subdomain.substring(1));
        tenant.setSubdomain(subdomain);
        tenant.setSubscriptionTier("free");
        tenant.setIsActive(true);
        return tenantRepository.save(tenant);
    }

    /**
     * Generate authentication response with tokens
     */
    private AuthResponse generateAuthResponse(User user, Tenant tenant) {
        // Extract roles and permissions
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getFullPermission)
                .distinct()
                .collect(Collectors.toList());

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                tenant.getId(),
                roles,
                permissions
        );

        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        // Build response
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .tenantId(tenant.getId())
                .tenantName(tenant.getName())
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    /**
     * Check if registration is allowed
     * Registration is only allowed if no users exist in the system yet (first-time setup)
     */
    public boolean isRegistrationAllowed() {
        // Count total users across all tenants
        long userCount = userRepository.count();
        boolean allowed = userCount == 0;
        log.info("Registration allowed check: {} users exist, registration {}", userCount, allowed ? "allowed" : "disabled");
        return allowed;
    }
}
