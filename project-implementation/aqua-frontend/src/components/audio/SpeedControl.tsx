import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Check } from 'lucide-react'
import { useState } from 'react'

interface SpeedControlProps {
  playbackRate: number
  onPlaybackRateChange: (rate: number) => void
  className?: string
}

/**
 * Available playback speed options
 */
const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x', description: 'Slow' },
  { value: 0.75, label: '0.75x', description: 'Slower' },
  { value: 1, label: '1x', description: 'Normal' },
  { value: 1.25, label: '1.25x', description: 'Faster' },
  { value: 1.5, label: '1.5x', description: 'Fast' },
  { value: 2, label: '2x', description: 'Very Fast' },
]

/**
 * SpeedControl - Playback speed selector
 *
 * Features:
 * - Compact button showing current speed
 * - Popover with speed options
 * - Visual indicator for selected speed
 * - Keyboard accessible
 */
export function SpeedControl({
  playbackRate,
  onPlaybackRateChange,
  className,
}: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectSpeed = (rate: number) => {
    onPlaybackRateChange(rate)
    setIsOpen(false)
  }

  // Format the current rate for display
  const currentLabel = playbackRate === 1 ? '1x' : `${playbackRate}x`

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex items-center', className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-2 font-mono text-xs font-medium',
                    'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    'border border-slate-200 rounded-md',
                    playbackRate !== 1 && 'text-blue-600 border-blue-200 bg-blue-50'
                  )}
                  aria-label={`Playback speed: ${currentLabel}`}
                >
                  {currentLabel}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Playback Speed</p>
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            side="top"
            align="center"
            className="w-40 p-1"
            sideOffset={8}
          >
            <div className="flex flex-col">
              <div className="px-2 py-1.5 text-xs font-medium text-slate-500 border-b border-slate-100 mb-1">
                Playback Speed
              </div>
              {SPEED_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectSpeed(option.value)}
                  className={cn(
                    'flex items-center justify-between px-2 py-2 text-sm rounded-md',
                    'transition-colors cursor-pointer',
                    'hover:bg-slate-100',
                    playbackRate === option.value && 'bg-blue-50 text-blue-700'
                  )}
                  role="menuitem"
                  aria-selected={playbackRate === option.value}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium w-10">
                      {option.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {option.description}
                    </span>
                  </div>
                  {playbackRate === option.value && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}

/**
 * SpeedControlCompact - Even more compact speed control
 *
 * Just cycles through speed options on click.
 */
export function SpeedControlCompact({
  playbackRate,
  onPlaybackRateChange,
  className,
}: SpeedControlProps) {
  const handleCycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.findIndex((o) => o.value === playbackRate)
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    onPlaybackRateChange(SPEED_OPTIONS[nextIndex].value)
  }

  const currentLabel = playbackRate === 1 ? '1x' : `${playbackRate}x`

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCycleSpeed}
            className={cn(
              'h-7 px-2 font-mono text-xs font-medium min-w-[40px]',
              'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              playbackRate !== 1 && 'text-blue-600 bg-blue-50',
              className
            )}
            aria-label={`Playback speed: ${currentLabel}. Click to change.`}
          >
            {currentLabel}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to change speed</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
