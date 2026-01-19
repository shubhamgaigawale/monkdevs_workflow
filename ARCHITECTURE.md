# CRM System - Complete Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │                    React + TypeScript SPA                               ││
│  │  (Redux Toolkit, Material-UI, React Router, Axios)                     ││
│  │                                                                          ││
│  │  Components:                                                             ││
│  │  • Login/Register  • Dashboard  • Time Tracking  • Attendance           ││
│  │  • Leads Management • Lead Import • Call Logging • Campaigns            ││
│  │  • Integrations • Billing • Reports • Settings                          ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                     ▲                                        │
│                                     │ HTTP/REST (Port 3000)                 │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY LAYER                                 │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │                   Spring Cloud Gateway (Port 8080)                      ││
│  │                                                                          ││
│  │  Responsibilities:                                                       ││
│  │  • Route all incoming requests to appropriate microservice              ││
│  │  • JWT Token validation                                                  ││
│  │  • Rate limiting per tenant                                              ││
│  │  • CORS handling                                                         ││
│  │  • Request/Response logging                                              ││
│  │  • Load balancing                                                        ││
│  └────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MICROSERVICES LAYER                                 │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  User Service    │  │   HR Service     │  │  Lead Service    │         │
│  │   (Port 8081)    │  │   (Port 8082)    │  │   (Port 8083)    │         │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤         │
│  │• Auth & JWT      │  │• Time Tracking   │  │• Lead CRUD       │         │
│  │• User Management │  │• Login/Logout    │  │• Excel Import    │         │
│  │• Role/Permission │  │• Break Tracking  │  │• Lead Assignment │         │
│  │• Tenant Mgmt     │  │• Attendance      │  │• Lead Search     │         │
│  │                  │  │• Performance KPI │  │• Lead History    │         │
│  │                  │  │• Reports Gen     │  │• Reassignment    │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│           │                      │                     │                    │
│           ▼                      ▼                     ▼                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  Call Service    │  │ Campaign Service │  │Integration Svc   │         │
│  │   (Port 8084)    │  │   (Port 8085)    │  │   (Port 8086)    │         │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤         │
│  │• Call Logging    │  │• Email Campaigns │  │• OAuth2 Manager  │         │
│  │• Inbound Calls   │  │• Mailchimp API   │  │• Calendly Sync   │         │
│  │• Lead Association│  │• Campaign Stats  │  │• RingCentral API │         │
│  │• Call Notes      │  │• Recipient Mgmt  │  │• PandaDoc API    │         │
│  │• RingCentral     │  │• List Sync       │  │• DocuSign API    │         │
│  │  Integration     │  │                  │  │• Webhook Handler │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│           │                      │                     │                    │
│           ▼                      ▼                     ▼                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Billing Service  │  │Customer Admin Svc│  │Notification Svc  │         │
│  │   (Port 8087)    │  │   (Port 8088)    │  │   (Port 8089)    │         │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤         │
│  │• Stripe API      │  │• Tenant Config   │  │• Email (SMTP)    │         │
│  │• Subscriptions   │  │• Feature Flags   │  │• SMS (Future)    │         │
│  │• Invoices        │  │• Branding        │  │• In-App Notif    │         │
│  │• Payments        │  │• Custom Fields   │  │• Templates       │         │
│  │• Webhook Handler │  │• Settings        │  │• Preferences     │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│           │                      │                     │                    │
│           ▼                      ▼                     ▼                    │
│  ┌──────────────────┐                                                       │
│  │ Reporting Service│                                                       │
│  │   (Port 8090)    │                                                       │
│  ├──────────────────┤                                                       │
│  │• Dashboard Data  │                                                       │
│  │• Analytics       │                                                       │
│  │• Custom Reports  │                                                       │
│  │• Data Export     │                                                       │
│  │• Scheduled Reports│                                                      │
│  └──────────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database (Port 5432)                        │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Schemas:                                                            │    │
│  │  • public (shared tables: tenants)                                  │    │
│  │  • user_management (users, roles, permissions, user_roles)          │    │
│  │  • hr_workflow (time_entries, attendance_records, performance...)   │    │
│  │  • lead_management (leads, lead_assignments, lead_history...)       │    │
│  │  • call_management (calls, call_logs)                               │    │
│  │  • campaign_management (campaigns, campaign_recipients...)          │    │
│  │  • integration_management (oauth_tokens, webhooks...)               │    │
│  │  • billing_management (subscriptions, invoices, payments)           │    │
│  │                                                                      │    │
│  │  All tables have tenant_id for multi-tenant support                 │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    Redis Cache (Port 6379)                          │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Usage:                                                              │    │
│  │  • JWT token blacklist (on logout)                                  │    │
│  │  • Session data                                                      │    │
│  │  • User permissions cache                                            │    │
│  │  • Rate limiting counters                                            │    │
│  │  • Frequently accessed data                                          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES LAYER                                 │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐               │
│  │   Calendly     │  │  RingCentral   │  │ PandaDoc/      │               │
│  │   API          │  │   VOIP API     │  │ DocuSign       │               │
│  │                │  │                │  │ E-Signature    │               │
│  │ • Appointments │  │ • Call Logs    │  │ • Documents    │               │
│  │ • Webhooks     │  │ • Click-to-Call│  │ • Signatures   │               │
│  │ • OAuth2       │  │ • Recordings   │  │ • OAuth2       │               │
│  └────────────────┘  └────────────────┘  └────────────────┘               │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐                                    │
│  │   Mailchimp    │  │    Stripe      │                                    │
│  │   Email API    │  │  Payment API   │                                    │
│  │                │  │                │                                    │
│  │ • Lists        │  │ • Subscriptions│                                    │
│  │ • Campaigns    │  │ • Invoices     │                                    │
│  │ • Statistics   │  │ • Webhooks     │                                    │
│  └────────────────┘  └────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Service Communication Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                   INTER-SERVICE COMMUNICATION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SYNCHRONOUS (REST API)                                       │
│     Frontend → API Gateway → Service                             │
│     Service → Service (via REST client)                          │
│                                                                  │
│     Example: Lead Service → User Service (get user details)     │
│                                                                  │
│  2. ASYNCHRONOUS (Event-Based) - FUTURE PHASE                    │
│     Service → Message Queue → Service                            │
│                                                                  │
│     Example: Lead Assignment → Notification Service              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Complete Service Breakdown

### 1. **API Gateway** (Port 8080)
**Technology:** Spring Cloud Gateway
**Responsibilities:**
- Single entry point for all client requests
- Route requests to appropriate microservices
- JWT token validation
- Rate limiting per tenant
- CORS configuration
- Request/response logging with correlation ID

**Routes:**
- `/api/auth/**` → User Service
- `/api/users/**` → User Service
- `/api/hr/**` → HR Service
- `/api/leads/**` → Lead Service
- `/api/calls/**` → Call Service
- `/api/campaigns/**` → Campaign Service
- `/api/integrations/**` → Integration Service
- `/api/billing/**` → Billing Service
- `/api/settings/**` → Customer Admin Service
- `/api/notifications/**` → Notification Service
- `/api/reports/**` → Reporting Service

---

### 2. **User Service** (Port 8081)
**Database Schema:** user_management
**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Password management (hashing with BCrypt)
- Role-Based Access Control (RBAC)
- User profile management
- Tenant management

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (blacklist token)
- `GET /api/users` - List users (admin/supervisor)
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

**Database Tables:**
- tenants
- users
- roles (ADMIN, SUPERVISOR, AGENT)
- permissions
- user_roles

---

### 3. **HR Service** (Port 8082)
**Database Schema:** hr_workflow
**Responsibilities:**
- Time tracking (login/logout/break)
- Attendance record management
- Performance metrics calculation
- KPI tracking
- Report generation (weekly, monthly, quarterly)

**Key Endpoints:**
- `POST /api/hr/time/clock-in` - Clock in
- `POST /api/hr/time/clock-out` - Clock out
- `POST /api/hr/time/break-start` - Start break
- `POST /api/hr/time/break-end` - End break
- `GET /api/hr/attendance` - Get attendance records
- `GET /api/hr/attendance/{userId}/{date}` - Daily attendance
- `GET /api/hr/performance/{userId}` - Performance metrics
- `GET /api/hr/reports/weekly` - Weekly report
- `GET /api/hr/reports/monthly` - Monthly report
- `GET /api/hr/reports/quarterly` - Quarterly report

**Database Tables:**
- time_entries
- attendance_records
- performance_metrics
- kpi_data

---

### 4. **Lead Service** (Port 8083)
**Database Schema:** lead_management
**Responsibilities:**
- Lead CRUD operations
- Excel file import and parsing
- Lead assignment (auto/manual)
- Lead reassignment
- Search with role-based filtering
- Lead history/audit trail

**Key Endpoints:**
- `GET /api/leads` - List leads (filtered by role)
- `GET /api/leads/{id}` - Get lead details
- `POST /api/leads` - Create lead
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead
- `POST /api/leads/import` - Import from Excel
- `POST /api/leads/{id}/assign` - Assign lead to agent
- `POST /api/leads/{id}/reassign` - Reassign lead
- `GET /api/leads/search` - Search leads
- `GET /api/leads/{id}/history` - Lead history

**Database Tables:**
- leads
- lead_assignments
- lead_history
- excel_imports

---

### 5. **Call Service** (Port 8084)
**Database Schema:** call_management
**Responsibilities:**
- Call logging (inbound/outbound)
- Call categorization
- Automatic lead association by phone
- Call notes and outcomes
- Integration with RingCentral

**Key Endpoints:**
- `GET /api/calls` - List calls
- `GET /api/calls/{id}` - Get call details
- `POST /api/calls` - Log new call
- `PUT /api/calls/{id}` - Update call
- `POST /api/calls/{id}/notes` - Add call notes
- `GET /api/calls/lead/{leadId}` - Calls for specific lead
- `POST /api/calls/webhooks/ringcentral` - RingCentral webhook

**Database Tables:**
- calls
- call_logs

---

### 6. **Campaign Service** (Port 8085)
**Database Schema:** campaign_management
**Responsibilities:**
- Email campaign management
- Mailchimp integration
- Campaign scheduling
- Campaign statistics tracking
- Recipient management

**Key Endpoints:**
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/{id}` - Get campaign details
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/{id}` - Update campaign
- `POST /api/campaigns/{id}/send` - Send campaign
- `GET /api/campaigns/{id}/stats` - Campaign statistics
- `POST /api/campaigns/webhooks/mailchimp` - Mailchimp webhook

**Database Tables:**
- campaigns
- campaign_recipients
- campaign_stats

---

### 7. **Integration Service** (Port 8086)
**Database Schema:** integration_management
**Responsibilities:**
- Centralized OAuth2 management
- Calendly integration (appointments)
- RingCentral integration (VOIP)
- PandaDoc/DocuSign integration (e-signatures)
- Webhook processing

**Key Endpoints:**
- `GET /api/integrations` - List available integrations
- `GET /api/integrations/{type}/status` - Integration status
- `GET /api/integrations/{type}/oauth/authorize` - Start OAuth flow
- `POST /api/integrations/{type}/oauth/callback` - OAuth callback
- `POST /api/integrations/calendly/sync` - Sync Calendly appointments
- `POST /api/integrations/pandadoc/send` - Send document for signature
- `POST /api/integrations/ringcentral/click-to-call` - Initiate call
- `POST /api/integrations/webhooks/calendly` - Calendly webhook
- `POST /api/integrations/webhooks/pandadoc` - PandaDoc webhook
- `POST /api/integrations/webhooks/ringcentral` - RingCentral webhook

**Database Tables:**
- integration_configs
- oauth_tokens
- webhooks
- appointments
- e_signatures

---

### 8. **Billing Service** (Port 8087)
**Database Schema:** billing_management
**Responsibilities:**
- Stripe integration
- Subscription management
- Invoice generation
- Payment processing
- Webhook handling

**Key Endpoints:**
- `GET /api/billing/subscription` - Get subscription details
- `POST /api/billing/subscription` - Create subscription
- `PUT /api/billing/subscription` - Update subscription
- `DELETE /api/billing/subscription` - Cancel subscription
- `GET /api/billing/invoices` - List invoices
- `GET /api/billing/invoices/{id}` - Get invoice
- `POST /api/billing/payment-method` - Add payment method
- `POST /api/billing/webhooks/stripe` - Stripe webhook

**Database Tables:**
- subscriptions
- invoices
- payments

---

### 9. **Customer Admin Service** (Port 8088)
**Database Schema:** public (tenants table)
**Responsibilities:**
- Tenant configuration
- Feature flag management
- Custom branding settings
- Custom field definitions

**Key Endpoints:**
- `GET /api/settings/tenant` - Get tenant settings
- `PUT /api/settings/tenant` - Update tenant settings
- `GET /api/settings/features` - Get feature flags
- `PUT /api/settings/features` - Update feature flags
- `GET /api/settings/custom-fields` - Get custom fields
- `POST /api/settings/custom-fields` - Add custom field

**Database Tables:**
- tenants
- tenant_configs
- feature_flags
- custom_fields

---

### 10. **Notification Service** (Port 8089)
**Database Schema:** notification_management
**Responsibilities:**
- Multi-channel notifications (email, in-app)
- Notification templates
- User preferences
- Event-triggered notifications

**Key Endpoints:**
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/{id}` - Get notification
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/{id}/delete` - Delete notification
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/send` - Send notification (internal)

**Database Tables:**
- notifications
- notification_templates
- notification_preferences

---

### 11. **Reporting Service** (Port 8090)
**Database Schema:** Reads from all schemas
**Responsibilities:**
- Dashboard data aggregation
- Analytics calculation
- Custom report builder
- Data export (PDF, Excel)
- Scheduled reports

**Key Endpoints:**
- `GET /api/reports/dashboard` - Dashboard data
- `GET /api/reports/analytics` - Analytics data
- `POST /api/reports/custom` - Generate custom report
- `GET /api/reports/export/{format}` - Export report
- `GET /api/reports/scheduled` - List scheduled reports
- `POST /api/reports/scheduled` - Create scheduled report

**No dedicated tables** - Reads from other service tables

---

## Technology Stack per Service

| Component | Technology |
|-----------|------------|
| **Language** | Java 17 |
| **Framework** | Spring Boot 3.2+ |
| **Web** | Spring Web (REST) |
| **Security** | Spring Security + JWT |
| **Database** | Spring Data JPA + Hibernate |
| **Migration** | Flyway |
| **Validation** | Bean Validation (JSR-380) |
| **HTTP Client** | Spring WebClient / OpenFeign |
| **Cache** | Spring Cache + Redis |
| **Logging** | SLF4J + Logback |
| **Testing** | JUnit 5, Mockito, Testcontainers |
| **Documentation** | SpringDoc OpenAPI (Swagger) |
| **Build** | Maven |

---

## Development Ports

| Service | Port |
|---------|------|
| Frontend | 3000 |
| API Gateway | 8080 |
| User Service | 8081 |
| HR Service | 8082 |
| Lead Service | 8083 |
| Call Service | 8084 |
| Campaign Service | 8085 |
| Integration Service | 8086 |
| Billing Service | 8087 |
| Customer Admin Service | 8088 |
| Notification Service | 8089 |
| Reporting Service | 8090 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| pgAdmin | 5050 |

---

## Data Flow Examples

### Example 1: User Login
```
Frontend → API Gateway → User Service
                              ↓
                        PostgreSQL (users table)
                              ↓
                        Generate JWT
                              ↓
                        Cache permissions in Redis
                              ↓
                        Return JWT to Frontend
```

### Example 2: Import Leads
```
Frontend → API Gateway → Lead Service
                              ↓
                        Parse Excel file
                              ↓
                        Validate data
                              ↓
                        Save to PostgreSQL (leads table)
                              ↓
                        Auto-assign to agents
                              ↓
                        Save assignments (lead_assignments table)
                              ↓
                        Return import summary
```

### Example 3: Log Inbound Call
```
Frontend → API Gateway → Call Service
                              ↓
                        Check if phone exists in leads
                              ↓
                        Call Lead Service API (get lead by phone)
                              ↓
                        Save call record with lead_id
                              ↓
                        Return call details
```

### Example 4: Send Email Campaign
```
Frontend → API Gateway → Campaign Service
                              ↓
                        Get recipient leads from Lead Service
                              ↓
                        Call Mailchimp API (create campaign)
                              ↓
                        Sync recipients to Mailchimp list
                              ↓
                        Send campaign via Mailchimp
                              ↓
                        Save campaign record
                              ↓
                        Poll Mailchimp for statistics
                              ↓
                        Update campaign_stats table
```

---

## Build Order

We'll build services in this order to respect dependencies:

1. **Common Module** - Shared utilities, DTOs, security filters
2. **User Service** - Foundation for authentication
3. **API Gateway** - Entry point routing
4. **HR Service** - Independent module
5. **Lead Service** - Depends on User Service
6. **Call Service** - Depends on Lead Service
7. **Integration Service** - Depends on Lead Service, Call Service
8. **Campaign Service** - Depends on Lead Service, Integration Service
9. **Billing Service** - Depends on User Service
10. **Customer Admin Service** - Depends on User Service
11. **Notification Service** - Can be used by all services
12. **Reporting Service** - Depends on all services (reads their data)

---

## Next Steps

After you review this architecture, we'll:
1. Create the Maven parent POM and module structure
2. Build the Common module with shared security components
3. Implement User Service with JWT authentication
4. Build API Gateway with routing
5. Continue with other services in order

Does this architecture look good to you? Any changes you'd like to make before we start building?
