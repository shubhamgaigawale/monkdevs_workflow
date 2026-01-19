import { useAuthStore } from '@/store'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) ?? false
  }

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(hasPermission)
  }

  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every(hasPermission)
  }

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) ?? false
  }

  const hasAnyRole = (roles: string[]) => {
    return roles.some(hasRole)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  }
}
