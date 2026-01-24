import { useState } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/components/common/StatsCard'
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
import {
  useLeaveBalances,
  useLeaveTypes,
  useMyLeaveRequests,
  useApplyLeave,
  useCancelLeaveRequest,
} from '../hooks/useLeave'
import type { LeaveRequest } from '../api/leaveApi'

export function LeaveManagementPage() {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const { data: balances, isLoading: balancesLoading, error: balancesError } = useLeaveBalances()
  const { data: leaveTypes, error: typesError } = useLeaveTypes()
  const { data: requests, isLoading: requestsLoading, error: requestsError } = useMyLeaveRequests(0, 20)
  const applyLeave = useApplyLeave()
  const cancelLeave = useCancelLeaveRequest()

  // Debug logging
  console.log('LeaveManagementPage render:', { balances, leaveTypes, requests, balancesLoading, requestsLoading })

  // Show errors if any
  if (balancesError || typesError || requestsError) {
    return (
      <AppLayout title="Leave Management" subtitle="Manage your leave requests and balances">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error loading data</h3>
          {balancesError && <p className="text-red-600 text-sm">Balances: {(balancesError as any)?.message}</p>}
          {typesError && <p className="text-red-600 text-sm">Types: {(typesError as any)?.message}</p>}
          {requestsError && <p className="text-red-600 text-sm">Requests: {(requestsError as any)?.message}</p>}
        </div>
      </AppLayout>
    )
  }

  // Show loading state
  if (balancesLoading || requestsLoading) {
    return (
      <AppLayout title="Leave Management" subtitle="Manage your leave requests and balances">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leave data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await applyLeave.mutateAsync(leaveForm)
      setApplyDialogOpen(false)
      setLeaveForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'outline',
      APPROVED: 'default',
      REJECTED: 'destructive',
      CANCELLED: 'secondary',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Leave Type',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.leaveType.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: row.leaveType.color }}
            />
          )}
          <span className="font-medium">{row.leaveType.name}</span>
        </div>
      ),
    },
    {
      header: 'Start Date',
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'End Date',
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Days',
      cell: (row) => <span className="text-sm font-medium">{row.totalDays}</span>,
    },
    {
      header: 'Status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Applied On',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.appliedDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => cancelLeave.mutate(row.id)}
              disabled={cancelLeave.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <AppLayout
      title="Leave Management"
      subtitle="Manage your leave requests and balances"
    >
      {/* Leave Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {balancesLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-8 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          balances?.map((balance, index) => {
            const variants = ['primary', 'success', 'warning', 'destructive'] as const;
            const variant = variants[index % variants.length];

            return (
              <StatsCard
                key={balance.id}
                title={balance.leaveType.name}
                value={`${balance.available}/${balance.totalAllocated}`}
                description={`${balance.used} used, ${balance.pending} pending`}
                icon={<Calendar className="h-5 w-5" />}
                variant={variant}
              />
            );
          })
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Leave Requests</h2>
        <Button onClick={() => setApplyDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={requests?.content || []}
            isLoading={requestsLoading}
            emptyMessage="No leave requests found. Apply for leave to get started!"
          />
        </CardContent>
      </Card>

      {/* Apply Leave Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select
                value={leaveForm.leaveTypeId}
                onValueChange={(value) =>
                  setLeaveForm((prev) => ({ ...prev, leaveTypeId: value }))
                }
                required
              >
                <SelectTrigger id="leaveType">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                        )}
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Brief reason for leave..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setApplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={applyLeave.isPending}>
                {applyLeave.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
