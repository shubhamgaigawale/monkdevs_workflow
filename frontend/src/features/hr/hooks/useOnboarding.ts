import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as onboardingApi from '../api/onboardingApi'
import type {
  StartOnboardingRequest,
  CompleteTaskRequest,
  DocumentUploadRequest,
  DocumentVerificationRequest,
  EquipmentAssignmentRequest,
} from '../api/onboardingApi'
import { toast } from 'sonner'

// Onboarding Progress
export function useMyOnboarding() {
  return useQuery({
    queryKey: ['onboarding', 'my-progress'],
    queryFn: onboardingApi.getMyOnboarding,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    retry: 1, // Only retry once if it fails (might not have onboarding)
  })
}

export function useTeamOnboardings() {
  return useQuery({
    queryKey: ['onboarding', 'team'],
    queryFn: onboardingApi.getTeamOnboardings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

export function useStartOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StartOnboardingRequest) => onboardingApi.startOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
      toast.success('Onboarding started successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start onboarding')
    },
  })
}

// Tasks
export function useMyOnboardingTasks() {
  return useQuery({
    queryKey: ['onboarding', 'tasks', 'my'],
    queryFn: onboardingApi.getMyOnboardingTasks,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: CompleteTaskRequest }) =>
      onboardingApi.completeTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
      toast.success('Task completed successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete task')
    },
  })
}

// Documents
export function useMyDocuments() {
  return useQuery({
    queryKey: ['onboarding', 'documents', 'my'],
    queryFn: onboardingApi.getMyDocuments,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DocumentUploadRequest) => onboardingApi.uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'documents'] })
      toast.success('Document uploaded successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload document')
    },
  })
}

export function useVerifyDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: DocumentVerificationRequest }) =>
      onboardingApi.verifyDocument(documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'documents'] })
      toast.success('Document verification completed!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify document')
    },
  })
}

// Equipment
export function useMyEquipment() {
  return useQuery({
    queryKey: ['onboarding', 'equipment', 'my'],
    queryFn: onboardingApi.getMyEquipment,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

export function useAssignEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EquipmentAssignmentRequest) => onboardingApi.assignEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'equipment'] })
      toast.success('Equipment assigned successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign equipment')
    },
  })
}
