import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveApi, type LeaveRequestInput, type LeaveApprovalInput, type LeaveTypeInput, type HolidayInput } from '../api/leaveApi'
import { toast } from 'sonner'

// Leave Types
export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave', 'types'],
    queryFn: leaveApi.getLeaveTypes,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes (doesn't change often)
  })
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LeaveTypeInput) => leaveApi.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'types'] })
      toast.success('Leave type created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create leave type')
    },
  })
}

// Leave Balances
export function useLeaveBalances() {
  return useQuery({
    queryKey: ['leave', 'balances'],
    queryFn: leaveApi.getMyLeaveBalances,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

// Leave Requests
export function useMyLeaveRequests(page = 0, size = 20) {
  return useQuery({
    queryKey: ['leave', 'requests', 'my', page, size],
    queryFn: () => leaveApi.getMyLeaveRequests(page, size),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  })
}

export function useApplyLeave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LeaveRequestInput) => leaveApi.applyLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] })
      queryClient.invalidateQueries({ queryKey: ['leave', 'balances'] })
      toast.success('Leave request submitted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request')
    },
  })
}

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leaveApi.cancelLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] })
      queryClient.invalidateQueries({ queryKey: ['leave', 'balances'] })
      toast.success('Leave request cancelled successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request')
    },
  })
}

// Leave Approvals (Manager/HR)
export function usePendingApprovals(page = 0, size = 20) {
  return useQuery({
    queryKey: ['leave', 'approvals', 'pending', page, size],
    queryFn: () => leaveApi.getPendingApprovals(page, size),
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
  })
}

export function useApproveLeave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeaveApprovalInput }) =>
      leaveApi.approveLeave(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'approvals'] })
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] })
      toast.success('Leave request approved!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve leave request')
    },
  })
}

export function useRejectLeave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeaveApprovalInput }) =>
      leaveApi.rejectLeave(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'approvals'] })
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] })
      toast.success('Leave request rejected')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject leave request')
    },
  })
}

// Team Calendar (Manager)
export function useTeamLeaveCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['leave', 'team-calendar', startDate, endDate],
    queryFn: () => leaveApi.getTeamLeaveCalendar(startDate, endDate),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!startDate && !!endDate, // Only run if dates are provided
  })
}

// Holidays
export function useHolidays() {
  return useQuery({
    queryKey: ['leave', 'holidays'],
    queryFn: leaveApi.getHolidays,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour (holidays don't change often)
  })
}

export function useCreateHoliday() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HolidayInput) => leaveApi.createHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'holidays'] })
      toast.success('Holiday created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create holiday')
    },
  })
}
