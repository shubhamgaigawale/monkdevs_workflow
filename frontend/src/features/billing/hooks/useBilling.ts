import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi, type CreateSubscriptionRequest, type CreatePaymentRequest } from '../api/billingApi'
import { toast } from 'sonner'

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: billingApi.getCurrentSubscription,
  })
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: billingApi.getPaymentHistory,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateSubscriptionRequest) => billingApi.createSubscription(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Subscription created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create subscription')
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: Partial<CreateSubscriptionRequest> }) =>
      billingApi.updateSubscription(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Subscription updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update subscription')
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingApi.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Subscription cancelled successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription')
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreatePaymentRequest) => billingApi.createPayment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Payment processed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payment')
    },
  })
}
