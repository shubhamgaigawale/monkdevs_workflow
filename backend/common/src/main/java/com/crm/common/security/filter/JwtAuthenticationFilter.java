package com.crm.common.security.filter;

import com.crm.common.security.jwt.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * JWT Authentication Filter
 * Validates JWT token from Authorization header and sets authentication in SecurityContext
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            log.info("JWT Filter - Request: {} {}, Token present: {}", request.getMethod(), request.getRequestURI(), jwt != null);

            if (StringUtils.hasText(jwt)) {
                boolean isValid = jwtUtil.validateToken(jwt);
                log.info("JWT Token validation result: {}", isValid);

                if (isValid) {
                    UUID userId = jwtUtil.getUserIdFromToken(jwt);
                    UUID tenantId = jwtUtil.getTenantIdFromToken(jwt);
                    String email = jwtUtil.getEmailFromToken(jwt);
                    List<String> roles = jwtUtil.getRolesFromToken(jwt);
                    List<String> permissions = jwtUtil.getPermissionsFromToken(jwt);

                    log.info("JWT User: {}, Roles: {}, Permissions: {}", email, roles, permissions);

                    // Combine roles and permissions as authorities
                    List<SimpleGrantedAuthority> authorities = Stream.concat(
                            roles.stream().map(role -> new SimpleGrantedAuthority("ROLE_" + role)),
                            permissions.stream().map(SimpleGrantedAuthority::new)
                    ).collect(Collectors.toList());

                    log.info("Spring Security Authorities: {}", authorities);

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userId, null, authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set tenant ID in request attribute for easy access
                    request.setAttribute("tenantId", tenantId);
                    request.setAttribute("userId", userId);
                    request.setAttribute("email", email);
                    request.setAttribute("roles", roles);
                    request.setAttribute("permissions", permissions);

                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.info("Authentication SET for user: {} in tenant: {}", userId, tenantId);
                } else {
                    log.warn("JWT Token validation FAILED");
                }
            } else {
                log.warn("No JWT token present in request");
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
