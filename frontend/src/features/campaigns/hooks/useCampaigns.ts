import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignsApi, type CampaignFilters, type CreateCampaignDto, type UpdateCampaignDto } from '../api/campaignsApi'
import { toast } from 'sonner'

export function useCampaigns(page: number = 0, size: number = 20, filters?: CampaignFilters) {
  return useQuery({
    queryKey: ['campaigns', page, size, filters],
    queryFn: () => campaignsApi.getAll(page, size, filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCampaignDetail(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCampaignTemplates() {
  return useQuery({
    queryKey: ['campaigns', 'templates'],
    queryFn: campaignsApi.getTemplates,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCampaignDto) => campaignsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Campaign created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create campaign')
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDto }) =>
      campaignsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] })
      toast.success('Campaign updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update campaign')
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Campaign deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete campaign')
    },
  })
}

export function useSendCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignsApi.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Campaign sent successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send campaign')
    },
  })
}

export function useScheduleCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      campaignsApi.schedule(id, scheduledAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] })
      toast.success('Campaign scheduled successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to schedule campaign')
    },
  })
}

export function usePauseCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignsApi.pause(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] })
      toast.success('Campaign paused!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to pause campaign')
    },
  })
}

export function useResumeCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignsApi.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] })
      toast.success('Campaign resumed!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resume campaign')
    },
  })
}
