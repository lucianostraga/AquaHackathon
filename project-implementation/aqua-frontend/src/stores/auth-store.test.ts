import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth-store'
import type { Profile, Permission } from '@/types'

describe('useAuthStore', () => {
  const mockProfile: Profile = {
    id: 1,
    userId: 1,
    name: 'John Doe',
    email: 'john@example.com',
    roleName: 'Admin',
    permissions: ['reviewcalls', 'upload', 'reports'] as Permission[],
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

    it('should have empty permissions array', () => {
      const state = useAuthStore.getState()
      expect(state.permissions).toEqual([])
    })

    it('should have null role', () => {
      const state = useAuthStore.getState()
      expect(state.role).toBeNull()
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

    it('should set permissions from profile', () => {
      useAuthStore.getState().login(mockProfile)
      const state = useAuthStore.getState()
      expect(state.permissions).toHaveLength(3)
      expect(state.permissions).toContain('reviewcalls')
      expect(state.permissions).toContain('upload')
      expect(state.permissions).toContain('reports')
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

    it('should clear permissions on logout', () => {
      useAuthStore.getState().login(mockProfile)
      useAuthStore.getState().logout()
      const state = useAuthStore.getState()
      expect(state.permissions).toEqual([])
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

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one permission', () => {
      useAuthStore.getState().login(mockProfile)
      expect(useAuthStore.getState().hasAnyPermission(['reviewcalls', 'users'])).toBe(true)
    })

    it('should return false if user has none of the permissions', () => {
      useAuthStore.getState().login(mockProfile)
      expect(useAuthStore.getState().hasAnyPermission(['users', 'teams'])).toBe(false)
    })

    it('should return false for empty permission array', () => {
      useAuthStore.getState().login(mockProfile)
      expect(useAuthStore.getState().hasAnyPermission([])).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      expect(useAuthStore.getState().isLoading).toBe(false)
      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)
      useAuthStore.getState().setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('Role-Based Access Control (RBAC)', () => {
    it('should support Administrator role with full access', () => {
      const adminProfile: Profile = {
        id: 1,
        userId: 1,
        name: 'Admin',
        email: 'admin@aqua.demo',
        roleName: 'Administrator',
        permissions: ['users', 'scorecard', 'teams', 'companies', 'projects', 'roles', 'monitor', 'reports', 'exportinfo', 'upload', 'reviewcalls', 'score', 'notes', 'coachingcalls'] as Permission[],
      }

      useAuthStore.getState().login(adminProfile)
      const state = useAuthStore.getState()

      expect(state.hasPermission('users')).toBe(true)
      expect(state.hasPermission('upload')).toBe(true)
      expect(state.hasPermission('reports')).toBe(true)
      expect(state.hasPermission('teams')).toBe(true)
    })

    it('should support QA Analyst role with limited access', () => {
      const qaProfile: Profile = {
        id: 2,
        userId: 2,
        name: 'QA User',
        email: 'qa@aqua.demo',
        roleName: 'QA Analyst',
        permissions: ['monitor', 'reports', 'reviewcalls', 'score', 'notes'] as Permission[],
      }

      useAuthStore.getState().login(qaProfile)
      const state = useAuthStore.getState()

      expect(state.hasPermission('monitor')).toBe(true)
      expect(state.hasPermission('reviewcalls')).toBe(true)
      expect(state.hasPermission('users')).toBe(false)
      expect(state.hasPermission('teams')).toBe(false)
    })

    it('should support Supervisor role', () => {
      const supProfile: Profile = {
        id: 3,
        userId: 3,
        name: 'Supervisor',
        email: 'sup@aqua.demo',
        roleName: 'Supervisor',
        permissions: ['monitor', 'reports', 'reviewcalls', 'notes', 'coachingcalls'] as Permission[],
      }

      useAuthStore.getState().login(supProfile)
      const state = useAuthStore.getState()

      expect(state.hasPermission('monitor')).toBe(true)
      expect(state.hasPermission('coachingcalls')).toBe(true)
      expect(state.hasPermission('upload')).toBe(false)
    })
  })
})
