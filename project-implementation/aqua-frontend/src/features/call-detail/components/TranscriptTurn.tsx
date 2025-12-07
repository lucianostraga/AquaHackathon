import { cn } from '@/lib/utils'
import type { DiarizationEntry, SentimentType } from '@/types'
import { User, Headphones } from 'lucide-react'

interface TranscriptTurnProps {
  entry: DiarizationEntry
  className?: string
}

/**
 * Sentiment color configuration for visual coding of transcript turns
 */
const sentimentConfig: Record<SentimentType, { bg: string; border: string; indicator: string }> = {
  Positive: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    indicator: 'bg-green-500',
  },
  Neutral: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    indicator: 'bg-slate-400',
  },
  Negative: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    indicator: 'bg-red-500',
  },
}

/**
 * Speaker configuration for visual distinction between agent and customer
 */
const speakerConfig = {
  Agent: {
    label: 'Agent',
    icon: Headphones,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  Customer: {
    label: 'Customer',
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
}

/**
 * TranscriptTurn - Displays a single turn in the call transcript
 *
 * Shows speaker identification, turn number, text content, and sentiment indicator.
 * The background color reflects the sentiment of the message.
 */
export function TranscriptTurn({ entry, className }: TranscriptTurnProps) {
  const { turnIndex, speaker, text, sentiment } = entry
  const sentimentStyle = sentimentConfig[sentiment]
  const speakerStyle = speakerConfig[speaker]
  const SpeakerIcon = speakerStyle.icon

  return (
    <div
      className={cn(
        'flex gap-4 rounded-lg border p-4 transition-colors',
        sentimentStyle.bg,
        sentimentStyle.border,
        className
      )}
    >
      {/* Turn number indicator */}
      <div className="flex flex-col items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
          {turnIndex}
        </span>
        {/* Sentiment indicator dot */}
        <span
          className={cn('h-2 w-2 rounded-full', sentimentStyle.indicator)}
          title={`${sentiment} sentiment`}
        />
      </div>

      {/* Content section */}
      <div className="flex-1">
        {/* Speaker badge */}
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1',
              speakerStyle.bgColor
            )}
          >
            <SpeakerIcon className={cn('h-3.5 w-3.5', speakerStyle.color)} />
            <span className={cn('text-xs font-medium', speakerStyle.color)}>
              {speakerStyle.label}
            </span>
          </div>
          <span className="text-xs text-slate-500">{sentiment}</span>
        </div>

        {/* Transcript text */}
        <p className="text-sm leading-relaxed text-slate-700">{text}</p>
      </div>
    </div>
  )
}

/**
 * TranscriptTurnSkeleton - Loading state for TranscriptTurn
 */
export function TranscriptTurnSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="flex-1">
        <div className="mb-2 h-6 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
