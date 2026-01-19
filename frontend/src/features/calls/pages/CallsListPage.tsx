import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Phone, Search, Calendar } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, type Column } from '@/components/common/DataTable'
import { CallLogForm } from '../components/CallLogForm'
import { useCalls, useCreateCall } from '../hooks/useCalls'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/formatters'
import type { Call } from '@/types/models'
import type { CreateCallDto } from '../api/callsApi'
import { cn } from '@/lib/utils/cn'

export function CallsListPage() {
  const location = useLocation()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [directionFilter, setDirectionFilter] = useState<'INBOUND' | 'OUTBOUND' | ''>('')
  const [showLogForm, setShowLogForm] = useState(false)
  const [initialCallData, setInitialCallData] = useState<Partial<CreateCallDto> | undefined>()

  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useCalls(page, 20, {
    search: debouncedSearch,
    direction: directionFilter || undefined,
  })
  const createCall = useCreateCall()

  // Check if we should auto-open the log form (e.g., from lead detail page)
  useEffect(() => {
    const state = location.state as any
    if (state?.openLogForm) {
      setShowLogForm(true)
      if (state.phoneNumber || state.leadId) {
        setInitialCallData({
          phoneNumber: state.phoneNumber || '',
          leadId: state.leadId,
          direction: 'OUTBOUND',
        })
      }
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const columns: Column<Call>[] = [
    {
      header: 'Phone Number',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.phoneNumber}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                row.direction === 'INBOUND'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              {row.direction === 'INBOUND' ? '↓ Inbound' : '↑ Outbound'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Duration',
      cell: (row) => (
        <span className="text-sm">
          {Math.floor(row.duration / 60)}:{(row.duration % 60).toString().padStart(2, '0')}
        </span>
      ),
    },
    {
      header: 'Outcome',
      cell: (row) => row.outcome || '-',
    },
    {
      header: 'Notes',
      cell: (row) => (
        <div className="max-w-xs truncate text-sm text-muted-foreground">
          {row.notes || '-'}
        </div>
      ),
    },
    {
      header: 'Follow-up',
      cell: (row) =>
        row.followUpRequired ? (
          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <Calendar className="h-3 w-3" />
            {row.followUpDate ? formatRelativeTime(row.followUpDate) : 'Required'}
          </div>
        ) : (
          '-'
        ),
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ]

  const handleLogCall = async (data: CreateCallDto) => {
    await createCall.mutateAsync(data)
    setShowLogForm(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calls</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage all your phone calls
            </p>
          </div>
          <Button onClick={() => setShowLogForm(true)}>
            <Phone className="h-4 w-4 mr-2" />
            Log Call
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search calls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as 'INBOUND' | 'OUTBOUND' | '')}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Directions</option>
            <option value="INBOUND">Inbound</option>
            <option value="OUTBOUND">Outbound</option>
          </select>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.content || []}
          isLoading={isLoading}
          pagination={
            data
              ? {
                  page: data.number,
                  size: data.size,
                  totalElements: data.totalElements,
                  totalPages: data.totalPages,
                  onPageChange: setPage,
                }
              : undefined
          }
          emptyMessage="No calls logged yet. Log your first call to get started."
        />

        {/* Call Log Form Dialog */}
        <CallLogForm
          open={showLogForm}
          onOpenChange={setShowLogForm}
          onSubmit={handleLogCall}
          isSubmitting={createCall.isPending}
          initialData={initialCallData}
        />
      </div>
    </AppLayout>
  )
}
