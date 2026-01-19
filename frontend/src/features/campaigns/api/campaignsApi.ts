import { campaignServiceAPI } from '@/lib/api/services'
import type { Campaign, CampaignStatus } from '@/types/models'
import type { PageResponse } from '@/types/api'

const api = campaignServiceAPI

export interface CreateCampaignDto {
  name: string
  subject: string
  previewText?: string
  fromName: string
  replyTo?: string
  campaignType: 'EMAIL' | 'SMS' | 'MIXED'
  content: string
  leadIds: string[]
  scheduledAt?: string
  templateId?: string
  mailchimpListId?: string
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export interface CampaignFilters {
  status?: CampaignStatus
  campaignType?: 'EMAIL' | 'SMS' | 'MIXED'
  search?: string
}

export interface CampaignTemplate {
  id: string
  name: string
  category: string
  subject: string
  content: string
  thumbnail?: string
}

export const campaignsApi = {
  getAll: async (
    page: number = 0,
    size: number = 20,
    filters?: CampaignFilters
  ): Promise<PageResponse<Campaign>> => {
    const response = await api.get('/api/campaigns', {
      params: { page, size, ...filters },
    })
    return response.data.data
  },

  getById: async (id: string): Promise<Campaign> => {
    const response = await api.get(`/api/campaigns/${id}`)
    return response.data.data
  },

  create: async (data: CreateCampaignDto): Promise<Campaign> => {
    const response = await api.post('/api/campaigns', data)
    return response.data.data
  },

  update: async (id: string, data: UpdateCampaignDto): Promise<Campaign> => {
    const response = await api.put(`/api/campaigns/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/campaigns/${id}`)
  },

  send: async (id: string): Promise<Campaign> => {
    const response = await api.post(`/api/campaigns/${id}/send`)
    return response.data.data
  },

  schedule: async (id: string, scheduledAt: string): Promise<Campaign> => {
    const response = await api.post(`/api/campaigns/${id}/schedule`, null, {
      params: { scheduledAt },
    })
    return response.data.data
  },

  pause: async (id: string): Promise<Campaign> => {
    const response = await api.post(`/api/campaigns/${id}/pause`)
    return response.data.data
  },

  resume: async (id: string): Promise<Campaign> => {
    const response = await api.post(`/api/campaigns/${id}/resume`)
    return response.data.data
  },

  getTemplates: async (): Promise<CampaignTemplate[]> => {
    const response = await api.get('/api/campaigns/templates')
    return response.data.data
  },

  createTemplate: async (template: Omit<CampaignTemplate, 'id'>): Promise<CampaignTemplate> => {
    const response = await api.post('/api/campaigns/templates', template)
    return response.data.data
  },
}
