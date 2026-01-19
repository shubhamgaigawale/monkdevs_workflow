import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboardApi'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLeadPipeline() {
  return useQuery({
    queryKey: ['dashboard', 'lead-pipeline'],
    queryFn: dashboardApi.getLeadPipeline,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCampaignPerformance() {
  return useQuery({
    queryKey: ['dashboard', 'campaign-performance'],
    queryFn: () => dashboardApi.getCampaignPerformance(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCallVolume(days: number = 7) {
  return useQuery({
    queryKey: ['dashboard', 'call-volume', days],
    queryFn: () => dashboardApi.getCallVolume(days),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLeadSources() {
  return useQuery({
    queryKey: ['dashboard', 'lead-sources'],
    queryFn: dashboardApi.getLeadSources,
    staleTime: 10 * 60 * 1000,
  })
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}
