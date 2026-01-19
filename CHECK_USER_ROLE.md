# Check Your User Role

Open browser console (F12) and run this:

```javascript
// Check your user info
const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}')
const user = authStorage?.state?.user

console.log('Current User:', user?.email)
console.log('Roles:', user?.roles)
console.log('Full User Object:', user)
```

**You need to have `ADMIN` role** to see License Management.

If you don't have ADMIN role, run this SQL to add it:

```sql
-- Find your user
SELECT id, email, role FROM user_management.users WHERE email = 'shubham@monkdevs.com';

-- Update to ADMIN role
UPDATE user_management.users
SET role = 'ADMIN'
WHERE email = 'shubham@monkdevs.com';
```

Then logout and login again.
