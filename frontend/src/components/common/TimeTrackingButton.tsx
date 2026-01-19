import { useEffect, useState } from 'react'
import { Clock, LogIn, LogOut, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTimeStatus, useClockIn, useClockOut, useStartBreak, useEndBreak } from '@/features/hr/hooks/useTimeTracking'
import { cn } from '@/lib/utils/cn'

export function TimeTrackingButton() {
  const { data: status, isLoading } = useTimeStatus()
  const clockIn = useClockIn()
  const clockOut = useClockOut()
  const startBreak = useStartBreak()
  const endBreak = useEndBreak()

  const [elapsedTime, setElapsedTime] = useState<string>('0:00:00')

  // Calculate elapsed time
  useEffect(() => {
    if (status?.currentStatus !== 'CLOCKED_IN' || !status.currentEntry?.timestamp) {
      setElapsedTime('0:00:00')
      return
    }

    const calculateElapsed = () => {
      const clockInTime = new Date(status.currentEntry!.timestamp).getTime()
      const now = Date.now()
      const diff = now - clockInTime

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    setElapsedTime(calculateElapsed())
    const interval = setInterval(() => {
      setElapsedTime(calculateElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [status?.currentStatus, status?.currentEntry?.timestamp])

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Clock className="h-4 w-4 mr-2" />
        <span className="hidden md:inline">Loading...</span>
      </Button>
    )
  }

  const isClockedIn = status?.currentStatus === 'CLOCKED_IN'
  const isOnBreak = status?.currentStatus === 'ON_BREAK'
  const isClockedOut = status?.currentStatus === 'CLOCKED_OUT'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2',
            isClockedIn && 'border-green-500 text-green-600 hover:bg-green-50',
            isOnBreak && 'border-orange-500 text-orange-600 hover:bg-orange-50',
            isClockedOut && 'border-gray-300'
          )}
        >
          <Clock className="h-4 w-4" />
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs leading-none">
              {isClockedIn && 'Clocked In'}
              {isOnBreak && 'On Break'}
              {isClockedOut && 'Clocked Out'}
            </span>
            {isClockedIn && (
              <span className="text-xs font-mono text-muted-foreground leading-none mt-0.5">
                {elapsedTime}
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Time Tracking</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Status Info */}
        <div className="px-2 py-2 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Status:</span>
            <span className={cn(
              'font-medium',
              isClockedIn && 'text-green-600',
              isOnBreak && 'text-orange-600',
              isClockedOut && 'text-gray-600'
            )}>
              {isClockedIn && 'Working'}
              {isOnBreak && 'On Break'}
              {isClockedOut && 'Not Working'}
            </span>
          </div>
          {isClockedIn && (
            <>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-mono font-medium">{elapsedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today:</span>
                <span className="font-medium">{status?.todayHours || 0}h</span>
              </div>
            </>
          )}
          {isClockedOut && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Today Total:</span>
              <span className="font-medium">{status?.todayHours || 0}h</span>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        {isClockedOut && (
          <DropdownMenuItem
            onClick={() => !clockIn.isPending && clockIn.mutate()}
            className={cn(
              'cursor-pointer',
              clockIn.isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            <LogIn className="mr-2 h-4 w-4 text-green-600" />
            <span className="text-green-600">Clock In</span>
          </DropdownMenuItem>
        )}

        {isClockedIn && (
          <>
            <DropdownMenuItem
              onClick={() => !startBreak.isPending && startBreak.mutate()}
              className={cn(
                'cursor-pointer',
                startBreak.isPending && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Coffee className="mr-2 h-4 w-4 text-orange-600" />
              <span className="text-orange-600">Start Break</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => !clockOut.isPending && clockOut.mutate()}
              className={cn(
                'cursor-pointer',
                clockOut.isPending && 'opacity-50 cursor-not-allowed'
              )}
            >
              <LogOut className="mr-2 h-4 w-4 text-red-600" />
              <span className="text-red-600">Clock Out</span>
            </DropdownMenuItem>
          </>
        )}

        {isOnBreak && (
          <DropdownMenuItem
            onClick={() => !endBreak.isPending && endBreak.mutate()}
            className={cn(
              'cursor-pointer',
              endBreak.isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Clock className="mr-2 h-4 w-4 text-green-600" />
            <span className="text-green-600">End Break</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
