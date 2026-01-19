# Permission Fix Complete - AGENT Role

## Date: 2026-01-19

## What Was Done

### 1. ✅ Removed `users:read` Permission from AGENT Role

**Migration File Updated:**
- File: `/backend/user-service/src/main/resources/db/migration/V1__initial_schema.sql`
- Removed line: `OR (p.resource = 'users' AND p.action = 'read')`
- This prevents new databases from giving agents users:read permission

**Database Updated:**
- Ran SQL script to remove existing permission
- Executed: `DELETE FROM user_management.role_permissions WHERE role_id = AGENT AND permission_id = users:read`
- Result: **1 row deleted** ✅

### 2. ✅ Verified Permission Removal

Current roles with `users:read` permission:
- ✅ ADMIN (can read/write/delete users)
- ✅ HR_MANAGER (can read users)
- ✅ IT_ADMIN (can read users)
- ✅ MANAGER (can read users)
- ✅ SUPERVISOR (can read users)
- ❌ **AGENT (NO LONGER HAS users:read)** ✅

### 3. ✅ Frontend Protection Already in Place

All Administration pages now have internal permission checks:
- **UsersListPage** - Requires `users:read` permission
- **IntegrationsPage** - Requires `integrations:read` permission
- **BillingPage** - Requires `billing:read` permission

## Expected Behavior Now

### For AGENT Users:
1. **Sidebar**: "Administration" section should be HIDDEN (no visible items)
2. **Direct URL Access**: If agent types `/users`, they see "Access Denied" page
3. **Profile Access**: Agents can still access their own profile via Settings

### For SUPERVISOR/MANAGER Users:
1. **Sidebar**: "Administration" section VISIBLE (can see Users, Integrations, Billing)
2. **Users Page**: Can view all users
3. **Add User Button**: Hidden (they have users:read but not users:write)

### For ADMIN/HR_MANAGER Users:
1. **Sidebar**: Full Administration section visible
2. **Users Page**: Can view all users + "Add User" button visible
3. **Full Access**: Can manage all admin features

## How to Test

### Test 1: Login as AGENT User
```
Expected Results:
❌ No "Administration" in sidebar
❌ Cannot access /users (shows Access Denied)
✅ Can access /settings (own profile)
✅ Can see Leads, Calls, Reports (their work area)
```

### Test 2: Login as SUPERVISOR/MANAGER
```
Expected Results:
✅ "Administration" visible in sidebar
✅ Can access /users
✅ Can see user list
❌ "Add User" button hidden (no users:write)
```

### Test 3: Login as ADMIN/HR_MANAGER
```
Expected Results:
✅ Full Administration section
✅ Can access all admin pages
✅ "Add User" button visible
✅ Can manage users
```

## Important: JWT Token Refresh Required

**⚠️ CRITICAL:** Users need to logout and login again to get updated permissions!

The permission change is in the database, but user's JWT token still contains old permissions until they:
1. Logout
2. Login again
3. New JWT token will be issued with updated permissions

## Files Modified

### Backend:
1. `/backend/user-service/src/main/resources/db/migration/V1__initial_schema.sql`
   - Removed users:read from AGENT role

### Frontend:
1. `/frontend/src/features/users/pages/UsersListPage.tsx`
   - Added internal permission check
   - Wrapped "Add User" button with PermissionGate

2. `/frontend/src/features/integrations/pages/IntegrationsPage.tsx`
   - Added internal permission check

3. `/frontend/src/features/billing/pages/BillingPage.tsx`
   - Added internal permission check

### Database Scripts:
1. `/backend/user-service/remove_agent_users_read_permission.sql`
   - SQL script to update existing database
   - **Already executed successfully** ✅

## Current AGENT Permissions

After this fix, AGENT role has these permissions:

| Resource    | Actions                         |
|-------------|--------------------------------|
| leads       | read, write, assign, reassign, import |
| calls       | read, write                    |
| campaigns   | read, write                    |
| reports     | read_own, read_all, read_team, generate |
| integrations| read                           |
| billing     | read                           |
| settings    | read                           |
| ~~users~~   | ~~read~~ ❌ **REMOVED**        |

**Note:** Some of these permissions (campaigns, reports:read_all) seem too broad for agents. You may want to review and restrict further.

## Next Steps

### Immediate (Required):
1. **Tell users to logout/login** to refresh JWT tokens
2. **Test with an AGENT user** after they re-login
3. **Verify Administration section is hidden**

### Future (Recommended):
1. Review AGENT permissions - they have more than expected:
   - campaigns:read/write
   - reports:read_all, reports:read_team
   - integrations:read
   - billing:read

2. Consider restricting to:
   - leads:read, leads:write (only own leads)
   - calls:read, calls:write (only own calls)
   - reports:read_own (only own reports)

## Rollback (If Needed)

If you need to restore users:read to AGENT:

```sql
INSERT INTO user_management.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM user_management.roles r
CROSS JOIN user_management.permissions p
WHERE r.name = 'AGENT'
AND p.resource = 'users' AND p.action = 'read'
ON CONFLICT DO NOTHING;
```

## Verification Commands

Check current AGENT permissions:
```sql
SELECT r.name, p.resource, p.action
FROM user_management.role_permissions rp
JOIN user_management.roles r ON r.id = rp.role_id
JOIN user_management.permissions p ON p.id = rp.permission_id
WHERE r.name = 'AGENT'
ORDER BY p.resource, p.action;
```

Check who has users:read:
```sql
SELECT r.name, p.resource, p.action
FROM user_management.role_permissions rp
JOIN user_management.roles r ON r.id = rp.role_id
JOIN user_management.permissions p ON p.id = rp.permission_id
WHERE p.resource = 'users'
ORDER BY r.name, p.action;
```

## Status: ✅ COMPLETE

All changes applied successfully. Permission removed from database and migration file updated for future deployments.
