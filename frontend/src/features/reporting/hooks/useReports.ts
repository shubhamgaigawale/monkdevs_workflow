import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportingApi, type ReportRequest } from '../api/reportingApi'
import { toast } from 'sonner'

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: reportingApi.getAllReports,
  })
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportingApi.getReportById(id),
    enabled: !!id,
  })
}

export function useReportsByType(type: string) {
  return useQuery({
    queryKey: ['reports', 'type', type],
    queryFn: () => reportingApi.getReportsByType(type),
    enabled: !!type,
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ReportRequest) => reportingApi.generateReport(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Report generated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate report')
    },
  })
}
