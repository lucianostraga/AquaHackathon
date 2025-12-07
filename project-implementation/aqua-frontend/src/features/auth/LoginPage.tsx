import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfilesQuery } from '@/hooks'
import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { normalizeProfile, type Permission } from '@/types'

/**
 * Determine the best redirect path based on user permissions
 */
function getDefaultRoute(permissions: Permission[]): string {
  // Priority order: Dashboard > Call Library > Analytics > Admin routes
  if (permissions.includes('monitor')) return '/dashboard'
  if (permissions.includes('reviewcalls')) return '/calls'
  if (permissions.includes('reports')) return '/analytics'
  if (permissions.includes('upload')) return '/upload'
  if (permissions.includes('teams')) return '/teams'
  if (permissions.includes('companies')) return '/companies'
  if (permissions.includes('projects')) return '/projects'
  if (permissions.includes('roles')) return '/roles'
  // Default fallback - go to calls (which will show demo data)
  return '/calls'
}

export function LoginPage() {
  const navigate = useNavigate()
  const { data: apiProfiles, isLoading } = useProfilesQuery()
  const login = useAuthStore(s => s.login)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  const handleLogin = () => {
    if (!selectedProfileId || !apiProfiles) return

    const apiProfile = apiProfiles.find(p => p.id === selectedProfileId)
    if (apiProfile) {
      const normalizedProfile = normalizeProfile(apiProfile)
      login(normalizedProfile)
      // Navigate based on user permissions
      const redirectPath = getDefaultRoute(normalizedProfile.permissions)
      navigate(redirectPath)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xl">
            A
          </div>
          <CardTitle className="text-2xl">Welcome to AQUA</CardTitle>
          <CardDescription>
            Select a profile to continue to the call center audit platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {apiProfiles?.map(profile => {
                  const displayName = `${profile.user.name} ${profile.user.lastName}`
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfileId(profile.id)}
                      className={cn(
                        'w-full rounded-lg border-2 p-4 text-left transition-colors',
                        selectedProfileId === profile.id
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                          {profile.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{displayName}</p>
                          <p className="text-sm text-slate-500">{profile.role.name}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <Button
                onClick={handleLogin}
                disabled={!selectedProfileId}
                className="mt-6 w-full"
                size="lg"
              >
                Continue
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
