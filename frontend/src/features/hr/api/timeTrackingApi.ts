import { hrServiceAPI } from '@/lib/api/services'
import type { TimeEntry } from '@/types/models'

export interface TimeStatus {
  currentStatus: 'CLOCKED_IN' | 'ON_BREAK' | 'CLOCKED_OUT'
  currentEntry?: TimeEntry
  todayHours: number
  breakTime: number
}

export interface TimeEntryFilters {
  userId?: string
  start?: string
  end?: string
}

export const timeTrackingApi = {
  getStatus: async (): Promise<TimeStatus> => {
    const response = await hrServiceAPI.get('/api/time/status')
    return response.data.data
  },

  clockIn: async (): Promise<TimeEntry> => {
    const response = await hrServiceAPI.post('/api/time/clock-in', {
      entryType: 'LOGIN'
    })
    return response.data.data
  },

  clockOut: async (): Promise<TimeEntry> => {
    const response = await hrServiceAPI.post('/api/time/clock-out', {
      entryType: 'LOGOUT'
    })
    return response.data.data
  },

  startBreak: async (): Promise<TimeEntry> => {
    const response = await hrServiceAPI.post('/api/time/break-start', {
      entryType: 'BREAK_START'
    })
    return response.data.data
  },

  endBreak: async (): Promise<TimeEntry> => {
    const response = await hrServiceAPI.post('/api/time/break-end', {
      entryType: 'BREAK_END'
    })
    return response.data.data
  },

  getEntries: async (filters?: TimeEntryFilters): Promise<TimeEntry[]> => {
    // Default to last 30 days if no date range provided
    // Format: yyyy-MM-ddTHH:mm:ss (LocalDateTime format without timezone)
    const formatLocalDateTime = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    const endDate = filters?.end ? new Date(filters.end) : new Date()
    const startDate = filters?.start ? new Date(filters.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const response = await hrServiceAPI.get('/api/time/entries/range', {
      params: {
        start: formatLocalDateTime(startDate),
        end: formatLocalDateTime(endDate),
      },
    })
    return response.data.data
  },

  updateEntry: async (id: string, data: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await hrServiceAPI.put(`/api/time/entries/${id}`, data)
    return response.data.data
  },

  deleteEntry: async (id: string): Promise<void> => {
    await hrServiceAPI.delete(`/api/time/entries/${id}`)
  },
}
