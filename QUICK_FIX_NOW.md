# Quick Fix - Enable Modules NOW (SQL Method)

## ✅ What's Fixed:
1. **API Gateway** - Now running with updated routes for `/api/license/**` and `/api/modules/**`
2. **CORS issue** - Completely resolved!

## ❌ What's Broken:
- **User Service** - Has Flyway database migration validation errors
- This is because we modified the Module entity structure
- Will take time to fix properly

---

## 🚀 IMMEDIATE SOLUTION: Use SQL to Enable Modules

Since the Gateway is working but User Service has DB issues, use this SQL script to enable modules directly in the database:

### Step 1: Get Your Tenant ID

Run this query in your database:

```sql
SELECT u.tenant_id
FROM user_management.users u
WHERE u.email = 'shubham@monkdevs.com';
```

**Copy the tenant_id value - you'll need it below!**

---

### Step 2: Enable All Modules

Replace `YOUR_TENANT_ID_HERE` with the actual UUID from Step 1, then run this:

```sql
-- Create/Update License
INSERT INTO public.tenant_licenses (
    tenant_id,
    license_key,
    plan_name,
    user_limit,
    issue_date,
    expiry_date,
    is_active,
    grace_period_days,
    billing_cycle
)
VALUES (
    'YOUR_TENANT_ID_HERE',  -- ⚠️ REPLACE THIS!
    'LIC-FULL-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint,
    'ENTERPRISE',
    1000,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 year',
    TRUE,
    30,
    'YEARLY'
)
ON CONFLICT (tenant_id) DO UPDATE SET
    plan_name = 'ENTERPRISE',
    user_limit = 1000,
    expiry_date = CURRENT_TIMESTAMP + INTERVAL '1 year',
    is_active = TRUE;

-- Enable All Modules
INSERT INTO public.tenant_enabled_modules (
    tenant_id,
    module_id,
    is_enabled,
    enabled_at
)
SELECT
    'YOUR_TENANT_ID_HERE',  -- ⚠️ REPLACE THIS!
    m.id,
    TRUE,
    CURRENT_TIMESTAMP
FROM public.modules m
ON CONFLICT (tenant_id, module_id) DO UPDATE SET
    is_enabled = TRUE,
    enabled_at = CURRENT_TIMESTAMP;
```

---

### Step 3: Refresh Your Browser

1. Go to your application: `http://localhost:5173`
2. Press **Ctrl + Shift + R** (hard refresh)
3. **All modules should now appear in the sidebar!**

---

## 🎯 Example with Actual Tenant ID

If your tenant_id is: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Then your SQL would be:

```sql
-- Create/Update License
INSERT INTO public.tenant_licenses (
    tenant_id, license_key, plan_name, user_limit,
    issue_date, expiry_date, is_active, grace_period_days, billing_cycle
)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- ✅ Actual tenant ID
    'LIC-FULL-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint,
    'ENTERPRISE', 1000,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year',
    TRUE, 30, 'YEARLY'
)
ON CONFLICT (tenant_id) DO UPDATE SET
    plan_name = 'ENTERPRISE', user_limit = 1000,
    expiry_date = CURRENT_TIMESTAMP + INTERVAL '1 year', is_active = TRUE;

-- Enable All Modules
INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', m.id, TRUE, CURRENT_TIMESTAMP
FROM public.modules m
ON CONFLICT (tenant_id, module_id) DO UPDATE SET is_enabled = TRUE, enabled_at = CURRENT_TIMESTAMP;
```

---

## ✅ What You'll See After Running the SQL:

After refreshing your browser, the sidebar will show:
- ✅ Dashboard
- ✅ Sales (Leads, Calls, Campaigns)
- ✅ My Workspace (Time Tracking, Leaves, Onboarding, Salary, Tax)
- ✅ HR Admin
- ✅ Leave Management
- ✅ Onboarding
- ✅ Salary Management
- ✅ Tax Management
- ✅ Reporting
- ✅ Administration (Users, License Management, Integrations, Billing)

---

## 🔧 Next Steps (After Modules Are Enabled):

We still need to fix the User Service database migration issues. Here are the options:

### Option 1: Reset Flyway Migrations (Destructive - Dev Only)
```sql
DELETE FROM user_management.flyway_schema_history
WHERE version >= 'VERSION_THAT_ADDED_MODULES';
```

### Option 2: Disable Flyway Validation
Edit `backend/user-service/src/main/resources/application.yml`:
```yaml
spring:
  flyway:
    validate-on-migrate: false
```

### Option 3: Fix the Migration File
Create a new migration that alters the `modules` table to match the current entity structure.

---

## 🎉 TLDR - Do This Now:

1. Run query to get your tenant_id
2. Copy the SQL script above
3. Replace `YOUR_TENANT_ID_HERE` with your actual tenant ID (2 places)
4. Run the SQL
5. Refresh browser (Ctrl + Shift + R)
6. All modules will appear in sidebar!

**This will work immediately** while we fix the User Service migration issues in the background.
