import { useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAudioStore } from '@/stores/audio-store'
import { Waveform, type SpeakerSegment, WaveformSkeleton } from './Waveform'
import { PlaybackControls } from './PlaybackControls'
import { VolumeControlInline } from './VolumeControl'
import { SpeedControl } from './SpeedControl'
import { TimeDisplay } from './TimeDisplay'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Headphones, Sparkles } from 'lucide-react'
import type { DiarizationEntry } from '@/types'
import { useState } from 'react'

interface AudioPlayerProps {
  audioUrl?: string | null
  callId?: string
  diarization?: DiarizationEntry[]
  className?: string
}

/**
 * Convert diarization entries to speaker segments for waveform regions
 *
 * This is a mock implementation that generates approximate timestamps.
 * In a real implementation, this would use actual timestamp data from the API.
 */
function diarizationToSegments(
  diarization: DiarizationEntry[],
  totalDuration: number
): SpeakerSegment[] {
  if (!diarization.length || totalDuration === 0) return []

  // Distribute segments evenly across the duration (mock implementation)
  const avgSegmentDuration = totalDuration / diarization.length

  return diarization.map((entry, index) => ({
    id: `segment-${entry.turnIndex}`,
    speaker: entry.speaker,
    startTime: index * avgSegmentDuration,
    endTime: (index + 1) * avgSegmentDuration,
    sentiment: entry.sentiment,
  }))
}

/**
 * AudioPlayer - Professional audio player with waveform visualization
 *
 * Features:
 * - Full waveform visualization with WaveSurfer.js
 * - Play/Pause, Skip back/forward controls
 * - Volume control with mute toggle
 * - Playback speed selector
 * - Time display (current / total)
 * - Speaker segment regions (Agent=blue, Customer=orange)
 * - Optional sentiment-colored regions
 * - Responsive design
 * - Accessible controls with tooltips
 *
 * Uses zustand audio-store for state management.
 */
export function AudioPlayer({
  audioUrl: propAudioUrl,
  callId,
  diarization = [],
  className,
}: AudioPlayerProps) {
  // Local state for sentiment toggle
  const [showSentiment, setShowSentiment] = useState(false)

  // Audio store state and actions
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    audioUrl: storeAudioUrl,
    setPlaying,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    setVolume,
    toggleMute,
    setAudioUrl,
    setCurrentCallId,
  } = useAudioStore()

  // Use prop URL or store URL
  const effectiveAudioUrl = propAudioUrl ?? storeAudioUrl

  // Convert diarization to speaker segments
  const speakerSegments = useMemo(
    () => diarizationToSegments(diarization, duration),
    [diarization, duration]
  )

  // Handlers
  const handleReady = useCallback(
    (audioDuration: number) => {
      setDuration(audioDuration)
      if (callId) {
        setCurrentCallId(callId)
      }
      if (propAudioUrl) {
        setAudioUrl(propAudioUrl)
      }
    },
    [callId, propAudioUrl, setDuration, setCurrentCallId, setAudioUrl]
  )

  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time)
    },
    [setCurrentTime]
  )

  const handleSeek = useCallback(
    (time: number) => {
      setCurrentTime(time)
    },
    [setCurrentTime]
  )

  const handleFinish = useCallback(() => {
    setPlaying(false)
    setCurrentTime(0)
  }, [setPlaying, setCurrentTime])

  const handlePlayPause = useCallback(() => {
    setPlaying(!isPlaying)
  }, [isPlaying, setPlaying])

  const handleSkipBack = useCallback(() => {
    const newTime = Math.max(0, currentTime - 10)
    setCurrentTime(newTime)
  }, [currentTime, setCurrentTime])

  const handleSkipForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 10)
    setCurrentTime(newTime)
  }, [currentTime, duration, setCurrentTime])

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume)
    },
    [setVolume]
  )

  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      setPlaybackRate(rate)
    },
    [setPlaybackRate]
  )

  const hasAudio = !!effectiveAudioUrl
  const hasDiarization = diarization.length > 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-4 space-y-4">
        {/* Header with title and sentiment toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Audio Player</span>
          </div>

          {hasDiarization && (
            <div className="flex items-center gap-2">
              <Switch
                id="sentiment-toggle"
                checked={showSentiment}
                onCheckedChange={setShowSentiment}
                className="scale-90"
              />
              <Label
                htmlFor="sentiment-toggle"
                className="text-xs text-slate-600 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Sentiment Colors
              </Label>
            </div>
          )}
        </div>

        {/* Waveform visualization */}
        <div className="relative">
          <Waveform
            audioUrl={effectiveAudioUrl}
            isPlaying={isPlaying}
            volume={volume}
            playbackRate={playbackRate}
            isMuted={isMuted}
            speakerSegments={speakerSegments}
            showSentimentColors={showSentiment}
            onReady={handleReady}
            onTimeUpdate={handleTimeUpdate}
            onSeek={handleSeek}
            onFinish={handleFinish}
          />

          {/* Legend for speaker colors */}
          {hasDiarization && duration > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/60" />
                <span className="text-slate-600">Agent</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/60" />
                <span className="text-slate-600">Customer</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Time display */}
          <TimeDisplay currentTime={currentTime} duration={duration} />

          {/* Center: Playback controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            disabled={!hasAudio}
          />

          {/* Right: Volume and speed controls */}
          <div className="flex items-center gap-3">
            <SpeedControl
              playbackRate={playbackRate}
              onPlaybackRateChange={handlePlaybackRateChange}
            />
            <VolumeControlInline
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={toggleMute}
            />
          </div>
        </div>

        {/* Sentiment legend (shown when sentiment colors are enabled) */}
        {showSentiment && hasDiarization && duration > 0 && (
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Sentiment:</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/70" />
              <span className="text-slate-600">Positive</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-400/30 border border-yellow-500/60" />
              <span className="text-slate-600">Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/70" />
              <span className="text-slate-600">Negative</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * AudioPlayerSkeleton - Loading state for AudioPlayer
 */
export function AudioPlayerSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-4 space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Waveform skeleton */}
        <WaveformSkeleton />

        {/* Controls skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-10 rounded bg-slate-200 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * AudioPlayerCompact - Compact version for smaller spaces
 */
export function AudioPlayerCompact({
  audioUrl,
  className,
}: {
  audioUrl?: string | null
  className?: string
}) {
  const {
    isPlaying,
    currentTime,
    duration,
    setPlaying,
    setCurrentTime,
  } = useAudioStore()

  const handlePlayPause = useCallback(() => {
    setPlaying(!isPlaying)
  }, [isPlaying, setPlaying])

  const handleSkipBack = useCallback(() => {
    setCurrentTime(Math.max(0, currentTime - 10))
  }, [currentTime, setCurrentTime])

  const handleSkipForward = useCallback(() => {
    setCurrentTime(Math.min(duration, currentTime + 10))
  }, [currentTime, duration, setCurrentTime])

  return (
    <div className={cn('flex items-center gap-4 p-3 bg-white rounded-lg border', className)}>
      {/* Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        disabled={!audioUrl}
      />

      {/* Progress bar (simplified) */}
      <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      {/* Time */}
      <TimeDisplay currentTime={currentTime} duration={duration} />
    </div>
  )
}

/**
 * AudioPlayerMini - Minimal floating player
 */
export function AudioPlayerMini({
  audioUrl,
  onExpand,
  className,
}: {
  audioUrl?: string | null
  onExpand?: () => void
  className?: string
}) {
  const { isPlaying, setPlaying, currentTime, duration } = useAudioStore()

  const handlePlayPause = useCallback(() => {
    setPlaying(!isPlaying)
  }, [isPlaying, setPlaying])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg border',
        'hover:shadow-xl transition-shadow cursor-pointer',
        className
      )}
      onClick={onExpand}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          handlePlayPause()
        }}
        className="h-8 w-8 rounded-full"
        disabled={!audioUrl}
      >
        {isPlaying ? (
          <span className="text-xs">II</span>
        ) : (
          <span className="text-xs ml-0.5">&#9654;</span>
        )}
      </Button>

      <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <TimeDisplay currentTime={currentTime} duration={duration} className="text-xs" />
    </div>
  )
}
