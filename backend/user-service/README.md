# User Service

User authentication and management microservice for the CRM application.

## Features

- User registration and login
- JWT-based authentication (access + refresh tokens)
- Role-based access control (RBAC)
  - ADMIN: Full system access
  - SUPERVISOR: Team management and reporting
  - AGENT: Own data access only
- Token blacklisting for logout
- Multi-tenant support
- Password encryption with BCrypt
- User CRUD operations

## Endpoints

### Authentication (Public)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (requires JWT)

### User Management (Authenticated)

- `GET /api/users/me` - Get current user info
- `GET /api/users` - Get all users (Admin/Supervisor only)
- `GET /api/users/{id}` - Get user by ID (Admin/Supervisor only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/{id}` - Update user (Admin only)
- `DELETE /api/users/{id}` - Delete user (Admin only)

## Database Schema

**Tables:**
- `tenants` - Customer/tenant information
- `users` - User accounts
- `roles` - ADMIN, SUPERVISOR, AGENT
- `permissions` - Fine-grained permissions
- `user_roles` - User-role mapping
- `role_permissions` - Role-permission mapping

## Configuration

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/crm_db
    username: crm_user
    password: crm_password

  data:
    redis:
      host: localhost
      port: 6379

server:
  port: 8081

jwt:
  secret: your-secret-key
  access-token-expiration: 900000      # 15 minutes
  refresh-token-expiration: 604800000  # 7 days
```

## Running the Service

### Prerequisites

1. **Start infrastructure:**
   ```bash
   docker-compose up -d
   ```

   This starts PostgreSQL and Redis.

2. **Build the project:**
   ```bash
   cd backend
   mvn clean install
   ```

3. **Run the service:**
   ```bash
   cd user-service
   mvn spring-boot:run
   ```

The service will start on **http://localhost:8081**

### API Documentation

Once running, access Swagger UI at:
**http://localhost:8081/api/swagger-ui.html**

## Testing with cURL

### 1. Register a new user

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "tenantSubdomain": "demo",
    "roleName": "ADMIN"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123"
  }'
```

Response includes `accessToken` and `refreshToken`.

### 3. Get current user (with JWT)

```bash
curl -X GET http://localhost:8081/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create a new user (Admin only)

```bash
curl -X POST http://localhost:8081/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@demo.com",
    "password": "password123",
    "firstName": "Agent",
    "lastName": "Smith",
    "roleNames": ["AGENT"]
  }'
```

### 5. Logout

```bash
curl -X POST http://localhost:8081/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Default Roles and Permissions

### ADMIN
- Full access to all resources
- Can manage users, settings, billing

### SUPERVISOR
- View all users
- Manage leads, calls, campaigns
- View all reports
- Assign/reassign leads

### AGENT
- View assigned leads and calls
- Update own data
- View own reports

## Security

- **Password Hashing:** BCrypt with strength 12
- **JWT Signing:** HMAC-SHA256
- **Token Expiry:** Access tokens expire in 15 minutes
- **Token Blacklist:** Logout tokens stored in Redis
- **Multi-tenancy:** All data isolated by `tenant_id`

## Dependencies

- Spring Boot 3.2.1
- Spring Security
- Spring Data JPA
- PostgreSQL
- Redis
- Flyway (database migrations)
- JWT (io.jsonwebtoken)
- Lombok
- SpringDoc OpenAPI (Swagger)

## Troubleshooting

### Database connection error
- Ensure PostgreSQL is running: `docker-compose ps`
- Check connection details in `application.yml`

### Redis connection error
- Ensure Redis is running: `docker-compose ps`
- Check Redis host and port in `application.yml`

### JWT validation error
- Ensure JWT secret is configured
- Check token expiration
- Verify token is not blacklisted

## Future Enhancements

- Email verification
- Password reset
- Two-factor authentication (2FA)
- Social login (Google, LinkedIn)
- User activity logging
