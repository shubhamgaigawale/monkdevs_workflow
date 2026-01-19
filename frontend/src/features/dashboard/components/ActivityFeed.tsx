import { Users, Phone, Mail, Puzzle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { ActivityItem } from '../api/dashboardApi'

interface ActivityFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
}

const activityIcons = {
  lead: Users,
  call: Phone,
  campaign: Mail,
  integration: Puzzle,
}

const activityColors = {
  lead: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  call: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  campaign: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  integration: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const colorClass = activityColors[activity.type]

              return (
                <div key={activity.id} className="flex gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {activity.user && <span>{activity.user}</span>}
                      <span>•</span>
                      <span>{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
