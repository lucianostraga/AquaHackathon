import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from '@/components/ui/toaster'
import { useThemeStore } from '@/stores'
import { cn } from '@/lib/utils'

export function MainLayout() {
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'

  return (
    <div className={cn(
      "min-h-screen",
      isTeamMode ? "bg-[#0d0d0d]" : "bg-slate-50"
    )}>
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
