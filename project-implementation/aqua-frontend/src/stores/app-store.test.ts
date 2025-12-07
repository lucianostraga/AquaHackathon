import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './app-store'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      sidebarOpen: true,
      sidebarCollapsed: false,
      callFilters: { page: 1, pageSize: 10, sortBy: 'date', sortOrder: 'desc' },
      isUploading: false,
      uploadProgress: 0,
      unreadNotificationCount: 0,
    })
  })

  describe('sidebar actions', () => {
    it('should toggle sidebar open state', () => {
      expect(useAppStore.getState().sidebarOpen).toBe(true)
      useAppStore.getState().toggleSidebar()
      expect(useAppStore.getState().sidebarOpen).toBe(false)
    })

    it('should set sidebar collapsed state', () => {
      useAppStore.getState().setSidebarCollapsed(true)
      expect(useAppStore.getState().sidebarCollapsed).toBe(true)
    })
  })

  describe('call filters', () => {
    it('should merge partial filters', () => {
      useAppStore.getState().setCallFilters({ search: 'test' })
      const filters = useAppStore.getState().callFilters
      expect(filters.search).toBe('test')
      expect(filters.page).toBe(1)
    })

    it('should reset filters to defaults', () => {
      useAppStore.getState().setCallFilters({ search: 'test', page: 5 })
      useAppStore.getState().resetCallFilters()
      expect(useAppStore.getState().callFilters.search).toBeUndefined()
    })
  })

  describe('upload state', () => {
    it('should set uploading state with progress', () => {
      useAppStore.getState().setUploading(true, 50)
      expect(useAppStore.getState().isUploading).toBe(true)
      expect(useAppStore.getState().uploadProgress).toBe(50)
    })
  })
})
