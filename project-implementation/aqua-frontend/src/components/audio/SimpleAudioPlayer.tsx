import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Headphones,
  AlertCircle
} from 'lucide-react'

interface SimpleAudioPlayerProps {
  audioUrl?: string | null
  className?: string
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Generate a deterministic, realistic-looking waveform pattern
function generateWaveformData(barCount: number, seed: number = 42): number[] {
  const bars: number[] = []
  let prevHeight = 50

  for (let i = 0; i < barCount; i++) {
    // Use deterministic pseudo-random based on seed and position
    const noise = Math.sin(seed * i * 0.1) * Math.cos(i * 0.3) * Math.sin(i * 0.7 + seed)
    // Create natural-looking audio envelope with peaks and valleys
    const envelope = Math.sin(i / barCount * Math.PI) * 0.3 + 0.7
    // Add some "conversation" pattern - alternating louder/quieter sections
    const conversation = Math.sin(i / 8) * 0.2 + 0.8
    // Smooth transition from previous bar
    const targetHeight = 25 + Math.abs(noise) * 50 * envelope * conversation
    const smoothedHeight = prevHeight * 0.3 + targetHeight * 0.7
    prevHeight = smoothedHeight
    bars.push(Math.max(15, Math.min(95, smoothedHeight)))
  }
  return bars
}

/**
 * SimpleAudioPlayer - Reliable HTML5 audio player
 *
 * Uses native browser audio for maximum compatibility.
 */
// Number of bars in the waveform
const BAR_COUNT = 60

export function SimpleAudioPlayer({ audioUrl, className }: SimpleAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Generate deterministic waveform data once based on audioUrl
  const waveformData = useMemo(() => {
    // Use audioUrl as seed for consistent waveform per file
    const seed = audioUrl ? audioUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 42
    return generateWaveformData(BAR_COUNT, seed)
  }, [audioUrl])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      setErrorMessage('Failed to load audio file')
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setHasError(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [audioUrl])

  // Reset state when URL changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setIsLoading(!!audioUrl)
    setHasError(false)
  }, [audioUrl])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  const handleSkipBack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, audio.currentTime - 10)
  }, [])

  const handleSkipForward = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.min(duration, audio.currentTime + 10)
  }, [duration])

  const handleVolumeChange = useCallback((value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)
    if (newVolume > 0) setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // No audio URL
  if (!audioUrl) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="p-4">
          <div className="flex items-center gap-2 text-slate-700 mb-4">
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Audio Player</span>
          </div>
          <div className="h-20 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
            <span className="text-sm text-slate-500">No audio file available</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-4 space-y-4">
        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Header */}
        <div className="flex items-center gap-2 text-slate-700">
          <Headphones className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Audio Player</span>
        </div>

        {/* Error state */}
        {hasError && (
          <div className="h-20 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-600">{errorMessage}</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="h-20 rounded-lg bg-slate-100 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
              <span>Loading audio...</span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {!isLoading && !hasError && (
          <div className="space-y-2">
            {/* Waveform-like visualization */}
            <div className="h-16 rounded-lg bg-slate-100 relative overflow-hidden">
              {/* Progress fill */}
              <div
                className="absolute inset-y-0 left-0 bg-blue-100"
                style={{ width: `${progress}%` }}
              />
              {/* Waveform bars */}
              <div className="absolute inset-0 flex items-center justify-around px-2">
                {waveformData.map((height, i) => {
                  const isPast = (i / waveformData.length) * 100 < progress
                  return (
                    <div
                      key={i}
                      className={cn(
                        'w-1 rounded-full transition-colors',
                        isPast ? 'bg-blue-500' : 'bg-slate-300'
                      )}
                      style={{ height: `${height}%` }}
                    />
                  )
                })}
              </div>
              {/* Clickable seek area */}
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center justify-between gap-4">
          {/* Time display */}
          <div className="text-sm font-mono text-slate-600 min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipBack}
              disabled={!duration}
              className="h-9 w-9"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              disabled={!duration || hasError}
              className="h-12 w-12 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipForward}
              disabled={!duration}
              className="h-9 w-9"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 min-w-[100px]">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
