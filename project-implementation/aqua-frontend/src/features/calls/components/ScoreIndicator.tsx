import { cn } from '@/lib/utils'

interface ScoreIndicatorProps {
  score: number
  showBar?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Gets the color class based on score thresholds
 * - 80-100: Green (good)
 * - 60-79: Yellow (warning)
 * - 0-59: Red (critical)
 */
function getScoreColor(score: number): {
  text: string
  bg: string
  bar: string
} {
  if (score >= 80) {
    return {
      text: 'text-green-600',
      bg: 'bg-green-100',
      bar: 'bg-green-500',
    }
  }
  if (score >= 60) {
    return {
      text: 'text-yellow-600',
      bg: 'bg-yellow-100',
      bar: 'bg-yellow-500',
    }
  }
  return {
    text: 'text-red-600',
    bg: 'bg-red-100',
    bar: 'bg-red-500',
  }
}

const sizeConfig = {
  sm: {
    text: 'text-xs',
    bar: 'h-1',
    width: 'w-12',
    padding: 'px-1.5 py-0.5',
  },
  md: {
    text: 'text-sm',
    bar: 'h-1.5',
    width: 'w-16',
    padding: 'px-2 py-1',
  },
  lg: {
    text: 'text-base',
    bar: 'h-2',
    width: 'w-20',
    padding: 'px-2.5 py-1.5',
  },
}

/**
 * ScoreIndicator - Displays a call's overall score with visual feedback
 *
 * Features:
 * - Color-coded score display (green/yellow/red based on thresholds)
 * - Optional progress bar visualization
 * - Multiple size variants for different contexts
 */
export function ScoreIndicator({
  score,
  showBar = true,
  size = 'md',
  className,
}: ScoreIndicatorProps) {
  const colors = getScoreColor(score)
  const sizes = sizeConfig[size]
  const clampedScore = Math.min(100, Math.max(0, score))

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Score badge */}
      <div
        className={cn(
          'rounded-md font-semibold tabular-nums',
          colors.bg,
          colors.text,
          sizes.text,
          sizes.padding
        )}
      >
        {clampedScore}%
      </div>

      {/* Progress bar */}
      {showBar && (
        <div
          className={cn(
            'rounded-full bg-slate-200 overflow-hidden',
            sizes.bar,
            sizes.width
          )}
          role="progressbar"
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Score: ${clampedScore}%`}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              colors.bar
            )}
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * ScoreIndicatorCompact - A more compact version showing just the colored score
 */
export function ScoreIndicatorCompact({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const colors = getScoreColor(score)
  const clampedScore = Math.min(100, Math.max(0, score))

  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        colors.text,
        className
      )}
    >
      {clampedScore}%
    </span>
  )
}
