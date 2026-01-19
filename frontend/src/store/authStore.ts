import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types'
import { userServiceAPI } from '@/lib/api/services'
import { useModuleStore } from './moduleStore'

const api = userServiceAPI

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post<{ data: AuthResponse }>('/api/auth/login', credentials)
          const authData = response.data.data

          localStorage.setItem('accessToken', authData.accessToken)
          localStorage.setItem('refreshToken', authData.refreshToken)

          const user: User = {
            id: authData.userId,
            email: authData.email,
            firstName: authData.firstName,
            lastName: authData.lastName,
            tenantId: authData.tenantId,
            tenantName: authData.tenantName,
            roles: authData.roles,
            permissions: authData.permissions,
            isActive: true,
            createdAt: new Date().toISOString(),
          }

          set({
            user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          // Fetch enabled modules after successful login
          await useModuleStore.getState().fetchEnabledModules()
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post<{ data: AuthResponse }>('/api/auth/register', data)
          const authData = response.data.data

          localStorage.setItem('accessToken', authData.accessToken)
          localStorage.setItem('refreshToken', authData.refreshToken)

          const user: User = {
            id: authData.userId,
            email: authData.email,
            firstName: authData.firstName,
            lastName: authData.lastName,
            tenantId: authData.tenantId,
            tenantName: authData.tenantName,
            roles: authData.roles,
            permissions: authData.permissions,
            isActive: true,
            createdAt: new Date().toISOString(),
          }

          set({
            user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          // Fetch enabled modules after successful registration
          await useModuleStore.getState().fetchEnabledModules()
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })

        // Clear modules on logout
        useModuleStore.getState().clearModules()
      },

      setUser: (user) => {
        set({ user })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
