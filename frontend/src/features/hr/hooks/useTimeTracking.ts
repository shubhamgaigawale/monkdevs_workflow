import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timeTrackingApi, type TimeEntryFilters } from '../api/timeTrackingApi'
import { toast } from 'sonner'

export function useTimeStatus() {
  return useQuery({
    queryKey: ['time', 'status'],
    queryFn: timeTrackingApi.getStatus,
    refetchInterval: 60 * 1000, // Refetch every minute
    staleTime: 30 * 1000, // Consider stale after 30 seconds
  })
}

export function useTimeEntries(filters?: TimeEntryFilters) {
  return useQuery({
    queryKey: ['time', 'entries', filters],
    queryFn: () => timeTrackingApi.getEntries(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useClockIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: timeTrackingApi.clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time'] })
      toast.success('Clocked in successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clock in')
    },
  })
}

export function useClockOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: timeTrackingApi.clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time'] })
      toast.success('Clocked out successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clock out')
    },
  })
}

export function useStartBreak() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: timeTrackingApi.startBreak,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time'] })
      toast.success('Break started')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start break')
    },
  })
}

export function useEndBreak() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: timeTrackingApi.endBreak,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time'] })
      toast.success('Break ended')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to end break')
    },
  })
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      timeTrackingApi.updateEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time'] })
      toast.success('Time entry updated!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update entry')
    },
  })
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => timeTrackingApi.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time'] })
      toast.success('Time entry deleted!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete entry')
    },
  })
}
