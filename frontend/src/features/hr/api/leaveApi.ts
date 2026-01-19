import { hrServiceAPI } from '@/lib/api/services'

// Types
export interface LeaveType {
  id: string
  tenantId: string
  name: string
  code: string
  description?: string
  isSystemDefined: boolean
  daysPerYear: number
  allowCarryForward: boolean
  maxCarryForwardDays?: number
  minNoticeDays?: number
  maxConsecutiveDays?: number
  isPaid: boolean
  color?: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface LeaveBalance {
  id: string
  userId: string
  leaveType: LeaveType
  year: number
  totalAllocated: number
  used: number
  pending: number
  available: number
  carryForward: number
}

export interface LeaveRequest {
  id: string
  tenantId: string
  userId: string
  userName?: string // Optional: Only populated in team calendar
  leaveType: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  currentApproverId?: string
  appliedDate: string
  approvedDate?: string
  rejectedDate?: string
  rejectionReason?: string
  approvals: LeaveApproval[]
}

export interface LeaveApproval {
  id: string
  leaveRequestId: string
  approverId: string
  approverName?: string
  level: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comments?: string
  approvedDate?: string
}

export interface Holiday {
  id: string
  tenantId: string
  name: string
  date: string
  type: 'PUBLIC' | 'OPTIONAL' | 'RESTRICTED'
  description?: string
  isOptional: boolean
}

export interface LeaveRequestInput {
  leaveTypeId: string
  startDate: string
  endDate: string
  reason?: string
}

export interface LeaveTypeInput {
  name: string
  code: string
  description?: string
  daysPerYear: number
  allowCarryForward?: boolean
  maxCarryForwardDays?: number
  minNoticeDays?: number
  maxConsecutiveDays?: number
  isPaid?: boolean
  color?: string
}

export interface LeaveApprovalInput {
  comments?: string
}

export interface HolidayInput {
  name: string
  date: string
  type?: 'PUBLIC' | 'OPTIONAL' | 'RESTRICTED'
  description?: string
  isOptional?: boolean
}

export interface PagedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export const leaveApi = {
  // Leave Types
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await hrServiceAPI.get('/api/leave/types')
    return response.data.data
  },

  createLeaveType: async (data: LeaveTypeInput): Promise<LeaveType> => {
    const response = await hrServiceAPI.post('/api/leave/types', data)
    return response.data.data
  },

  // Leave Balances
  getMyLeaveBalances: async (): Promise<LeaveBalance[]> => {
    const response = await hrServiceAPI.get('/api/leave/balance')
    return response.data.data
  },

  // Leave Requests
  applyLeave: async (data: LeaveRequestInput): Promise<LeaveRequest> => {
    const response = await hrServiceAPI.post('/api/leave/apply', data)
    return response.data.data
  },

  getMyLeaveRequests: async (page = 0, size = 20): Promise<PagedResponse<LeaveRequest>> => {
    const response = await hrServiceAPI.get('/api/leave/requests', {
      params: { page, size },
    })
    return response.data.data
  },

  cancelLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await hrServiceAPI.put(`/api/leave/requests/${id}/cancel`)
    return response.data.data
  },

  // Leave Approvals (Manager/HR)
  getPendingApprovals: async (page = 0, size = 20): Promise<PagedResponse<LeaveRequest>> => {
    const response = await hrServiceAPI.get('/api/leave/pending-approvals', {
      params: { page, size },
    })
    return response.data.data
  },

  approveLeave: async (id: string, data: LeaveApprovalInput): Promise<LeaveRequest> => {
    const response = await hrServiceAPI.post(`/api/leave/approve/${id}`, data)
    return response.data.data
  },

  rejectLeave: async (id: string, data: LeaveApprovalInput): Promise<LeaveRequest> => {
    const response = await hrServiceAPI.post(`/api/leave/reject/${id}`, data)
    return response.data.data
  },

  // Team Calendar (Manager)
  getTeamLeaveCalendar: async (startDate: string, endDate: string): Promise<LeaveRequest[]> => {
    const response = await hrServiceAPI.get('/api/leave/team-calendar', {
      params: { startDate, endDate },
    })
    return response.data.data
  },

  // Holidays
  getHolidays: async (): Promise<Holiday[]> => {
    const response = await hrServiceAPI.get('/api/leave/holidays')
    return response.data.data
  },

  createHoliday: async (data: HolidayInput): Promise<Holiday> => {
    const response = await hrServiceAPI.post('/api/leave/holidays', data)
    return response.data.data
  },
}
