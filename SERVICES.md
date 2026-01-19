# Service Details & Port Reference

Complete reference for all microservices in the CRM system.

---

## Service Overview

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| Frontend | 3000 | 🟢 Running | React application UI |
| API Gateway | 8000 | 🟢 Running | Entry point for all API requests |
| User Service | 8081 | 🟢 Running | Authentication & user management |
| HR Service | 8082 | 🟢 Running | Time tracking & attendance |
| Lead Service | 8083 | 🟢 Running | Lead/customer management |
| Call Service | 8084 | 🟢 Running | Call logging & tracking |
| Campaign Service | 8085 | 🟢 Running | Email campaign management |
| Notification Service | 8087 | 🟢 Running | Push & email notifications |
| Integration Service | 8088 | 🟢 Running | Third-party integrations |
| Config Server | 8888 | 🟢 Running | Centralized configuration |

---

## Detailed Service Information

### 1. Frontend (Port 3000)

**Technology:** React 18 + TypeScript + Vite

**Purpose:** User interface for the CRM system

**Features:**
- Responsive design (mobile, tablet, desktop)
- Dark/light mode toggle
- Real-time dashboard with charts
- Form validation with React Hook Form
- State management with Zustand & React Query
- Component library: shadcn/ui + Tailwind CSS

**Access:** http://localhost:3000

**Log:** `/tmp/frontend.log`

**Start Command:**
```bash
cd frontend && npm run dev
```

---

### 2. API Gateway (Port 8000)

**Technology:** Spring Cloud Gateway

**Purpose:** Central entry point for all API requests

**Features:**
- Request routing to microservices
- JWT token validation
- CORS configuration
- Rate limiting (optional)
- Load balancing
- Request/response logging

**Routes:**
```
/api/auth/**        → User Service (8081)
/api/users/**       → User Service (8081)
/api/leads/**       → Lead Service (8083)
/api/calls/**       → Call Service (8084)
/api/campaigns/**   → Campaign Service (8085)
/api/time/**        → HR Service (8082)
/api/integrations/** → Integration Service (8088)
/api/notifications/** → Notification Service (8087)
```

**Access:** http://localhost:8000

**Health Check:** http://localhost:8000/actuator/health

**Log:** `/tmp/api-gateway.log`

**Start Command:**
```bash
cd backend/api-gateway
java -jar target/api-gateway-1.0.0.jar
```

**Important:** Must start AFTER all other services are running

---

### 3. Config Server (Port 8888)

**Technology:** Spring Cloud Config

**Purpose:** Centralized configuration management

**Features:**
- External configuration storage
- Environment-specific configs (dev, prod)
- Hot reload without restart
- Git-backed configuration (optional)
- Encryption for sensitive data

**Access:** http://localhost:8888

**Configuration Example:**
```
GET http://localhost:8888/user-service/default
GET http://localhost:8888/lead-service/production
```

**Log:** `/tmp/config-server.log`

**Start Command:**
```bash
cd backend/config-server
java -jar target/config-server-1.0.0.jar
```

**Important:** Must start FIRST before all other services

---

### 4. User Service (Port 8081)

**Technology:** Spring Boot + Spring Security + JWT

**Purpose:** User authentication and management

**Features:**
- User registration with tenant creation
- JWT authentication (access + refresh tokens)
- Password encryption (BCrypt)
- Role-based access control (RBAC)
- Permission management
- Token refresh mechanism
- User CRUD operations

**Database Tables:**
- `tenants` - Organization/tenant data
- `users` - User accounts
- `roles` - Role definitions (Admin, Manager, Agent)
- `permissions` - Permission definitions
- `user_roles` - Many-to-many user-role mapping
- `role_permissions` - Many-to-many role-permission mapping

**Key Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/users/me
GET    /api/users
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

**JWT Configuration:**
- Algorithm: HS512
- Access Token Expiry: 1 hour
- Refresh Token Expiry: 7 days
- Token stored in: Authorization header as Bearer token

**Log:** `/tmp/user-service.log`

**Start Command:**
```bash
cd backend/user-service
java -jar target/user-service-1.0.0.jar
```

---

### 5. Lead Service (Port 8083)

**Technology:** Spring Boot + Spring Data JPA

**Purpose:** Customer/lead management

**Features:**
- Lead CRUD operations
- Excel import/export
- Lead assignment to users
- Full-text search
- Lead history/audit trail
- Lead statistics & analytics
- Status workflow management
- Priority levels
- Multi-source tracking

**Database Tables:**
- `leads` - Core lead information
- `lead_history` - Audit trail with changes
- `lead_assignments` - Lead-to-user assignments

**Lead Statuses:**
- NEW - Just created
- CONTACTED - Initial contact made
- QUALIFIED - Meets qualification criteria
- PROPOSAL_SENT - Proposal/quote sent
- NEGOTIATION - In negotiation phase
- WON - Deal closed successfully
- LOST - Deal lost
- CANCELLED - Lead cancelled

**Priority Levels:**
- LOW
- MEDIUM
- HIGH
- URGENT

**Key Endpoints:**
```
GET    /api/leads?page=0&size=20
GET    /api/leads/{id}
POST   /api/leads
PUT    /api/leads/{id}
DELETE /api/leads/{id}
POST   /api/leads/search
GET    /api/leads/{id}/history
GET    /api/leads/stats
POST   /api/leads/import
POST   /api/leads/bulk-assign
```

**Role-Based Access:**
- Admin/Manager: See all leads
- Agent: See only assigned leads

**Log:** `/tmp/lead-service.log`

**Start Command:**
```bash
cd backend/lead-service
java -jar target/lead-service-1.0.0.jar
```

---

### 6. Call Service (Port 8084)

**Technology:** Spring Boot + Spring Data JPA

**Purpose:** Call logging and tracking

**Features:**
- Log inbound/outbound calls
- Associate calls with leads
- Duration tracking
- Call status management
- Notes/comments
- Follow-up scheduling
- Call history per lead
- Call analytics

**Database Tables:**
- `calls` - Call records
- `follow_ups` - Scheduled follow-up actions

**Call Directions:**
- INBOUND - Incoming call
- OUTBOUND - Outgoing call

**Call Statuses:**
- COMPLETED - Call completed successfully
- NO_ANSWER - No answer
- BUSY - Line busy
- VOICEMAIL - Went to voicemail
- FAILED - Call failed

**Key Endpoints:**
```
GET    /api/calls?page=0&size=20
GET    /api/calls/{id}
POST   /api/calls
PUT    /api/calls/{id}
DELETE /api/calls/{id}
GET    /api/calls/lead/{leadId}
GET    /api/calls/stats
GET    /api/calls/follow-ups
```

**Log:** `/tmp/call-service.log`

**Start Command:**
```bash
cd backend/call-service
java -jar target/call-service-1.0.0.jar
```

---

### 7. Campaign Service (Port 8085)

**Technology:** Spring Boot + JavaMail

**Purpose:** Email campaign management

**Features:**
- Create email campaigns
- Template library with variables
- Recipient selection with filters
- Send immediately or schedule
- Track opens and clicks
- Campaign analytics
- A/B testing support
- Unsubscribe management

**Database Tables:**
- `campaigns` - Campaign metadata
- `campaign_templates` - Reusable email templates
- `campaign_recipients` - Tracking per recipient
- `campaign_analytics` - Performance metrics

**Campaign Statuses:**
- DRAFT - Being created
- SCHEDULED - Scheduled for future
- SENDING - Currently sending
- SENT - Completed
- CANCELLED - Cancelled before sending

**Template Variables:**
- `{{firstName}}` - Recipient's first name
- `{{lastName}}` - Recipient's last name
- `{{company}}` - Company name
- `{{email}}` - Email address
- Custom variables supported

**Key Endpoints:**
```
GET    /api/campaigns?page=0&size=20
GET    /api/campaigns/{id}
POST   /api/campaigns
PUT    /api/campaigns/{id}
DELETE /api/campaigns/{id}
POST   /api/campaigns/{id}/send
POST   /api/campaigns/{id}/schedule
GET    /api/campaigns/{id}/analytics
GET    /api/campaigns/templates
POST   /api/campaigns/templates
```

**Log:** `/tmp/campaign-service.log`

**Start Command:**
```bash
cd backend/campaign-service
java -jar target/campaign-service-1.0.0.jar
```

---

### 8. HR Service (Port 8082)

**Technology:** Spring Boot + Spring Data JPA

**Purpose:** Time tracking and attendance management

**Features:**
- Clock in/out functionality
- Break time tracking
- Real-time status tracking
- Time entry management
- Attendance reports
- Hourly/daily calculations
- Overtime tracking
- Leave management (future)

**Database Tables:**
- `time_entries` - Individual clock in/out records
- `attendance_summary` - Daily aggregates (future)

**Entry Types:**
- LOGIN - Clock in
- LOGOUT - Clock out
- BREAK_START - Start break
- BREAK_END - End break

**Status Values:**
- CLOCKED_IN - Currently working
- ON_BREAK - On break
- CLOCKED_OUT - Not working

**Key Endpoints:**
```
GET    /api/time/status
POST   /api/time/clock-in
POST   /api/time/clock-out
POST   /api/time/break-start
POST   /api/time/break-end
GET    /api/time/entries
GET    /api/time/entries/range?start=2026-01-01T00:00:00&end=2026-01-31T23:59:59
```

**Time Calculations:**
- Today's hours = (Clock out - Clock in) - Break time
- Break time = Sum of (Break end - Break start)
- If still clocked in: Current time - Clock in time
- All times stored in LocalDateTime (no timezone)

**Log:** `/tmp/hr-service.log`

**Start Command:**
```bash
cd backend/hr-service
java -jar target/hr-service-1.0.0.jar
```

---

### 9. Integration Service (Port 8088)

**Technology:** Spring Boot + OAuth2 Client

**Purpose:** Third-party service integrations

**Features:**
- OAuth 2.0 flow management
- Calendly appointment sync
- RingCentral call integration
- DocuSign e-signature
- PandaDoc document management
- Mailchimp email sync
- Webhook handling
- Token refresh automation

**Database Tables:**
- `integrations` - Integration configurations
- `oauth_tokens` - OAuth access/refresh tokens
- `appointments` - Synced Calendly appointments
- `webhooks` - Webhook subscriptions

**Supported Integrations:**

**Calendly:**
- Sync appointments
- Associate with leads
- View upcoming meetings

**RingCentral:**
- Call history sync
- Click-to-call
- Call recording links

**DocuSign:**
- Send documents for signature
- Track signature status
- Store signed documents

**PandaDoc:**
- Create proposals/quotes
- Send for approval
- Track document views

**Mailchimp:**
- Sync contact lists
- Campaign management
- Email analytics

**Key Endpoints:**
```
GET    /api/integrations
GET    /api/integrations/{type}
POST   /api/integrations/{type}/enable
POST   /api/integrations/{type}/disable
GET    /api/integrations/{type}/oauth/authorize
GET    /api/integrations/{type}/oauth/callback
POST   /api/integrations/{type}/sync
GET    /api/integrations/appointments
GET    /api/integrations/appointments/upcoming
```

**OAuth Flow:**
1. User clicks "Connect" → GET /oauth/authorize
2. Redirect to provider OAuth page
3. User grants permission
4. Provider redirects to /oauth/callback
5. Service exchanges code for access token
6. Tokens stored securely in database

**Log:** `/tmp/integration-service.log`

**Start Command:**
```bash
cd backend/integration-service
java -jar target/integration-service-1.0.0.jar
```

---

### 10. Notification Service (Port 8087)

**Technology:** Spring Boot + JavaMail + WebSocket

**Purpose:** Multi-channel notifications

**Features:**
- Push notifications
- Email notifications
- In-app notifications
- Real-time updates via WebSocket
- Notification preferences
- Read/unread tracking
- Notification history

**Database Tables:**
- `notifications` - Notification records
- `notification_preferences` - User preferences

**Notification Types:**
- LEAD_ASSIGNED - New lead assigned
- CALL_REMINDER - Call follow-up reminder
- CAMPAIGN_SENT - Campaign send confirmation
- CAMPAIGN_OPENED - Recipient opened email
- MEETING_REMINDER - Upcoming meeting
- SYSTEM_ALERT - System notifications

**Key Endpoints:**
```
GET    /api/notifications
GET    /api/notifications/unread
POST   /api/notifications/{id}/mark-read
POST   /api/notifications/mark-all-read
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
```

**Log:** `/tmp/notification-service.log`

**Start Command:**
```bash
cd backend/notification-service
java -jar target/notification-service-1.0.0.jar
```

---

## Database Schema

### PostgreSQL Configuration

**Database Name:** `crm_database`

**Connection:**
```
Host: localhost
Port: 5432
Database: crm_database
Username: crm_user (or postgres)
Password: your_password
```

**Multi-Tenancy:**
- All tables have `tenant_id` column
- Row-level security ensures data isolation
- Each service has its own schema/tables
- Foreign keys respect tenant boundaries

---

## Redis Configuration

**Purpose:** Caching & session management

**Host:** localhost
**Port:** 6379

**Usage:**
- User sessions
- JWT token blacklist (for logout)
- API response caching
- Rate limiting counters

**Start Redis:**
```bash
redis-server
```

**Check Status:**
```bash
redis-cli ping  # Should return PONG
```

---

## Health Check URLs

| Service | Health Check URL |
|---------|-----------------|
| API Gateway | http://localhost:8000/actuator/health |
| User Service | http://localhost:8081/actuator/health |
| Lead Service | http://localhost:8083/actuator/health |
| Call Service | http://localhost:8084/actuator/health |
| Campaign Service | http://localhost:8085/actuator/health |
| HR Service | http://localhost:8082/actuator/health |
| Integration Service | http://localhost:8088/actuator/health |
| Notification Service | http://localhost:8087/actuator/health |
| Config Server | http://localhost:8888/actuator/health |

---

## Log Files

All service logs are stored in `/tmp/` directory:

```
/tmp/api-gateway.log
/tmp/config-server.log
/tmp/user-service.log
/tmp/lead-service.log
/tmp/call-service.log
/tmp/campaign-service.log
/tmp/hr-service.log
/tmp/integration-service.log
/tmp/notification-service.log
/tmp/frontend.log
```

**View logs in real-time:**
```bash
tail -f /tmp/api-gateway.log
tail -f /tmp/user-service.log
```

**Search logs for errors:**
```bash
grep "ERROR" /tmp/*.log
grep "Exception" /tmp/*.log
```

---

## Service Dependencies

**Startup Order (Important!):**

1. **Config Server** (8888) - Must start first
2. **Core Services** (8081-8088) - Can start in parallel
3. **API Gateway** (8000) - Must start last
4. **Frontend** (3000) - Can start anytime after Gateway

**Dependency Graph:**
```
Config Server (8888)
    ↓
┌───┴────────────────────┐
│   All Other Services   │
└───┬────────────────────┘
    ↓
API Gateway (8000)
    ↓
Frontend (3000)
```

---

## Memory Requirements

**Minimum:**
- Each Java service: ~300MB RAM
- Total backend: ~3GB RAM
- Frontend: ~200MB RAM
- PostgreSQL: ~500MB RAM
- Redis: ~100MB RAM
- **Total: ~4GB RAM minimum**

**Recommended:**
- 8GB RAM for comfortable development
- 16GB RAM for production-like environment

---

## Port Conflict Resolution

If a port is already in use:

```bash
# Find process using port
lsof -i :8083

# Kill the process
lsof -ti:8083 | xargs kill -9

# Or change port in application.properties
server.port=8090
```

---

## Service Communication

Services communicate via:
1. **REST APIs** - HTTP requests through API Gateway
2. **Database** - Shared PostgreSQL database (multi-tenant)
3. **Redis** - Shared cache layer
4. **Events** (Future) - Message broker like RabbitMQ/Kafka

---

## Security

**JWT Token Structure:**
```
Header: { "alg": "HS512" }
Payload: { 
  "sub": "user-id",
  "tenantId": "tenant-id",
  "roles": ["ADMIN"],
  "permissions": ["leads:read", "leads:create"],
  "exp": 1234567890
}
Signature: HMACSHA512(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

**Token Validation:**
- API Gateway validates all tokens
- Expired tokens automatically refreshed
- Invalid tokens return 401 Unauthorized

---

## Monitoring Commands

```bash
# Check all running services
ps aux | grep java | grep -E "service|gateway|config"

# Check ports in use
netstat -an | grep LISTEN | grep -E "300[0]|800[0-8]|888[8]"

# Check memory usage
ps aux | grep java | awk '{print $11, $4}' | sort -k2 -rn

# Check database connections
psql -U postgres -d crm_database -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis memory
redis-cli info memory
```

---

**For full documentation, see:**
- [USER_MANUAL.md](./USER_MANUAL.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [README.md](./README.md)
