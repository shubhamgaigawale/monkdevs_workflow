import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store'
import { usePermissions } from './usePermissions'

interface UsePagePermissionOptions {
  permission?: string | string[]
  role?: string | string[]
  requireAll?: boolean
  redirectOnFail?: boolean
}

interface UsePagePermissionResult {
  hasAccess: boolean
  isLoading: boolean
  user: any
  checkingPermissions: boolean
}

/**
 * Hook to check permissions within a page component
 * Provides loading state and access check
 * Use this inside pages for internal permission checks
 */
export function usePagePermission(options: UsePagePermissionOptions = {}): UsePagePermissionResult {
  const { permission, role, requireAll = false } = options
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions()

  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Short delay to prevent flash of unauthorized content
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      let permissionCheck = true
      let roleCheck = true

      // Check permissions
      if (permission) {
        if (Array.isArray(permission)) {
          if (requireAll) {
            permissionCheck = hasAllPermissions(permission)
          } else {
            permissionCheck = hasAnyPermission(permission)
          }
        } else {
          permissionCheck = hasPermission(permission)
        }
      }

      // Check roles
      if (role) {
        if (Array.isArray(role)) {
          roleCheck = hasAnyRole(role)
        } else {
          roleCheck = hasRole(role)
        }
      }

      setHasAccess(permissionCheck && roleCheck)
      setIsLoading(false)
    }, 100) // Small delay to prevent flashing

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, permission, role, requireAll, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole])

  return {
    hasAccess,
    isLoading,
    user,
    checkingPermissions: isLoading
  }
}
