import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Phone,
  Upload,
  Users,
  Building2,
  FolderOpen,
  Shield,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore, useThemeStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Permission } from '@/types'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  permission?: Permission
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'monitor',
  },
  {
    title: 'Call Library',
    href: '/calls',
    icon: Phone,
    // No permission required - accessible to all authenticated users for demo
  },
  {
    title: 'Upload',
    href: '/upload',
    icon: Upload,
    permission: 'upload',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'reports',
  },
]

const adminNavItems: NavItem[] = [
  {
    title: 'Teams',
    href: '/teams',
    icon: Users,
    permission: 'teams',
  },
  {
    title: 'Companies',
    href: '/companies',
    icon: Building2,
    permission: 'companies',
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    permission: 'projects',
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: Shield,
    permission: 'roles',
  },
]

export function Sidebar() {
  const location = useLocation()
  const { user, role, hasPermission, logout } = useAuthStore()
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'

  const renderNavItem = (item: NavItem) => {
    // Check permission if required
    if (item.permission && !hasPermission(item.permission)) {
      return null
    }

    const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? isTeamMode
              ? 'bg-yellow-500/20 text-yellow-500'
              : 'bg-slate-100 text-slate-900'
            : isTeamMode
              ? 'text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-500'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
        aria-label={`Navigate to ${item.title}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        {item.title}
      </Link>
    )
  }

  const filteredMainNav = mainNavItems.filter(
    item => !item.permission || hasPermission(item.permission)
  )
  const filteredAdminNav = adminNavItems.filter(
    item => !item.permission || hasPermission(item.permission)
  )

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r",
        isTeamMode
          ? "border-gray-800 bg-[#0d0d0d]"
          : "border-slate-200 bg-white"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center gap-2 border-b px-6",
        isTeamMode ? "border-gray-800" : "border-slate-200"
      )}>
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg font-bold",
          isTeamMode ? "bg-yellow-500 text-black" : "bg-slate-900 text-white"
        )}>
          A
        </div>
        <span className={cn(
          "text-xl font-semibold",
          isTeamMode ? "text-yellow-500" : "text-slate-900"
        )}>AQUA</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {filteredMainNav.map(renderNavItem)}
        </div>

        {filteredAdminNav.length > 0 && (
          <>
            <Separator className={cn("my-4", isTeamMode && "bg-gray-800")} />
            <p className={cn(
              "mb-2 px-3 text-xs font-semibold uppercase tracking-wider",
              isTeamMode ? "text-gray-500" : "text-slate-400"
            )}>
              Administration
            </p>
            <div className="space-y-1">
              {filteredAdminNav.map(renderNavItem)}
            </div>
          </>
        )}
      </nav>

      {/* User section */}
      <div className={cn(
        "border-t p-4",
        isTeamMode ? "border-gray-800" : "border-slate-200"
      )}>
        <div className="mb-3 flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium",
            isTeamMode ? "bg-yellow-500/20 text-yellow-500" : "bg-slate-100 text-slate-600"
          )}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={cn(
              "truncate text-sm font-medium",
              isTeamMode ? "text-white" : "text-slate-900"
            )}>
              {user?.name || 'User'}
            </p>
            <p className={cn(
              "truncate text-xs",
              isTeamMode ? "text-gray-500" : "text-slate-500"
            )}>
              {role?.name || 'Role'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 justify-start",
              isTeamMode ? "text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10" : "text-slate-600"
            )}
            asChild
          >
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              isTeamMode ? "text-gray-300 hover:text-red-500" : "text-slate-600 hover:text-red-600"
            )}
            onClick={logout}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
