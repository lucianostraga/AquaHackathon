import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores'

interface HeaderProps {
  title?: string
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export function Header({ title, showSearch = false, onSearch }: HeaderProps) {
  const unreadNotificationCount = useAppStore(s => s.unreadNotificationCount)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left side - Title or Search */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        )}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search calls..."
              className="w-80 pl-10"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Right side - Notifications */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadNotificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {unreadNotificationCount === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No new notifications
              </div>
            ) : (
              <>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">Call processing complete</span>
                    <span className="text-xs text-slate-500">
                      Call #12345 has been analyzed
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-blue-600">
                  View all notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
