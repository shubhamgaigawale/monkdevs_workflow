import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as taxApi from '../api/taxApi'
import type { TaxRegimeType } from '../types/tax'

// Query keys
export const taxKeys = {
  all: ['tax'] as const,
  declaration: (financialYear: string) => [...taxKeys.all, 'declaration', financialYear] as const,
  calculation: (financialYear: string, regimeType: TaxRegimeType) =>
    [...taxKeys.all, 'calculation', financialYear, regimeType] as const,
  comparison: (financialYear: string) => [...taxKeys.all, 'comparison', financialYear] as const,
  projection: () => [...taxKeys.all, 'projection'] as const,
}

/**
 * Get current declaration
 */
export function useCurrentDeclaration(financialYear: string) {
  return useQuery({
    queryKey: taxKeys.declaration(financialYear),
    queryFn: () => taxApi.getCurrentDeclaration(financialYear),
    staleTime: 30000,
  })
}

/**
 * Create declaration
 */
export function useCreateDeclaration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taxApi.createDeclaration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taxKeys.declaration(data.financialYear) })
      toast.success('Tax declaration created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create declaration')
    },
  })
}

/**
 * Add declaration item
 */
export function useAddDeclarationItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ declarationId, request }: {
      declarationId: string
      request: taxApi.AddDeclarationItemRequest
    }) => taxApi.addDeclarationItem(declarationId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all })
      toast.success('Investment added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add investment')
    },
  })
}

/**
 * Update HRA declaration
 */
export function useUpdateHraDeclaration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ declarationId, request }: {
      declarationId: string
      request: taxApi.UpdateHraRequest
    }) => taxApi.updateHraDeclaration(declarationId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all })
      toast.success('HRA declaration updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update HRA declaration')
    },
  })
}

/**
 * Calculate tax
 */
export function useTaxCalculation(financialYear: string, regimeType: TaxRegimeType) {
  return useQuery({
    queryKey: taxKeys.calculation(financialYear, regimeType),
    queryFn: () => taxApi.calculateTax(financialYear, regimeType),
    enabled: !!financialYear && !!regimeType,
    staleTime: 30000,
  })
}

/**
 * Compare regimes
 */
export function useCompareRegimes(financialYear: string) {
  return useQuery({
    queryKey: taxKeys.comparison(financialYear),
    queryFn: () => taxApi.compareRegimes(financialYear),
    enabled: !!financialYear,
    staleTime: 30000,
  })
}

/**
 * Submit declaration
 */
export function useSubmitDeclaration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taxApi.submitDeclaration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taxKeys.declaration(data.financialYear) })
      toast.success('Declaration submitted for verification')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit declaration')
    },
  })
}

/**
 * Verify proof (HR only)
 */
export function useVerifyProof() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, request }: {
      itemId: string
      request: taxApi.VerifyProofRequest
    }) => taxApi.verifyProof(itemId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all })
      toast.success('Proof verification updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify proof')
    },
  })
}

/**
 * Get tax projection
 */
export function useTaxProjection() {
  return useQuery({
    queryKey: taxKeys.projection(),
    queryFn: taxApi.getTaxProjection,
    staleTime: 60000,
  })
}
