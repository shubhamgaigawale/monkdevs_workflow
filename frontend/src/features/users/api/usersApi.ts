import api from '@/lib/api/axios'
import type { User } from '@/types/models'

export interface CreateUserDto {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  roleNames?: string[]
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  roles?: string[]
  isActive?: boolean
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  email?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data.data
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me')
    return response.data.data
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data)
    return response.data.data
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data.data
  },

  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await api.put('/users/me', data)
    return response.data.data
  },

  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await api.post('/users/me/password', data)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
