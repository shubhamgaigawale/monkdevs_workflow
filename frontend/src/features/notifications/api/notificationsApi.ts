import { notificationServiceAPI } from '@/lib/api/services'
import type { ApiResponse } from '@/types/api'

const api = notificationServiceAPI

export interface Notification {
  id: string
  type: 'EMAIL' | 'SMS'
  recipient: string
  subject?: string
  content: string
  status: 'PENDING' | 'SENT' | 'FAILED'
  retryCount: number
  errorMessage?: string
  sentAt?: string
  createdAt: string
}

export interface SendEmailRequest {
  recipient: string
  subject: string
  content: string
}

export interface SendSMSRequest {
  phoneNumber: string
  content: string
}

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get<ApiResponse<Notification[]>>('/api/notifications')
    return data.data || []
  },

  getPending: async (): Promise<Notification[]> => {
    const { data } = await api.get<ApiResponse<Notification[]>>('/api/notifications/pending')
    return data.data || []
  },

  sendEmail: async (request: SendEmailRequest): Promise<Notification> => {
    const { data } = await api.post<ApiResponse<Notification>>('/api/notifications/email', request)
    return data.data!
  },

  sendSMS: async (request: SendSMSRequest): Promise<Notification> => {
    const { data } = await api.post<ApiResponse<Notification>>('/api/notifications/sms', request)
    return data.data!
  },
}
