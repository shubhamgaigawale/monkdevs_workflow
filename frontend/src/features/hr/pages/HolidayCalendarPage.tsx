import { useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHolidays, useCreateHoliday } from '../hooks/useLeave'
import { useAuthStore } from '@/store/authStore'
import type { Holiday } from '../api/leaveApi'

export function HolidayCalendarPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: 'PUBLIC' as 'PUBLIC' | 'OPTIONAL',
    description: '',
    isOptional: false,
  })

  const { data: holidays, isLoading, error } = useHolidays()
  const createHoliday = useCreateHoliday()
  const { user } = useAuthStore()

  // Check if user has hr:manage permission
  const canManageHolidays = user?.permissions?.includes('hr:manage')

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createHoliday.mutateAsync(holidayForm)
      setCreateDialogOpen(false)
      setHolidayForm({
        name: '',
        date: '',
        type: 'PUBLIC',
        description: '',
        isOptional: false,
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  if (error) {
    return (
      <AppLayout
        title="Holiday Calendar"
        subtitle="View company holidays and optional holidays"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error loading holidays</h3>
          <p className="text-red-600 text-sm">{(error as any)?.message}</p>
        </div>
      </AppLayout>
    )
  }

  const getTypeBadge = (type: string) => {
    return type === 'PUBLIC' ? (
      <Badge variant="default">Public Holiday</Badge>
    ) : (
      <Badge variant="outline">Optional</Badge>
    )
  }

  // Group holidays by year
  const holidaysByYear = holidays?.reduce((acc, holiday) => {
    const year = new Date(holiday.date).getFullYear()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(holiday)
    return acc
  }, {} as Record<number, Holiday[]>)

  // Sort holidays by date within each year
  Object.keys(holidaysByYear || {}).forEach((year) => {
    holidaysByYear![parseInt(year)].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  })

  const currentYear = new Date().getFullYear()
  const currentYearHolidays = holidaysByYear?.[currentYear] || []

  const columns: Column<Holiday>[] = [
    {
      header: 'Date',
      cell: (row) => {
        const date = new Date(row.date)
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="text-2xl font-bold text-primary">
                {date.getDate()}
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {date.toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Holiday Name',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.description && (
            <div className="text-sm text-muted-foreground">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => getTypeBadge(row.type),
    },
  ]

  return (
    <AppLayout
      title="Holiday Calendar"
      subtitle="View company holidays and optional holidays"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">
            Holidays {currentYear}
          </h2>
        </div>
        {canManageHolidays && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Holiday
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Holidays</p>
                <p className="text-3xl font-bold">
                  {currentYearHolidays.length}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Public Holidays</p>
                <p className="text-3xl font-bold">
                  {currentYearHolidays.filter((h) => h.type === 'PUBLIC').length}
                </p>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                Public
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optional Holidays</p>
                <p className="text-3xl font-bold">
                  {currentYearHolidays.filter((h) => h.type === 'OPTIONAL').length}
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Optional
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holidays Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={currentYearHolidays}
            isLoading={isLoading}
            emptyMessage="No holidays found for this year."
          />
        </CardContent>
      </Card>

      {/* Create Holiday Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateHoliday} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name *</Label>
              <Input
                id="name"
                value={holidayForm.name}
                onChange={(e) =>
                  setHolidayForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Republic Day"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={holidayForm.date}
                onChange={(e) =>
                  setHolidayForm((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={holidayForm.type}
                onValueChange={(value: 'PUBLIC' | 'OPTIONAL') =>
                  setHolidayForm((prev) => ({
                    ...prev,
                    type: value,
                    isOptional: value === 'OPTIONAL',
                  }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public Holiday</SelectItem>
                  <SelectItem value="OPTIONAL">Optional Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={holidayForm.description}
                onChange={(e) =>
                  setHolidayForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the holiday..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createHoliday.isPending}>
                {createHoliday.isPending ? 'Creating...' : 'Create Holiday'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
