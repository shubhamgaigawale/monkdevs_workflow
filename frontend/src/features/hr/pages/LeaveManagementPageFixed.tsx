import { useState } from 'react'
import { Calendar, Plus, X } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useLeaveBalances,
  useLeaveTypes,
  useMyLeaveRequests,
  useApplyLeave,
  useCancelLeaveRequest,
} from '../hooks/useLeave'
import { TeamLeaveCalendar } from '../components/leave/TeamLeaveCalendar'
import { useAuthStore } from '@/store/authStore'

export function LeaveManagementPageFixed() {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const { data: balances, isLoading: balancesLoading, error: balancesError } = useLeaveBalances()
  const { data: leaveTypes, error: leaveTypesError } = useLeaveTypes()
  const { data: requests, isLoading: requestsLoading, error: requestsError } = useMyLeaveRequests(0, 20)
  const applyLeave = useApplyLeave()
  const cancelLeave = useCancelLeaveRequest()
  const { user } = useAuthStore()

  // Check if user has manager permissions
  const canViewTeamCalendar = user?.permissions?.includes('manager:access') ||
                               user?.permissions?.includes('hr:manage')

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await applyLeave.mutateAsync(leaveForm)
      setApplyDialogOpen(false)
      setLeaveForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
    } catch (error) {
      console.error('Apply leave error:', error)
    }
  }

  return (
    <AppLayout title="Leave Management" subtitle="Manage your leave requests and balances">
      <div className="space-y-6">
        {/* Apply Button */}
        <div className="flex justify-end">
          <Button onClick={() => setApplyDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Apply for Leave
          </Button>
        </div>

        {/* Leave Balances - with states */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Leave Balances</h3>

            {/* Loading State */}
            {balancesLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <span className="ml-3 text-muted-foreground">Loading balances...</span>
              </div>
            )}

            {/* Error State */}
            {balancesError && !balancesLoading && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-medium">Error loading leave balances</p>
                <p className="text-red-600 text-sm mt-1">
                  {(balancesError as any)?.response?.data?.message || (balancesError as any)?.message || 'Unknown error'}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!balancesLoading && !balancesError && (!balances || balances.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No leave balances found</p>
                <p className="text-sm mt-1">Contact HR to set up your leave balances</p>
              </div>
            )}

            {/* Data State */}
            {!balancesLoading && !balancesError && balances && balances.length > 0 && (
              <div className="space-y-2">
                {balances.map((balance) => (
                  <div key={balance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{balance.leaveType.name}</p>
                      <p className="text-sm text-gray-600">
                        {balance.used} used | {balance.pending} pending | {balance.available} available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{balance.available}/{balance.totalAllocated}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Requests - with loading, error, and empty states */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">My Leave Requests</h3>

            {/* Loading State */}
            {requestsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <span className="ml-3 text-muted-foreground">Loading leave requests...</span>
              </div>
            )}

            {/* Error State */}
            {requestsError && !requestsLoading && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-medium">Error loading leave requests</p>
                <p className="text-red-600 text-sm mt-1">
                  {(requestsError as any)?.response?.data?.message || (requestsError as any)?.message || 'Unknown error'}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!requestsLoading && !requestsError && (!requests || !requests.content || requests.content.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No leave requests found</p>
                <p className="text-sm mt-1">Click "Apply for Leave" to create your first request</p>
              </div>
            )}

            {/* Data State */}
            {!requestsLoading && !requestsError && requests && requests.content && requests.content.length > 0 && (
              <div className="space-y-2">
                {requests.content.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{request.leaveType.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        {request.reason && ` • ${request.reason}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                      {request.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => cancelLeave.mutate(request.id)}
                          disabled={cancelLeave.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Leave Calendar - Only for Managers */}
        {canViewTeamCalendar && <TeamLeaveCalendar />}

        {/* Apply Leave Dialog */}
        {applyDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Apply for Leave</h3>
                <button
                  onClick={() => setApplyDialogOpen(false)}
                  className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Dialog Content */}
              <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                {/* Leave Type */}
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type *</Label>
                  <Select
                    value={leaveForm.leaveTypeId}
                    onValueChange={(value) => setLeaveForm(prev => ({ ...prev, leaveTypeId: value }))}
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
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Brief reason for leave..."
                    rows={3}
                  />
                </div>

                {/* Dialog Footer */}
                <div className="flex justify-end gap-2 pt-4">
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
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
