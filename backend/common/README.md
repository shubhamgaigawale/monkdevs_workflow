# Common Module

This module contains shared utilities, DTOs, security components, and base classes used across all microservices.

## Contents

### 1. Base Entity (`entity/BaseEntity.java`)
- Base class for all JPA entities
- Provides common fields: `id`, `tenantId`, `createdAt`, `updatedAt`
- All entities in microservices should extend this class

### 2. Security Components

#### JWT Utility (`security/jwt/JwtUtil.java`)
- Generate access and refresh tokens
- Validate tokens
- Extract claims from tokens (userId, tenantId, email, roles, permissions)

#### JWT Authentication Filter (`security/filter/JwtAuthenticationFilter.java`)
- Intercepts all requests
- Validates JWT from Authorization header
- Sets authentication in SecurityContext
- Makes tenant and user info available in request attributes

#### Token Blacklist Service (`security/jwt/TokenBlacklistService.java`)
- Manages JWT token blacklist in Redis
- Used for logout functionality
- Automatically expires blacklisted tokens

### 3. DTOs

#### ApiResponse (`dto/ApiResponse.java`)
- Standard wrapper for all API responses
- Consistent response structure across microservices
- Includes success/error handling

```java
// Success response
ApiResponse.success("User created", userDto);

// Error response
ApiResponse.error("User not found");
```

### 4. Exceptions

#### ResourceNotFoundException
- Thrown when a requested resource is not found
- Returns 404 status

#### UnauthorizedException
- Thrown when user is not authorized
- Returns 401 status

#### BadRequestException
- Thrown for invalid requests
- Returns 400 status

#### GlobalExceptionHandler
- Handles all exceptions globally
- Returns consistent error responses
- Logs all errors

### 5. Utilities

#### TenantContext (`util/TenantContext.java`)
- ThreadLocal based tenant context
- Easy access to current tenant ID

```java
UUID tenantId = TenantContext.getTenantId();
```

### 6. Configuration

#### RedisConfig (`config/RedisConfig.java`)
- Redis configuration for caching and token blacklist

## Usage in Microservices

### 1. Add dependency in service pom.xml
```xml
<dependency>
    <groupId>com.crm</groupId>
    <artifactId>common</artifactId>
</dependency>
```

### 2. Extend BaseEntity
```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    // Your fields
}
```

### 3. Use ApiResponse in controllers
```java
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<UserDTO>> getUser(@PathVariable UUID id) {
    UserDTO user = userService.findById(id);
    return ResponseEntity.ok(ApiResponse.success(user));
}
```

### 4. Configure security in each service
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter,
                           UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

## Key Features

- **Multi-tenancy Support**: All entities have `tenantId`
- **JWT Authentication**: Secure token-based auth
- **Token Blacklisting**: Redis-based logout
- **Consistent Responses**: Standardized API responses
- **Global Error Handling**: Centralized exception handling
- **Audit Fields**: Automatic createdAt/updatedAt tracking
