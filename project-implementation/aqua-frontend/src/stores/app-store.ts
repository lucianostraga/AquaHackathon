import { create } from 'zustand'
import type { FilterParams } from '@/types'

interface AppState {
  // Sidebar state
  sidebarOpen: boolean
  sidebarCollapsed: boolean

  // Call filters
  callFilters: FilterParams

  // UI state
  isUploading: boolean
  uploadProgress: number

  // Notifications
  unreadNotificationCount: number

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCallFilters: (filters: Partial<FilterParams>) => void
  resetCallFilters: () => void
  setUploading: (uploading: boolean, progress?: number) => void
  setUnreadNotificationCount: (count: number) => void
}

const defaultFilters: FilterParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'date',
  sortOrder: 'desc',
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  callFilters: defaultFilters,
  isUploading: false,
  uploadProgress: 0,
  unreadNotificationCount: 0,

  // Actions
  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen })
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed })
  },

  setCallFilters: (filters: Partial<FilterParams>) => {
    set({ callFilters: { ...get().callFilters, ...filters } })
  },

  resetCallFilters: () => {
    set({ callFilters: defaultFilters })
  },

  setUploading: (uploading: boolean, progress: number = 0) => {
    set({ isUploading: uploading, uploadProgress: progress })
  },

  setUnreadNotificationCount: (count: number) => {
    set({ unreadNotificationCount: count })
  },
}))
