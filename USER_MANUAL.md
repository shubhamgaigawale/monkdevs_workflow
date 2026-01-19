# Multi-Tenant CRM System - User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Starting the System](#starting-the-system)
6. [Using the Application](#using-the-application)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)
9. [Service Details](#service-details)

---

## System Overview

This is a **Multi-Tenant CRM (Customer Relationship Management) System** built with a microservices architecture. It provides comprehensive features for managing leads, calls, campaigns, integrations, and HR operations.

### Key Features
- **Multi-Tenant Architecture**: Complete data isolation between tenants
- **User Management**: Role-based access control (Admin, Manager, Agent)
- **Lead Management**: Track and manage leads with full CRUD operations
- **Call Logging**: Log and track customer calls with follow-ups
- **Email Campaigns**: Create and send email campaigns with templates
- **Integrations**: OAuth integrations with Calendly, RingCentral, DocuSign, PandaDoc, Mailchimp
- **HR & Time Tracking**: Employee time tracking with clock in/out
- **Real-time Dashboard**: Analytics and KPIs with interactive charts

### Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.2.1
- PostgreSQL (Database)
- Redis (Caching)
- Spring Cloud Gateway (API Gateway)
- JWT Authentication (HS512)
- Maven (Build Tool)

**Frontend:**
- React 18
- TypeScript
- Vite (Build Tool)
- Tailwind CSS
- shadcn/ui Components
- TanStack Query (React Query)
- Zustand (State Management)
- Recharts (Data Visualization)

---

## Architecture

### Microservices Architecture

```
┌─────────────┐
│   Frontend  │ (React - Port 3000)
│  (Vite App) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│           API Gateway (Port 8000)                       │
│  - Routes requests to microservices                     │
│  - JWT validation                                       │
│  - CORS configuration                                   │
└────┬────────────────────────────────────────────────────┘
     │
     ├─────────────────────────────────────────────────────┐
     │                                                      │
     ▼                                                      ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│User Service │  │Lead Service │  │Call Service │  │  Campaign   │
│  (8081)     │  │  (8083)     │  │  (8084)     │  │  Service    │
│             │  │             │  │             │  │  (8085)     │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
     │                │                │                │
     ▼                ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  - Tenant isolation using tenant_id                              │
│  - Separate schemas: users, leads, calls, campaigns, etc.        │
└──────────────────────────────────────────────────────────────────┘

Additional Services:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Notification │  │Integration  │  │     HR      │  │   Config    │
│  Service    │  │   Service   │  │  Service    │  │   Server    │
│  (8087)     │  │   (8088)    │  │  (8082)     │  │  (8888)     │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### Request Flow

1. **Frontend** makes HTTP request → `http://localhost:3000`
2. **API Gateway** receives request → `http://localhost:8000/api/*`
3. **Gateway** validates JWT token and routes to appropriate service
4. **Microservice** processes request and interacts with database
5. **Response** flows back through Gateway to Frontend

---

## Prerequisites

### Required Software

1. **Java Development Kit (JDK) 17 or higher**
   ```bash
   java -version
   # Should show: openjdk version "17.x.x" or higher
   ```

2. **Node.js 18+ and npm**
   ```bash
   node -v  # Should show v18.x.x or higher
   npm -v   # Should show 8.x.x or higher
   ```

3. **PostgreSQL 14+**
   ```bash
   psql --version
   # Should show: psql (PostgreSQL) 14.x or higher
   ```

4. **Redis**
   ```bash
   redis-cli --version
   # Should show: redis-cli 6.x.x or higher
   ```

5. **Maven 3.8+**
   ```bash
   mvn -v
   # Should show: Apache Maven 3.8.x or higher
   ```

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: 5GB free space
- **OS**: macOS, Linux, or Windows with WSL2

---

## Installation & Setup

### 1. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crm_database;

# Create user (if needed)
CREATE USER crm_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE crm_database TO crm_user;

# Exit
\q
```

#### Configure Database Connection
Each service has an `application.properties` file in `src/main/resources/`:

```properties
# Database configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/crm_database
spring.datasource.username=crm_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### 2. Redis Setup

```bash
# Start Redis server
redis-server

# Or on macOS with Homebrew
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 3. Backend Setup

#### Install Dependencies (for all services)
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend

# Build all services
for service in user-service lead-service call-service campaign-service integration-service hr-service notification-service config-server api-gateway; do
  echo "Building $service..."
  cd $service
  mvn clean install -DskipTests
  cd ..
done
```

### 4. Frontend Setup

```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=CRM System
EOF
```

---

## Starting the System

### Option 1: Automated Startup (Recommended)

Create a startup script to launch all services at once:

```bash
#!/bin/bash
# File: start-all.sh

echo "Starting Multi-Tenant CRM System..."

# Start Redis
echo "Starting Redis..."
redis-server &
sleep 2

# Start Config Server first (required by other services)
echo "Starting Config Server..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/config-server
nohup java -jar target/config-server-1.0.0.jar > /tmp/config-server.log 2>&1 &
echo "Config Server started on port 8888"
sleep 10

# Start User Service
echo "Starting User Service..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/user-service
nohup java -jar target/user-service-1.0.0.jar > /tmp/user-service.log 2>&1 &
echo "User Service started on port 8081"
sleep 5

# Start Lead Service
echo "Starting Lead Service..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/lead-service
nohup java -jar target/lead-service-1.0.0.jar > /tmp/lead-service.log 2>&1 &
echo "Lead Service started on port 8083"
sleep 5

# Start Call Service
echo "Starting Call Service..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/call-service
nohup java -jar target/call-service-1.0.0.jar > /tmp/call-service.log 2>&1 &
echo "Call Service started on port 8084"
sleep 5

# Start Campaign Service
echo "Starting Campaign Service..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/campaign-service
nohup java -jar target/campaign-service-1.0.0.jar > /tmp/campaign-service.log 2>&1 &
echo "Campaign Service started on port 8085"
sleep 5

# Start HR Service
echo "Starting HR Service..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/hr-service
nohup java -jar target/hr-service-1.0.0.jar > /tmp/hr-service.log 2>&1 &
echo "HR Service started on port 8082"
sleep 5

# Start Integration Service
echo "Starting Integration Service..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/integration-service
nohup java -jar target/integration-service-1.0.0.jar > /tmp/integration-service.log 2>&1 &
echo "Integration Service started on port 8088"
sleep 5

# Start Notification Service
echo "Starting Notification Service..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/notification-service
nohup java -jar target/notification-service-1.0.0.jar > /tmp/notification-service.log 2>&1 &
echo "Notification Service started on port 8087"
sleep 5

# Start API Gateway (must be last)
echo "Starting API Gateway..."
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/api-gateway
nohup java -jar target/api-gateway-1.0.0.jar > /tmp/api-gateway.log 2>&1 &
echo "API Gateway started on port 8000"
sleep 5

# Start Frontend
echo "Starting Frontend..."
cd /Users/shubhamgaigawale/monkdevs_workflow/frontend
npm run dev > /tmp/frontend.log 2>&1 &
echo "Frontend started on port 3000"

echo ""
echo "=========================================="
echo "All services started successfully!"
echo "=========================================="
echo ""
echo "Service Status:"
echo "  Config Server:     http://localhost:8888"
echo "  User Service:      http://localhost:8081"
echo "  Lead Service:      http://localhost:8083"
echo "  Call Service:      http://localhost:8084"
echo "  Campaign Service:  http://localhost:8085"
echo "  HR Service:        http://localhost:8082"
echo "  Integration:       http://localhost:8088"
echo "  Notification:      http://localhost:8087"
echo "  API Gateway:       http://localhost:8000"
echo "  Frontend:          http://localhost:3000"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
```

Make it executable and run:
```bash
chmod +x start-all.sh
./start-all.sh
```

### Option 2: Manual Startup

Start services in this specific order:

#### 1. Start Config Server
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/config-server
java -jar target/config-server-1.0.0.jar
# Wait for "Started ConfigServerApplication"
```

#### 2. Start Core Services
Open separate terminal windows for each:

**User Service:**
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/user-service
java -jar target/user-service-1.0.0.jar
# Port: 8081
```

**Lead Service:**
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/lead-service
java -jar target/lead-service-1.0.0.jar
# Port: 8083
```

**Call Service:**
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/call-service
java -jar target/call-service-1.0.0.jar
# Port: 8084
```

**Campaign Service:**
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/campaign-service
java -jar target/campaign-service-1.0.0.jar
# Port: 8085
```

**HR Service:**
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/hr-service
java -jar target/hr-service-1.0.0.jar
# Port: 8082
```

**Integration Service:**
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/integration-service
java -jar target/integration-service-1.0.0.jar
# Port: 8088
```

**Notification Service:**
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/notification-service
java -jar target/notification-service-1.0.0.jar
# Port: 8087
```

#### 3. Start API Gateway (Important: Start Last)
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/api-gateway
java -jar target/api-gateway-1.0.0.jar
# Port: 8000
```

#### 4. Start Frontend
```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/frontend
npm run dev
# Port: 3000
```

### Verification

Check if all services are running:
```bash
# Check backend services
lsof -i :8000  # API Gateway
lsof -i :8081  # User Service
lsof -i :8082  # HR Service
lsof -i :8083  # Lead Service
lsof -i :8084  # Call Service
lsof -i :8085  # Campaign Service
lsof -i :8087  # Notification Service
lsof -i :8088  # Integration Service
lsof -i :8888  # Config Server

# Check frontend
lsof -i :3000  # Frontend
```

---

## Using the Application

### First Time Setup

#### 1. Register a New Tenant/Organization

1. Open browser: `http://localhost:3000`
2. Click **"Sign Up"** or **"Create Account"**
3. Fill in registration form:
   - **Tenant Name**: Your company name (e.g., "Acme Corp")
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Password**: Strong password (min 8 characters)
4. Click **"Create Account"**
5. System automatically:
   - Creates tenant with unique subdomain
   - Creates admin user
   - Sets up database schema
   - Assigns admin role and permissions

#### 2. Login

1. Enter your **email** and **password**
2. Click **"Sign In"**
3. JWT tokens are stored securely
4. Redirected to Dashboard

### Dashboard Overview

After logging in, you'll see the main dashboard with:

**KPI Cards (Top Row):**
- Total Leads
- Active Campaigns
- Calls Today
- Conversion Rate

**Charts (Middle Section):**
- Lead Pipeline (by status)
- Campaign Performance
- Call Volume Trends
- Lead Source Distribution

**Activity Feed (Right Sidebar):**
- Recent lead assignments
- New calls logged
- Campaign activity
- Integration syncs

**Quick Actions (Floating Button):**
- Log Call
- Create Lead
- Start Campaign
- Clock In/Out

---

### Lead Management

#### Creating a Lead

1. Navigate to **Leads** from sidebar
2. Click **"+ New Lead"** button
3. Fill in lead information:
   - **Basic Info**: First name, last name, email, phone
   - **Company**: Company name, position
   - **Details**: Lead source, status, priority
   - **Address**: Optional location details
4. Click **"Save"**

#### Viewing Leads

- **List View**: See all leads in a table
  - Search by name/email
  - Filter by status, priority, source
  - Sort by columns
  - Pagination (20 per page)

- **Detail View**: Click on any lead to see:
  - Complete lead information
  - Edit button
  - Activity timeline
  - Associated calls
  - Campaign history
  - Quick actions (Assign, Email, Call)

#### Importing Leads from Excel

1. Go to **Leads** → **Import**
2. Click **"Choose File"** or drag-and-drop Excel file
3. Map columns to lead fields
4. Review validation errors (if any)
5. Click **"Import"**
6. System shows: Success count, Error count

**Excel Format:**
```
firstName | lastName | email | phone | company | status | priority | source
John      | Smith    | john@example.com | +1-555-0101 | TechCorp | NEW | HIGH | Website
```

#### Assigning Leads

**Individual Assignment:**
1. Open lead detail page
2. Click **"Assign"** button
3. Select user from dropdown
4. Click **"Assign"**

**Bulk Assignment:**
1. Go to **Leads** → **Assign**
2. Select multiple leads (checkboxes)
3. Choose user or click **"Auto-Assign"** (round-robin)
4. Click **"Assign Selected"**

#### Role-Based Lead Access

- **Admin/Manager**: See all leads
- **Agent**: See only assigned leads (use "My Leads" filter)

---

### Call Management

#### Logging a Call

**From Dashboard:**
1. Click Quick Action → **"Log Call"**

**From Lead Page:**
1. Open lead detail
2. Click **"Log Call"** button

**Call Form:**
- Phone Number (auto-suggests from leads)
- Lead Association (optional)
- Call Direction (Inbound/Outbound)
- Duration (manual or timer)
- Call Status (Completed, No Answer, Voicemail)
- Notes
- Follow-up checkbox + date

#### Viewing Call History

1. Navigate to **Calls** from sidebar
2. Filter by:
   - Date range
   - Call status
   - Associated lead
   - Direction
3. Click on call to see details

#### Follow-ups

- Calls marked for follow-up appear in dashboard
- Get notifications on follow-up dates
- Mark as completed when done

---

### Campaign Management

#### Creating an Email Campaign

1. Navigate to **Campaigns** → **"New Campaign"**

**Step 1: Campaign Details**
- Name: Campaign name
- Subject line
- From email
- Reply-to email

**Step 2: Select Recipients**
- Choose leads from list
- Apply filters (status, source, etc.)
- Review recipient count

**Step 3: Design Email**
- Use template (select from library)
- Or write custom HTML/text
- Preview mode
- Test email

**Step 4: Schedule**
- Send now
- Schedule for later date/time
- Save as draft

#### Using Templates

1. Go to **Campaigns** → **Templates**
2. Browse template library
3. Click **"Use Template"**
4. Customize content
5. Save or send

#### Creating Templates

1. **Campaigns** → **Templates** → **"New Template"**
2. Name your template
3. Select category
4. Design email content
5. Use variables: `{{firstName}}`, `{{company}}`, etc.
6. Save

#### Campaign Analytics

View campaign performance:
- **Open Rate**: % of recipients who opened
- **Click Rate**: % who clicked links
- **Charts**: Opens/clicks over time
- **Recipients Table**: Individual tracking status

---

### Integration Management

#### Connecting Third-Party Services

1. Navigate to **Integrations**
2. See available integrations:
   - **Calendly**: Sync appointments
   - **RingCentral**: Call integration
   - **DocuSign**: E-signatures
   - **PandaDoc**: Document management
   - **Mailchimp**: Email marketing

#### Connecting Calendly (Example)

1. Click **"Connect"** on Calendly card
2. Redirected to Calendly OAuth page
3. Login to Calendly
4. Grant permissions
5. Redirected back to CRM
6. Connection status: **Connected**
7. View **"Last Sync"** timestamp

#### Viewing Synced Appointments

1. Go to **Integrations** → **Appointments**
2. See calendar view or list
3. Filter by date range
4. Click appointment to see:
   - Lead associated
   - Meeting details
   - Status
5. Manual sync button to refresh

#### Disconnecting Integration

1. Click **"Disconnect"** on integration card
2. Confirm disconnection
3. Synced data remains but no new syncs

---

### HR & Time Tracking

#### Clock In/Out

**For Employees:**
1. Navigate to **Time Tracking** (or use Quick Action)
2. See large clock display showing current time
3. Click **"Clock In"** button
4. Status changes to "Clocked In"
5. See running timer for today's hours

**Taking Breaks:**
1. While clocked in, click **"Start Break"**
2. Status changes to "On Break"
3. Break time tracked separately
4. Click **"End Break"** to resume work

**Clocking Out:**
1. Click **"Clock Out"** button
2. See summary of day:
   - Total hours worked
   - Break time taken
   - Net working hours

#### Viewing Time Entries

**Personal View:**
1. Time Tracking page shows table of entries
2. Filter by date range (default: last 7 days)
3. See for each day:
   - Clock in/out times
   - Break duration
   - Total hours
   - Status

**Edit Time Entry** (if permitted):
1. Click on time entry
2. Modify clock in/out times
3. Add notes
4. Save changes

#### Attendance Management (Supervisors/Admins)

1. Navigate to **HR** → **Attendance**
2. Select team member from dropdown
3. View:
   - Calendar with color-coded days
   - Monthly attendance summary
   - Late arrivals, early departures
4. Export to Excel for reports

---

### User Management (Admin Only)

#### Creating Users

1. Navigate to **Users** → **"New User"**
2. Fill in user details:
   - Name, email
   - Role (Admin, Manager, Agent)
   - Permissions
   - Status (Active/Inactive)
3. System sends invitation email
4. User sets password on first login

#### Managing Roles & Permissions

**Available Roles:**
- **Admin**: Full access, can manage users
- **Manager**: View all data, assign leads, create campaigns
- **Agent**: View assigned leads, log calls

**Custom Permissions:**
- `leads:read`, `leads:create`, `leads:update`, `leads:delete`
- `calls:read`, `calls:create`, `calls:update`
- `campaigns:read`, `campaigns:create`, `campaigns:send`
- `users:read`, `users:create`, `users:update` (admin only)
- `integrations:manage`
- `hr:read` (for viewing team attendance)

#### Deactivating Users

1. Go to user detail page
2. Click **"Deactivate"**
3. User loses access immediately
4. Data remains for audit purposes

---

### Profile Settings

#### Updating Your Profile

1. Click your name/avatar in header
2. Select **"Profile"**
3. Update:
   - Name
   - Email
   - Profile picture
   - Notification preferences
4. Click **"Save Changes"**

#### Changing Password

1. Profile → **"Change Password"**
2. Enter:
   - Current password
   - New password
   - Confirm new password
3. Click **"Update Password"**

#### Theme Settings

Toggle between **Light** and **Dark** mode:
- Click moon/sun icon in header
- Or: Profile → Theme → Select preference
- Saved to browser localStorage

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication

All API requests (except login/register) require JWT token:

```bash
# Login to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "user": { ... }
  }
}

# Use token in subsequent requests
curl -X GET http://localhost:8000/api/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### API Endpoints

#### Authentication APIs

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "tenantName": "Acme Corp",
  "fullName": "John Doe",
  "email": "john@acme.com",
  "password": "SecurePass123"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "SecurePass123"
}
```

**Refresh Token**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Lead APIs

**Get All Leads** (Paginated)
```http
GET /api/leads?page=0&size=20
Authorization: Bearer {token}
```

**Get Lead by ID**
```http
GET /api/leads/{id}
Authorization: Bearer {token}
```

**Create Lead**
```http
POST /api/leads
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1-555-0102",
  "company": "Example Inc",
  "status": "NEW",
  "priority": "HIGH",
  "source": "Website"
}
```

**Update Lead**
```http
PUT /api/leads/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "QUALIFIED",
  "notes": "Interested in premium plan"
}
```

**Delete Lead**
```http
DELETE /api/leads/{id}
Authorization: Bearer {token}
```

**Search Leads**
```http
POST /api/leads/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "NEW",
  "priority": "HIGH",
  "search": "tech",
  "page": 0,
  "size": 20
}
```

**Get Lead History**
```http
GET /api/leads/{id}/history
Authorization: Bearer {token}
```

**Import Leads**
```http
POST /api/leads/import
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: leads.xlsx
```

#### Call APIs

**Get All Calls**
```http
GET /api/calls?page=0&size=20
Authorization: Bearer {token}
```

**Log a Call**
```http
POST /api/calls
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumber": "+1-555-0101",
  "leadId": "uuid-of-lead",
  "direction": "OUTBOUND",
  "duration": 450,
  "callStatus": "COMPLETED",
  "notes": "Discussed pricing",
  "followUpRequired": true,
  "followUpDate": "2026-01-15T10:00:00"
}
```

**Get Calls for Lead**
```http
GET /api/calls/lead/{leadId}
Authorization: Bearer {token}
```

#### Campaign APIs

**Get All Campaigns**
```http
GET /api/campaigns?page=0&size=20
Authorization: Bearer {token}
```

**Create Campaign**
```http
POST /api/campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Spring Sale 2026",
  "subject": "Exclusive Spring Offers",
  "fromEmail": "sales@acme.com",
  "replyToEmail": "support@acme.com",
  "content": "<html>Email content here</html>",
  "recipientLeadIds": ["uuid1", "uuid2"]
}
```

**Send Campaign**
```http
POST /api/campaigns/{id}/send
Authorization: Bearer {token}
```

**Schedule Campaign**
```http
POST /api/campaigns/{id}/schedule
Authorization: Bearer {token}
Content-Type: application/json

{
  "scheduledTime": "2026-01-20T09:00:00"
}
```

**Get Campaign Analytics**
```http
GET /api/campaigns/{id}/analytics
Authorization: Bearer {token}
```

#### Time Tracking APIs

**Get Current Status**
```http
GET /api/time/status
Authorization: Bearer {token}
```

**Clock In**
```http
POST /api/time/clock-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Starting work"
}
```

**Clock Out**
```http
POST /api/time/clock-out
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "End of day"
}
```

**Start Break**
```http
POST /api/time/break-start
Authorization: Bearer {token}
```

**End Break**
```http
POST /api/time/break-end
Authorization: Bearer {token}
```

**Get Time Entries**
```http
GET /api/time/entries/range?start=2026-01-01T00:00:00&end=2026-01-11T23:59:59
Authorization: Bearer {token}
```

#### Integration APIs

**Get All Integrations**
```http
GET /api/integrations
Authorization: Bearer {token}
```

**Initiate OAuth Flow**
```http
GET /api/integrations/{type}/oauth/authorize
Authorization: Bearer {token}

# Types: calendly, ringcentral, docusign, pandadoc, mailchimp
```

**Get Appointments**
```http
GET /api/integrations/appointments
Authorization: Bearer {token}
```

**Sync Integration**
```http
POST /api/integrations/{type}/sync
Authorization: Bearer {token}
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:**
```
Port 8083 was already in use
```

**Solution:**
```bash
# Find process using the port
lsof -ti:8083

# Kill the process
lsof -ti:8083 | xargs kill -9

# Or restart the specific service
```

#### 2. Database Connection Failed

**Error:**
```
Cannot connect to database
```

**Solutions:**
- Check PostgreSQL is running: `pg_ctl status`
- Verify credentials in `application.properties`
- Test connection: `psql -U crm_user -d crm_database`
- Check database exists: `\l` in psql

#### 3. JWT Token Invalid/Expired

**Error:**
```
401 Unauthorized - Invalid JWT token
```

**Solutions:**
- Token expired → Login again to get new token
- Token malformed → Check Authorization header format: `Bearer {token}`
- Clock skew → Sync system time

#### 4. CORS Errors in Browser

**Error:**
```
Access blocked by CORS policy
```

**Solutions:**
- Verify API Gateway CORS configuration
- Check frontend is using correct API URL
- Ensure requests include proper headers
- Restart API Gateway

#### 5. Service Won't Start

**Error:**
```
Failed to start Application Context
```

**Solutions:**
1. Check logs: `tail -f /tmp/{service-name}.log`
2. Verify all dependencies are running
3. Check database schema is initialized
4. Rebuild service: `mvn clean install -DskipTests`
5. Check Java version: `java -version`

#### 6. Frontend Shows Blank Page

**Solutions:**
- Check browser console for errors
- Verify API Gateway is running (port 8000)
- Check network tab in DevTools
- Clear browser cache
- Verify `.env` file has correct `VITE_API_URL`

#### 7. Cannot See Data in UI

**Solutions:**
- Check JWT token is valid
- Verify role has required permissions
- Check API response in Network tab
- Ensure data exists in database
- Check frontend is parsing response correctly (`response.data.data`)

### Checking Service Health

```bash
# Check if services are responding
curl http://localhost:8000/api/leads
curl http://localhost:8081/api/users/me -H "Authorization: Bearer {token}"
curl http://localhost:8083/api/leads/stats -H "Authorization: Bearer {token}"

# Check logs
tail -f /tmp/api-gateway.log
tail -f /tmp/user-service.log
tail -f /tmp/lead-service.log
```

### Stopping All Services

```bash
# Kill all Java processes
pkill -f "java -jar"

# Or kill specific services
lsof -ti:8000 | xargs kill -9  # API Gateway
lsof -ti:8081 | xargs kill -9  # User Service
lsof -ti:8083 | xargs kill -9  # Lead Service
# ... etc

# Stop frontend
lsof -ti:3000 | xargs kill -9

# Stop Redis
redis-cli shutdown
```

---

## Service Details

### 1. Config Server (Port 8888)

**Purpose:** Centralized configuration management for all microservices

**Features:**
- Stores configuration in Git repository
- Hot reload configuration without restart
- Environment-specific configs (dev, prod)

**Endpoints:**
- `GET /{service-name}/{profile}` - Get configuration

---

### 2. API Gateway (Port 8000)

**Purpose:** Single entry point for all frontend requests

**Features:**
- Routes requests to appropriate microservice
- JWT token validation
- CORS handling
- Rate limiting
- Load balancing

**Routes:**
- `/api/auth/**` → User Service
- `/api/leads/**` → Lead Service
- `/api/calls/**` → Call Service
- `/api/campaigns/**` → Campaign Service
- `/api/time/**` → HR Service
- `/api/integrations/**` → Integration Service
- `/api/notifications/**` → Notification Service

---

### 3. User Service (Port 8081)

**Purpose:** Authentication and user management

**Features:**
- User registration with tenant creation
- JWT-based authentication (HS512)
- Role-based access control (RBAC)
- Password encryption (BCrypt)
- Refresh token mechanism
- User CRUD operations

**Database Tables:**
- `tenants` - Tenant/organization data
- `users` - User accounts
- `roles` - Role definitions
- `permissions` - Permission definitions
- `user_roles` - User-role mapping
- `role_permissions` - Role-permission mapping

---

### 4. Lead Service (Port 8083)

**Purpose:** Lead/customer management

**Features:**
- Lead CRUD operations
- Excel import/export
- Lead assignment to users
- Full-text search
- Lead history/audit trail
- Status workflow (New → Contacted → Qualified → Converted/Lost)
- Priority levels (Low, Medium, High)
- Multi-source tracking

**Database Tables:**
- `leads` - Lead information
- `lead_history` - Audit trail
- `lead_assignments` - Lead-to-user assignments

---

### 5. Call Service (Port 8084)

**Purpose:** Call logging and tracking

**Features:**
- Log inbound/outbound calls
- Associate calls with leads
- Track call duration, status, notes
- Follow-up management
- Call history per lead
- Recording metadata storage

**Database Tables:**
- `calls` - Call records
- `follow_ups` - Scheduled follow-ups

---

### 6. Campaign Service (Port 8085)

**Purpose:** Email campaign management

**Features:**
- Create email campaigns
- Template library
- Recipient selection with filters
- Send immediately or schedule
- Track opens and clicks
- Campaign analytics
- A/B testing support

**Database Tables:**
- `campaigns` - Campaign metadata
- `campaign_templates` - Email templates
- `campaign_recipients` - Recipient tracking
- `campaign_analytics` - Performance metrics

---

### 7. HR Service (Port 8082)

**Purpose:** Time tracking and attendance

**Features:**
- Clock in/out
- Break time tracking
- Time entry management
- Attendance reports
- Hourly calculations
- Overtime tracking
- Leave management

**Database Tables:**
- `time_entries` - Clock in/out records
- `attendance_summary` - Daily aggregates
- `leave_requests` - Leave management

---

### 8. Integration Service (Port 8088)

**Purpose:** Third-party integrations

**Features:**
- OAuth 2.0 flow management
- Calendly appointment sync
- RingCentral call integration
- DocuSign e-signature
- PandaDoc document management
- Mailchimp email sync
- Webhook handling

**Database Tables:**
- `integrations` - Integration configurations
- `oauth_tokens` - OAuth access tokens
- `appointments` - Synced appointments
- `webhooks` - Webhook subscriptions

---

### 9. Notification Service (Port 8087)

**Purpose:** Real-time notifications

**Features:**
- Push notifications
- Email notifications
- In-app notifications
- Notification preferences
- Read/unread tracking
- Notification history

**Database Tables:**
- `notifications` - Notification records
- `notification_preferences` - User preferences

---

## Best Practices

### Security

1. **Never commit sensitive data**
   - Keep `.env` files out of git
   - Use environment variables for secrets

2. **Strong passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols

3. **Regular token refresh**
   - Access tokens expire in 1 hour
   - Refresh tokens expire in 7 days
   - System auto-refreshes on 401

4. **Role-based access**
   - Grant minimum required permissions
   - Regularly audit user access

### Performance

1. **Database indexing**
   - Indexes on `tenant_id`, `email`, `created_at`
   - Composite indexes for common queries

2. **Caching**
   - Redis for session data
   - React Query for API caching (5 min stale time)

3. **Pagination**
   - Always use pagination for lists
   - Default page size: 20 items

### Development

1. **Code organization**
   - Follow feature-based structure
   - Keep components small and focused

2. **Error handling**
   - All API calls wrapped in try-catch
   - User-friendly error messages
   - Detailed logging for debugging

3. **Testing**
   - Unit tests for business logic
   - Integration tests for APIs
   - E2E tests for critical flows

---

## Support & Maintenance

### Backup Procedures

**Database Backup:**
```bash
# Full backup
pg_dump -U crm_user crm_database > backup_$(date +%Y%m%d).sql

# Restore
psql -U crm_user crm_database < backup_20260111.sql
```

**Configuration Backup:**
```bash
# Backup all application.properties files
tar -czf config_backup.tar.gz backend/*/src/main/resources/application.properties
```

### Logs Location

All service logs are stored in `/tmp/`:
- `/tmp/api-gateway.log`
- `/tmp/user-service.log`
- `/tmp/lead-service.log`
- `/tmp/call-service.log`
- `/tmp/campaign-service.log`
- `/tmp/hr-service.log`
- `/tmp/integration-service.log`
- `/tmp/notification-service.log`
- `/tmp/frontend.log`

### Monitoring

**Key Metrics to Monitor:**
- Service uptime
- Response times
- Database connections
- Memory usage
- Disk space
- Error rates

**Tools:**
- Spring Boot Actuator endpoints: `/actuator/health`, `/actuator/metrics`
- PostgreSQL monitoring: `pg_stat_activity`
- Redis monitoring: `redis-cli info`

---

## Appendix

### Default Credentials

**Test User:**
```
Email: shubham@monkdevs.com
Password: Monkdevs@259
Role: Admin
```

### Port Reference

| Service          | Port |
|------------------|------|
| Frontend         | 3000 |
| API Gateway      | 8000 |
| User Service     | 8081 |
| HR Service       | 8082 |
| Lead Service     | 8083 |
| Call Service     | 8084 |
| Campaign Service | 8085 |
| Notification     | 8087 |
| Integration      | 8088 |
| Config Server    | 8888 |
| PostgreSQL       | 5432 |
| Redis            | 6379 |

### Useful Commands

```bash
# Check Java version
java -version

# Check Node version
node -v

# Check PostgreSQL
psql --version

# Check Redis
redis-cli ping

# Maven build all
mvn clean install -DskipTests

# NPM install
npm install

# View logs in real-time
tail -f /tmp/api-gateway.log

# Search logs
grep "ERROR" /tmp/*.log

# Check memory usage
free -h

# Check disk space
df -h
```

---

**Version:** 1.0.0
**Last Updated:** January 11, 2026
**Maintained By:** CRM Development Team
