import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, type SendEmailRequest, type SendSMSRequest } from '../api/notificationsApi'
import { toast } from 'sonner'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
  })
}

export function usePendingNotifications() {
  return useQuery({
    queryKey: ['notifications', 'pending'],
    queryFn: notificationsApi.getPending,
  })
}

export function useSendEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: SendEmailRequest) => notificationsApi.sendEmail(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Email sent successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send email')
    },
  })
}

export function useSendSMS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: SendSMSRequest) => notificationsApi.sendSMS(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('SMS sent successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send SMS')
    },
  })
}
