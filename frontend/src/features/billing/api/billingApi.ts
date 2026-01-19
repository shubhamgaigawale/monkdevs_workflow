import { billingServiceAPI } from '@/lib/api/services'
import type { ApiResponse } from '@/types/api'

const api = billingServiceAPI

export interface Subscription {
  id: string
  planType: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM'
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL'
  amount: number
  currency: string
  startDate: string
  endDate?: string
  autoRenew: boolean
  features?: Record<string, any>
  createdAt: string
}

export interface Payment {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'STRIPE'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  paidAt?: string
  createdAt: string
}

export interface CreateSubscriptionRequest {
  planType: string
  billingCycle: string
  amount: number
  currency: string
  startDate: string
  autoRenew: boolean
}

export interface CreatePaymentRequest {
  subscriptionId: string
  amount: number
  currency: string
  paymentMethod: string
}

export const billingApi = {
  getCurrentSubscription: async (): Promise<Subscription | null> => {
    const { data } = await api.get<ApiResponse<Subscription>>('/api/subscriptions/current')
    return data.data || null
  },

  createSubscription: async (request: CreateSubscriptionRequest): Promise<Subscription> => {
    const { data } = await api.post<ApiResponse<Subscription>>('/api/subscriptions', request)
    return data.data!
  },

  updateSubscription: async (
    id: string,
    request: Partial<CreateSubscriptionRequest>
  ): Promise<Subscription> => {
    const { data } = await api.put<ApiResponse<Subscription>>(`/api/subscriptions/${id}`, request)
    return data.data!
  },

  cancelSubscription: async (id: string): Promise<void> => {
    await api.delete(`/api/subscriptions/${id}`)
  },

  getPaymentHistory: async (): Promise<Payment[]> => {
    const { data } = await api.get<ApiResponse<Payment[]>>('/api/payments')
    return data.data || []
  },

  createPayment: async (request: CreatePaymentRequest): Promise<Payment> => {
    const { data} = await api.post<ApiResponse<Payment>>('/api/payments', request)
    return data.data!
  },
}
