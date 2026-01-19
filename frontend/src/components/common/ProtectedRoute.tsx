import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { usePermissions } from '@/hooks/usePermissions'
import { ROUTES } from '@/lib/constants/routes'
import { AccessDenied } from './AccessDenied'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: string | string[] // Can be single permission or array of permissions (OR logic)
  role?: string | string[] // Can be single role or array of roles (OR logic)
  requireAll?: boolean // If true, requires ALL permissions (AND logic). Default is OR logic
  showAccessDenied?: boolean // If true, shows AccessDenied component instead of redirecting
}

export function ProtectedRoute({
  children,
  permission,
  role,
  requireAll = false,
  showAccessDenied = true
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions()

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Show loading if user data is still being fetched
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check permissions
  let hasRequiredPermission = true
  let requiredPermissionString = ''

  if (permission) {
    if (Array.isArray(permission)) {
      requiredPermissionString = permission.join(', ')
      if (requireAll) {
        hasRequiredPermission = hasAllPermissions(permission)
      } else {
        hasRequiredPermission = hasAnyPermission(permission)
      }
    } else {
      requiredPermissionString = permission
      hasRequiredPermission = hasPermission(permission)
    }

    if (!hasRequiredPermission) {
      if (showAccessDenied) {
        return (
          <AccessDenied
            message="You don't have the required permissions to access this page"
            requiredPermission={requiredPermissionString}
          />
        )
      }
      return <Navigate to={ROUTES.DASHBOARD} replace />
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

    if (!hasRequiredRole) {
      if (showAccessDenied) {
        return (
          <AccessDenied
            message="You don't have the required role to access this page"
          />
        )
      }
      return <Navigate to={ROUTES.DASHBOARD} replace />
    }
  }

  return <>{children}</>
}
