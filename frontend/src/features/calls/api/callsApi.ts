import { callServiceAPI } from '@/lib/api/services'
import type { Call } from '@/types/models'
import type { PageResponse } from '@/types/api'

const api = callServiceAPI

export interface CreateCallDto {
  leadId?: string
  phoneNumber: string
  direction: 'INBOUND' | 'OUTBOUND'
  duration: number
  notes?: string
  outcome?: string
  followUpRequired: boolean
  followUpDate?: string
}

export interface UpdateCallDto extends Partial<CreateCallDto> {}

export interface CallFilters {
  leadId?: string
  direction?: 'INBOUND' | 'OUTBOUND'
  startDate?: string
  endDate?: string
  followUpRequired?: boolean
  search?: string
}

export const callsApi = {
  getAll: async (
    page: number = 0,
    size: number = 20,
    filters?: CallFilters
  ): Promise<PageResponse<Call>> => {
    const response = await api.get('/api/calls', {
      params: { page, size, ...filters },
    })
    return response.data.data
  },

  getById: async (id: string): Promise<Call> => {
    const response = await api.get(`/api/calls/${id}`)
    return response.data.data
  },

  getByLeadId: async (leadId: string): Promise<Call[]> => {
    const response = await api.get(`/api/calls/lead/${leadId}`)
    return response.data.data
  },

  create: async (data: CreateCallDto): Promise<Call> => {
    const response = await api.post('/api/calls', data)
    return response.data.data
  },

  update: async (id: string, data: UpdateCallDto): Promise<Call> => {
    const response = await api.put(`/api/calls/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/calls/${id}`)
  },

  getUpcomingFollowUps: async (): Promise<Call[]> => {
    const response = await api.get('/api/calls/follow-ups')
    return response.data.data
  },
}
