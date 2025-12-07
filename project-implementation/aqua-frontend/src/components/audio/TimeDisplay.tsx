import { cn } from '@/lib/utils'

interface TimeDisplayProps {
  currentTime: number
  duration: number
  className?: string
}

/**
 * Formats seconds into MM:SS format
 */
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * TimeDisplay - Shows current playback time and total duration
 *
 * Displays time in MM:SS / MM:SS format with subtle styling
 * that fits the overall audio player design.
 */
export function TimeDisplay({ currentTime, duration, className }: TimeDisplayProps) {
  return (
    <div className={cn('flex items-center gap-1 font-mono text-sm', className)}>
      <span className="min-w-[40px] text-slate-900 font-medium">
        {formatTime(currentTime)}
      </span>
      <span className="text-slate-400">/</span>
      <span className="min-w-[40px] text-slate-500">
        {formatTime(duration)}
      </span>
    </div>
  )
}
