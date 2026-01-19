import { customerAdminServiceAPI } from '@/lib/api/services'
import type { ApiResponse } from '@/types/api'

const api = customerAdminServiceAPI

export interface CustomerProfile {
  id: string
  companyName: string
  domain?: string
  industry?: string
  contactPerson: string
  contactEmail: string
  contactPhone?: string
  address?: string
  notes?: string
  customSettings?: Record<string, any>
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CLOSED'
  createdAt: string
  updatedAt: string
}

export interface UpdateCustomerProfileRequest {
  companyName?: string
  domain?: string
  industry?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  notes?: string
  customSettings?: Record<string, any>
}

export const customerAdminApi = {
  getProfile: async (): Promise<CustomerProfile> => {
    const { data } = await api.get<ApiResponse<CustomerProfile>>('/api/customer/profile')
    return data.data!
  },

  createProfile: async (profile: UpdateCustomerProfileRequest): Promise<CustomerProfile> => {
    const { data } = await api.post<ApiResponse<CustomerProfile>>('/api/customer/profile', profile)
    return data.data!
  },

  updateProfile: async (id: string, profile: UpdateCustomerProfileRequest): Promise<CustomerProfile> => {
    const { data } = await api.put<ApiResponse<CustomerProfile>>(`/api/customer/profile/${id}`, profile)
    return data.data!
  },

  updateAccountStatus: async (id: string, status: string): Promise<void> => {
    await api.put(`/api/customer/profile/${id}/status`, null, { params: { status } })
  },
}
