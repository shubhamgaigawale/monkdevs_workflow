# 🆓 Free Deployment Guide for CRM Application

## 🎯 Your Tech Stack

- **Backend**: Java Spring Boot (API Gateway, User Service, etc.)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Frontend**: React + Vite

---

## 🚀 Best Free Deployment Options

### Option 1: Render (Recommended - Easiest)

**What's Free:**
- 750 hours/month of web service runtime
- PostgreSQL database (90 days, then expires but can recreate)
- Redis instance
- Free SSL certificates
- Custom domains

**Limitations:**
- Services sleep after 15 minutes of inactivity (takes ~30s to wake up)
- 512 MB RAM per service
- Database limited to 1GB storage

**Perfect for:** Testing, demos, small teams

---

### Option 2: Railway

**What's Free:**
- $5 free credits/month (enough for small deployments)
- PostgreSQL, Redis included
- No sleep (always on)
- Better performance than Render free tier

**Limitations:**
- Credits run out if you use too much
- Need to monitor usage

**Perfect for:** Small production deployments, always-on services

---

### Option 3: Fly.io

**What's Free:**
- 3 shared-cpu VMs with 256MB RAM each
- 3GB persistent storage
- 160GB outbound data transfer/month

**Limitations:**
- Requires Docker containers
- More complex setup
- Need to configure PostgreSQL separately

**Perfect for:** Docker-savvy developers

---

### Option 4: Mixed Approach (Best Performance)

- **Frontend**: Vercel or Netlify (Free, always fast)
- **Backend + Database**: Render or Railway
- **Redis**: Upstash (Free tier with Redis)

---

## 📋 Detailed Setup: Render (Recommended)

### Prerequisites

1. GitHub account
2. Push your code to GitHub
3. Render account (free signup)

### Step 1: Prepare Your Code for Deployment

#### A. Add Render Configuration Files

**Create: `render.yaml`** (in project root)

```yaml
services:
  # API Gateway
  - type: web
    name: crm-api-gateway
    runtime: java
    buildCommand: cd backend/api-gateway && mvn clean package -DskipTests
    startCommand: java -jar backend/api-gateway/target/api-gateway-1.0.0.jar
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: production
      - key: PORT
        value: 8000
      - key: REDIS_URL
        fromService:
          type: redis
          name: crm-redis
          property: connectionString
    healthCheckPath: /actuator/health

  # User Service
  - type: web
    name: crm-user-service
    runtime: java
    buildCommand: cd backend/user-service && mvn clean package -DskipTests
    startCommand: java -jar backend/user-service/target/user-service-1.0.0.jar
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: production
      - key: PORT
        value: 8081
      - key: DATABASE_URL
        fromDatabase:
          name: crm-database
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: crm-redis
          property: connectionString
    healthCheckPath: /actuator/health

  # Frontend
  - type: web
    name: crm-frontend
    runtime: node
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm run preview -- --host 0.0.0.0 --port $PORT
    envVars:
      - key: VITE_API_URL
        value: https://crm-api-gateway.onrender.com

databases:
  - name: crm-database
    databaseName: crm_db
    user: crm_user

services:
  - type: redis
    name: crm-redis
    ipAllowList: []
```

#### B. Add Production Configuration

**Create: `backend/api-gateway/src/main/resources/application-production.yml`**

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: https://crm-user-service.onrender.com
          predicates:
            - Path=/api/auth/**, /api/users/**, /api/tenants/**, /api/license/**, /api/modules/**
          filters:
            - StripPrefix=1

  redis:
    url: ${REDIS_URL}

server:
  port: ${PORT:8000}

jwt:
  secret: ${JWT_SECRET}

logging:
  level:
    root: INFO
```

**Create: `backend/user-service/src/main/resources/application-production.yml`**

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false

  flyway:
    enabled: true
    baseline-on-migrate: true
    validate-on-migrate: false

  redis:
    url: ${REDIS_URL}

server:
  port: ${PORT:8081}

jwt:
  secret: ${JWT_SECRET}
```

#### C. Update Frontend API URL

**Edit: `frontend/.env.production`** (create if doesn't exist)

```env
VITE_API_URL=https://crm-api-gateway.onrender.com
```

**Edit: `frontend/src/lib/api/client.ts`**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

### Step 2: Deploy on Render

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Click "New +"
   - Select "Blueprint"

3. **Connect GitHub Repository**
   - Select your repository
   - Render will read `render.yaml` automatically

4. **Set Environment Variables**

   For **API Gateway**:
   - `JWT_SECRET`: Generate a secure random string (64+ characters)

   For **User Service**:
   - `JWT_SECRET`: Same as API Gateway

   For **Frontend**:
   - `VITE_API_URL`: Will be set automatically to gateway URL

5. **Deploy**
   - Click "Apply"
   - Wait 10-15 minutes for build and deployment
   - Services will be available at:
     - API Gateway: `https://crm-api-gateway.onrender.com`
     - User Service: `https://crm-user-service.onrender.com`
     - Frontend: `https://crm-frontend.onrender.com`

### Step 3: Initialize Database

After deployment, you need to seed the database with initial data:

1. **Access Database Console** on Render:
   - Go to your database in Render dashboard
   - Click "Connect" → "External Connection"
   - Use the connection details with a PostgreSQL client (DBeaver, pgAdmin)

2. **Run Initialization Scripts**:

```sql
-- Create roles (if not created by Flyway)
INSERT INTO user_management.roles (id, name, description) VALUES
    (gen_random_uuid(), 'ADMIN', 'Administrator'),
    (gen_random_uuid(), 'MANAGER', 'Manager'),
    (gen_random_uuid(), 'AGENT', 'Agent')
ON CONFLICT (name) DO NOTHING;

-- Create modules
INSERT INTO public.modules (code, name, description, icon, display_order, is_core_module) VALUES
    ('DASHBOARD', 'Dashboard', 'Main dashboard and analytics', 'LayoutDashboard', 0, TRUE),
    ('HRMS', 'HR Management', 'Time tracking, leave, salary, onboarding', 'Users', 1, FALSE),
    ('SALES', 'Sales Management', 'Leads, calls, campaigns', 'Briefcase', 2, FALSE),
    ('BILLING', 'Billing', 'Subscriptions, payments, invoices', 'Wallet', 3, FALSE),
    ('REPORTS', 'Reports & Analytics', 'Custom reports, data export', 'FileText', 4, FALSE),
    ('SUPPORT', 'Customer Support', 'Tickets, help desk', 'MessageSquare', 5, FALSE),
    ('INTEGRATIONS', 'Integrations', 'Third-party integrations', 'Puzzle', 6, FALSE)
ON CONFLICT (code) DO NOTHING;
```

### Step 4: Register First User

1. Go to: `https://crm-frontend.onrender.com/register`
2. Create your admin account
3. Fix role to ADMIN using database console (see FIRST_TIME_DEPLOYMENT_GUIDE.md)
4. Enable modules via License Management

---

## 📋 Option 2: Railway (Better Performance)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Initialize Project

```bash
cd /Users/shubhamgaigawale/monkdevs_workflow
railway init
```

### Step 3: Create Services

```bash
# Create PostgreSQL
railway add --plugin postgresql

# Create Redis
railway add --plugin redis

# Deploy API Gateway
cd backend/api-gateway
railway up

# Deploy User Service
cd ../user-service
railway up

# Deploy Frontend
cd ../../frontend
railway up
```

### Step 4: Configure Environment Variables

```bash
# Set variables
railway variables set JWT_SECRET=your-super-secret-jwt-key-min-64-chars
railway variables set SPRING_PROFILES_ACTIVE=production
```

### Step 5: Get URLs

```bash
railway domain
```

Use the provided URLs to configure your services.

---

## 📋 Option 3: Vercel (Frontend) + Render (Backend)

### Frontend on Vercel (Free, Fast, Always On)

1. **Push to GitHub**
2. **Go to Vercel**: https://vercel.com
3. **Import Project** from GitHub
4. **Configure Build**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Set Environment Variables**:
   - `VITE_API_URL`: Your Render API Gateway URL
6. **Deploy** - Takes 2-3 minutes

### Backend on Render (as described above)

Just deploy backend services on Render, frontend on Vercel.

**Advantages:**
- Frontend is super fast (global CDN)
- Frontend never sleeps
- Backend can use Render's free tier

---

## 📋 Option 4: Netlify (Frontend) + Render (Backend)

Similar to Vercel option:

1. **Go to Netlify**: https://www.netlify.com
2. **Connect GitHub repository**
3. **Configure**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: Your backend URL
5. **Deploy**

---

## 🆓 Free Tier Comparison

| Platform | Frontend | Backend | Database | Redis | Always On | Best For |
|----------|----------|---------|----------|-------|-----------|----------|
| **Render** | ✅ 750h | ✅ 750h | ✅ 1GB | ✅ | ❌ (sleeps) | Testing |
| **Railway** | ✅ | ✅ | ✅ | ✅ | ✅ | Small prod |
| **Vercel** | ✅ ⚡ | ❌ | ❌ | ❌ | ✅ | Frontend only |
| **Netlify** | ✅ ⚡ | ❌ | ❌ | ❌ | ✅ | Frontend only |
| **Fly.io** | ✅ | ✅ | Limited | ❌ | ✅ | Docker apps |

**Recommendation**:
- **Best Overall**: Frontend on Vercel + Backend on Railway
- **Simplest**: All on Render (single platform)
- **Most Credits**: Railway ($5/month free)

---

## ⚙️ Production Checklist

Before deploying:

- [ ] Change all default passwords
- [ ] Generate secure JWT secret (64+ characters)
- [ ] Update CORS origins to your domain
- [ ] Set `spring.profiles.active=production`
- [ ] Disable `show-sql` in production
- [ ] Enable HTTPS only
- [ ] Set up database backups
- [ ] Configure error monitoring (Sentry, etc.)
- [ ] Set up logging (Papertrail, Logtail)
- [ ] Test all critical flows

---

## 🔐 Security for Production

### 1. Generate Secure JWT Secret

```bash
# Generate random 64-character string
openssl rand -base64 48
```

Use this as `JWT_SECRET` environment variable.

### 2. Update CORS

**Edit: `backend/api-gateway/src/main/resources/application-production.yml`**

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins:
              - "https://your-frontend-domain.vercel.app"
              - "https://crm-frontend.onrender.com"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
              - PATCH
            allowedHeaders: "*"
            allowCredentials: true
```

### 3. Secure Database

- Use strong password (generated by Render/Railway)
- Restrict IP access (if possible)
- Enable SSL connections

---

## 💰 Cost Breakdown

### Completely Free (with limitations):

**Option A: All on Render**
- Cost: $0/month
- Limitations: Services sleep after 15 min, database expires after 90 days

**Option B: Vercel + Render**
- Frontend: $0 (Vercel free tier)
- Backend: $0 (Render free tier)
- Total: $0/month
- Limitations: Backend sleeps, database expires

**Option C: Railway**
- Cost: $0 for first $5 credits
- After credits: ~$5-10/month for small usage
- Best value if you can afford minimal cost

### Recommended Paid Plan (if you grow):

**Railway Hobby Plan**: $5/month
- Includes everything
- No sleep
- Better performance
- Good for small businesses

**Render Paid**: $7/service/month
- No sleep
- Persistent databases
- Better for scaling

---

## 📊 Deployment URLs After Setup

After deploying, you'll have:

- **Frontend**: `https://crm-frontend.onrender.com` or `https://your-app.vercel.app`
- **API Gateway**: `https://crm-api-gateway.onrender.com`
- **User Service**: `https://crm-user-service.onrender.com` (internal)
- **Database**: Provided by Render/Railway (internal connection)
- **Redis**: Provided by Render/Railway (internal connection)

---

## 🆘 Troubleshooting

### Services won't start

**Check logs** in Render/Railway dashboard:
- Look for build errors
- Check if environment variables are set
- Verify database connection

### Database connection issues

**Check**:
- `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Firewall rules (allow Render/Railway IPs)
- Database user permissions

### Frontend can't connect to backend

**Check**:
- `VITE_API_URL` is set correctly
- CORS is configured for your frontend domain
- API Gateway is running and healthy

### Redis connection failed

**Check**:
- `REDIS_URL` environment variable is set
- Redis service is running
- Connection string format

---

## 🎉 Quick Start Summary

**Easiest Path (5 steps)**:

1. Push code to GitHub
2. Create Render account
3. Click "New Blueprint" and select your repo
4. Wait for deployment (10-15 min)
5. Access your app at the provided URL!

**Best Performance Path**:

1. Deploy frontend on Vercel (2 min)
2. Deploy backend on Railway (5 min)
3. Configure environment variables
4. Done!

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Fly.io Docs**: https://fly.io/docs

---

## 🚀 Next Steps After Deployment

1. Register first admin user
2. Enable required modules
3. Invite team members
4. Configure integrations
5. Start using your CRM!

**Your app is now live and accessible from anywhere!** 🎉
