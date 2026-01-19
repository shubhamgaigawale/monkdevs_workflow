import { Link } from 'react-router-dom'
import { Users, UserPlus, Calendar, CheckCircle2, Clock, FileText } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { useTeamOnboardings } from '../hooks/useOnboarding'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

export function HRAdminDashboard() {
  // Internal permission check
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const { data: onboardings, isLoading: onboardingsLoading } = useTeamOnboardings()

  // Fetch pending leave requests
  const { data: pendingLeaves } = useQuery({
    queryKey: ['leave', 'pending-approvals'],
    queryFn: async () => {
      const response = await api.get('/leave/pending-approvals?page=0&size=10')
      return response.data.data
    },
  })

  // Calculate stats
  const totalOnboardings = onboardings?.length || 0
  const activeOnboardings = onboardings?.filter((o) => o.status === 'IN_PROGRESS').length || 0
  const completedOnboardings = onboardings?.filter((o) => o.status === 'COMPLETED').length || 0
  const pendingLeaveCount = pendingLeaves?.content?.length || 0

  // Show loading while checking permissions
  if (checkingPermissions) {
    return (
      <AppLayout title="HR Admin Dashboard" subtitle="Manage your HR operations">
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
    return <AccessDenied requiredPermission={PERMISSIONS.HR_MANAGE} />
  }

  return (
    <AppLayout title="HR Admin Dashboard" subtitle="Manage your HR operations">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Onboardings</p>
                  <p className="text-3xl font-bold text-primary">{activeOnboardings}</p>
                </div>
                <UserPlus className="h-12 w-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Leaves</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingLeaveCount}</p>
                </div>
                <Calendar className="h-12 w-12 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Onboardings</p>
                  <p className="text-3xl font-bold text-green-600">{completedOnboardings}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Onboardings</p>
                  <p className="text-3xl font-bold text-blue-600">{totalOnboardings}</p>
                </div>
                <Users className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to={ROUTES.HR_ADMIN_ONBOARDING}>
                <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                  <UserPlus className="h-6 w-6" />
                  <span>Manage Onboarding</span>
                </Button>
              </Link>

              <Link to={ROUTES.HR_ADMIN_LEAVES}>
                <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span>Approve Leaves</span>
                </Button>
              </Link>

              <Link to={ROUTES.USERS}>
                <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                  <Users className="h-6 w-6" />
                  <span>Manage Employees</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Onboardings */}
        {onboardings && onboardings.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Onboardings</h3>
                <Link to={ROUTES.HR_ADMIN_ONBOARDING}>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {onboardings.slice(0, 5).map((onboarding) => (
                  <div
                    key={onboarding.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">Employee ID: {onboarding.userId.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(onboarding.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(onboarding.completionPercentage || 0)}%
                        </p>
                        <p className="text-xs text-gray-600">Complete</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          onboarding.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : onboarding.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {onboarding.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Leave Approvals */}
        {pendingLeaves && pendingLeaves.content && pendingLeaves.content.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pending Leave Approvals</h3>
                <Link to={ROUTES.HR_ADMIN_LEAVES}>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {pendingLeaves.content.slice(0, 5).map((leave: any) => (
                  <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{leave.leaveType.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(leave.startDate).toLocaleDateString()} -{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded text-sm font-semibold">
                        {leave.totalDays} days
                      </span>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
