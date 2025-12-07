export * from './call'
export * from './user'

export interface Notification {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  timestamp: string
}

export interface Configuration {
  id: number
  key: string
  value: string
  description?: string
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FilterParams {
  search?: string
  startDate?: string
  endDate?: string
  flag?: 'Red' | 'Yellow' | 'Green'
  status?: 'Pending' | 'Reviewed' | 'Processing'
  agentId?: number
  companyId?: number
  projectId?: number
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
