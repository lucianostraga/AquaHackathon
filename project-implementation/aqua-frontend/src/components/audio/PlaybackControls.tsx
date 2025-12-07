import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PlaybackControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onSkipBack: () => void
  onSkipForward: () => void
  disabled?: boolean
  className?: string
}

/**
 * PlaybackControls - Audio playback control buttons
 *
 * Includes:
 * - Skip back 10 seconds button
 * - Play/Pause toggle button (larger, primary)
 * - Skip forward 10 seconds button
 *
 * All buttons include tooltips for accessibility.
 */
export function PlaybackControls({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  disabled = false,
  className,
}: PlaybackControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Skip Back Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkipBack}
              disabled={disabled}
              className="h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              aria-label="Skip back 10 seconds"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Skip back 10s</p>
          </TooltipContent>
        </Tooltip>

        {/* Play/Pause Button - Primary action, larger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              onClick={onPlayPause}
              disabled={disabled}
              className={cn(
                'h-12 w-12 rounded-full shadow-md transition-all',
                'bg-blue-600 hover:bg-blue-700 active:scale-95',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white ml-0.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPlaying ? 'Pause' : 'Play'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Skip Forward Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkipForward}
              disabled={disabled}
              className="h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Skip forward 10s</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
