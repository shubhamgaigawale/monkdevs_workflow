import { leadServiceAPI } from '@/lib/api/services'
import type { Lead, LeadStatus } from '@/types/models'
import type { PageResponse } from '@/types/api'

const api = leadServiceAPI

export interface CreateLeadDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  source: string
  status: LeadStatus
  priority: string
  notes?: string
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

export interface LeadFilters {
  status?: LeadStatus
  priority?: string
  source?: string
  assignedToId?: string
  search?: string
}

export interface BulkAssignDto {
  leadIds: string[]
  assignedToId: string
}

export interface LeadHistory {
  id: string
  leadId: string
  action: string
  field?: string
  oldValue?: string
  newValue?: string
  changedBy: string
  changedAt: string
}

export const leadsApi = {
  getAll: async (
    page: number = 0,
    size: number = 20,
    filters?: LeadFilters
  ): Promise<PageResponse<Lead>> => {
    const response = await api.get('/api/leads', {
      params: { page, size, ...filters },
    })
    return response.data.data
  },

  getById: async (id: string): Promise<Lead> => {
    const response = await api.get(`/api/leads/${id}`)
    return response.data.data
  },

  create: async (data: CreateLeadDto): Promise<Lead> => {
    const response = await api.post('/api/leads', data)
    return response.data.data
  },

  update: async (id: string, data: UpdateLeadDto): Promise<Lead> => {
    const response = await api.put(`/api/leads/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/leads/${id}`)
  },

  assign: async (id: string, assignedToId: string): Promise<Lead> => {
    const response = await api.post(`/api/leads/${id}/assign`, null, {
      params: { assignedToId },
    })
    return response.data.data
  },

  bulkAssign: async (data: BulkAssignDto): Promise<void> => {
    await api.post('/api/leads/bulk-assign', data)
  },

  importFromExcel: async (file: File): Promise<{ successCount: number; errorCount: number }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/leads/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  getHistory: async (id: string): Promise<LeadHistory[]> => {
    const response = await api.get(`/api/leads/${id}/history`)
    return response.data.data
  },

  exportToExcel: async (filters?: LeadFilters): Promise<Blob> => {
    const response = await api.get('/api/leads/export', {
      params: filters,
      responseType: 'blob',
    })
    return response.data.data
  },
}
