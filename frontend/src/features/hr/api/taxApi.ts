import { hrServiceAPI } from '@/lib/api/services'
import type { TaxRegimeType } from '../types/tax'

const api = hrServiceAPI

// Types
export interface TaxDeclaration {
  id: string
  userId: string
  financialYear: string
  regimeType: TaxRegimeType
  totalDeclaredAmount: number
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'REJECTED'
  submittedDate?: string
  approvedDate?: string
  approvedBy?: string
  rejectionReason?: string
  items: TaxDeclarationItem[]
  hraDeclaration?: HraDeclaration
  createdAt: string
  updatedAt: string
}

export interface TaxDeclarationItem {
  id: string
  declarationId: string
  section: string
  subSection?: string
  description: string
  declaredAmount: number
  proofFilePath?: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  verifiedBy?: string
  verifiedDate?: string
  verificationNotes?: string
  createdAt: string
}

export interface HraDeclaration {
  id: string
  tenantId: string
  declarationId: string
  rentPaidMonthly: number
  landlordName: string
  landlordPan?: string
  landlordAddress: string
  metroCity: boolean
  rentReceiptsPath?: string
  calculatedExemption?: number
  createdAt: string
}

export interface TaxCalculation {
  id: string
  userId: string
  financialYear: string
  regimeType: TaxRegimeType
  grossSalary: number
  totalDeductions: number
  taxableIncome: number
  totalTax: number
  cess: number
  tdsMonthly: number
  calculationDate: string
}

export interface RegimeCalculation {
  regimeType: TaxRegimeType
  grossSalary: number
  totalDeductions: number
  taxableIncome: number
  totalTax: number
  cess: number
  netIncome: number
}

export interface TaxComparisonResponse {
  financialYear: string
  oldRegime: RegimeCalculation
  newRegime: RegimeCalculation
  savingsAmount: number
  recommendedRegime: TaxRegimeType
}

export interface CreateDeclarationRequest {
  financialYear: string
  regimeType: TaxRegimeType
}

export interface AddDeclarationItemRequest {
  section: string
  subSection?: string
  description: string
  declaredAmount: number
  proofFilePath?: string
}

export interface UpdateHraRequest {
  rentPaidMonthly: number
  landlordName: string
  landlordPan?: string
  landlordAddress: string
  metroCity: boolean
  rentReceiptsPath?: string
}

export interface VerifyProofRequest {
  approved: boolean
  verificationNotes?: string
}

/**
 * Create a new tax declaration
 */
export const createDeclaration = async (request: CreateDeclarationRequest): Promise<TaxDeclaration> => {
  const { data } = await api.post<TaxDeclaration>('/api/tax/declaration/create', request)
  return data
}

/**
 * Get current financial year declaration
 */
export const getCurrentDeclaration = async (financialYear: string): Promise<TaxDeclaration> => {
  const { data } = await api.get<TaxDeclaration>('/api/tax/declaration/current', {
    params: { financialYear }
  })
  return data
}

/**
 * Add a declaration item
 */
export const addDeclarationItem = async (
  declarationId: string,
  request: AddDeclarationItemRequest
): Promise<TaxDeclarationItem> => {
  const { data } = await api.post<TaxDeclarationItem>(
    `/api/tax/declaration/${declarationId}/items`,
    request
  )
  return data
}

/**
 * Update HRA declaration
 */
export const updateHraDeclaration = async (
  declarationId: string,
  request: UpdateHraRequest
): Promise<HraDeclaration> => {
  const { data } = await api.post<HraDeclaration>(
    `/api/tax/declaration/${declarationId}/hra`,
    request
  )
  return data
}

/**
 * Calculate tax for a specific regime
 */
export const calculateTax = async (
  financialYear: string,
  regimeType: TaxRegimeType
): Promise<TaxCalculation> => {
  const { data } = await api.get<TaxCalculation>('/api/tax/calculation', {
    params: { financialYear, regimeType }
  })
  return data
}

/**
 * Compare both tax regimes
 */
export const compareRegimes = async (financialYear: string): Promise<TaxComparisonResponse> => {
  const { data} = await api.get<TaxComparisonResponse>('/api/tax/compare-regimes', {
    params: { financialYear }
  })
  return data
}

/**
 * Submit declaration for verification
 */
export const submitDeclaration = async (declarationId: string): Promise<TaxDeclaration> => {
  const { data } = await api.post<TaxDeclaration>(`/api/tax/declaration/${declarationId}/submit`)
  return data
}

/**
 * Verify proof document (HR only)
 */
export const verifyProof = async (
  itemId: string,
  request: VerifyProofRequest
): Promise<TaxDeclarationItem> => {
  const { data } = await api.post<TaxDeclarationItem>(
    `/api/tax/declaration/items/${itemId}/verify`,
    request
  )
  return data
}

/**
 * Get tax projection for current FY
 */
export const getTaxProjection = async (): Promise<TaxCalculation> => {
  const { data } = await api.get<TaxCalculation>('/api/tax/projection')
  return data
}
