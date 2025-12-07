import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth-store'
import type { Profile } from '@/types'

describe('useAuthStore', () => {
  const mockProfile: Profile = {
    id: 1,
    userId: 1,
    name: 'John Doe',
    email: 'john@example.com',
    roleName: 'Admin',
    permissions: ['reviewcalls', 'upload', 'reports'],
  }

  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  describe('initial state', () => {
    it('should have null user when not logged in', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should set user and role on login', () => {
      useAuthStore.getState().login(mockProfile)
      const state = useAuthStore.getState()
      expect(state.user?.name).toBe('John Doe')
      expect(state.role?.name).toBe('Admin')
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear all auth state on logout', () => {
      useAuthStore.getState().login(mockProfile)
      useAuthStore.getState().logout()
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('should return true for existing permission', () => {
      useAuthStore.getState().login(mockProfile)
      expect(useAuthStore.getState().hasPermission('reviewcalls')).toBe(true)
    })

    it('should return false for non-existing permission', () => {
      useAuthStore.getState().login(mockProfile)
      expect(useAuthStore.getState().hasPermission('users')).toBe(false)
    })
  })
})
