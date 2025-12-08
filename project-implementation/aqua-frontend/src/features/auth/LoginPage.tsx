import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/api'
import type { Permission } from '@/types'

interface Profile {
  id: string
  code: string
  name: string
  color: 'blue' | 'yellow' | 'green' | 'red' | 'gray'
  permissions: string[]
}

// Color mapping for profile badges
const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
}

/**
 * Determine the best redirect path based on user permissions
 */
function getDefaultRoute(permissions: Permission[]): string {
  if (permissions.includes('monitor')) return '/dashboard'
  if (permissions.includes('reviewcalls')) return '/calls'
  if (permissions.includes('reports')) return '/analytics'
  if (permissions.includes('upload')) return '/upload'
  if (permissions.includes('teams')) return '/teams'
  if (permissions.includes('companies')) return '/companies'
  if (permissions.includes('projects')) return '/projects'
  if (permissions.includes('roles')) return '/roles'
  return '/calls'
}

/**
 * LoginPage - Profile Selection matching Figma design
 *
 * Shows AQUA branding with 6 profile options in a 3x2 grid
 */
export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await apiClient.get('/Profiles')
      return response.data as Profile[]
    },
  })

  const handleProfileSelect = (profile: Profile) => {
    // Create normalized profile for auth store with all required fields
    const normalizedProfile = {
      id: parseInt(profile.id) || 0,
      userId: parseInt(profile.id) || 0,
      name: profile.name,
      email: `${profile.code.toLowerCase()}@aqua.demo`,
      roleName: profile.name,
      permissions: profile.permissions as Permission[],
    }
    login(normalizedProfile)
    const redirectPath = getDefaultRoute(normalizedProfile.permissions)
    navigate(redirectPath)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-3xl text-center">
        {/* AQUA Branding */}
        <h1 className="text-4xl font-bold text-slate-900 mb-2">AQUA</h1>
        <p className="text-lg font-medium text-slate-700 mb-1">
          Audit, Quality, User & Analytics
        </p>
        <p className="text-base text-slate-500 mb-8">
          The intelligent platform for performance and compliance
        </p>

        {/* Select Profile Label */}
        <p className="text-sm text-slate-600 mb-6">Select your profile</p>

        {/* Profile Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {profiles?.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border border-slate-200',
                  'hover:border-slate-300 hover:shadow-sm transition-all',
                  'bg-white text-left'
                )}
              >
                {/* Colored Circle with Code */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold',
                    colorClasses[profile.color] || 'bg-blue-500'
                  )}
                >
                  {profile.code}
                </div>
                {/* Profile Name */}
                <span className="text-sm font-medium text-slate-900">
                  {profile.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
