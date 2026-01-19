import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi, type LeadFilters, type CreateLeadDto, type UpdateLeadDto, type BulkAssignDto } from '../api/leadsApi'
import { toast } from 'sonner'

export function useLeads(page: number = 0, size: number = 20, filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', page, size, filters],
    queryFn: () => leadsApi.getAll(page, size, filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLeadHistory(id: string) {
  return useQuery({
    queryKey: ['leads', id, 'history'],
    queryFn: () => leadsApi.getHistory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeadDto) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Lead created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create lead')
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadDto }) =>
      leadsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Lead updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead')
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Lead deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead')
    },
  })
}

export function useAssignLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) =>
      leadsApi.assign(id, assignedToId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] })
      toast.success('Lead assigned successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign lead')
    },
  })
}

export function useBulkAssignLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkAssignDto) => leadsApi.bulkAssign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Leads assigned successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign leads')
    },
  })
}

export function useImportLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => leadsApi.importFromExcel(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(
        `Import completed: ${data.successCount} successful, ${data.errorCount} errors`
      )
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to import leads')
    },
  })
}
