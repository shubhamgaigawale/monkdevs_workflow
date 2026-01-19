import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAdminApi, type UpdateCustomerProfileRequest } from '../api/customerAdminApi'
import { toast } from 'sonner'

export function useCustomerProfile() {
  return useQuery({
    queryKey: ['customer-profile'],
    queryFn: customerAdminApi.getProfile,
  })
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, profile }: { id: string; profile: UpdateCustomerProfileRequest }) =>
      customerAdminApi.updateProfile(id, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      customerAdminApi.updateAccountStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
      toast.success('Account status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update account status')
    },
  })
}
