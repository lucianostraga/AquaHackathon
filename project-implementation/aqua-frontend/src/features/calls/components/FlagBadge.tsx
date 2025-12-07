import { cn } from '@/lib/utils'
import type { FlagType } from '@/types'

interface FlagBadgeProps {
  flag: FlagType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const flagConfig: Record<FlagType, { color: string; bgColor: string; label: string }> = {
  Green: {
    color: '#22C55E',
    bgColor: 'bg-green-50',
    label: 'Good',
  },
  Yellow: {
    color: '#EAB308',
    bgColor: 'bg-yellow-50',
    label: 'Warning',
  },
  Red: {
    color: '#EF4444',
    bgColor: 'bg-red-50',
    label: 'Critical',
  },
}

const sizeConfig = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

/**
 * FlagBadge - Visual indicator for call quality flags
 *
 * Displays a colored dot representing the call's quality assessment:
 * - Green: Good quality call
 * - Yellow: Warning - needs attention
 * - Red: Critical - requires immediate review
 */
export function FlagBadge({
  flag,
  size = 'md',
  showLabel = false,
  className
}: FlagBadgeProps) {
  // Default to Green if flag is undefined or invalid
  const validFlag = flag && flagConfig[flag] ? flag : 'Green'
  const config = flagConfig[validFlag]

  if (showLabel) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-2.5 py-1',
          config.bgColor,
          className
        )}
      >
        <span
          className={cn('rounded-full', sizeConfig[size])}
          style={{ backgroundColor: config.color }}
          aria-hidden="true"
        />
        <span
          className="text-xs font-medium"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      title={`${validFlag} flag - ${config.label}`}
    >
      <span
        className={cn(
          'rounded-full shadow-sm',
          sizeConfig[size]
        )}
        style={{
          backgroundColor: config.color,
          boxShadow: `0 0 0 2px ${config.color}40`,
        }}
        aria-label={`${validFlag} flag`}
      />
    </div>
  )
}
