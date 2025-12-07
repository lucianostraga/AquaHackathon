import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Call, FlagType } from '@/types'
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Flag } from 'lucide-react'
import { FlagBadge } from '@/features/calls/components/FlagBadge'
import { SentimentPanel, SentimentPanelSkeleton } from './SentimentPanel'
import { ScorecardPanel, ScorecardPanelSkeleton } from './ScorecardPanel'

interface SummaryTabProps {
  call: Call
  className?: string
}

/**
 * Calculate overall score from scorecard
 */
function calculateOverallScore(call: Call): {
  score: number
  maxScore: number
  percentage: number
  passCount: number
  failCount: number
} {
  const groups = call.scoreCard.groups
  const score = groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + q.score, 0),
    0
  )
  const maxScore = groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + q.maxPoint, 0),
    0
  )
  const passCount = groups.reduce(
    (sum, g) => sum + g.questions.filter((q) => q.result === 'Pass').length,
    0
  )
  const failCount = groups.reduce(
    (sum, g) => sum + g.questions.filter((q) => q.result === 'Fail').length,
    0
  )
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

  return { score, maxScore, percentage, passCount, failCount }
}

/**
 * Get color based on score percentage
 */
function getScoreColors(percentage: number): {
  text: string
  bg: string
  ring: string
} {
  if (percentage >= 80)
    return { text: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-500' }
  if (percentage >= 60)
    return { text: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-500' }
  return { text: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-500' }
}

/**
 * OverallScoreCard - Displays the prominent overall score
 */
function OverallScoreCard({ call }: { call: Call }) {
  const { score, maxScore, percentage, passCount, failCount } =
    calculateOverallScore(call)
  const colors = getScoreColors(percentage)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Overall Score</span>
          <FlagBadge flag={call.anomaly.flag} size="md" showLabel />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Large score display */}
          <div
            className={cn(
              'flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full ring-4',
              colors.bg,
              colors.ring
            )}
          >
            <div className="text-center">
              <span className={cn('text-4xl font-bold', colors.text)}>
                {percentage}
              </span>
              <span className={cn('text-lg', colors.text)}>%</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Points Earned</span>
              <span className="font-semibold text-slate-700">
                {score} / {maxScore}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {passCount} Passed
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  {failCount} Failed
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span>
                {call.scoreCard.groups.length} scorecard groups evaluated
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * AnomalyCard - Displays flag justifications and anomalies
 */
function AnomalyCard({ call }: { call: Call }) {
  const { flag, justification } = call.anomaly

  // Icon and styling based on flag type
  const flagConfig: Record<
    FlagType,
    { icon: typeof Flag; bgColor: string; borderColor: string; textColor: string }
  > = {
    Green: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
    },
    Yellow: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
    },
    Red: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
    },
  }

  const config = flagConfig[flag]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="h-5 w-5" />
          Anomaly Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {justification.length === 0 ? (
          <div
            className={cn(
              'rounded-lg border p-4',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn('h-5 w-5', config.textColor)} />
              <p className={cn('font-medium', config.textColor)}>
                No anomalies detected. This call meets all quality standards.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={cn(
                'rounded-lg border p-4',
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className={cn('h-5 w-5', config.textColor)} />
                <span className={cn('font-medium', config.textColor)}>
                  {justification.length} issue{justification.length > 1 ? 's' : ''}{' '}
                  detected
                </span>
              </div>
              <ul className="space-y-2">
                {justification.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className={cn(
                        'mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full',
                        flag === 'Red'
                          ? 'bg-red-500'
                          : flag === 'Yellow'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      )}
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * SummaryTab - Main summary view for call detail
 *
 * Displays:
 * - Overall score with visual indicator
 * - Anomaly/flag justifications
 * - Sentiment analysis panel
 * - Complete scorecard with collapsible groups
 */
export function SummaryTab({ call, className }: SummaryTabProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Top row with score and anomalies */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OverallScoreCard call={call} />
        <AnomalyCard call={call} />
      </div>

      {/* Sentiment Analysis */}
      <SentimentPanel sentimentData={call.sentimentAnalisys} />

      {/* Scorecard */}
      <ScorecardPanel scorecard={call.scoreCard} />
    </div>
  )
}

/**
 * SummaryTabSkeleton - Loading state for SummaryTab
 */
export function SummaryTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overall Score Skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-5 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </div>
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Panel Skeleton */}
      <SentimentPanelSkeleton />

      {/* Scorecard Skeleton */}
      <ScorecardPanelSkeleton />
    </div>
  )
}
