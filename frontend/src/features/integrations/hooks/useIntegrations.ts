import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationsApi } from '../api/integrationsApi'
import type { IntegrationType } from '@/types/models'
import { toast } from 'sonner'

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsApi.getAll,
    staleTime: 5 * 60 * 1000,
  })
}

export function useIntegration(type: IntegrationType) {
  return useQuery({
    queryKey: ['integrations', type],
    queryFn: () => integrationsApi.getByType(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  })
}

export function useEnableIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: IntegrationType) => integrationsApi.enable(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration enabled!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enable integration')
    },
  })
}

export function useDisableIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: IntegrationType) => integrationsApi.disable(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration disabled!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disable integration')
    },
  })
}

export function useAppointments() {
  return useQuery({
    queryKey: ['integrations', 'appointments'],
    queryFn: integrationsApi.getAppointments,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['integrations', 'appointments', 'upcoming'],
    queryFn: integrationsApi.getUpcomingAppointments,
    staleTime: 1 * 60 * 1000,
  })
}

export function useSyncAppointments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: integrationsApi.syncAppointments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'appointments'] })
      toast.success('Appointments synced!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sync appointments')
    },
  })
}
