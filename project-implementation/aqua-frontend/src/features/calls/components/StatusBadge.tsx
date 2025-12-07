import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, Loader2 } from 'lucide-react'
import type { CallStatus } from '@/types'

interface StatusBadgeProps {
  status: CallStatus
  className?: string
}

const statusConfig: Record<
  CallStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    className: string
    icon: React.ElementType
  }
> = {
  Pending: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200',
    icon: Clock,
  },
  Processing: {
    label: 'Processing',
    variant: 'secondary',
    className: 'bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200',
    icon: Loader2,
  },
  Reviewed: {
    label: 'Reviewed',
    variant: 'secondary',
    className: 'bg-green-50 text-green-600 hover:bg-green-50 border-green-200',
    icon: CheckCircle2,
  },
}

/**
 * StatusBadge - Displays the processing status of a call
 *
 * Status types:
 * - Pending: Call is waiting to be processed (gray)
 * - Processing: Call is currently being analyzed (blue with spinner)
 * - Reviewed: Call has been fully processed and reviewed (green)
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Default to Pending if status is undefined or invalid
  const validStatus = status && statusConfig[status] ? status : 'Pending'
  const config = statusConfig[validStatus]
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'gap-1.5 font-medium border',
        config.className,
        className
      )}
    >
      <Icon
        className={cn(
          'h-3 w-3',
          validStatus === 'Processing' && 'animate-spin'
        )}
      />
      {config.label}
    </Badge>
  )
}
