import { useState, useEffect } from 'react'
import { Clock, Coffee, LogIn, LogOut } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/components/common/StatsCard'
import { DataTable, type Column } from '@/components/common/DataTable'
import {
  useTimeStatus,
  useTimeEntries,
  useClockIn,
  useClockOut,
  useStartBreak,
  useEndBreak,
} from '../hooks/useTimeTracking'
import { formatDateTime } from '@/lib/utils/formatters'
import type { TimeEntry } from '@/types/models'

export function TimeTrackingPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const { data: status, isLoading: statusLoading } = useTimeStatus()
  const { data: entries, isLoading: entriesLoading } = useTimeEntries({
    start: startDate,
    end: endDate,
  })

  const clockIn = useClockIn()
  const clockOut = useClockOut()
  const startBreak = useStartBreak()
  const endBreak = useEndBreak()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const columns: Column<TimeEntry>[] = [
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.timestamp).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Time',
      cell: (row) => (
        <span className="text-sm">{formatDateTime(row.timestamp)}</span>
      ),
    },
    {
      header: 'Type',
      cell: (row) => {
        const typeConfig = {
          LOGIN: { label: 'Clock In', className: 'bg-green-100 text-green-800' },
          LOGOUT: { label: 'Clock Out', className: 'bg-gray-100 text-gray-800' },
          BREAK_START: { label: 'Break Start', className: 'bg-orange-100 text-orange-800' },
          BREAK_END: { label: 'Break End', className: 'bg-blue-100 text-blue-800' },
        }
        const config = typeConfig[row.entryType]
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        )
      },
    },
    {
      header: 'Notes',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.notes || '-'}
        </span>
      ),
    },
  ]

  if (statusLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Track your working hours and breaks
          </p>
        </div>

        {/* Clock Widget */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Current Time Display */}
              <div className="text-center">
                <div className="text-6xl font-bold tracking-tight">
                  {formatTime(currentTime)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Status Display */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                    status?.currentStatus === 'CLOCKED_IN'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : status?.currentStatus === 'ON_BREAK'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}
                >
                  {status?.currentStatus === 'CLOCKED_IN' && '✓ Clocked In'}
                  {status?.currentStatus === 'ON_BREAK' && '☕ On Break'}
                  {status?.currentStatus === 'CLOCKED_OUT' && '○ Clocked Out'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {status?.currentStatus === 'CLOCKED_OUT' && (
                  <Button
                    size="lg"
                    onClick={() => clockIn.mutate()}
                    disabled={clockIn.isPending}
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Clock In
                  </Button>
                )}

                {status?.currentStatus === 'CLOCKED_IN' && (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => startBreak.mutate()}
                      disabled={startBreak.isPending}
                    >
                      <Coffee className="h-5 w-5 mr-2" />
                      Start Break
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => clockOut.mutate()}
                      disabled={clockOut.isPending}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Clock Out
                    </Button>
                  </>
                )}

                {status?.currentStatus === 'ON_BREAK' && (
                  <Button
                    size="lg"
                    onClick={() => endBreak.mutate()}
                    disabled={endBreak.isPending}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    End Break
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Hours Worked Today"
            value={status?.todayHours !== undefined ? formatHours(status.todayHours) : 'Loading...'}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatsCard
            title="Break Time"
            value={status?.breakTime !== undefined ? formatHours(status.breakTime) : 'Loading...'}
            icon={<Coffee className="h-4 w-4" />}
          />
          <StatsCard
            title="Current Status"
            value={status?.currentStatus ? status.currentStatus.replace('_', ' ') : 'Loading...'}
            icon={<LogIn className="h-4 w-4" />}
          />
        </div>

        {/* Time Entries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Time Entries</CardTitle>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
                <span className="self-center text-sm text-muted-foreground">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={entries || []}
              isLoading={entriesLoading}
              emptyMessage="No time entries found for the selected period."
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
