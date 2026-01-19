import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { callsApi, type CallFilters, type CreateCallDto, type UpdateCallDto } from '../api/callsApi'
import { toast } from 'sonner'

export function useCalls(page: number = 0, size: number = 20, filters?: CallFilters) {
  return useQuery({
    queryKey: ['calls', page, size, filters],
    queryFn: () => callsApi.getAll(page, size, filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCallDetail(id: string) {
  return useQuery({
    queryKey: ['calls', id],
    queryFn: () => callsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCallsByLead(leadId: string) {
  return useQuery({
    queryKey: ['calls', 'lead', leadId],
    queryFn: () => callsApi.getByLeadId(leadId),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpcomingFollowUps() {
  return useQuery({
    queryKey: ['calls', 'follow-ups'],
    queryFn: callsApi.getUpcomingFollowUps,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCreateCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCallDto) => callsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Call logged successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to log call')
    },
  })
}

export function useUpdateCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCallDto }) =>
      callsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      queryClient.invalidateQueries({ queryKey: ['calls', variables.id] })
      toast.success('Call updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update call')
    },
  })
}

export function useDeleteCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => callsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      toast.success('Call deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete call')
    },
  })
}
