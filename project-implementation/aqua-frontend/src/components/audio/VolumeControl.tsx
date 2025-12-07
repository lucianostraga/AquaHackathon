import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Volume2, Volume1, VolumeX } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface VolumeControlProps {
  volume: number
  isMuted: boolean
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  className?: string
}

/**
 * Gets the appropriate volume icon based on level and mute state
 */
function getVolumeIcon(volume: number, isMuted: boolean) {
  if (isMuted || volume === 0) {
    return VolumeX
  }
  if (volume < 0.5) {
    return Volume1
  }
  return Volume2
}

/**
 * VolumeControl - Volume slider with mute toggle
 *
 * Features:
 * - Click icon to mute/unmute
 * - Hover/click to reveal volume slider in popover
 * - Visual feedback for current volume level
 * - Smooth slider interaction
 */
export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className,
}: VolumeControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const VolumeIcon = getVolumeIcon(volume, isMuted)
  const displayVolume = isMuted ? 0 : Math.round(volume * 100)

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0] / 100
    onVolumeChange(newVolume)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex items-center gap-2', className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    // If clicking while popover is open, toggle mute
                    if (isOpen) {
                      e.preventDefault()
                      onMuteToggle()
                    }
                  }}
                  className={cn(
                    'h-9 w-9 rounded-full transition-colors',
                    'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    isMuted && 'text-slate-400'
                  )}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  <VolumeIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMuted ? 'Unmute' : `Volume: ${displayVolume}%`}</p>
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            side="top"
            align="center"
            className="w-auto p-3"
            sideOffset={8}
          >
            <div className="flex flex-col items-center gap-3">
              {/* Volume percentage display */}
              <span className="text-xs font-medium text-slate-600 tabular-nums">
                {displayVolume}%
              </span>

              {/* Vertical volume slider */}
              <div className="h-24 flex items-center">
                <Slider
                  orientation="vertical"
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  className="h-full"
                  aria-label="Volume"
                />
              </div>

              {/* Mute button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onMuteToggle}
                className={cn(
                  'h-7 px-2 text-xs',
                  isMuted && 'text-red-600 hover:text-red-700'
                )}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}

/**
 * VolumeControlInline - Horizontal inline volume control
 *
 * Alternative layout with inline slider for more compact displays.
 */
export function VolumeControlInline({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className,
}: VolumeControlProps) {
  const VolumeIcon = getVolumeIcon(volume, isMuted)

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0] / 100
    onVolumeChange(newVolume)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex items-center gap-2 group', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMuteToggle}
              className={cn(
                'h-8 w-8 rounded-full transition-colors shrink-0',
                'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                isMuted && 'text-slate-400'
              )}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? 'Unmute' : 'Mute'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Inline slider - shows on hover or when interacting */}
        <div className="w-20 opacity-70 group-hover:opacity-100 transition-opacity">
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={handleVolumeChange}
            min={0}
            max={100}
            step={1}
            aria-label="Volume"
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
