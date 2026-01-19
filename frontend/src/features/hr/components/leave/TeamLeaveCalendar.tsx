import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTeamLeaveCalendar } from '../../hooks/useLeave'
import type { LeaveRequest } from '../../api/leaveApi'

interface TeamLeaveCalendarProps {
  className?: string
}

export function TeamLeaveCalendar({ className }: TeamLeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate start and end dates for the current month
  const startDate = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return date.toISOString().split('T')[0]
  }, [currentDate])

  const endDate = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return date.toISOString().split('T')[0]
  }, [currentDate])

  const { data: teamLeaves, isLoading, error } = useTeamLeaveCalendar(startDate, endDate)

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const numDays = new Date(year, month + 1, 0).getDate()

    const days: (Date | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= numDays; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentDate])

  // Group leaves by date
  const leavesByDate = useMemo(() => {
    if (!teamLeaves) return {}

    const grouped: Record<string, LeaveRequest[]> = {}

    teamLeaves.forEach((leave) => {
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)

      // Add leave to each date in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        if (!grouped[dateKey].find((l) => l.id === leave.id)) {
          grouped[dateKey].push(leave)
        }
      }
    })

    return grouped
  }, [teamLeaves])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isWeekend = (date: Date | null) => {
    if (!date) return false
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const getLeavesForDate = (date: Date | null) => {
    if (!date) return []
    const dateKey = date.toISOString().split('T')[0]
    return leavesByDate[dateKey] || []
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load team leave calendar</p>
            <p className="text-sm mt-1">{(error as any)?.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Leave Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[140px] text-center">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {daysInMonth.map((date, index) => {
                const leaves = getLeavesForDate(date)
                const hasLeaves = leaves.length > 0

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] border rounded-lg p-2
                      ${!date ? 'bg-muted/30' : ''}
                      ${isToday(date) ? 'border-primary border-2 bg-primary/5' : ''}
                      ${isWeekend(date) ? 'bg-muted/50' : ''}
                      ${hasLeaves ? 'bg-blue-50' : ''}
                    `}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-medium mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {leaves.slice(0, 2).map((leave) => (
                            <div
                              key={leave.id}
                              className="text-xs p-1 rounded bg-white border border-gray-200 truncate"
                              title={`${leave.userName || 'User'} - ${leave.leaveType.name}`}
                            >
                              <div className="flex items-center gap-1">
                                {leave.leaveType.color && (
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: leave.leaveType.color }}
                                  />
                                )}
                                <span className="truncate font-medium">
                                  {leave.userName || leave.userId.substring(0, 8)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {leaves.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{leaves.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary rounded"></div>
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted/50 border rounded"></div>
                <span className="text-muted-foreground">Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border rounded"></div>
                <span className="text-muted-foreground">Has Leaves</span>
              </div>
            </div>

            {/* Summary */}
            {teamLeaves && teamLeaves.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">This Month's Leaves</h4>
                <div className="space-y-2">
                  {teamLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                    >
                      <div className="flex items-center gap-2">
                        {leave.leaveType.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: leave.leaveType.color }}
                          />
                        )}
                        <span className="font-medium">
                          {leave.userName || leave.userId.substring(0, 8)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {leave.leaveType.name}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString()} -{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {teamLeaves && teamLeaves.length === 0 && (
              <div className="mt-4 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No team leaves scheduled for this month</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
