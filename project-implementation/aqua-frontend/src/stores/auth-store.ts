import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role, Permission, Profile } from '@/types'

interface AuthState {
  user: User | null
  role: Role | null
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (profile: Profile) => void
  logout: () => void
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,

      login: (profile: Profile) => {
        const user: User = {
          id: profile.userId,
          name: profile.name,
          email: profile.email,
          roleId: 0, // Will be set from profile
        }

        const role: Role = {
          id: 0,
          name: profile.roleName,
          permissions: profile.permissions,
        }

        set({
          user,
          role,
          permissions: profile.permissions,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          role: null,
          permissions: [],
          isAuthenticated: false,
        })
      },

      hasPermission: (permission: Permission) => {
        return get().permissions.includes(permission)
      },

      hasAnyPermission: (permissions: Permission[]) => {
        const userPermissions = get().permissions
        return permissions.some(p => userPermissions.includes(p))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'aqua-auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
