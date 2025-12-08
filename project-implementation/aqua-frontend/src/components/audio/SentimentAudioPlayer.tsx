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
  AlertCircle,
  User,
  Bot,
  Mic,
} from 'lucide-react'
import type { DiarizationEntry } from '@/types'

interface SentimentAudioPlayerProps {
  audioUrl?: string | null
  diarization?: DiarizationEntry[]
  className?: string
  onTimeUpdate?: (time: number) => void
  onTurnClick?: (turnIndex: number) => void
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Sentiment colors matching the design system
const SENTIMENT_COLORS = {
  Positive: {
    agent: '#009951', // green
    customer: '#22c55e', // lighter green
    bg: 'bg-green-500',
  },
  Neutral: {
    agent: '#3b82f6', // blue
    customer: '#8b5cf6', // purple
    bg: 'bg-blue-500',
  },
  Negative: {
    agent: '#f97316', // orange for agent
    customer: '#ec221f', // red for customer
    bg: 'bg-red-500',
  },
}


/**
 * Generate waveform data based on diarization - creates realistic audio envelope
 * that reflects conversation patterns with sentiment-based intensity
 */
function generateSentimentWaveform(
  diarization: DiarizationEntry[],
  barCount: number = 100
): Array<{
  height: number
  speaker: 'Agent' | 'Customer'
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  turnIndex: number
}> {
  if (!diarization || diarization.length === 0) {
    // Generate default waveform if no diarization
    return Array.from({ length: barCount }, (_, i) => ({
      height: 30 + Math.sin(i * 0.3) * 20 + Math.random() * 30,
      speaker: i % 2 === 0 ? 'Agent' : 'Customer',
      sentiment: 'Neutral' as const,
      turnIndex: Math.floor(i / (barCount / 10)),
    }))
  }

  const bars: Array<{
    height: number
    speaker: 'Agent' | 'Customer'
    sentiment: 'Positive' | 'Neutral' | 'Negative'
    turnIndex: number
  }> = []

  // Calculate total text length for proportional distribution
  const totalLength = diarization.reduce((sum, d) => sum + d.text.length, 0)

  let barIndex = 0
  diarization.forEach((entry) => {
    // Number of bars proportional to text length
    const entryBars = Math.max(2, Math.round((entry.text.length / totalLength) * barCount))

    // Generate bars for this turn with natural audio envelope
    for (let i = 0; i < entryBars && barIndex < barCount; i++) {
      // Create natural speech pattern - louder in middle, quieter at edges
      const position = i / entryBars
      const envelope = Math.sin(position * Math.PI) * 0.6 + 0.4

      // Sentiment affects intensity
      const sentimentMultiplier =
        entry.sentiment === 'Negative' ? 1.2 : // More intense for negative
        entry.sentiment === 'Positive' ? 1.0 : 0.8 // Calmer for neutral

      // Add some natural variation
      const noise = Math.sin(barIndex * 0.5) * Math.cos(barIndex * 0.3) * 15

      const height = Math.max(15, Math.min(95,
        40 * envelope * sentimentMultiplier + noise + Math.random() * 20
      ))

      bars.push({
        height,
        speaker: entry.speaker,
        sentiment: entry.sentiment,
        turnIndex: entry.turnIndex,
      })
      barIndex++
    }
  })

  // Fill remaining bars if needed
  while (bars.length < barCount) {
    const lastEntry = diarization[diarization.length - 1]
    bars.push({
      height: 25 + Math.random() * 20,
      speaker: lastEntry?.speaker || 'Agent',
      sentiment: lastEntry?.sentiment || 'Neutral',
      turnIndex: lastEntry?.turnIndex || 0,
    })
  }

  return bars.slice(0, barCount)
}

/**
 * SentimentAudioPlayer - Sophisticated audio player with sentiment visualization
 *
 * Features:
 * - Waveform colored by speaker (Agent=blue, Customer=purple)
 * - Sentiment intensity (height and color saturation)
 * - Click-to-seek on waveform
 * - Timeline markers for speaker turns
 * - Playhead indicator
 * - Volume control with mute toggle
 */
const BAR_COUNT = 100

export function SentimentAudioPlayer({
  audioUrl,
  diarization = [],
  className,
  onTimeUpdate,
  onTurnClick,
}: SentimentAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  // Generate waveform data based on diarization
  const waveformData = useMemo(
    () => generateSentimentWaveform(diarization, BAR_COUNT),
    [diarization]
  )

  // Calculate which turn is currently playing
  const currentTurn = useMemo(() => {
    if (duration === 0) return null
    const progress = currentTime / duration
    const barIndex = Math.floor(progress * BAR_COUNT)
    return waveformData[barIndex]?.turnIndex ?? null
  }, [currentTime, duration, waveformData])

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
      onTimeUpdate?.(audio.currentTime)
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
  }, [audioUrl, onTimeUpdate])

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

  const handleWaveformClick = useCallback(
    (barIndex: number) => {
      const audio = audioRef.current
      if (!audio || !duration) return

      const newTime = (barIndex / BAR_COUNT) * duration
      audio.currentTime = newTime
      setCurrentTime(newTime)

      // Notify about turn click
      const turnIndex = waveformData[barIndex]?.turnIndex
      if (turnIndex !== undefined) {
        onTurnClick?.(turnIndex)
      }
    },
    [duration, waveformData, onTurnClick]
  )

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
  const currentBarIndex = Math.floor((progress / 100) * BAR_COUNT)

  // Get bar color based on speaker and sentiment
  const getBarColor = (bar: typeof waveformData[0], isPast: boolean, isHovered: boolean) => {
    const baseColor = SENTIMENT_COLORS[bar.sentiment][bar.speaker.toLowerCase() as 'agent' | 'customer']

    if (isHovered) {
      return baseColor
    }
    if (isPast) {
      return baseColor
    }
    // Future bars are muted
    return bar.speaker === 'Agent' ? '#93c5fd' : '#c4b5fd'
  }

  // No audio URL - show placeholder
  if (!audioUrl) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="p-4">
          <div className="flex items-center gap-2 text-slate-700 mb-4">
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Audio Player</span>
            <span className="text-xs text-slate-500 ml-auto">Sentiment Analysis</span>
          </div>
          <div className="h-24 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
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

        {/* Header with legend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Audio Player</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-slate-600">Agent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-slate-600">Customer</span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-500">+</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-500">~</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-slate-500">-</span>
              </span>
            </div>
          </div>
        </div>

        {/* Error state */}
        {hasError && (
          <div className="h-24 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-600">{errorMessage}</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="h-24 rounded-lg bg-slate-100 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
              <span>Loading audio...</span>
            </div>
          </div>
        )}

        {/* Waveform visualization */}
        {!isLoading && !hasError && (
          <div className="space-y-2">
            {/* Main waveform */}
            <div
              ref={waveformRef}
              className="h-24 rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 relative overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const barIndex = Math.floor((x / rect.width) * BAR_COUNT)
                handleWaveformClick(barIndex)
              }}
            >
              {/* Playhead line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-20 transition-all duration-100"
                style={{ left: `${progress}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rounded-full" />
              </div>

              {/* Waveform bars */}
              <div className="absolute inset-0 flex items-center justify-around px-1">
                {waveformData.map((bar, i) => {
                  const isPast = i < currentBarIndex
                  const isHovered = hoveredBar === i
                  const isCurrent = i === currentBarIndex
                  const color = getBarColor(bar, isPast, isHovered)

                  return (
                    <div
                      key={i}
                      className={cn(
                        'relative transition-all duration-75 rounded-full',
                        isCurrent && 'ring-2 ring-slate-900 ring-offset-1'
                      )}
                      style={{
                        width: '3px',
                        height: `${bar.height}%`,
                        backgroundColor: color,
                        opacity: isPast || isHovered ? 1 : 0.5,
                        transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                      }}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  )
                })}
              </div>

              {/* Turn markers at top */}
              <div className="absolute top-0 left-0 right-0 h-2 flex">
                {diarization.map((entry, i) => {
                  const startPercent = (i / diarization.length) * 100
                  const width = 100 / diarization.length
                  const isCurrentTurn = currentTurn === entry.turnIndex

                  return (
                    <div
                      key={i}
                      className={cn(
                        'h-full transition-all',
                        entry.speaker === 'Agent' ? 'bg-blue-400' : 'bg-purple-400',
                        isCurrentTurn && 'ring-1 ring-slate-900'
                      )}
                      style={{
                        left: `${startPercent}%`,
                        width: `${width}%`,
                        opacity: isCurrentTurn ? 1 : 0.5,
                      }}
                      title={`Turn ${entry.turnIndex}: ${entry.speaker} - ${entry.sentiment}`}
                    />
                  )
                })}
              </div>
            </div>

            {/* Hover tooltip */}
            {hoveredBar !== null && waveformData[hoveredBar] && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <Mic className="h-3 w-3" />
                <span className={cn(
                  'font-medium',
                  waveformData[hoveredBar].speaker === 'Agent' ? 'text-blue-600' : 'text-purple-600'
                )}>
                  {waveformData[hoveredBar].speaker}
                </span>
                <span>•</span>
                <span className={cn(
                  'font-medium',
                  waveformData[hoveredBar].sentiment === 'Positive' ? 'text-green-600' :
                  waveformData[hoveredBar].sentiment === 'Negative' ? 'text-red-600' :
                  'text-slate-600'
                )}>
                  {waveformData[hoveredBar].sentiment}
                </span>
                <span>•</span>
                <span>Turn {waveformData[hoveredBar].turnIndex}</span>
              </div>
            )}
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center justify-between gap-4">
          {/* Time display */}
          <div className="text-sm font-mono text-slate-600 min-w-[90px]">
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
              title="Skip back 10s"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              disabled={!duration || hasError}
              className="h-12 w-12 rounded-full bg-slate-900 hover:bg-slate-800"
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
              title="Skip forward 10s"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 min-w-[110px]">
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

        {/* Hidden seek slider for accessibility */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="sr-only"
        />
      </div>
    </Card>
  )
}

export default SentimentAudioPlayer
