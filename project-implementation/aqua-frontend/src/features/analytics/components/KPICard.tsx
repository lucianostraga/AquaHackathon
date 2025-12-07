import { type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * KPI variant types for styling
 */
type KPIVariant = 'default' | 'success' | 'warning' | 'danger'

/**
 * Props for the KPICard component
 */
interface KPICardProps {
  /** Title of the KPI metric */
  title: string
  /** Main value to display */
  value: string | number
  /** Optional subtitle or description */
  subtitle?: string
  /** Icon component to display */
  icon: LucideIcon
  /** Percentage change from previous period */
  change?: number
  /** Visual variant for the card */
  variant?: KPIVariant
  /** Whether data is loading */
  isLoading?: boolean
  /** Optional suffix for the value (e.g., '%', 'calls') */
  valueSuffix?: string
}

/**
 * Variant style configurations
 */
const variantStyles: Record<KPIVariant, { iconBg: string; iconColor: string; ringColor: string }> = {
  default: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    ringColor: 'ring-blue-100',
  },
  success: {
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    ringColor: 'ring-green-100',
  },
  warning: {
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    ringColor: 'ring-yellow-100',
  },
  danger: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    ringColor: 'ring-red-100',
  },
}

/**
 * KPICard - Displays a single KPI metric with icon and optional change indicator
 *
 * Features:
 * - Displays a large value with title and optional subtitle
 * - Shows percentage change from previous period
 * - Supports loading skeleton state
 * - Multiple color variants for different metric types
 */
export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  variant = 'default',
  isLoading = false,
  valueSuffix,
}: KPICardProps) {
  const styles = variantStyles[variant]

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {valueSuffix && (
              <span className="text-lg font-semibold text-slate-500">{valueSuffix}</span>
            )}
          </div>
          {/* Change indicator or subtitle */}
          {change !== undefined ? (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change >= 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              <span className="text-sm text-slate-400">vs last period</span>
            </div>
          ) : subtitle ? (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          ) : null}
        </div>

        {/* Icon */}
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl ring-4',
            styles.iconBg,
            styles.ringColor
          )}
        >
          <Icon className={cn('h-6 w-6', styles.iconColor)} />
        </div>
      </div>
    </Card>
  )
}

/**
 * KPICardSkeleton - Loading placeholder for KPI cards
 */
export function KPICardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </Card>
  )
}
