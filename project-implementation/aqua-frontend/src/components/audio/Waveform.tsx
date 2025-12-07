import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'
import { cn } from '@/lib/utils'

/**
 * Speaker segment for waveform regions
 */
export interface SpeakerSegment {
  id: string
  speaker: 'Agent' | 'Customer'
  startTime: number
  endTime: number
  sentiment?: 'Positive' | 'Neutral' | 'Negative'
}

interface WaveformProps {
  audioUrl: string | null
  isPlaying: boolean
  volume: number
  playbackRate: number
  isMuted: boolean
  speakerSegments?: SpeakerSegment[]
  showSentimentColors?: boolean
  onReady?: (duration: number) => void
  onTimeUpdate?: (currentTime: number) => void
  onSeek?: (time: number) => void
  onFinish?: () => void
  onError?: (error: Error) => void
  className?: string
}

/**
 * Color configurations for speakers and sentiments
 */
const SPEAKER_COLORS = {
  Agent: {
    background: 'rgba(59, 130, 246, 0.2)',    // Blue
    border: 'rgba(59, 130, 246, 0.6)',
  },
  Customer: {
    background: 'rgba(249, 115, 22, 0.2)',    // Orange
    border: 'rgba(249, 115, 22, 0.6)',
  },
}

const SENTIMENT_COLORS = {
  Positive: {
    background: 'rgba(34, 197, 94, 0.25)',    // Green
    border: 'rgba(34, 197, 94, 0.7)',
  },
  Neutral: {
    background: 'rgba(250, 204, 21, 0.2)',    // Yellow
    border: 'rgba(250, 204, 21, 0.6)',
  },
  Negative: {
    background: 'rgba(239, 68, 68, 0.25)',    // Red
    border: 'rgba(239, 68, 68, 0.7)',
  },
}

/**
 * Waveform - WaveSurfer.js wrapper component
 *
 * Features:
 * - Full waveform visualization
 * - Click-to-seek functionality
 * - Speaker segment regions (Agent=blue, Customer=orange)
 * - Optional sentiment-colored regions
 * - Smooth playback visualization
 * - Loading and error states
 */
export function Waveform({
  audioUrl,
  isPlaying,
  volume,
  playbackRate,
  isMuted,
  speakerSegments = [],
  showSentimentColors = false,
  onReady,
  onTimeUpdate,
  onSeek,
  onFinish,
  onError,
  className,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const regionsPluginRef = useRef<RegionsPlugin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Memoize the regions plugin to avoid recreating
  const regionsPlugin = useMemo(() => RegionsPlugin.create(), [])

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || !audioUrl) {
      setIsLoading(false)
      return
    }

    // Small delay to ensure container is fully mounted
    const initTimeout = setTimeout(() => {
      if (!containerRef.current) return

      setIsLoading(true)
      setHasError(false)
      setErrorMessage('')

      try {
        const wavesurfer = WaveSurfer.create({
          container: containerRef.current,
          waveColor: '#94A3B8',           // Slate-400
          progressColor: '#3B82F6',       // Blue-500
          cursorColor: '#1E293B',         // Slate-800
          cursorWidth: 2,
          barWidth: 3,
          barGap: 2,
          barRadius: 3,
          height: 80,
          normalize: true,
          interact: true,
          hideScrollbar: true,
          plugins: [regionsPlugin],
        })

        wavesurferRef.current = wavesurfer
        regionsPluginRef.current = regionsPlugin

        // Event handlers
        wavesurfer.on('ready', () => {
          setIsLoading(false)
          const duration = wavesurfer.getDuration()
          onReady?.(duration)

          // Add speaker regions after audio is ready
          if (speakerSegments.length > 0) {
            addSpeakerRegions(speakerSegments, showSentimentColors)
          }
        })

        wavesurfer.on('audioprocess', (currentTime: number) => {
          onTimeUpdate?.(currentTime)
        })

        wavesurfer.on('seeking', (progress: number) => {
          const duration = wavesurfer.getDuration()
          const seekTime = progress * duration
          onSeek?.(seekTime)
        })

        wavesurfer.on('finish', () => {
          onFinish?.()
        })

        wavesurfer.on('error', (err: Error) => {
          setIsLoading(false)
          setHasError(true)
          setErrorMessage(err.message || 'Failed to load audio')
          onError?.(err)
        })

        // Load audio
        wavesurfer.load(audioUrl)
      } catch (err) {
        setIsLoading(false)
        setHasError(true)
        setErrorMessage('Failed to initialize audio player')
        console.error('WaveSurfer init error:', err)
      }
    }, 100)

    // Cleanup
    return () => {
      clearTimeout(initTimeout)
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
        wavesurferRef.current = null
        regionsPluginRef.current = null
      }
    }
  }, [audioUrl]) // Only recreate when URL changes

  // Add speaker regions helper
  const addSpeakerRegions = useCallback(
    (segments: SpeakerSegment[], useSentimentColors: boolean) => {
      const plugin = regionsPluginRef.current
      if (!plugin) return

      // Clear existing regions
      plugin.clearRegions()

      // Add new regions
      segments.forEach((segment) => {
        const colors = useSentimentColors && segment.sentiment
          ? SENTIMENT_COLORS[segment.sentiment]
          : SPEAKER_COLORS[segment.speaker]

        plugin.addRegion({
          id: segment.id,
          start: segment.startTime,
          end: segment.endTime,
          color: colors.background,
          drag: false,
          resize: false,
        })
      })
    },
    []
  )

  // Update regions when segments or sentiment display changes
  useEffect(() => {
    if (wavesurferRef.current && !isLoading && speakerSegments.length > 0) {
      addSpeakerRegions(speakerSegments, showSentimentColors)
    }
  }, [speakerSegments, showSentimentColors, isLoading, addSpeakerRegions])

  // Handle play/pause
  useEffect(() => {
    const ws = wavesurferRef.current
    if (!ws || isLoading) return

    if (isPlaying) {
      ws.play()
    } else {
      ws.pause()
    }
  }, [isPlaying, isLoading])

  // Handle volume changes
  useEffect(() => {
    const ws = wavesurferRef.current
    if (!ws) return

    ws.setVolume(isMuted ? 0 : volume)
  }, [volume, isMuted])

  // Handle playback rate changes
  useEffect(() => {
    const ws = wavesurferRef.current
    if (!ws) return

    ws.setPlaybackRate(playbackRate)
  }, [playbackRate])

  // Error state
  if (hasError) {
    return (
      <div className={cn('relative', className)}>
        <WaveformPlaceholder message={errorMessage || 'Failed to load audio'} isError />
      </div>
    )
  }

  // No audio URL state
  if (!audioUrl) {
    return (
      <div className={cn('relative', className)}>
        <WaveformPlaceholder message="No audio file available" />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Loading state shown on top of container */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <WaveformSkeleton />
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              <span className="font-medium">Loading waveform...</span>
            </div>
          </div>
        </div>
      )}
      {/* WaveSurfer container - always rendered */}
      <div
        ref={containerRef}
        className={cn(
          'w-full rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden cursor-pointer',
          'hover:from-slate-100 hover:to-slate-150 transition-all duration-200',
          'border border-slate-200 shadow-inner',
          isLoading && 'invisible'
        )}
        style={{ minHeight: 80 }}
        role="slider"
        aria-label="Audio waveform - click to seek"
        tabIndex={0}
      />
    </div>
  )
}

/**
 * WaveformSkeleton - Loading skeleton for waveform
 */
export function WaveformSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full h-20 rounded-lg overflow-hidden bg-slate-100', className)}>
      <div className="h-full flex items-center justify-center gap-[2px] px-4">
        {/* Generate random-height bars to simulate waveform */}
        {Array.from({ length: 80 }).map((_, i) => {
          // Create a pattern that looks like audio waveform
          const height = 20 + Math.sin(i * 0.3) * 15 + Math.random() * 20
          return (
            <div
              key={i}
              className="w-[2px] bg-slate-300 rounded-full animate-pulse"
              style={{
                height: `${height}%`,
                animationDelay: `${i * 20}ms`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * WaveformPlaceholder - Placeholder when no audio is available
 */
export function WaveformPlaceholder({
  message = 'No audio available',
  isError = false,
  className,
}: {
  message?: string
  isError?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'w-full h-20 rounded-lg flex items-center justify-center',
        'border-2 border-dashed',
        isError
          ? 'bg-red-50 border-red-200 text-red-600'
          : 'bg-slate-50 border-slate-200 text-slate-500',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}

/**
 * Hook to control waveform from parent component
 */
export function useWaveformControl() {
  const seekToRef = useRef<((time: number) => void) | null>(null)

  const seekTo = useCallback((time: number) => {
    seekToRef.current?.(time)
  }, [])

  return {
    seekTo,
    registerSeekTo: (fn: (time: number) => void) => {
      seekToRef.current = fn
    },
  }
}
