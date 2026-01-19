import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api/services'

interface Module {
  id: string
  code: string
  name: string
  description: string
  icon: string
  displayOrder: number
  isEnabled: boolean
  isCoreModule: boolean
}

interface ModuleState {
  enabledModules: Module[]
  isLoading: boolean
  error: string | null
  fetchEnabledModules: () => Promise<void>
  hasModule: (moduleCode: string) => boolean
  clearModules: () => void
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      enabledModules: [],
      isLoading: false,
      error: null,

      /**
       * Fetch enabled modules for the current tenant
       * This is called after login to determine which features are available
       */
      fetchEnabledModules: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.get('/api/modules/enabled')
          set({ enabledModules: response.data.data, isLoading: false })
        } catch (error: any) {
          console.error('Failed to fetch modules:', error)
          set({
            enabledModules: [],
            isLoading: false,
            error: error.response?.data?.error?.message || 'Failed to fetch modules',
          })
        }
      },

      /**
       * Check if a specific module is enabled for the current tenant
       * @param moduleCode - The code of the module to check (e.g., 'HRMS', 'SALES')
       * @returns true if the module is enabled, false otherwise
       */
      hasModule: (moduleCode) => {
        const modules = get().enabledModules
        return modules.some((m) => m.code === moduleCode && m.isEnabled)
      },

      /**
       * Clear all modules from state
       * Called on logout
       */
      clearModules: () => {
        set({ enabledModules: [], error: null })
      },
    }),
    {
      name: 'module-storage',
      partialize: (state) => ({ enabledModules: state.enabledModules }),
    }
  )
)
