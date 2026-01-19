# 🚀 First-Time Deployment & Login Guide

## Overview

When you deploy this CRM product for the first time, you need to:
1. **Register the first user** (Company Admin)
2. **Assign ADMIN role** (currently defaults to AGENT)
3. **Configure license and modules**
4. **Start using the system**

---

## 📋 Prerequisites

Before starting, ensure:
- ✅ PostgreSQL database is running and initialized
- ✅ Redis is running (required for session management)
- ✅ All services are running:
  - API Gateway (port 8000)
  - User Service (port 8081)
  - Other microservices as needed
- ✅ Frontend is running (port 5173 or deployed)

---

## 🎯 Method 1: Registration Page (Recommended for Users)

### Step 1: Access Registration Page

Go to: `http://localhost:5173/register` (or your deployed URL)

### Step 2: Fill Registration Form

The registration page asks for:
- **Email**: Your admin email (e.g., `admin@yourcompany.com`)
- **Password**: Secure password
- **First Name**: Your first name
- **Last Name**: Your last name
- **Company Name**: Your company name (e.g., "Acme Corporation")

**Important**: The "Company Name" creates a new **tenant** (isolated workspace for your company).

### Step 3: Submit Registration

Click **"Create Account"** button.

**What happens**:
- ✅ Creates a new tenant (company workspace)
- ✅ Creates your user account
- ⚠️ **Problem**: Assigns AGENT role by default (not ADMIN)

### Step 4: Fix Role to ADMIN

After registration, you need to update your role to ADMIN using SQL:

```sql
-- Find your user
SELECT id, email, first_name, last_name
FROM user_management.users
WHERE email = 'admin@yourcompany.com';

-- Get the ADMIN role ID
SELECT id, name FROM user_management.roles WHERE name = 'ADMIN';

-- Update user_roles table
-- First, delete the AGENT role association
DELETE FROM user_management.user_roles
WHERE user_id = (SELECT id FROM user_management.users WHERE email = 'admin@yourcompany.com');

-- Then, add ADMIN role
INSERT INTO user_management.user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM user_management.users WHERE email = 'admin@yourcompany.com'),
    (SELECT id FROM user_management.roles WHERE name = 'ADMIN')
);
```

### Step 5: Logout and Login Again

1. Click on your profile → **Logout**
2. Login again with your credentials
3. You should now have ADMIN access!

---

## 🔧 Method 2: SQL Direct Creation (For Developers)

If you want to create the first admin user directly via SQL:

### Step 1: Create Tenant

```sql
-- Create tenant
INSERT INTO user_management.tenants (id, name, subdomain, is_active)
VALUES (
    gen_random_uuid(),
    'Acme Corporation',
    'acme',
    true
)
RETURNING id;
```

**Save the returned tenant ID** - you'll need it in the next steps!

### Step 2: Create Admin User

```sql
-- Replace TENANT_ID_HERE with the ID from Step 1
-- Replace the password hash with a bcrypt hash of your desired password

INSERT INTO user_management.users (
    id, tenant_id, email, password_hash,
    first_name, last_name, is_active
)
VALUES (
    gen_random_uuid(),
    'TENANT_ID_HERE',  -- ⚠️ REPLACE THIS
    'admin@acme.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EXkzrk2XEZ5YRYww6p3l.e',  -- Password: "Admin123!"
    'Admin',
    'User',
    true
)
RETURNING id;
```

**Save the returned user ID** - you'll need it for the next step!

**Note**: The password hash above is for `Admin123!`. To generate your own:
```java
// In Java
String hashedPassword = new BCryptPasswordEncoder().encode("YourPassword");
```

Or use an online bcrypt generator.

### Step 3: Assign ADMIN Role

```sql
-- Replace USER_ID_HERE with the ID from Step 2

INSERT INTO user_management.user_roles (user_id, role_id)
VALUES (
    'USER_ID_HERE',  -- ⚠️ REPLACE THIS
    (SELECT id FROM user_management.roles WHERE name = 'ADMIN')
);
```

### Step 4: Login

Go to: `http://localhost:5173/login`

Login with:
- **Email**: `admin@acme.com` (or whatever you used)
- **Password**: `Admin123!` (or whatever you set)

---

## 🔐 Better Solution: Fix Registration to Auto-Assign ADMIN

### Backend Fix (Permanent Solution)

Edit: `backend/user-service/src/main/java/com/crm/userservice/service/AuthService.java`

**Change this** (around line 97-98):
```java
// Determine role (default to AGENT)
String roleName = request.getRoleName() != null ? request.getRoleName() : "AGENT";
```

**To this**:
```java
// Determine role
// If this is the first user in the tenant, make them ADMIN
boolean isFirstUser = userRepository.findByTenantId(tenant.getId()).isEmpty();
String roleName;
if (request.getRoleName() != null) {
    roleName = request.getRoleName();
} else if (isFirstUser) {
    roleName = "ADMIN";  // First user is always ADMIN
} else {
    roleName = "AGENT";  // Subsequent users default to AGENT
}
```

**Restart user-service** after making this change.

Now:
- ✅ First user in a new tenant automatically gets ADMIN role
- ✅ Subsequent users default to AGENT role
- ✅ No manual SQL needed!

---

## 📦 After First Login - Setup Modules

Once you're logged in as ADMIN:

### Option 1: Using UI

1. Go to **Administration → License Management**
2. Click **"Update License"**
3. Select modules you want to enable
4. Click **"Update License"**
5. Page reloads → Sidebar shows enabled modules

### Option 2: Using SQL

Run the script from `QUICK_FIX_NOW.md`:

```sql
-- Get your tenant ID
SELECT u.tenant_id
FROM user_management.users u
WHERE u.email = 'your-email@company.com';

-- Create license (replace YOUR_TENANT_ID)
INSERT INTO public.tenant_licenses (
    tenant_id, license_key, plan_name, user_limit,
    issue_date, expiry_date, is_active, grace_period_days, billing_cycle
)
VALUES (
    'YOUR_TENANT_ID',
    'LIC-FULL-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint,
    'ENTERPRISE', 1000,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year',
    TRUE, 30, 'YEARLY'
);

-- Enable all modules
INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT 'YOUR_TENANT_ID', m.id, TRUE, CURRENT_TIMESTAMP FROM public.modules m;
```

---

## 🎯 Quick Start Checklist

For deploying to a new environment:

- [ ] 1. Start all services (PostgreSQL, Redis, API Gateway, User Service)
- [ ] 2. Access registration page: `/register`
- [ ] 3. Create first user with company details
- [ ] 4. Fix role to ADMIN using SQL (or use backend fix)
- [ ] 5. Logout and login again
- [ ] 6. Enable modules via License Management or SQL
- [ ] 7. Start inviting team members!

---

## 🆘 Troubleshooting

### Can't see License Management in sidebar?

**Check 1**: Do you have ADMIN role?
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('auth-storage')).state.user
console.log('Roles:', user.roles)
```

Should include `{ name: "ADMIN" }`.

**Check 2**: Is Administration category visible?
- Look for "Administration" in sidebar
- Click to expand
- "License Management" should be inside

### Can't access License Management page?

**Error**: "Access Denied" or redirected to dashboard
**Cause**: You don't have ADMIN role
**Fix**: Run SQL to update your role (see Method 1, Step 4)

### License Management page has no sidebar?

**Cause**: Fixed in latest code
**Fix**: Refresh browser (Ctrl + Shift + R)

---

## 🔐 Default Credentials (After SQL Creation)

If you used Method 2 (SQL Direct Creation):
- **Email**: `admin@acme.com`
- **Password**: `Admin123!`

**⚠️ IMPORTANT**: Change this password immediately after first login!

Go to: **Profile → Settings → Change Password**

---

## 📊 What You Should See After Setup

After completing all steps:

**Sidebar should show**:
- Dashboard
- Sales (if SALES module enabled)
  - Leads
  - Calls
  - Campaigns
- My Workspace (if HRMS module enabled)
  - Time Tracking
  - My Leaves
  - My Salary
  - etc.
- Administration
  - Users
  - **License Management** ← You should see this
  - Integrations
  - Billing

**License Management page should show**:
- Current license status
- Module cards with checkboxes
- "Update License" button

---

## 🚀 Production Deployment Notes

For production deployments:

1. **Use environment variables** for:
   - Database credentials
   - JWT secret
   - Redis connection
   - API URLs

2. **Secure the registration endpoint**:
   - Option A: Disable after first user
   - Option B: Require invite code
   - Option C: Only allow ADMIN to create users

3. **Use strong passwords**:
   - Minimum 12 characters
   - Mix of upper, lower, numbers, symbols
   - No default passwords

4. **Enable HTTPS**:
   - Use SSL certificates
   - Redirect HTTP to HTTPS

5. **Set up backups**:
   - Database daily backups
   - Backup tenant data separately

---

## 🎉 Summary

**For End Users** (Method 1):
1. Register at `/register`
2. Run SQL to fix role to ADMIN
3. Logout and login again
4. Enable modules

**For Developers** (Backend Fix):
1. Update `AuthService.java` to auto-assign ADMIN to first user
2. Restart service
3. Register at `/register` → automatic ADMIN role!
4. Enable modules

**Next Steps After Login**:
- Enable required modules
- Invite team members
- Configure integrations
- Start using the CRM!
