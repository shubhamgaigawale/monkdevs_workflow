import api from '@/lib/api/axios'
import type { Integration, IntegrationType } from '@/types/models'

export interface Appointment {
  id: string
  eventName: string
  startTime: string
  endTime: string
  attendeeEmail: string
  attendeeName: string
  status: string
  location?: string
  description?: string
}

export const integrationsApi = {
  getAll: async (): Promise<Integration[]> => {
    const response = await api.get('/api/integrations')
    return response.data.data
  },

  getByType: async (type: IntegrationType): Promise<Integration> => {
    const response = await api.get(`/api/integrations/${type}`)
    return response.data.data
  },

  enable: async (type: IntegrationType): Promise<Integration> => {
    const response = await api.post(`/api/integrations/${type}/enable`)
    return response.data.data
  },

  disable: async (type: IntegrationType): Promise<Integration> => {
    const response = await api.post(`/api/integrations/${type}/disable`)
    return response.data.data
  },

  getOAuthUrl: async (type: IntegrationType): Promise<{ authUrl: string }> => {
    const response = await api.get(`/api/integrations/${type}/oauth/authorize`)
    return response.data.data
  },

  handleOAuthCallback: async (
    type: IntegrationType,
    code: string
  ): Promise<Integration> => {
    const response = await api.post(`/api/integrations/${type}/oauth/callback`, null, {
      params: { code },
    })
    return response.data.data
  },

  syncAppointments: async (): Promise<void> => {
    await api.post('/api/integrations/appointments/sync')
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/api/integrations/appointments')
    return response.data.data
  },

  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/api/integrations/appointments/upcoming')
    return response.data.data
  },
}
