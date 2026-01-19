# 🗄️ Database Setup Guide - Free Deployment

## ✅ Database is Included FREE!

When you deploy to Render using the `render.yaml` file, you get:

- ✅ **PostgreSQL Database** (FREE)
- ✅ **1GB Storage** (plenty for small-medium apps)
- ✅ **Automatic backups** (daily)
- ✅ **SSL connections** (secure)
- ✅ **90 days validity** (can recreate when expires)

**No extra setup needed!** Render creates the database automatically.

---

## 🔧 How It Works

### 1. **Database is Created Automatically**

When you deploy using Blueprint (render.yaml), Render:
- ✅ Creates a PostgreSQL database named `crm-database`
- ✅ Creates database: `crm_db`
- ✅ Creates user: `crm_user` with random password
- ✅ Generates connection string: `postgresql://user:pass@host:port/dbname`
- ✅ Injects connection string into your services as `DATABASE_URL`

**You don't create it manually!**

### 2. **Connection String is Automatic**

In `render.yaml`, this line handles it:

```yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: crm-database
      property: connectionString
```

This means:
- Render automatically sets `DATABASE_URL` environment variable
- Your User Service reads it from `${DATABASE_URL}`
- Connection is automatic - no manual config needed!

### 3. **Tables are Created by Flyway**

Your application uses **Flyway migrations** to create tables automatically on first startup:

**Location**: `backend/user-service/src/main/resources/db/migration/`

When User Service starts:
1. Connects to database
2. Checks if tables exist
3. Runs migration scripts if needed
4. Creates all tables, indexes, etc.

**You don't run SQL manually for tables!**

---

## 📊 What You DO Need to Do Manually

After deployment, you need to **seed initial data** (one-time):

### Step 1: Access Database Console

**In Render Dashboard:**

1. Click on **"crm-database"**
2. Click **"Connect"** tab
3. Copy connection details:
   - **External Database URL**: `postgresql://user:pass@host:port/dbname`
   - Or individual fields (host, port, database, user, password)

### Step 2: Connect with Database Client

Use **any** PostgreSQL client:

**Option A: DBeaver (Free, GUI)**
- Download: https://dbeaver.io/download/
- New Connection → PostgreSQL
- Paste connection details from Render

**Option B: pgAdmin (Free, GUI)**
- Download: https://www.pgadmin.org/download/
- New Server → Connection tab
- Enter details from Render

**Option C: psql (Command line)**
```bash
psql "postgresql://user:pass@host:port/dbname"
```

**Option D: Render's Web Console**
- In Render dashboard
- Click "Connect" → "Connect via PSQL"
- Opens terminal in browser (easiest!)

### Step 3: Run Initial Seed Data

```sql
-- =====================================================
-- SEED DATA - Run this ONCE after first deployment
-- =====================================================

-- 1. Create Roles
INSERT INTO user_management.roles (id, name, description) VALUES
    (gen_random_uuid(), 'ADMIN', 'Administrator with full access'),
    (gen_random_uuid(), 'MANAGER', 'Manager with team access'),
    (gen_random_uuid(), 'SUPERVISOR', 'Supervisor with limited management'),
    (gen_random_uuid(), 'AGENT', 'Agent with basic access'),
    (gen_random_uuid(), 'HR_MANAGER', 'HR Manager with HR access')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Modules
INSERT INTO public.modules (id, code, name, description, icon, display_order, is_core_module, base_price, created_at) VALUES
    (gen_random_uuid(), 'DASHBOARD', 'Dashboard', 'Main dashboard and analytics', 'LayoutDashboard', 0, TRUE, 0, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'HRMS', 'HR Management', 'Time tracking, leave, salary, onboarding, tax', 'Users', 1, FALSE, 50, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'SALES', 'Sales Management', 'Leads, calls, campaigns', 'Briefcase', 2, FALSE, 30, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'BILLING', 'Billing', 'Subscriptions, payments, invoices', 'Wallet', 3, FALSE, 25, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'REPORTS', 'Reports & Analytics', 'Dashboard, custom reports, data export', 'FileText', 4, FALSE, 20, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'SUPPORT', 'Customer Support', 'Tickets, help desk, knowledge base', 'MessageSquare', 5, FALSE, 15, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'INTEGRATIONS', 'Integrations', 'Third-party integrations', 'Puzzle', 6, FALSE, 10, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Done! Seed data inserted.
```

**Why is this needed?**
- Roles and Modules are reference data
- Your app needs them to function
- Not created by migrations (by design)
- Run once per database

---

## 🎯 Database Timeline

### When You Deploy:

**Minute 0**: Click "Apply" in Render
- ⏳ Render creates database (30 seconds)
- ⏳ Database is ready but empty

**Minute 1-5**: Backend services build
- ⏳ Maven downloads dependencies
- ⏳ Compiles Java code
- ⏳ Creates JAR files

**Minute 5-6**: User Service starts first time
- ✅ Connects to database
- ✅ Flyway runs migrations
- ✅ Creates all tables automatically
- ✅ Service is ready

**Minute 6+**: You seed initial data
- ⏰ **YOU DO THIS**: Run seed SQL
- ⏰ **YOU DO THIS**: Create first admin user
- ✅ App is fully ready to use!

---

## 📋 Complete Deployment Checklist

- [ ] **Step 1**: Push code to GitHub
- [ ] **Step 2**: Deploy to Render (Blueprint)
- [ ] **Step 3**: Wait for deployment (10 min)
- [ ] **Step 4**: Access database console
- [ ] **Step 5**: Run seed SQL (roles + modules)
- [ ] **Step 6**: Create first admin user (via registration or SQL)
- [ ] **Step 7**: Login and enable modules
- [ ] **Step 8**: Start using your CRM!

---

## 🔍 Verify Database is Working

### Check 1: Database Created

In Render dashboard:
- Look for **"crm-database"** service
- Status should be **"Available"** (green)

### Check 2: User Service Connected

In Render dashboard:
- Go to **crm-user-service**
- Click **"Logs"** tab
- Search for: `"HikariPool"` or `"Flyway"`
- Should see: "Starting migration", "Successfully applied migrations"

### Check 3: Tables Created

In database console, run:
```sql
-- Check schemas exist
\dn

-- Should see: public, user_management

-- Check tables exist
\dt user_management.*

-- Should see: users, roles, user_roles, tenants, etc.

-- Check modules table
SELECT COUNT(*) FROM public.modules;

-- Should return: 7 (after seed data)
```

---

## 💾 Database Free Tier Details

### What's Included (FREE):

| Feature | Free Tier |
|---------|-----------|
| **Storage** | 1 GB |
| **RAM** | Shared |
| **Connections** | 97 max |
| **Backups** | Daily (7 days retention) |
| **Expiry** | 90 days |
| **Cost** | $0/month |

### Limitations:

1. **90-Day Expiry**
   - Database expires after 90 days
   - You get email warnings at 75, 85, 89 days
   - Can export data and create new database
   - **Workaround**: Upgrade to paid ($7/month) for permanent database

2. **1GB Storage**
   - Good for ~100,000 records
   - Should be fine for small-medium usage
   - Can monitor usage in Render dashboard

3. **Shared Resources**
   - Shared CPU/RAM with other free databases
   - May be slower than paid tier
   - Fine for testing/demos

### When to Upgrade:

Upgrade when:
- Approaching 1GB storage
- Need database beyond 90 days
- Need better performance
- Have paying customers

**Paid Tier**: $7/month
- Permanent (no expiry)
- 10GB storage
- Better performance
- Priority support

---

## 🆘 Common Database Issues

### Issue 1: "Connection refused"

**Cause**: Database not ready yet or wrong connection details

**Fix**:
1. Check database status in Render dashboard
2. Verify it shows "Available" (green)
3. Check User Service logs for connection errors
4. Verify DATABASE_URL is set correctly

### Issue 2: "Role does not exist"

**Cause**: Flyway migrations haven't run yet

**Fix**:
1. Check User Service logs
2. Look for Flyway migration messages
3. Restart User Service if needed
4. Check if tables exist in database

### Issue 3: "Cannot create user - roles not found"

**Cause**: Seed data not inserted

**Fix**:
1. Connect to database
2. Run seed SQL (roles + modules)
3. Try creating user again

### Issue 4: "Too many connections"

**Cause**: Connection pool settings too high or leaks

**Fix**:
1. Check `maximum-pool-size` in config (set to 5 for free tier)
2. Restart User Service
3. Monitor active connections

---

## 📊 Database Monitoring

### In Render Dashboard:

1. Go to **crm-database**
2. Click **"Metrics"** tab
3. See:
   - Storage usage
   - Active connections
   - Query performance

### Set Up Alerts:

1. Click **"Settings"** tab
2. Enable notifications:
   - Storage approaching limit
   - Expiry warnings
   - Performance issues

---

## 🔄 Database Backup & Restore

### Automatic Backups (Render Free):

- Daily backups (automatic)
- 7 days retention
- Can restore from Render dashboard

### Manual Backup:

```bash
# Export entire database
pg_dump "postgresql://user:pass@host:port/dbname" > backup.sql

# Export specific schema
pg_dump -n user_management "postgresql://user:pass@host:port/dbname" > user_management.sql
```

### Restore from Backup:

```bash
# Restore entire database
psql "postgresql://user:pass@host:port/dbname" < backup.sql
```

---

## 🎯 After 90 Days (Database Expiry)

When your free database approaches expiry:

### Option 1: Export & Recreate (Free)

1. **Export data** (7 days before expiry):
   ```bash
   pg_dump "postgresql://old-connection" > full_backup.sql
   ```

2. **Create new database** in Render:
   - Click "New +" → "PostgreSQL"
   - Free tier again (another 90 days)

3. **Update connection** in services:
   - Update DATABASE_URL in User Service
   - Redeploy

4. **Restore data**:
   ```bash
   psql "postgresql://new-connection" < full_backup.sql
   ```

### Option 2: Upgrade to Paid ($7/month)

1. Go to database in Render
2. Click "Upgrade"
3. Select Starter plan ($7/month)
4. Database becomes permanent!

---

## 🎉 Summary

**What's Automatic:**
- ✅ Database creation (Render)
- ✅ Connection string (Render)
- ✅ Table creation (Flyway migrations)
- ✅ Daily backups (Render)

**What You Do Once:**
- ⏰ Run seed SQL (roles + modules)
- ⏰ Create first admin user

**What's FREE:**
- ✅ PostgreSQL database (1GB, 90 days)
- ✅ SSL connections
- ✅ Daily backups
- ✅ Connection pooling

**Total Cost: $0/month** (perfect for testing/demos!)

---

## 📚 Next Steps

1. ✅ Deploy to Render (database is created automatically)
2. ✅ Wait for services to start
3. ✅ Connect to database console
4. ✅ Run seed SQL
5. ✅ Create admin user
6. ✅ Start using your CRM!

**Database is ready to go!** 🚀
