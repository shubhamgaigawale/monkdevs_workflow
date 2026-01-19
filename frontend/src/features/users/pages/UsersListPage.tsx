import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/common/DataTable'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useUsers } from '../hooks/useUsers'
import { formatDateTime } from '@/lib/utils/formatters'
import type { User } from '@/types/models'
import { CreateUserDialog } from '../components/CreateUserDialog'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PermissionGate } from '@/components/common/PermissionGate'
import { PERMISSIONS } from '@/lib/constants/permissions'

export function UsersListPage() {
  // Internal permission check
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.USERS_READ
  })

  const { data: users, isLoading, error } = useUsers()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Debug logging
  console.log('UsersListPage render:', { users, isLoading, error, usersCount: users?.length })

  // Show loading while checking permissions
  if (checkingPermissions) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return <AccessDenied requiredPermission={PERMISSIONS.USERS_READ} />
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">Users</h1>
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">Error: {(error as any)?.message || 'Unknown error'}</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const columns: Column<User>[] = [
    {
      header: 'Name',
      cell: (row) => {
        try {
          return `${row?.firstName || ''} ${row?.lastName || ''}`.trim() || 'N/A'
        } catch (e) {
          console.error('Error rendering name:', e)
          return 'Error'
        }
      },
    },
    {
      header: 'Email',
      cell: (row) => {
        try {
          return row?.email || 'N/A'
        } catch (e) {
          console.error('Error rendering email:', e)
          return 'Error'
        }
      },
    },
    {
      header: 'Roles',
      cell: (row) => {
        try {
          if (!row?.roles) return 'No roles'
          if (!Array.isArray(row.roles)) return 'Invalid roles'
          return row.roles.length > 0 ? row.roles.join(', ') : 'No roles'
        } catch (e) {
          console.error('Error rendering roles:', e)
          return 'Error'
        }
      },
    },
    {
      header: 'Status',
      cell: (row) => {
        try {
          return row?.isActive ? 'Active' : 'Inactive'
        } catch (e) {
          console.error('Error rendering status:', e)
          return 'Error'
        }
      },
    },
  ]

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground mt-2">
                Manage users and their permissions
              </p>
            </div>
            <PermissionGate permission={PERMISSIONS.USERS_WRITE}>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </PermissionGate>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={users || []}
            isLoading={isLoading}
            emptyMessage="No users found."
          />
        </div>

        {/* Create User Dialog */}
        <CreateUserDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
      </ErrorBoundary>
    </AppLayout>
  )
}
