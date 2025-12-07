import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { SentimentAnalysis, SpeakerSentiment, SentimentType } from '@/types'
import { TrendingUp, TrendingDown, Minus, Headphones, User, Quote } from 'lucide-react'

interface SentimentPanelProps {
  sentimentData: SentimentAnalysis
  className?: string
}

/**
 * Trend configuration for visual indicators
 */
const trendConfig = {
  Increasing: {
    icon: TrendingUp,
    color: 'text-green-600',
    label: 'Improving',
  },
  Stable: {
    icon: Minus,
    color: 'text-slate-500',
    label: 'Stable',
  },
  Decreasing: {
    icon: TrendingDown,
    color: 'text-red-600',
    label: 'Declining',
  },
}

/**
 * Speaker configuration for styling
 */
const speakerConfig = {
  Agent: {
    icon: Headphones,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    progressColor: 'bg-blue-500',
  },
  Customer: {
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    progressColor: 'bg-purple-500',
  },
}

/**
 * Sentiment color configuration
 */
const sentimentColors: Record<SentimentType, string> = {
  Positive: 'text-green-600',
  Neutral: 'text-slate-500',
  Negative: 'text-red-600',
}

interface SpeakerSentimentCardProps {
  data: SpeakerSentiment
}

/**
 * SpeakerSentimentCard - Displays sentiment data for a single speaker
 */
function SpeakerSentimentCard({ data }: SpeakerSentimentCardProps) {
  const { speaker, averageScore = 0, trend, highlights = [] } = data || {}
  // Default to Agent if speaker is undefined or invalid
  const validSpeaker = speaker && speakerConfig[speaker] ? speaker : 'Agent'
  // Default to Stable if trend is undefined or invalid
  const validTrend = trend && trendConfig[trend] ? trend : 'Stable'
  const config = speakerConfig[validSpeaker]
  const trendInfo = trendConfig[validTrend]
  const SpeakerIcon = config.icon
  const TrendIcon = trendInfo.icon

  // Determine score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Header with speaker info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('rounded-full p-2', config.bgColor)}>
            <SpeakerIcon className={cn('h-5 w-5', config.color)} />
          </div>
          <span className={cn('font-semibold', config.color)}>{validSpeaker}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon className={cn('h-4 w-4', trendInfo.color)} />
          <span className={cn('text-xs font-medium', trendInfo.color)}>
            {trendInfo.label}
          </span>
        </div>
      </div>

      {/* Score display */}
      <div className="mb-4">
        <div className="mb-2 flex items-end gap-2">
          <span className={cn('text-3xl font-bold', getScoreColor(averageScore))}>
            {averageScore}
          </span>
          <span className="mb-1 text-sm text-slate-500">/ 100</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn('h-full transition-all', config.progressColor)}
            style={{ width: `${averageScore}%` }}
          />
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Key Moments
          </h4>
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md bg-white/60 p-2"
            >
              <Quote className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-600">{highlight.text}</p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Turn {highlight.turn}</span>
                  <span className={sentimentColors[highlight.sentiment] || 'text-slate-500'}>
                    {highlight.sentiment || 'Neutral'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * SentimentPanel - Displays sentiment analysis for a call
 *
 * Shows:
 * - Overall summary of the call sentiment
 * - Individual speaker sentiment scores with trends
 * - Key sentiment highlights from the conversation
 */
export function SentimentPanel({ sentimentData, className }: SentimentPanelProps) {
  const { sentiment = [], summary = '' } = sentimentData || {}

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-slate-700">Summary</h4>
          <p className="text-sm leading-relaxed text-slate-600">{summary}</p>
        </div>

        {/* Speaker sentiment cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {sentiment.map((speakerData) => (
            <SpeakerSentimentCard key={speakerData.speaker} data={speakerData} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * SentimentPanelSkeleton - Loading state for SentimentPanel
 */
export function SentimentPanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="mb-2 h-10 w-20" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
