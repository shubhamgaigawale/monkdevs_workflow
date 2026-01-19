# 🚀 Deploy Your CRM - 100% FREE

## ✅ What's Prepared

All configuration files are ready:
- ✅ `render.yaml` - Backend deployment config
- ✅ `application-production.yml` - Production configs for services
- ✅ `vercel.json` - Frontend deployment config
- ✅ `.env.production` - Frontend environment variables

---

## 📋 Deployment Steps (15 minutes total)

### Part 1: Deploy Backend on Render (10 minutes)

#### Step 1: Push to GitHub

```bash
# Add all new configuration files
git add .

# Commit
git commit -m "Add deployment configuration for Render and Vercel"

# Push to GitHub
git push origin main
```

#### Step 2: Deploy on Render

1. **Go to Render**: https://dashboard.render.com/
2. **Sign up** with GitHub (free account)
3. **Click "New +"** → **"Blueprint"**
4. **Connect your GitHub repository**
5. **Select your repository**: `monkdevs_workflow`
6. **Click "Apply"**

**What happens:**
- Render reads `render.yaml` automatically
- Creates PostgreSQL database (free)
- Creates Redis instance (free)
- Builds API Gateway (takes ~5-7 min)
- Builds User Service (takes ~5-7 min)

#### Step 3: Set JWT Secret

After services are created:

1. Go to **crm-api-gateway** service
2. Click **"Environment"** tab
3. Find **JWT_SECRET** variable
4. Click **"Generate Value"** (or set your own 64+ character string)
5. **Save Changes**

6. Go to **crm-user-service** service
7. Click **"Environment"** tab
8. Find **JWT_SECRET** variable
9. **Copy the SAME value** from API Gateway
10. **Save Changes**

**Both services must have the SAME JWT_SECRET!**

#### Step 4: Get Your Backend URL

After deployment completes (~10 min):

1. Go to **crm-api-gateway** service
2. Copy the URL (e.g., `https://crm-api-gateway.onrender.com`)
3. **Save this URL** - you'll need it for frontend!

---

### Part 2: Deploy Frontend on Vercel (5 minutes)

#### Step 1: Deploy on Vercel

1. **Go to Vercel**: https://vercel.com/
2. **Sign up** with GitHub (free account)
3. **Click "Add New"** → **"Project"**
4. **Import** your GitHub repository
5. **Select "frontend" folder** as root directory:
   - Click **"Edit"** next to Root Directory
   - Select **`frontend`**
6. **Framework Preset**: Automatically detects Vite ✅
7. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Step 2: Set Environment Variable

**IMPORTANT**: Before deploying, add environment variable:

1. Click **"Environment Variables"**
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://crm-api-gateway.onrender.com` (your Render URL from Part 1)
   - **Select**: All environments
3. Click **"Add"**

#### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. **Your app is live!** 🎉

Vercel will give you a URL like: `https://your-app.vercel.app`

---

## 🔧 After Deployment: Initialize Database

### Step 1: Access Render Database Console

1. Go to Render Dashboard
2. Click on **"crm-database"**
3. Click **"Connect"** → **"External Connection"**
4. Copy the connection details

### Step 2: Connect with Database Client

Use **pgAdmin**, **DBeaver**, or **psql** with the connection details:

```
Host: [from Render]
Port: 5432
Database: crm_db
User: crm_user
Password: [from Render]
```

### Step 3: Run Initialization SQL

```sql
-- Create schemas if not exist
CREATE SCHEMA IF NOT EXISTS user_management;
CREATE SCHEMA IF NOT EXISTS public;

-- Create roles
INSERT INTO user_management.roles (id, name, description) VALUES
    (gen_random_uuid(), 'ADMIN', 'Administrator'),
    (gen_random_uuid(), 'MANAGER', 'Manager'),
    (gen_random_uuid(), 'SUPERVISOR', 'Supervisor'),
    (gen_random_uuid(), 'AGENT', 'Agent'),
    (gen_random_uuid(), 'HR_MANAGER', 'HR Manager')
ON CONFLICT (name) DO NOTHING;

-- Create modules
INSERT INTO public.modules (id, code, name, description, icon, display_order, is_core_module, base_price, created_at) VALUES
    (gen_random_uuid(), 'DASHBOARD', 'Dashboard', 'Main dashboard and analytics', 'LayoutDashboard', 0, TRUE, 0, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'HRMS', 'HR Management', 'Time tracking, leave, salary, onboarding, tax', 'Users', 1, FALSE, 50, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'SALES', 'Sales Management', 'Leads, calls, campaigns', 'Briefcase', 2, FALSE, 30, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'BILLING', 'Billing', 'Subscriptions, payments, invoices', 'Wallet', 3, FALSE, 25, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'REPORTS', 'Reports & Analytics', 'Dashboard, custom reports, data export', 'FileText', 4, FALSE, 20, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'SUPPORT', 'Customer Support', 'Tickets, help desk, knowledge base', 'MessageSquare', 5, FALSE, 15, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'INTEGRATIONS', 'Integrations', 'Third-party integrations', 'Puzzle', 6, FALSE, 10, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
```

---

## 👤 Create Your First User

### Method 1: Using Registration Page (Easiest)

1. Go to your Vercel URL: `https://your-app.vercel.app/register`
2. Fill in the form:
   - **Email**: `admin@yourcompany.com`
   - **Password**: Your secure password
   - **First Name**: Your first name
   - **Last Name**: Your last name
   - **Company Name**: Your company name (e.g., "Acme Corp")
3. Click **"Create Account"**

4. **Fix Role to ADMIN** (using database console):

```sql
-- Update your role to ADMIN
DELETE FROM user_management.user_roles
WHERE user_id = (SELECT id FROM user_management.users WHERE email = 'admin@yourcompany.com');

INSERT INTO user_management.user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM user_management.users WHERE email = 'admin@yourcompany.com'),
    (SELECT id FROM user_management.roles WHERE name = 'ADMIN')
);
```

5. **Logout and Login again** → You now have ADMIN access!

### Method 2: Direct SQL Creation

```sql
-- Create tenant
INSERT INTO user_management.tenants (id, name, subdomain, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Your Company Name',
    'yourcompany',
    true,
    CURRENT_TIMESTAMP
)
RETURNING id;

-- Save the tenant ID, then create admin user
INSERT INTO user_management.users (
    id, tenant_id, email, password_hash,
    first_name, last_name, is_active, created_at
)
VALUES (
    gen_random_uuid(),
    'YOUR_TENANT_ID_HERE',  -- From above query
    'admin@yourcompany.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EXkzrk2XEZ5YRYww6p3l.e',  -- Password: Admin123!
    'Admin',
    'User',
    true,
    CURRENT_TIMESTAMP
)
RETURNING id;

-- Assign ADMIN role
INSERT INTO user_management.user_roles (user_id, role_id)
VALUES (
    'YOUR_USER_ID_HERE',  -- From above query
    (SELECT id FROM user_management.roles WHERE name = 'ADMIN')
);
```

---

## 🎯 Enable Modules

After logging in as ADMIN:

### Option 1: Using UI

1. Go to **Administration** → **License Management**
2. Click **"Update License"**
3. Select modules you want (HRMS, Sales, etc.)
4. Click **"Update License"**
5. Page reloads → Sidebar shows all enabled modules!

### Option 2: Using SQL

```sql
-- Get your tenant ID
SELECT u.tenant_id FROM user_management.users u WHERE u.email = 'admin@yourcompany.com';

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
)
ON CONFLICT (tenant_id) DO UPDATE SET
    plan_name = 'ENTERPRISE',
    user_limit = 1000,
    expiry_date = CURRENT_TIMESTAMP + INTERVAL '1 year',
    is_active = TRUE;

-- Enable all modules
INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT 'YOUR_TENANT_ID', m.id, TRUE, CURRENT_TIMESTAMP
FROM public.modules m
ON CONFLICT (tenant_id, module_id) DO UPDATE SET
    is_enabled = TRUE,
    enabled_at = CURRENT_TIMESTAMP;
```

Refresh browser → All modules appear!

---

## ✅ Verification Checklist

After deployment:

- [ ] Backend is running on Render: `https://crm-api-gateway.onrender.com/actuator/health`
      - Should return: `{"status":"UP"}`
- [ ] Frontend is running on Vercel: `https://your-app.vercel.app`
      - Should load the login page
- [ ] Database is accessible and initialized
- [ ] Can register/create admin user
- [ ] Can login successfully
- [ ] Can access License Management page
- [ ] Can enable modules
- [ ] Sidebar shows enabled modules

---

## 🆘 Troubleshooting

### Backend Services Won't Start

**Check Render Logs**:
1. Go to service in Render dashboard
2. Click "Logs" tab
3. Look for errors

**Common Issues**:
- Build failed → Check Java version (should be 17+)
- Out of memory → Services are using minimal RAM (400MB)
- Database connection failed → Check DATABASE_URL variable

### Frontend Can't Connect to Backend

**Check**:
1. `VITE_API_URL` in Vercel is set correctly
2. CORS is configured in API Gateway
3. Backend is running (check health endpoint)

**Fix**:
- Go to Vercel → Your Project → Settings → Environment Variables
- Update `VITE_API_URL` to correct Render URL
- Redeploy frontend

### Database Connection Issues

**Check**:
1. Render database is running
2. Connection string is correct
3. Firewall allows connections

**Note**: Render free databases expire after 90 days. You'll get an email warning. Just create a new one and migrate data.

### Services Sleeping (15 min inactivity)

**Expected behavior on free tier**:
- Services sleep after 15 minutes of no requests
- Wake up in ~30 seconds on next request
- Completely normal for free tier

**To prevent** (costs money):
- Upgrade to Render paid plan ($7/month per service)
- Or use a ping service to keep it awake

---

## 💰 Cost Breakdown

**Current Setup**: **$0/month** (Forever free!)

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel Free | $0 |
| API Gateway | Render Free | $0 |
| User Service | Render Free | $0 |
| PostgreSQL | Render Free | $0 |
| Redis | Render Free | $0 |
| **Total** | | **$0/month** |

**Limitations**:
- Services sleep after 15 min (wake in ~30s)
- Database expires in 90 days (can recreate)
- Limited resources (fine for testing/demos)

**When to Upgrade**:
- Getting real users/customers
- Need services always on
- Database > 1GB
- Need better performance

**Upgrade Cost**:
- Render Starter: $7/service/month
- Railway Hobby: $5/month (all services)

---

## 🎉 Your CRM is Now Live!

**Access your deployed app**:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://crm-api-gateway.onrender.com`

**Next Steps**:
1. Register/Login as admin
2. Enable required modules
3. Invite team members
4. Configure integrations
5. Start using your CRM!

**Share your app**: Send the Vercel URL to anyone - it's live and accessible from anywhere! 🌍

---

## 📊 Performance Notes

**First Request** (after sleep):
- May take 30-60 seconds (services waking up)
- Normal for free tier

**Subsequent Requests**:
- Fast response times (< 1 second)
- Good performance for demos

**Production Ready**:
- For production with real users, consider upgrading
- Railway $5/month or Render Starter $7/month per service
- Services stay awake, better performance

---

## 🔒 Security Reminder

After deployment:

1. **Change default password** if you used SQL method
2. **Generate strong JWT secret** (done automatically by Render)
3. **Update CORS origins** to only allow your Vercel domain
4. **Enable HTTPS** (automatic on both platforms ✅)
5. **Regular database backups** (Render provides this)

---

## 📚 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Check Logs**: Always check service logs in dashboards

---

**🎊 Congratulations! Your CRM is now deployed and running for FREE!** 🎊
