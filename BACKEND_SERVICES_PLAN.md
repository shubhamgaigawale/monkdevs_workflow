# Backend Services - Complete Implementation Plan

## Overview

This document outlines all backend services for the CRM system. We have **3 services complete** and **9 services remaining** to build.

---

## ✅ Services Completed (3/12)

### 1. Common Module ✅
**Port:** N/A (Shared Library)
**Status:** 100% Complete
**Files:** 12 files

**Features:**
- JWT utilities & authentication filter
- Token blacklist service (Redis)
- Base entity with tenant support
- API response wrapper
- Global exception handling
- Redis configuration

---

### 2. User Service ✅
**Port:** 8081
**Status:** 100% Complete
**Files:** 22 files
**Endpoints:** 10

**Features:**
- User registration & login
- JWT token generation (access + refresh)
- Token refresh & logout
- Role-Based Access Control (ADMIN, SUPERVISOR, AGENT)
- 20+ permissions configured
- User CRUD operations
- Multi-tenant support

**Key Endpoints:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`
- GET `/api/users/me`
- GET `/api/users`
- POST `/api/users`
- PUT `/api/users/{id}`
- DELETE `/api/users/{id}`

---

### 3. HR Service ✅
**Port:** 8082
**Status:** 100% Complete
**Files:** 20 files
**Endpoints:** 10

**Features:**
- Time tracking (clock in/out, breaks)
- Attendance calculation
- Work hours & break hours tracking
- Attendance status (PRESENT, ABSENT, LATE, HALF_DAY)
- Team attendance view
- Real-time status tracking

**Key Endpoints:**
- POST `/api/time/clock-in`
- POST `/api/time/clock-out`
- POST `/api/time/break-start`
- POST `/api/time/break-end`
- GET `/api/time/status`
- GET `/api/attendance/today`
- GET `/api/attendance/range`
- GET `/api/attendance/team`

---

## 🔄 Services In Progress (1/12)

### 4. Lead Service 🔄
**Port:** 8083
**Status:** 10% Complete (Schema only)
**Priority:** HIGH - Core CRM functionality

**Remaining Work:**
- Entities (Lead, LeadAssignment, LeadHistory, ExcelImport)
- Repositories (4 repositories)
- DTOs (10+ DTOs)
- Services (LeadService, ExcelImportService, AssignmentService)
- Controllers (LeadController, ImportController)
- Excel parsing logic with Apache POI
- Search functionality with full-text search
- Lead assignment algorithms (round-robin, load balancing)

**Key Features Needed:**
- Lead CRUD operations
- Excel import with validation
- Lead assignment (auto/manual)
- Lead reassignment
- Search by name, email, phone
- Lead history/audit trail
- Role-based data access (Agents see only their leads)

**Endpoints to Create (~15):**
- GET `/api/leads` - List leads (filtered by role)
- GET `/api/leads/{id}` - Get lead details
- POST `/api/leads` - Create lead
- PUT `/api/leads/{id}` - Update lead
- DELETE `/api/leads/{id}` - Delete lead
- POST `/api/leads/import` - Import Excel
- POST `/api/leads/{id}/assign` - Assign lead
- POST `/api/leads/{id}/reassign` - Reassign lead
- GET `/api/leads/search` - Search leads
- GET `/api/leads/{id}/history` - Lead history
- GET `/api/leads/my-leads` - Agent's leads
- POST `/api/leads/bulk-assign` - Bulk assignment

---

## 📝 Services To Build (8/12)

### 5. Call Service
**Port:** 8084
**Status:** Not Started
**Priority:** HIGH - Core CRM functionality
**Dependencies:** Lead Service

**Features Needed:**
- Call logging (inbound/outbound)
- Call categorization
- Automatic lead association by phone
- Call notes & outcomes
- Call duration tracking
- RingCentral integration (webhook)

**Database Tables:**
- calls
- call_logs

**Endpoints (~8):**
- GET `/api/calls` - List calls
- POST `/api/calls` - Log call
- GET `/api/calls/{id}` - Call details
- PUT `/api/calls/{id}` - Update call
- POST `/api/calls/{id}/notes` - Add notes
- GET `/api/calls/lead/{leadId}` - Calls for lead
- POST `/api/calls/webhooks/ringcentral` - Webhook

---

### 6. Campaign Service
**Port:** 8085
**Status:** Not Started
**Priority:** MEDIUM
**Dependencies:** Lead Service, Integration Service

**Features Needed:**
- Email campaign management
- Mailchimp integration
- Campaign scheduling
- Recipient list management
- Campaign statistics tracking
- Open/click tracking

**Database Tables:**
- campaigns
- campaign_recipients
- campaign_stats

**Endpoints (~10):**
- GET `/api/campaigns` - List campaigns
- POST `/api/campaigns` - Create campaign
- PUT `/api/campaigns/{id}` - Update campaign
- POST `/api/campaigns/{id}/send` - Send campaign
- GET `/api/campaigns/{id}/stats` - Statistics
- POST `/api/campaigns/webhooks/mailchimp` - Webhook

---

### 7. Integration Service
**Port:** 8086
**Status:** Not Started
**Priority:** HIGH
**Dependencies:** User Service, Lead Service

**Features Needed:**
- OAuth2 flow management
- Calendly integration (appointments)
- RingCentral integration (VOIP)
- PandaDoc/DocuSign integration (e-signatures)
- Mailchimp integration (email)
- Webhook routing & processing

**Database Tables:**
- integration_configs
- oauth_tokens
- webhooks
- appointments
- e_signatures

**Endpoints (~15):**
- GET `/api/integrations` - List integrations
- GET `/api/integrations/{type}/oauth/authorize` - Start OAuth
- POST `/api/integrations/{type}/oauth/callback` - OAuth callback
- POST `/api/integrations/calendly/sync` - Sync appointments
- POST `/api/integrations/pandadoc/send` - Send document
- POST `/api/integrations/ringcentral/click-to-call` - Initiate call
- POST `/api/integrations/webhooks/{provider}` - Webhook handlers

---

### 8. Billing Service
**Port:** 8087
**Status:** Not Started
**Priority:** MEDIUM
**Dependencies:** User Service

**Features Needed:**
- Stripe integration
- Subscription management
- Invoice generation
- Payment processing
- Webhook handling (payment events)
- Usage tracking

**Database Tables:**
- subscriptions
- invoices
- payments

**Endpoints (~12):**
- GET `/api/billing/subscription` - Get subscription
- POST `/api/billing/subscription` - Create subscription
- PUT `/api/billing/subscription` - Update subscription
- DELETE `/api/billing/subscription` - Cancel subscription
- GET `/api/billing/invoices` - List invoices
- POST `/api/billing/payment-method` - Add payment method
- POST `/api/billing/webhooks/stripe` - Stripe webhook

---

### 9. Customer Admin Service
**Port:** 8088
**Status:** Not Started
**Priority:** LOW
**Dependencies:** User Service

**Features Needed:**
- Tenant configuration management
- Feature flag management
- Custom branding settings
- Custom field definitions
- Email template management

**Database Tables:**
- tenant_configs
- feature_flags
- custom_fields

**Endpoints (~8):**
- GET `/api/settings/tenant` - Get settings
- PUT `/api/settings/tenant` - Update settings
- GET `/api/settings/features` - Feature flags
- PUT `/api/settings/features` - Update features
- GET `/api/settings/custom-fields` - Custom fields
- POST `/api/settings/custom-fields` - Add custom field

---

### 10. Notification Service
**Port:** 8089
**Status:** Not Started
**Priority:** MEDIUM
**Dependencies:** User Service

**Features Needed:**
- Multi-channel notifications (email, SMS, in-app)
- Notification templates
- User preferences
- Event-triggered notifications
- AWS SES/SNS integration

**Database Tables:**
- notifications
- notification_templates
- notification_preferences

**Endpoints (~8):**
- GET `/api/notifications` - List notifications
- GET `/api/notifications/{id}` - Get notification
- POST `/api/notifications/{id}/read` - Mark as read
- DELETE `/api/notifications/{id}` - Delete notification
- GET `/api/notifications/preferences` - Get preferences
- PUT `/api/notifications/preferences` - Update preferences
- POST `/api/notifications/send` - Send notification (internal)

---

### 11. Reporting Service
**Port:** 8090
**Status:** Not Started
**Priority:** MEDIUM
**Dependencies:** All other services

**Features Needed:**
- Dashboard data aggregation
- Analytics calculation
- Custom report builder
- Data export (PDF, Excel)
- Scheduled reports
- Read from all service databases

**No dedicated tables** - Reads from other services

**Endpoints (~10):**
- GET `/api/reports/dashboard` - Dashboard data
- GET `/api/reports/analytics` - Analytics
- POST `/api/reports/custom` - Custom report
- GET `/api/reports/export/{format}` - Export report
- GET `/api/reports/scheduled` - List scheduled reports
- POST `/api/reports/scheduled` - Create scheduled report
- GET `/api/reports/performance` - Performance reports
- GET `/api/reports/sales` - Sales reports

---

### 12. API Gateway
**Port:** 8080
**Status:** Not Started
**Priority:** HIGH
**Dependencies:** All services

**Technology:** Spring Cloud Gateway

**Features Needed:**
- Central routing to all services
- JWT validation at gateway level
- Rate limiting per tenant
- CORS configuration
- Request/response logging
- Load balancing
- Circuit breaker integration

**Routes:**
- `/api/auth/**` → User Service (8081)
- `/api/users/**` → User Service (8081)
- `/api/time/**` → HR Service (8082)
- `/api/attendance/**` → HR Service (8082)
- `/api/leads/**` → Lead Service (8083)
- `/api/calls/**` → Call Service (8084)
- `/api/campaigns/**` → Campaign Service (8085)
- `/api/integrations/**` → Integration Service (8086)
- `/api/billing/**` → Billing Service (8087)
- `/api/settings/**` → Customer Admin Service (8088)
- `/api/notifications/**` → Notification Service (8089)
- `/api/reports/**` → Reporting Service (8090)

**Configuration:**
- Gateway filters for JWT validation
- Route predicates for path matching
- Global CORS configuration
- Rate limiting configuration
- Circuit breaker with Resilience4j

---

## 📊 Implementation Statistics

### Current Status
- **Services Complete:** 3/12 (25%)
- **Services In Progress:** 1/12 (8%)
- **Services Remaining:** 8/12 (67%)

### Work Breakdown
- **Total Endpoints:** ~120 across all services
- **Endpoints Complete:** 20 (17%)
- **Endpoints Remaining:** ~100

### Files Created So Far
- **Total Files:** 70+
- **Lines of Code:** ~7,500+
- **Database Tables:** 10
- **API Documentation:** Swagger UI for all services

---

## 🎯 Implementation Order

### Phase 1: Core CRM (Priority)
1. ✅ User Service (Complete)
2. ✅ HR Service (Complete)
3. 🔄 Lead Service (In Progress) - FINISH THIS FIRST
4. ⏳ Call Service (Next)

### Phase 2: Integrations & Communication
5. ⏳ Integration Service
6. ⏳ Campaign Service
7. ⏳ Notification Service

### Phase 3: Business & Analytics
8. ⏳ Billing Service
9. ⏳ Reporting Service
10. ⏳ Customer Admin Service

### Phase 4: Infrastructure
11. ⏳ API Gateway (Last - needs all services running)

---

## 🚀 Quick Implementation Guide

### For Each Service:

1. **Create Project Structure**
   ```bash
   mkdir -p {entity,repository,service,controller,dto,config}
   ```

2. **Create Database Migration**
   - `V1__create_{service}_schema.sql`

3. **Create Entities**
   - Extend BaseEntity
   - Add proper indexes
   - Use JSONB for flexible fields

4. **Create Repositories**
   - Extend JpaRepository
   - Add custom queries

5. **Create DTOs**
   - Request DTOs (with validation)
   - Response DTOs

6. **Create Services**
   - Business logic
   - Validation
   - Exception handling

7. **Create Controllers**
   - REST endpoints
   - Security annotations
   - OpenAPI documentation

8. **Create Configuration**
   - SecurityConfig
   - application.yml
   - Main application class

9. **Test**
   - Start service
   - Test with Swagger UI
   - Verify JWT authentication

---

## 💡 Code Reuse Strategy

### Common Patterns Across All Services:

**1. Security Configuration (Same for all)**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        // Standard configuration
    }
}
```

**2. Application Properties (Similar for all)**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/crm_db
  flyway:
    schemas: public,{service}_schema
server:
  port: 808X
jwt:
  secret: {same-secret}
```

**3. Main Application Class (Same pattern)**
```java
@SpringBootApplication(scanBasePackages = {"com.crm.{service}", "com.crm.common"})
@EnableJpaAuditing
@OpenAPIDefinition(...)
public class {Service}Application {
    public static void main(String[] args) {
        SpringApplication.run({Service}Application.class, args);
    }
}
```

---

## 🎓 Key Architectural Decisions

1. **Multi-Tenancy:** All tables have `tenant_id`
2. **Authentication:** JWT tokens validated in each service
3. **Database:** PostgreSQL with separate schemas per service
4. **Caching:** Redis for session data and token blacklist
5. **API Docs:** Swagger UI for each service
6. **Exception Handling:** Global handler from Common module
7. **Logging:** SLF4J with Logback
8. **Validation:** Bean Validation (JSR-380)
9. **Mapping:** MapStruct or manual mappers
10. **Testing:** JUnit 5 + Mockito + Testcontainers

---

## 📈 Estimated Effort

### Per Service (Average):
- **Setup:** 1 hour (pom.xml, structure, config)
- **Database:** 1 hour (migration, entities)
- **Repositories:** 30 minutes
- **DTOs:** 1 hour
- **Services:** 2-3 hours (business logic)
- **Controllers:** 1 hour
- **Testing:** 1-2 hours
- **Documentation:** 30 minutes

**Total per service:** ~8-10 hours

### Remaining Work:
- **8 services × 8 hours:** ~64 hours
- **API Gateway:** 4 hours
- **Integration & Testing:** 8 hours
- **Total:** ~76 hours (2 weeks with 2 developers)

---

## 🔧 Development Environment

### Ports In Use:
- 8081 - User Service ✅
- 8082 - HR Service ✅
- 8083 - Lead Service 🔄
- 8084 - Call Service ⏳
- 8085 - Campaign Service ⏳
- 8086 - Integration Service ⏳
- 8087 - Billing Service ⏳
- 8088 - Customer Admin Service ⏳
- 8089 - Notification Service ⏳
- 8090 - Reporting Service ⏳
- 8080 - API Gateway ⏳

### Database Schemas:
- public (tenants)
- user_management ✅
- hr_workflow ✅
- lead_management 🔄
- call_management ⏳
- campaign_management ⏳
- integration_management ⏳
- billing_management ⏳
- (notifications use user_management schema)
- (reporting reads from all schemas)

---

## 🎯 Next Immediate Steps

1. **Complete Lead Service** (80% remaining)
   - Create all entities
   - Implement Excel import with Apache POI
   - Implement search functionality
   - Implement assignment algorithms
   - Create all controllers
   - Test thoroughly

2. **Build Call Service** (0% complete)
   - Similar to Lead Service but simpler
   - Focus on call logging and lead association

3. **Build Integration Service** (0% complete)
   - OAuth2 implementation is the most complex part
   - Start with Calendly integration

4. **Continue with remaining services** in priority order

---

## 📚 Documentation Links

- **ARCHITECTURE.md** - System architecture
- **PROJECT_PROGRESS.md** - Overall progress
- **COMPLETED_FEATURES.md** - Completed features
- **QUICKSTART.md** - How to run services
- **HR_SERVICE_COMPLETE.md** - HR Service details
- **backend/user-service/README.md** - User Service docs
- **backend/hr-service/README.md** - HR Service docs

---

Last Updated: 2026-01-10
