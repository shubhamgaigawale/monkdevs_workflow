# CRM System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you get the CRM system running quickly.

---

## Prerequisites Check

```bash
# Check all required software
java -version    # Should be 17+
node -v          # Should be 18+
psql --version   # Should be 14+
redis-cli ping   # Should return PONG
mvn -v           # Should be 3.8+
```

If any are missing, install them first before proceeding.

---

## Step 1: Database Setup (One-time)

```bash
# Start PostgreSQL (if not running)
brew services start postgresql
# or
sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE crm_database;"

# Start Redis
brew services start redis
# or
sudo systemctl start redis
```

---

## Step 2: Build All Services (One-time)

```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/backend

# Quick build script
for service in config-server api-gateway user-service lead-service call-service campaign-service hr-service integration-service notification-service; do
  echo "Building $service..."
  cd $service && mvn clean install -DskipTests && cd ..
done

echo "✅ All services built successfully!"
```

---

## Step 3: Setup Frontend (One-time)

```bash
cd /Users/shubhamgaigawale/monkdevs_workflow/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
echo "VITE_APP_NAME=CRM System" >> .env

echo "✅ Frontend setup complete!"
```

---

## Step 4: Start Everything

Use the automated startup script:

```bash
cd /Users/shubhamgaigawale/monkdevs_workflow
./start-all.sh
```

---

## Step 5: Access the Application

1. Open browser: **http://localhost:3000**

2. **First Time?** Register a new account
3. **Already Registered?** Login with:
   - Email: shubham@monkdevs.com
   - Password: Monkdevs@259

---

## Quick Verification

```bash
# Check if all services are running
lsof -i :8000  # API Gateway
lsof -i :3000  # Frontend
```

---

## Stopping the System

```bash
# Stop all services
./stop-all.sh
```

---

**🎉 You're all set! Access: http://localhost:3000**
