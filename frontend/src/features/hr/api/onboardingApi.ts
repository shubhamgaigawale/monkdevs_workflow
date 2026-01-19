import api from '@/lib/api/axios'

// Types
export interface OnboardingTemplate {
  id: string
  tenantId: string
  name: string
  description?: string
  durationDays: number
  isDefault: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
}

export interface EmployeeOnboarding {
  id: string
  tenantId: string
  userId: string
  template: OnboardingTemplate
  startDate: string
  expectedCompletionDate: string
  actualCompletionDate?: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'TERMINATED'
  completionPercentage: number
  managerId?: string
  buddyId?: string
  probationEndDate?: string
  confirmationDate?: string
  notes?: string
  tasks: EmployeeOnboardingTask[]
}

export interface EmployeeOnboardingTask {
  id: string
  tenantId: string
  onboardingId: string
  title: string
  description?: string
  dueDate: string
  assignedToRole?: string
  assignedToUserId?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  completedDate?: string
  completedBy?: string
  notes?: string
  taskOrder?: number
}

export interface EmployeeDocument {
  id: string
  tenantId: string
  userId: string
  onboardingId?: string
  documentType: string
  documentName: string
  filePath: string
  fileSize?: number
  mimeType?: string
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'
  verifiedBy?: string
  verifiedDate?: string
  verificationNotes?: string
  isMandatory: boolean
  expiryDate?: string
  uploadedBy?: string
  createdAt: string
}

export interface EquipmentAssignment {
  id: string
  tenantId: string
  userId: string
  onboardingId?: string
  equipmentType: string
  equipmentName: string
  serialNumber?: string
  assetTag?: string
  assignedDate: string
  returnDate?: string
  expectedReturnDate?: string
  status: 'ASSIGNED' | 'RETURNED' | 'LOST' | 'DAMAGED' | 'UNDER_REPAIR'
  conditionAtAssignment?: string
  conditionAtReturn?: string
  notes?: string
  assignedBy?: string
}

// Request types
export interface StartOnboardingRequest {
  userId: string
  templateId?: string
  startDate: string
  managerId?: string
  buddyId?: string
  probationEndDate?: string
  notes?: string
}

export interface CompleteTaskRequest {
  notes?: string
}

export interface DocumentUploadRequest {
  documentType: string
  documentName: string
  filePath: string
  fileSize?: number
  mimeType?: string
  isMandatory?: boolean
  expiryDate?: string
}

export interface DocumentVerificationRequest {
  approved: boolean
  verificationNotes?: string
}

export interface EquipmentAssignmentRequest {
  userId: string
  equipmentType: string
  equipmentName: string
  serialNumber?: string
  assetTag?: string
  assignedDate: string
  expectedReturnDate?: string
  conditionAtAssignment?: string
  notes?: string
}

// API Response wrapper
interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

// API Functions

// Onboarding Lifecycle
export const startOnboarding = async (data: StartOnboardingRequest): Promise<EmployeeOnboarding> => {
  const response = await api.post<ApiResponse<EmployeeOnboarding>>('/onboarding/start', data)
  return response.data.data
}

export const getMyOnboarding = async (): Promise<EmployeeOnboarding> => {
  const response = await api.get<ApiResponse<EmployeeOnboarding>>('/onboarding/my-progress')
  return response.data.data
}

export const getTeamOnboardings = async (): Promise<EmployeeOnboarding[]> => {
  const response = await api.get<ApiResponse<EmployeeOnboarding[]>>('/onboarding/team')
  return response.data.data
}

// Tasks
export const getMyOnboardingTasks = async (): Promise<EmployeeOnboardingTask[]> => {
  const response = await api.get<ApiResponse<EmployeeOnboardingTask[]>>('/onboarding/tasks')
  return response.data.data
}

export const completeTask = async (taskId: string, data: CompleteTaskRequest): Promise<EmployeeOnboardingTask> => {
  const response = await api.post<ApiResponse<EmployeeOnboardingTask>>(
    `/onboarding/tasks/${taskId}/complete`,
    data
  )
  return response.data.data
}

// Documents
export const uploadDocument = async (data: DocumentUploadRequest): Promise<EmployeeDocument> => {
  const response = await api.post<ApiResponse<EmployeeDocument>>('/onboarding/documents/upload', data)
  return response.data.data
}

export const getMyDocuments = async (): Promise<EmployeeDocument[]> => {
  const response = await api.get<ApiResponse<EmployeeDocument[]>>('/onboarding/documents')
  return response.data.data
}

export const verifyDocument = async (
  documentId: string,
  data: DocumentVerificationRequest
): Promise<EmployeeDocument> => {
  const response = await api.post<ApiResponse<EmployeeDocument>>(
    `/onboarding/documents/${documentId}/verify`,
    data
  )
  return response.data.data
}

// Equipment
export const assignEquipment = async (data: EquipmentAssignmentRequest): Promise<EquipmentAssignment> => {
  const response = await api.post<ApiResponse<EquipmentAssignment>>('/onboarding/equipment/assign', data)
  return response.data.data
}

export const getMyEquipment = async (): Promise<EquipmentAssignment[]> => {
  const response = await api.get<ApiResponse<EquipmentAssignment[]>>('/onboarding/equipment')
  return response.data.data
}
