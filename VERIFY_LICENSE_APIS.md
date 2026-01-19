# Verify License APIs After Gateway Restart

After restarting the API Gateway, use these steps to verify the APIs are working:

---

## Step 1: Check API Gateway Health

Open your browser and go to:
```
http://localhost:8000/actuator/health
```

Should return:
```json
{"status":"UP"}
```

---

## Step 2: Test License/Module APIs in Browser Console

1. Go to your application in browser: `http://localhost:5173`
2. Login as `shubham@monkdevs.com`
3. Press **F12** to open Developer Tools
4. Go to **Console** tab
5. Paste and run this script:

```javascript
// Test script to verify license and module APIs
async function testLicenseAPIs() {
  const token = localStorage.getItem('accessToken')

  if (!token) {
    console.error('❌ Not logged in - no access token found')
    return
  }

  console.log('🔍 Testing License APIs...\n')

  // Test 1: Fetch all modules
  console.log('1️⃣ Testing GET /api/modules/all')
  try {
    const modulesResponse = await fetch('http://localhost:8000/api/modules/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (modulesResponse.ok) {
      const modulesData = await modulesResponse.json()
      console.log('✅ Modules API working!')
      console.log('   Modules found:', modulesData.data?.length || 0)
      console.table(modulesData.data?.map(m => ({ code: m.code, name: m.name, enabled: m.isEnabled })))
    } else {
      console.error('❌ Modules API failed:', modulesResponse.status, modulesResponse.statusText)
      const errorText = await modulesResponse.text()
      console.error('   Error:', errorText)
    }
  } catch (error) {
    console.error('❌ Modules API error (likely CORS or network):', error.message)
  }

  console.log('\n')

  // Test 2: Fetch license info
  console.log('2️⃣ Testing GET /api/license/info')
  try {
    const licenseResponse = await fetch('http://localhost:8000/api/license/info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (licenseResponse.ok) {
      const licenseData = await licenseResponse.json()
      console.log('✅ License API working!')
      console.log('   Plan:', licenseData.data?.planName || 'Not configured')
      console.log('   Enabled Modules:', licenseData.data?.enabledModules || [])
      console.log('   User Limit:', licenseData.data?.userLimit || 'N/A')
      console.log('   Days Until Expiry:', licenseData.data?.daysUntilExpiry || 'N/A')
    } else {
      console.error('❌ License API failed:', licenseResponse.status, licenseResponse.statusText)
      const errorText = await licenseResponse.text()
      console.error('   Error:', errorText)
    }
  } catch (error) {
    console.error('❌ License API error (likely CORS or network):', error.message)
  }

  console.log('\n')
  console.log('🏁 Test complete!')
  console.log('\n📋 Next Steps:')
  console.log('   - If both APIs show ✅, refresh the License Management page')
  console.log('   - You should now see module cards with checkboxes')
  console.log('   - Select modules and click "Update License"')
}

// Run the test
testLicenseAPIs()
```

---

## Expected Output (Success)

```
🔍 Testing License APIs...

1️⃣ Testing GET /api/modules/all
✅ Modules API working!
   Modules found: 7

┌─────────┬───────────────┬─────────────────────────┬─────────┐
│ (index) │     code      │          name           │ enabled │
├─────────┼───────────────┼─────────────────────────┼─────────┤
│    0    │  'DASHBOARD'  │      'Dashboard'        │  true   │
│    1    │    'HRMS'     │   'HR Management'       │  false  │
│    2    │    'SALES'    │  'Sales Management'     │  false  │
│    3    │   'BILLING'   │       'Billing'         │  false  │
│    4    │   'REPORTS'   │ 'Reports & Analytics'   │  false  │
│    5    │   'SUPPORT'   │  'Customer Support'     │  false  │
│    6    │ 'INTEGRATIONS'│    'Integrations'       │  false  │
└─────────┴───────────────┴─────────────────────────┴─────────┘

2️⃣ Testing GET /api/license/info
✅ License API working!
   Plan: Not configured
   Enabled Modules: []
   User Limit: N/A
   Days Until Expiry: N/A

🏁 Test complete!
```

---

## If You Still See CORS Errors

### Check API Gateway Logs

Look for errors when the gateway starts:
```bash
# If running in terminal, check output for:
Started ApiGatewayApplication in X.XXX seconds

# If using pkill/background, check logs:
tail -f backend/api-gateway/logs/spring.log
```

### Verify Gateway Routes Are Loaded

Check gateway logs for route registration:
```
Mapped [/api/license/**] onto user-service
Mapped [/api/modules/**] onto user-service
```

### Alternative: Bypass Gateway (Temporary Test)

Test if user-service is working directly:
```javascript
// Test direct connection to user-service (port 8081)
fetch('http://localhost:8081/license/info', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') }
})
.then(r => r.json())
.then(data => console.log('Direct user-service:', data))
```

If this works but gateway doesn't, it confirms gateway routing issue.

---

## Success Checklist

- [ ] API Gateway health check returns `{"status":"UP"}`
- [ ] `/api/modules/all` returns 7 modules without CORS error
- [ ] `/api/license/info` returns data (or 404 if no license yet)
- [ ] License Management page loads without console errors
- [ ] Module cards with checkboxes are visible
- [ ] "Update License" button is disabled (until you select modules)

---

## After APIs Work - Enable Modules

1. Go to **Administration → License Management**
2. Click **"Update License"** button
3. You should now see:
   - License configuration form (Plan Name, User Limit, Validity)
   - **7 module cards with checkboxes** (HRMS, Sales, Billing, etc.)
4. Check the boxes for modules you want:
   - ☑ HR Management
   - ☑ Sales Management
   - ☑ Billing
   - ☑ Reports & Analytics
   - ☑ Customer Support
   - ☑ Third-Party Integrations
5. Click **"Update License"** (button will be blue/enabled)
6. Page will reload automatically
7. **Sidebar will now show all enabled modules!**

---

## Still Not Working?

Use the SQL script method from `QUICK_START_LICENSE.md`:

```sql
-- Find your tenant ID
SELECT u.tenant_id
FROM user_management.users u
WHERE u.email = 'shubham@monkdevs.com';

-- Use the tenant_id from above query in the next statements
-- (Replace YOUR_TENANT_ID with the actual UUID)

-- Create license
INSERT INTO public.tenant_licenses (tenant_id, license_key, plan_name, user_limit, issue_date, expiry_date, is_active, grace_period_days, billing_cycle)
VALUES ('YOUR_TENANT_ID', 'LIC-FULL-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::bigint, 'ENTERPRISE', 1000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', TRUE, 30, 'YEARLY')
ON CONFLICT (tenant_id) DO UPDATE SET plan_name = 'ENTERPRISE', user_limit = 1000, expiry_date = CURRENT_TIMESTAMP + INTERVAL '1 year', is_active = TRUE;

-- Enable all modules
INSERT INTO public.tenant_enabled_modules (tenant_id, module_id, is_enabled, enabled_at)
SELECT 'YOUR_TENANT_ID', m.id, TRUE, CURRENT_TIMESTAMP FROM public.modules m
ON CONFLICT (tenant_id, module_id) DO UPDATE SET is_enabled = TRUE;
```

Then refresh browser (Ctrl + Shift + R)!
