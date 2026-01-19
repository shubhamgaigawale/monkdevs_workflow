# Role-Based Access Control (RBAC) Guide

## Overview

This application implements a comprehensive Role-Based Access Control (RBAC) system with multiple layers of protection:

1. **Route-level protection** - Protects entire pages
2. **Component-level permission checks** - Internal page validation
3. **UI element gating** - Show/hide specific buttons and features

## Components & Hooks

### 1. ProtectedRoute Component

Protects routes at the router level.

**Features:**
- Supports single or multiple permissions (OR logic)
- Supports single or multiple roles
- Can require ALL permissions (AND logic)
- Shows AccessDenied component or redirects
- Includes loading state

**Usage:**

```tsx
// Single permission
<Route
  path="/hr/admin"
  element={
    <ProtectedRoute permission="hr:manage">
      <HRAdminDashboard />
    </ProtectedRoute>
  }
/>

// Multiple permissions (OR logic) - user needs ANY of these
<Route
  path="/leave/approvals"
  element={
    <ProtectedRoute permission={["manager:access", "hr:manage"]}>
      <LeaveApprovalsPage />
    </ProtectedRoute>
  }
/>

// Multiple permissions (AND logic) - user needs ALL of these
<Route
  path="/sensitive-data"
  element={
    <ProtectedRoute
      permission={["data:read", "data:export"]}
      requireAll={true}
    >
      <SensitiveDataPage />
    </ProtectedRoute>
  }
/>

// By role instead of permission
<Route
  path="/admin"
  element={
    <ProtectedRoute role="ADMIN">
      <AdminPanel />
    </ProtectedRoute>
  }
/>

// Silent redirect instead of showing AccessDenied
<Route
  path="/internal"
  element={
    <ProtectedRoute permission="internal:access" showAccessDenied={false}>
      <InternalPage />
    </ProtectedRoute>
  }
/>
```

### 2. usePagePermission Hook

Use inside page components for internal permission checks.

**Features:**
- Returns `hasAccess` boolean
- Provides loading state
- Returns user object
- Prevents flash of unauthorized content

**Usage:**

```tsx
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

export function AdminPage() {
  // Check permission internally
  const { hasAccess, isLoading, user } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  // Show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show access denied
  if (!hasAccess) {
    return <AccessDenied requiredPermission={PERMISSIONS.HR_MANAGE} />
  }

  // Normal page rendering
  return <div>Admin Content</div>
}
```

**Multiple Permissions:**

```tsx
// User needs ANY of these permissions (OR logic)
const { hasAccess } = usePagePermission({
  permission: [PERMISSIONS.MANAGER_ACCESS, PERMISSIONS.HR_MANAGE]
})

// User needs ALL of these permissions (AND logic)
const { hasAccess } = usePagePermission({
  permission: [PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_WRITE],
  requireAll: true
})
```

### 3. PermissionGate Component

Conditionally renders UI elements based on permissions.

**Features:**
- Shows/hides buttons, sections, features
- Supports OR and AND logic
- Can show fallback content

**Usage:**

```tsx
import { PermissionGate } from '@/components/common/PermissionGate'
import { PERMISSIONS } from '@/lib/constants/permissions'

// Hide button from users without permission
<PermissionGate permission={PERMISSIONS.HR_MANAGE}>
  <Button>Add Employee</Button>
</PermissionGate>

// Show to users with ANY of these permissions
<PermissionGate permission={["manager:access", "hr:manage"]}>
  <Button>Approve Leaves</Button>
</PermissionGate>

// Show to users with ALL permissions
<PermissionGate
  permission={["leads:write", "leads:assign"]}
  requireAll
>
  <Button>Assign Lead</Button>
</PermissionGate>

// Show fallback if user doesn't have permission
<PermissionGate
  permission="billing:manage"
  fallback={<span className="text-gray-400">Contact admin to manage billing</span>}
>
  <Button>Manage Billing</Button>
</PermissionGate>
```

### 4. usePermissions Hook

Low-level hook for checking permissions in code.

**Usage:**

```tsx
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/constants/permissions'

function MyComponent() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole
  } = usePermissions()

  // Check single permission
  if (hasPermission(PERMISSIONS.LEADS_WRITE)) {
    // User has leads:write permission
  }

  // Check if user has ANY of these permissions
  if (hasAnyPermission([PERMISSIONS.MANAGER_ACCESS, PERMISSIONS.HR_MANAGE])) {
    // User has manager:access OR hr:manage
  }

  // Check if user has ALL of these permissions
  if (hasAllPermissions([PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_WRITE])) {
    // User has BOTH permissions
  }

  // Check role
  if (hasRole('ADMIN')) {
    // User is an admin
  }

  // Check if user has ANY of these roles
  if (hasAnyRole(['MANAGER', 'HR_MANAGER'])) {
    // User is manager OR HR manager
  }
}
```

### 5. AccessDenied Component

Shows a user-friendly access denied page.

**Features:**
- Shows required permission
- Back button and Dashboard link
- Consistent styling

**Usage:**

```tsx
import { AccessDenied } from '@/components/common/AccessDenied'

// Default usage
<AccessDenied />

// With custom message
<AccessDenied message="You need HR Manager privileges to access this feature" />

// With required permission shown
<AccessDenied requiredPermission="hr:manage" />

// Without back button
<AccessDenied showBackButton={false} />
```

## Best Practices

### 1. Always Use Multiple Layers

**❌ Bad - Only route protection:**
```tsx
// Router
<Route path="/admin" element={<ProtectedRoute permission="admin"><AdminPage /></ProtectedRoute>} />

// AdminPage.tsx
export function AdminPage() {
  return <div>Admin Content</div> // ⚠️ No internal check!
}
```

**✅ Good - Route + internal check:**
```tsx
// Router
<Route path="/admin" element={<ProtectedRoute permission="admin"><AdminPage /></ProtectedRoute>} />

// AdminPage.tsx
export function AdminPage() {
  const { hasAccess, isLoading } = usePagePermission({ permission: 'admin' })

  if (isLoading) return <Loading />
  if (!hasAccess) return <AccessDenied />

  return <div>Admin Content</div> // ✅ Double protected
}
```

### 2. Use PermissionGate for UI Elements

**❌ Bad - Manual permission checks:**
```tsx
const { hasPermission } = usePermissions()

{hasPermission('hr:manage') && (
  <Button>Add Employee</Button>
)}
```

**✅ Good - Use PermissionGate:**
```tsx
<PermissionGate permission="hr:manage">
  <Button>Add Employee</Button>
</PermissionGate>
```

### 3. Use Constants for Permissions

**❌ Bad - Magic strings:**
```tsx
<ProtectedRoute permission="hr:manage">
```

**✅ Good - Use constants:**
```tsx
import { PERMISSIONS } from '@/lib/constants/permissions'

<ProtectedRoute permission={PERMISSIONS.HR_MANAGE}>
```

### 4. Proper Loading States

**❌ Bad - No loading state:**
```tsx
const { hasAccess } = usePagePermission({ permission: 'admin' })
if (!hasAccess) return <AccessDenied />
return <Content /> // ⚠️ Might flash briefly!
```

**✅ Good - Handle loading:**
```tsx
const { hasAccess, isLoading } = usePagePermission({ permission: 'admin' })

if (isLoading) {
  return <LoadingSpinner />
}

if (!hasAccess) {
  return <AccessDenied />
}

return <Content />
```

## Available Permissions

```typescript
// Leads
LEADS_READ: 'leads:read'
LEADS_WRITE: 'leads:write'
LEADS_DELETE: 'leads:delete'
LEADS_ASSIGN: 'leads:assign'
LEADS_REASSIGN: 'leads:reassign'
LEADS_IMPORT: 'leads:import'
LEADS_EXPORT: 'leads:export'

// Calls
CALLS_READ: 'calls:read'
CALLS_WRITE: 'calls:write'
CALLS_DELETE: 'calls:delete'

// Campaigns
CAMPAIGNS_READ: 'campaigns:read'
CAMPAIGNS_WRITE: 'campaigns:write'
CAMPAIGNS_DELETE: 'campaigns:delete'

// HR
HR_READ: 'hr:read' // All employees
HR_MANAGE: 'hr:manage' // HR Admin only
HR_VIEW_TEAM: 'hr:view_team'

// Manager
MANAGER_ACCESS: 'manager:access'

// Team
TEAM_VIEW: 'team:view'
TEAM_MANAGE: 'team:manage'

// Reports
REPORTS_READ_OWN: 'reports:read_own'
REPORTS_READ_TEAM: 'reports:read_team'
REPORTS_READ_ALL: 'reports:read_all'

// Settings
SETTINGS_READ: 'settings:read'
SETTINGS_WRITE: 'settings:write'

// Billing
BILLING_READ: 'billing:read'
BILLING_MANAGE: 'billing:manage'

// Users
USERS_READ: 'users:read'
USERS_WRITE: 'users:write'
USERS_DELETE: 'users:delete'

// Integrations
INTEGRATIONS_READ: 'integrations:read'
INTEGRATIONS_WRITE: 'integrations:write'

// IT Admin
IT_MANAGE: 'it:manage'
```

## Available Roles

```typescript
ADMIN: 'ADMIN'
SUPERVISOR: 'SUPERVISOR'
AGENT: 'AGENT'
MANAGER: 'MANAGER'
HR_MANAGER: 'HR_MANAGER'
IT_ADMIN: 'IT_ADMIN'
```

## Common Patterns

### Pattern 1: Admin-Only Page

```tsx
// Router
<Route
  path="/admin/settings"
  element={
    <ProtectedRoute permission={PERMISSIONS.SETTINGS_WRITE}>
      <AdminSettingsPage />
    </ProtectedRoute>
  }
/>

// AdminSettingsPage.tsx
export function AdminSettingsPage() {
  const { hasAccess, isLoading } = usePagePermission({
    permission: PERMISSIONS.SETTINGS_WRITE
  })

  if (isLoading) return <Loading />
  if (!hasAccess) return <AccessDenied />

  return (
    <div>
      <h1>Admin Settings</h1>
      {/* Page content */}
    </div>
  )
}
```

### Pattern 2: Page with Conditional Features

```tsx
export function LeadsPage() {
  return (
    <div>
      <h1>Leads</h1>

      {/* Everyone with leads:read can see the list */}
      <LeadsList />

      {/* Only users with leads:write can add new leads */}
      <PermissionGate permission={PERMISSIONS.LEADS_WRITE}>
        <Button>Add Lead</Button>
      </PermissionGate>

      {/* Only users with leads:import can import */}
      <PermissionGate permission={PERMISSIONS.LEADS_IMPORT}>
        <Button>Import Leads</Button>
      </PermissionGate>

      {/* Only managers or admins can reassign */}
      <PermissionGate permission={[PERMISSIONS.LEADS_REASSIGN, PERMISSIONS.MANAGER_ACCESS]}>
        <Button>Reassign Lead</Button>
      </PermissionGate>
    </div>
  )
}
```

### Pattern 3: Manager or HR Access

```tsx
// Many pages need to be accessible by EITHER managers OR HR
<Route
  path="/leave/approvals"
  element={
    <ProtectedRoute permission={[PERMISSIONS.MANAGER_ACCESS, PERMISSIONS.HR_MANAGE]}>
      <LeaveApprovalsPage />
    </ProtectedRoute>
  }
/>

export function LeaveApprovalsPage() {
  const { hasAccess, isLoading } = usePagePermission({
    permission: [PERMISSIONS.MANAGER_ACCESS, PERMISSIONS.HR_MANAGE]
  })

  if (isLoading) return <Loading />
  if (!hasAccess) return <AccessDenied />

  return <div>Approve Leaves</div>
}
```

## Testing RBAC

To test RBAC with different users:

1. Login as different users with different roles
2. Try accessing protected routes directly via URL
3. Check that unauthorized users see AccessDenied page
4. Check that UI elements are properly hidden
5. Check that there's no flash of unauthorized content

## Debugging

If users see pages they shouldn't:

1. Check if route has `<ProtectedRoute>` wrapper
2. Check if page uses `usePagePermission` internally
3. Verify user's JWT token has correct permissions (check localStorage)
4. Check permission constants match backend
5. Ensure user logged out/in after permission changes

## Migration Guide

If you have existing pages without RBAC:

1. Add `<ProtectedRoute>` in router
2. Add `usePagePermission` hook in page component
3. Add loading and access denied checks
4. Use `<PermissionGate>` for conditional UI elements
5. Test with different user roles
