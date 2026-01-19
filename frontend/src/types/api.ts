export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error?: ErrorDetails
  timestamp: string
}

export interface ErrorDetails {
  code: string
  message: string
  details?: any
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}
