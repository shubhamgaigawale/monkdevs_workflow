# How to Restart Services to Fix CORS/License Issues

## ✅ What I Fixed:
1. Added `/api/license/**` and `/api/modules/**` routes to the API Gateway configuration.
2. Fixed LicenseController path from `/api/license` → `/license`
3. Fixed ModuleController path from `/api/modules` → `/modules`
4. Updated license creation permission to allow ADMIN role (not just SUPER_ADMIN)

---

## 🔄 Restart API Gateway

### **Method 1: If running in terminal**

1. Find the terminal window running the API Gateway
2. Press **Ctrl + C** to stop it
3. Start it again with:
   ```bash
   cd /Users/shubhamgaigawale/monkdevs_workflow/backend/api-gateway
   mvn spring-boot:run
   ```

### **Method 2: If running in IDE (IntelliJ/Eclipse)**

1. Find the API Gateway run configuration
2. Click the **Stop** button (red square)
3. Click **Run** again (green play button)

### **Method 3: Using pkill (if running in background)**

```bash
# Stop API Gateway
pkill -f api-gateway

# Start it again
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/api-gateway
mvn spring-boot:run
```

---

## 🔄 Restart User Service

Since we also fixed the controller paths, you need to restart the user-service.

### **Method 1: If running in terminal**

1. Find the terminal window running the User Service
2. Press **Ctrl + C** to stop it
3. Start it again with:
   ```bash
   cd /Users/shubhamgaigawale/monkdevs_workflow/backend/user-service
   mvn spring-boot:run
   ```

### **Method 2: If running in IDE (IntelliJ/Eclipse)**

1. Find the User Service run configuration
2. Click the **Stop** button (red square)
3. Click **Run** again (green play button)

### **Method 3: Using pkill (if running in background)**

```bash
# Stop User Service
pkill -f user-service

# Start it again
cd /Users/shubhamgaigawale/monkdevs_workflow/backend/user-service
mvn spring-boot:run
```

---

## ✅ After Restarting Both Services

1. Wait for both services to start:
   - User Service: Look for "Started UserServiceApplication"
   - API Gateway: Look for "Started ApiGatewayApplication"
2. Go back to your browser
3. Go to License Management page: **Administration → License Management**
4. Press **Ctrl + Shift + R** (hard refresh)
5. You should now see:
   - **License Configuration Form** (Plan, User Limit, Validity)
   - **Module Cards with Checkboxes** (HRMS, Sales, Billing, etc.)
   - **NO CORS errors in console**

---

## 🎯 Then Enable Modules:

1. **Check the boxes** for modules you want:
   - ☑ HR Management
   - ☑ Sales Management
   - ☑ Billing
   - ☑ Reports & Analytics
   - ☑ Customer Support
   - ☑ Third-Party Integrations

2. Click **"Update License"** button (will be blue/enabled after selecting modules)

3. Wait for success message and page reload

4. **Done!** Sidebar will show all enabled modules

---

## 🔍 Verify API Gateway is Working:

Open browser console (F12) and check:

```javascript
// Test if API gateway routes are working
fetch('http://localhost:8000/api/modules/all', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(r => r.json())
.then(data => console.log('✅ API Gateway working!', data))
.catch(err => console.error('❌ Still not working:', err))
```

If you see **"✅ API Gateway working!"** with module data → Gateway is fixed!

---

## 🚨 Still Getting CORS Errors?

### Check if API Gateway is running:
```bash
curl http://localhost:8000/actuator/health
```

Should return: `{"status":"UP"}`

### Check Gateway logs:
Look for errors when starting the gateway. Common issues:
- Port 8000 already in use
- Redis not running (required by gateway)
- User service (port 8081) not running

---

## 🆘 Alternative: Use SQL (If Gateway Won't Start)

If you can't restart the gateway right now, use this SQL script:

```sql
-- Find your tenant ID
SELECT u.tenant_id
FROM user_management.users u
WHERE u.email = 'shubham@monkdevs.com';

-- Enable all modules (replace YOUR_TENANT_ID with result above)
INSERT INTO public.tenant_licenses (tenant_id, license_key, plan_name, user_limit, issue_date, expiry_date, is_active, grace_period_days, billing_cycle)
VALUES ('YOUR_TENANT_ID', 'LIC-FULL-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint, 'ENTERPRISE', 1000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', TRUE, 30, 'YEARLY')
ON CONFLICT (tenant_id) DO UPDATE SET plan_name = 'ENTERPRISE', user_limit = 1000, expiry_date = CURRENT_TIMESTAMP + INTERVAL '1 year', is_active = TRUE;

INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT 'YOUR_TENANT_ID', m.id, TRUE, CURRENT_TIMESTAMP FROM public.modules m
ON CONFLICT (tenant_id, module_id) DO UPDATE SET is_enabled = TRUE;
```

Then refresh browser!
