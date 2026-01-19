import { reportingServiceAPI } from '@/lib/api/services'
import type { ApiResponse } from '@/types/api'

const api = reportingServiceAPI

export interface Report {
  id: string
  name: string
  type: 'LEAD_CONVERSION' | 'CALL_ACTIVITY' | 'CAMPAIGN_PERFORMANCE' | 'SALES_REVENUE' | 'USER_ACTIVITY' | 'CUSTOM'
  startDate?: string
  endDate?: string
  parameters?: string
  results?: string
  generatedBy: string
  createdAt: string
}

export interface ReportRequest {
  name: string
  type: string
  startDate: string
  endDate: string
  parameters?: Record<string, any>
}

export const reportingApi = {
  getAllReports: async (): Promise<Report[]> => {
    const { data } = await api.get<ApiResponse<Report[]>>('/api/reports')
    return data.data || []
  },

  getReportById: async (id: string): Promise<Report> => {
    const { data } = await api.get<ApiResponse<Report>>(`/api/reports/${id}`)
    return data.data!
  },

  getReportsByType: async (type: string): Promise<Report[]> => {
    const { data } = await api.get<ApiResponse<Report[]>>(`/api/reports/type/${type}`)
    return data.data || []
  },

  generateReport: async (request: ReportRequest): Promise<Report> => {
    const { data } = await api.post<ApiResponse<Report>>('/api/reports/generate', request)
    return data.data!
  },
}
