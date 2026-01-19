# Quick Start: Enable Modules for Your Account

## 🚀 Quick Option 1: Use the Admin UI (Recommended)

Now you have a **License Management** page in your admin panel!

### Steps:

1. **Navigate to License Management**
   - Go to: **Administration → License Management** in the sidebar
   - Or directly visit: `http://localhost:5173/settings/license`

2. **Update Your License**
   - Click the **"Update License"** button
   - Select modules you want to enable (checkboxes):
     - ✅ DASHBOARD (always enabled)
     - ✅ HRMS (Time Tracking, Leaves, HR Admin, Salary, etc.)
     - ✅ SALES (Leads, Calls, Campaigns)
     - ✅ BILLING (Subscriptions, Payments)
     - ✅ REPORTS (Analytics, Custom Reports)
     - ✅ SUPPORT (Ticketing, Help Desk)
     - ✅ INTEGRATIONS (Third-party APIs)

3. **Configure License Details**
   - **Plan Name**: PROFESSIONAL / ENTERPRISE / CUSTOM
   - **User Limit**: How many users allowed (e.g., 50, 100, 1000)
   - **Validity**: 1, 2, 3, or 5 years

4. **Click "Update License"**
   - Page will reload automatically
   - Sidebar will now show only enabled modules

---

## 🔧 Option 2: SQL Script (If Database Access Available)

If the UI doesn't work yet, run this SQL:

```sql
-- Step 1: Find your tenant ID
SELECT
    u.id as user_id,
    u.email,
    u.tenant_id,
    t.name as tenant_name
FROM user_management.users u
JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.email = 'shubham@monkdevs.com';

-- Step 2: Copy the tenant_id from above and replace below

-- Create license with ALL modules
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
) VALUES (
    'YOUR_TENANT_ID_HERE',  -- Replace with actual tenant_id
    'LIC-FULL-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint,
    'ENTERPRISE',
    1000,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 year',
    TRUE,
    30,
    'YEARLY'
) ON CONFLICT (tenant_id) DO UPDATE SET
    plan_name = 'ENTERPRISE',
    user_limit = 1000,
    expiry_date = CURRENT_TIMESTAMP + INTERVAL '1 year',
    is_active = TRUE;

-- Enable ALL modules
INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT
    'YOUR_TENANT_ID_HERE',  -- Replace with actual tenant_id
    m.id,
    TRUE,
    CURRENT_TIMESTAMP
FROM public.modules m
ON CONFLICT (tenant_id, module_id) DO UPDATE SET
    is_enabled = TRUE,
    enabled_at = CURRENT_TIMESTAMP;
```

**After running SQL**: Logout and login again (or refresh page) to see all modules.

---

## 📋 What Happens After Enabling Modules

### Sidebar Updates Automatically
You'll see these sections appear based on enabled modules:

**HRMS Module Enabled** → Shows:
- My Workspace (Time Tracking, My Leaves, My Salary, etc.)
- HR Admin
- Leave Management
- Onboarding
- Salary Management
- Tax Management

**SALES Module Enabled** → Shows:
- Sales (Leads, Calls, Campaigns)

**BILLING Module Enabled** → Shows:
- Billing (under Administration)

**REPORTS Module Enabled** → Shows:
- Reporting

---

## 🎯 Troubleshooting

### Issue 1: "No modules showing in sidebar"
**Solution**:
1. Open browser console (F12)
2. Check: `localStorage.getItem('module-storage')`
3. If empty, go to License Management and update license
4. Or run SQL script above

### Issue 2: "License Management page not visible"
**Solution**:
- Make sure you have **ADMIN** role/permission
- Check: Your user should have `ADMIN` in roles or permissions

### Issue 3: "Can't access License Management page"
**Solution**:
- Direct URL: `http://localhost:5173/settings/license`
- Or use SQL script method

### Issue 4: "Updated license but still not showing modules"
**Solution**:
1. Logout completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Or hard refresh: Ctrl+F5

---

## 📊 Module Overview

| Module | What You Get | Use Case |
|--------|-------------|----------|
| **DASHBOARD** | Main overview, analytics | Always enabled (core) |
| **HRMS** | Full HR suite - Time, Leaves, Salary, Onboarding, Tax | Employee management |
| **SALES** | CRM features - Leads, Calls, Campaigns | Sales team |
| **BILLING** | Subscriptions, Invoices, Payments | Finance team |
| **REPORTS** | Custom reports, data export, analytics | Management |
| **SUPPORT** | Ticketing, Help desk | Customer support |
| **INTEGRATIONS** | Connect external services | All teams |

---

## ✅ Recommended Setup for Testing

For development/testing, enable **ALL modules**:

Using License Management UI:
1. Go to Administration → License Management
2. Click "Update License"
3. Check all modules except DASHBOARD (it's auto-checked)
4. Set User Limit: 1000
5. Set Validity: 1 Year
6. Click "Update License"
7. Wait for page reload

Your sidebar will now show all features!

---

## 🎉 You're All Set!

Once modules are enabled:
- ✅ Sidebar shows only your licensed features
- ✅ Direct navigation blocked for non-licensed modules
- ✅ Friendly error messages if accessing non-licensed routes
- ✅ License expiry warnings appear automatically

**Need help?** Check the main documentation:
- `MODULE_LICENSING_IMPLEMENTATION_COMPLETE.md` - Full technical details
- `/Users/shubhamgaigawale/.claude/plans/multi-tenant-licensing-system.md` - Architecture

---

**Last Updated**: 2026-01-19
