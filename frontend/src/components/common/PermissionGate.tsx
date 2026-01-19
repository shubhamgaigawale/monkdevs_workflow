import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGateProps {
  children: ReactNode
  permission?: string | string[]
  role?: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
}

/**
 * Component to conditionally render UI based on permissions
 * Use this for hiding specific buttons, sections, or features based on user permissions
 *
 * @example
 * // Show button only to users with hr:manage permission
 * <PermissionGate permission="hr:manage">
 *   <Button>Add Employee</Button>
 * </PermissionGate>
 *
 * @example
 * // Show button to users with EITHER manager:access OR hr:manage permission
 * <PermissionGate permission={["manager:access", "hr:manage"]}>
 *   <Button>Approve Leaves</Button>
 * </PermissionGate>
 *
 * @example
 * // Show button only to users with ALL specified permissions
 * <PermissionGate permission={["leads:write", "leads:assign"]} requireAll>
 *   <Button>Assign Lead</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  role,
  requireAll = false,
  fallback = null
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions()

  // Check permissions
  let hasRequiredPermission = true

  if (permission) {
    if (Array.isArray(permission)) {
      if (requireAll) {
        hasRequiredPermission = hasAllPermissions(permission)
      } else {
        hasRequiredPermission = hasAnyPermission(permission)
      }
    } else {
      hasRequiredPermission = hasPermission(permission)
    }
  }

  // Check roles
  let hasRequiredRole = true

  if (role) {
    if (Array.isArray(role)) {
      hasRequiredRole = hasAnyRole(role)
    } else {
      hasRequiredRole = hasRole(role)
    }
  }

  // Show children only if both permission and role checks pass
  if (hasRequiredPermission && hasRequiredRole) {
    return <>{children}</>
  }

  // Otherwise show fallback (default is nothing)
  return <>{fallback}</>
}
