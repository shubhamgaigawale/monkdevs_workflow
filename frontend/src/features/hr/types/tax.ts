export type TaxRegimeType = 'OLD' | 'NEW'

export type DeclarationStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'REJECTED'

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export const TAX_SECTIONS = {
  '80C': {
    label: 'Section 80C',
    description: 'Investments - PPF, ELSS, LIC, etc. (Max ₹1.5 Lakh)',
    maxAmount: 150000
  },
  '80D': {
    label: 'Section 80D',
    description: 'Health Insurance Premium',
    maxAmount: null
  },
  '80G': {
    label: 'Section 80G',
    description: 'Donations to Charitable Institutions',
    maxAmount: null
  },
  '80E': {
    label: 'Section 80E',
    description: 'Education Loan Interest',
    maxAmount: null
  },
  '24': {
    label: 'Section 24',
    description: 'Home Loan Interest (Self-occupied property)',
    maxAmount: 200000
  }
} as const

export type TaxSection = keyof typeof TAX_SECTIONS
