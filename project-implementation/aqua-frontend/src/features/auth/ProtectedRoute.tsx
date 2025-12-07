import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import type { Permission } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: Permission
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
