import { CheckCircle2, XCircle, Calendar as CalendarIcon } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrServiceAPI } from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface LeaveRequest {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  leaveType: {
    id: string
    name: string
    code: string
    color?: string
  }
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  status: string
  appliedDate: string
}

export function LeaveApprovalsPage() {
  // Internal permission check - managers OR HR managers can access
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: [PERMISSIONS.MANAGER_ACCESS, PERMISSIONS.HR_MANAGE]
  })

  const queryClient = useQueryClient()

  // Fetch pending leave approvals
  const { data: pendingLeaves, isLoading } = useQuery({
    queryKey: ['leave', 'pending-approvals'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/leave/pending-approvals?page=0&size=50')
      return response.data.data
    },
  })

  // Approve leave mutation
  const approveLeave = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await hrServiceAPI.post(`/api/leave/approve/${requestId}`, { comments: 'Approved by HR' })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] })
      toast.success('Leave request approved successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve leave request')
    },
  })

  // Reject leave mutation
  const rejectLeave = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const response = await hrServiceAPI.post(`/api/leave/reject/${requestId}`, { comments: reason })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] })
      toast.success('Leave request rejected')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject leave request')
    },
  })

  const handleApprove = async (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this leave request?')) {
      await approveLeave.mutateAsync(requestId)
    }
  }

  const handleReject = async (requestId: string) => {
    const reason = window.prompt('Enter rejection reason:')
    if (reason) {
      await rejectLeave.mutateAsync({ requestId, reason })
    }
  }

  // Show loading while checking permissions
  if (checkingPermissions) {
    return (
      <AppLayout title="Leave Approvals" subtitle="Review and approve leave requests">
        <div className="flex items-center justify-center h-64">
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
    return <AccessDenied requiredPermission={`${PERMISSIONS.MANAGER_ACCESS} or ${PERMISSIONS.HR_MANAGE}`} />
  }

  if (isLoading) {
    return (
      <AppLayout title="Leave Approvals" subtitle="Review and approve leave requests">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leave requests...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const leaveRequests = pendingLeaves?.content || []

  return (
    <AppLayout title="Leave Approvals" subtitle="Review and approve leave requests">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-3xl font-bold text-yellow-600">{leaveRequests.length}</p>
                </div>
                <CalendarIcon className="h-12 w-12 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Days Requested</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {leaveRequests.reduce((sum: number, req: LeaveRequest) => sum + req.totalDays, 0)}
                  </p>
                </div>
                <CalendarIcon className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Employees</p>
                  <p className="text-3xl font-bold text-primary">
                    {new Set(leaveRequests.map((req: LeaveRequest) => req.userId)).size}
                  </p>
                </div>
                <CalendarIcon className="h-12 w-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests */}
        {leaveRequests.length > 0 ? (
          <div className="space-y-4">
            {leaveRequests.map((request: LeaveRequest) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {request.leaveType.color && (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: request.leaveType.color }}
                          />
                        )}
                        <h3 className="text-lg font-semibold">{request.leaveType.name}</h3>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                          PENDING
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Employee Name</p>
                          <p className="font-medium">{request.userName || 'Unknown'}</p>
                          {request.userEmail && (
                            <p className="text-xs text-gray-500">{request.userEmail}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">{request.totalDays} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-medium">{new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-medium">{new Date(request.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {request.reason && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Reason</p>
                          <p className="text-sm">{request.reason}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-600">Applied On</p>
                        <p className="text-sm">{new Date(request.appliedDate).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={approveLeave.isPending || rejectLeave.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                        disabled={approveLeave.isPending || rejectLeave.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Leave Requests</h3>
              <p className="text-muted-foreground">All leave requests have been processed.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
