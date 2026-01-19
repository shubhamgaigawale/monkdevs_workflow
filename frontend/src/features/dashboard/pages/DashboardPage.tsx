import { Users, Mail, Phone, TrendingUp, Clock, Calendar, UserCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatsCard } from '@/components/common/StatsCard'
import { LeadPipelineChart } from '@/components/charts/LeadPipelineChart'
import { CampaignPerformanceChart } from '@/components/charts/CampaignPerformanceChart'
import { CallVolumeChart } from '@/components/charts/CallVolumeChart'
import { LeadSourceChart } from '@/components/charts/LeadSourceChart'
import { ActivityFeed } from '../components/ActivityFeed'
import {
  useDashboardStats,
  useLeadPipeline,
  useCampaignPerformance,
  useCallVolume,
  useLeadSources,
  useRecentActivity,
} from '../hooks/useDashboard'
import { useAuthStore } from '@/store'
import { usePermissions } from '@/hooks/usePermissions'
import { formatNumber, formatPercentage } from '@/lib/utils/formatters'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { hasPermission, hasRole, hasAnyRole } = usePermissions()

  // Determine user's primary role for dashboard customization
  const isHRManager = hasRole('HR_MANAGER')
  const isManager = hasRole('MANAGER') || hasAnyRole(['SUPERVISOR', 'ADMIN'])
  const isAgent = hasRole('AGENT') && !isManager && !isHRManager
  const isAdmin = hasRole('ADMIN')

  // Fetch dashboard data conditionally
  const shouldShowSalesData = hasPermission('leads:read')

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: leadPipeline, isLoading: pipelineLoading } = shouldShowSalesData ? useLeadPipeline() : { data: null, isLoading: false }
  const { data: campaignPerformance, isLoading: campaignLoading } = shouldShowSalesData ? useCampaignPerformance() : { data: null, isLoading: false }
  const { data: callVolume, isLoading: callsLoading } = shouldShowSalesData ? useCallVolume() : { data: null, isLoading: false }
  const { data: leadSources, isLoading: sourcesLoading } = shouldShowSalesData ? useLeadSources() : { data: null, isLoading: false }
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity()

  // Get role-specific welcome message
  const getRoleBasedWelcome = () => {
    if (isHRManager) return 'Manage your team and HR operations'
    if (isManager) return 'Monitor your team performance and approve requests'
    if (isAgent) return 'Track your leads and daily activities'
    if (isAdmin) return 'Full system overview and administration'
    return 'Track your work and stay updated'
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.firstName} {user?.lastName}!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {getRoleBasedWelcome()}
          </p>
          {user?.roles && (
            <div className="flex gap-2 mt-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary"
                >
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* KPI Stats - Role-based */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sales Stats - Show for users with leads:read permission */}
          {shouldShowSalesData && (
            <>
              <StatsCard
                title="Total Leads"
                value={statsLoading ? '...' : formatNumber(stats?.totalLeads || 0)}
                icon={<Users className="h-5 w-5" />}
                variant="primary"
                trend={
                  stats?.leadsGrowth
                    ? {
                        value: stats.leadsGrowth,
                        isPositive: stats.leadsGrowth > 0,
                      }
                    : undefined
                }
              />

              <StatsCard
                title="Active Campaigns"
                value={statsLoading ? '...' : stats?.activeCampaigns || 0}
                description={
                  stats?.scheduledCampaigns
                    ? `${stats.scheduledCampaigns} scheduled`
                    : undefined
                }
                icon={<Mail className="h-5 w-5" />}
                variant="success"
              />

              <StatsCard
                title="Calls Today"
                value={statsLoading ? '...' : formatNumber(stats?.callsToday || 0)}
                icon={<Phone className="h-5 w-5" />}
                variant="warning"
                trend={
                  stats?.callsGrowth
                    ? {
                        value: stats.callsGrowth,
                        isPositive: stats.callsGrowth > 0,
                      }
                    : undefined
                }
              />

              <StatsCard
                title="Conversion Rate"
                value={
                  statsLoading
                    ? '...'
                    : formatPercentage(stats?.conversionRate || 0)
                }
                icon={<TrendingUp className="h-5 w-5" />}
                variant="success"
                trend={
                  stats?.conversionGrowth
                    ? {
                        value: stats.conversionGrowth,
                        isPositive: stats.conversionGrowth > 0,
                      }
                    : undefined
                }
              />
            </>
          )}

          {/* HR Stats - Show for HR users */}
          {hasPermission('hr:read') && (
            <>
              <StatsCard
                title="My Hours Today"
                value="0h 0m"
                description="Clock in to start tracking"
                icon={<Clock className="h-5 w-5" />}
                variant="primary"
              />

              <StatsCard
                title="Leave Balance"
                value="27 days"
                description="12 CL, 10 SL, 5 EL remaining"
                icon={<Calendar className="h-5 w-5" />}
                variant="success"
              />
            </>
          )}

          {/* Manager/HR Stats - Show for managers */}
          {(isManager || isHRManager) && hasPermission('manager:access') && (
            <>
              <StatsCard
                title="Pending Approvals"
                value="8"
                description="5 leaves, 3 documents"
                icon={<UserCheck className="h-5 w-5" />}
                variant="warning"
              />
            </>
          )}
        </div>

        {/* Charts Grid - Only for users with sales permissions */}
        {shouldShowSalesData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!pipelineLoading && leadPipeline && (
              <LeadPipelineChart data={leadPipeline} />
            )}
            {!campaignLoading && campaignPerformance && (
              <CampaignPerformanceChart data={campaignPerformance} />
            )}
            {!callsLoading && callVolume && <CallVolumeChart data={callVolume} />}
            {!sourcesLoading && leadSources && (
              <LeadSourceChart data={leadSources} />
            )}
          </div>
        )}

        {/* HR Dashboard Content */}
        {!shouldShowSalesData && hasPermission('hr:read') && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/hr/time-tracking"
                className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-accent transition-colors"
              >
                <Clock className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">Clock In/Out</span>
                <span className="text-sm text-muted-foreground">Track your time</span>
              </a>
              <a
                href="/hr/leave"
                className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-accent transition-colors"
              >
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">Apply for Leave</span>
                <span className="text-sm text-muted-foreground">Request time off</span>
              </a>
              <a
                href="/hr/salary"
                className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">View Salary</span>
                <span className="text-sm text-muted-foreground">Check pay slips</span>
              </a>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Placeholder for additional content */}
          </div>
          <div>
            <ActivityFeed
              activities={activities || []}
              isLoading={activitiesLoading}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
