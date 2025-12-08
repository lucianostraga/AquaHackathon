import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Call } from '@/types'
import { Bot, Smile, Frown, Settings, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react'

interface SummaryTabProps {
  call: Call
  className?: string
}

/**
 * Calculate scores from scorecard groups
 */
function calculateScores(call: Call) {
  const groups = call.scoreCard.groups

  // Calculate per-group scores
  const groupScores = groups.map(g => {
    const groupScore = g.questions.reduce((sum, q) => sum + q.score, 0)
    const groupMax = g.questions.reduce((sum, q) => sum + q.maxPoint, 0)
    const percentage = groupMax > 0 ? Math.round((groupScore / groupMax) * 100) : 0
    return {
      name: g.groupName.replace(/_/g, ' '),
      aiScore: percentage,
      weight: Math.round(groupMax / groups.reduce((s, grp) => s + grp.questions.reduce((qs, q) => qs + q.maxPoint, 0), 0) * 100),
      finalScore: percentage, // Same as AI for now, could be overridden
    }
  })

  // Calculate overall
  const totalScore = groups.reduce((sum, g) => sum + g.questions.reduce((s, q) => s + q.score, 0), 0)
  const maxScore = groups.reduce((sum, g) => sum + g.questions.reduce((s, q) => s + q.maxPoint, 0), 0)
  const overallPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return { groupScores, overallPercentage, totalScore, maxScore }
}

/**
 * Calculate sentiment distribution from diarization
 */
function calculateSentimentDistribution(call: Call) {
  const diarization = call.transcription.diarization
  const total = diarization.length

  // Count sentiments from customer turns
  const customerTurns = diarization.filter(d => d.speaker === 'Customer')

  const negativeCount = customerTurns.filter(d => d.sentiment === 'Negative').length
  const neutralCount = customerTurns.filter(d => d.sentiment === 'Neutral').length
  const positiveCount = customerTurns.filter(d => d.sentiment === 'Positive').length
  const customerTotal = customerTurns.length

  // Distribution percentages (matching Figma categories)
  const sadPercent = customerTotal > 0 ? Math.round((negativeCount * 0.5 / customerTotal) * 100) : 0
  const upsetPercent = customerTotal > 0 ? Math.round((negativeCount * 0.5 / customerTotal) * 100) : 0
  const calmPercent = customerTotal > 0 ? Math.round((neutralCount / customerTotal) * 100) : 0
  const happyPercent = customerTotal > 0 ? Math.round((positiveCount * 0.5 / customerTotal) * 100) : 0
  const veryHappyPercent = customerTotal > 0 ? Math.round((positiveCount * 0.5 / customerTotal) * 100) : 0

  // Get customer sentiment data
  const customerSentiment = call.sentimentAnalisys.sentiment.find(s => s.speaker === 'Customer')
  const agentSentiment = call.sentimentAnalisys.sentiment.find(s => s.speaker === 'Agent')

  // Determine overall sentiment
  const avgScore = customerSentiment?.averageScore || 3
  const overall = avgScore >= 4 ? 'Positive' : avgScore >= 3 ? 'Neutral' : 'Negative'
  const trend = customerSentiment?.trend || 'Stable'

  return {
    sadPercent,
    upsetPercent,
    calmPercent,
    happyPercent,
    veryHappyPercent,
    overall,
    trend,
    customerEmotion: getCustomerEmotionDescription(diarization),
    agentTone: getAgentToneDescription(agentSentiment?.averageScore || 4),
    totalTurns: total,
  }
}

function getCustomerEmotionDescription(diarization: Call['transcription']['diarization']): string {
  const customerTurns = diarization.filter(d => d.speaker === 'Customer')
  if (customerTurns.length === 0) return 'No customer data'

  const firstHalf = customerTurns.slice(0, Math.ceil(customerTurns.length / 2))
  const secondHalf = customerTurns.slice(Math.ceil(customerTurns.length / 2))

  const firstNegative = firstHalf.filter(t => t.sentiment === 'Negative').length
  const secondPositive = secondHalf.filter(t => t.sentiment === 'Positive').length

  if (firstNegative > 0 && secondPositive > 0) {
    return 'frustration early, satisfaction at close'
  } else if (secondPositive > firstNegative) {
    return 'satisfaction throughout'
  } else if (firstNegative > secondPositive) {
    return 'frustration throughout'
  }
  return 'neutral throughout'
}

function getAgentToneDescription(avgScore: number): string {
  if (avgScore >= 4.5) return 'calm and confident'
  if (avgScore >= 4) return 'professional and helpful'
  if (avgScore >= 3) return 'neutral'
  return 'needs improvement'
}

/**
 * Extract call summary details from baseCallDetails
 */
function extractCallDetails(call: Call) {
  const details = (call as any).baseCallDetails || []
  const getDetail = (name: string) => details.find((d: any) => d.name === name)?.value

  const topicDriver = getDetail('TopContactDriver') || 'General inquiry'
  const resolution = getDetail('Resolution')
  const language = getDetail('Language') || 'English'

  // Parse topic from TopContactDriver (format: "Issue > Category > Resolution")
  const topicParts = topicDriver.split(' > ')
  const topic = topicParts[0] || 'General inquiry'

  return {
    topic,
    resolution: resolution === 'True' || resolution === true,
    language,
    topicDriver,
  }
}

/**
 * AI Summary Card - Shows call summary and key details
 */
function AISummaryCard({ call }: { call: Call }) {
  const { topic, resolution } = extractCallDetails(call)
  const sentimentSummary = call.sentimentAnalisys.summary

  // Derive tone from sentiment analysis
  const customerSentiment = call.sentimentAnalisys.sentiment.find(s => s.speaker === 'Customer')
  const trend = customerSentiment?.trend || 'Stable'
  const tone = trend === 'Increasing' ? 'Positive and reassuring' : trend === 'Stable' ? 'Professional' : 'Challenging'

  // Check for escalation indicators in anomaly justifications
  const hasEscalation = call.anomaly.justification.some(j =>
    j.toLowerCase().includes('escalat') || j.toLowerCase().includes('transfer')
  )

  // Duration impact based on resolution
  const durationImpact = resolution ? 'Normal' : 'Extended due to unresolved issues'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bot className="h-5 w-5 text-slate-600" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          {sentimentSummary}
        </p>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">Immediate Summarization:</p>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><span className="font-medium">Topic:</span> {topic}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>
                <span className="font-medium">Resolution:</span>{' '}
                {resolution ? (
                  <span className="text-green-600">✓ Completed</span>
                ) : (
                  <span className="text-red-600">✗ Not resolved</span>
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><span className="font-medium">Tone:</span> {tone}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><span className="font-medium">Escalation:</span> {hasEscalation ? 'Yes' : 'No'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><span className="font-medium">Duration impact:</span> {durationImpact}</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Customer Sentiment Overview Card - Shows sentiment distribution and analysis
 */
function CustomerSentimentCard({ call }: { call: Call }) {
  const sentiment = calculateSentimentDistribution(call)
  const trendArrow = sentiment.trend === 'Increasing' ? '→' : sentiment.trend === 'Stable' ? '→' : '→'
  const trendLabel = sentiment.trend === 'Increasing' ? 'Recovered' : sentiment.trend === 'Stable' ? 'Stable' : 'Declined'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Smile className="h-5 w-5 text-slate-600" />
          Customer Sentiment Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emoji scale */}
        <div className="flex items-center justify-between px-2">
          <Frown className="h-5 w-5 text-red-400" />
          <div className="flex-1 flex justify-between px-4">
            {[0, 2, 4, 6, 8, 10, 12].map((num) => (
              <span key={num} className="text-xs text-slate-400">{num}</span>
            ))}
          </div>
          <Smile className="h-5 w-5 text-green-500" />
        </div>

        {/* Sentiment distribution bar */}
        <div className="flex h-4 rounded-full overflow-hidden">
          <div
            className="bg-red-500"
            style={{ width: `${sentiment.sadPercent}%` }}
            title={`Sad: ${sentiment.sadPercent}%`}
          />
          <div
            className="bg-orange-400"
            style={{ width: `${sentiment.upsetPercent}%` }}
            title={`Upset: ${sentiment.upsetPercent}%`}
          />
          <div
            className="bg-yellow-400"
            style={{ width: `${sentiment.calmPercent}%` }}
            title={`Calm: ${sentiment.calmPercent}%`}
          />
          <div
            className="bg-green-400"
            style={{ width: `${sentiment.happyPercent}%` }}
            title={`Happy: ${sentiment.happyPercent}%`}
          />
          <div
            className="bg-green-600"
            style={{ width: `${sentiment.veryHappyPercent}%` }}
            title={`Very Happy: ${sentiment.veryHappyPercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-600">Sad {sentiment.sadPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-slate-600">Upset {sentiment.upsetPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-slate-600">Calm {sentiment.calmPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-slate-600">Happy {sentiment.happyPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-slate-600">{sentiment.veryHappyPercent}%</span>
          </div>
        </div>

        {/* Summary text */}
        <div className="space-y-1 text-sm">
          <p><span className="font-medium text-slate-900">Overall:</span> <span className="text-slate-700">{sentiment.overall}</span></p>
          <p><span className="font-medium text-slate-900">Trend:</span> <span className="text-slate-700">Neutral {trendArrow} {sentiment.overall} ({trendLabel})</span></p>
          <p><span className="font-medium text-slate-900">Customer emotion:</span> <span className="text-slate-700">{sentiment.customerEmotion}</span></p>
          <p><span className="font-medium text-slate-900">Agent tone:</span> <span className="text-slate-700">{sentiment.agentTone}</span></p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * AI Scoring Breakdown Card - Shows scoring table with progress bars
 */
function AIScoringBreakdownCard({ call }: { call: Call }) {
  const { groupScores, overallPercentage } = calculateScores(call)

  // Calculate confidence (average of non-zero scores)
  const nonZeroScores = groupScores.filter(g => g.aiScore > 0)
  const confidence = nonZeroScores.length > 0
    ? (nonZeroScores.reduce((sum, g) => sum + g.aiScore, 0) / nonZeroScores.length / 100).toFixed(2)
    : '0.00'

  // Final score (for demo, add some points to simulate override)
  const finalScore = Math.min(100, overallPercentage + 7)
  const scoreDiff = finalScore - overallPercentage

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Settings className="h-5 w-5 text-slate-600" />
          AI Scoring Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scoring table */}
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left font-medium text-slate-600 py-2">Group</th>
                <th className="text-center font-medium text-slate-600 py-2 w-16">AI</th>
                <th className="text-center font-medium text-slate-600 py-2 w-16">Weight</th>
                <th className="text-right font-medium text-slate-600 py-2 w-24">Final (%)</th>
              </tr>
            </thead>
            <tbody>
              {groupScores.map((group, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{group.name}</td>
                  <td className="py-2 text-center text-slate-900 font-medium">{group.aiScore}</td>
                  <td className="py-2 text-center text-slate-600">{group.weight}%</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            group.finalScore >= 80 ? 'bg-green-500' :
                            group.finalScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${group.finalScore}%` }}
                        />
                      </div>
                      <span className="text-slate-900 font-medium w-8 text-right">{group.finalScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary stats */}
        <div className="space-y-1 pt-2 border-t border-slate-200 text-sm">
          <p>
            <span className="text-slate-600">Overall AI Score:</span>{' '}
            <span className="font-semibold text-slate-900">{overallPercentage}</span>{' '}
            <span className="text-slate-600">Final Score:</span>{' '}
            <span className="font-semibold text-green-600">{finalScore}</span>{' '}
            <CheckCircle className="inline h-4 w-4 text-green-600" />
          </p>
          <p className="text-slate-600">
            AI Confidence Average: <span className="font-medium text-slate-900">{confidence}</span>
          </p>
          <p className="text-slate-600">
            Agent's empathy <span className="font-medium text-green-600">+{scoreDiff}%</span> above team average
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Detected Anomalies Card - Shows list of detected issues
 */
function DetectedAnomaliesCard({ call }: { call: Call }) {
  const { flag, justification } = call.anomaly

  // Parse anomalies - try to extract turn numbers from text or assign sequentially
  const anomalies = justification.map((text, index) => {
    // Try to find turn reference in text
    const turnMatch = text.match(/turn\s*(\d+)/i)
    const turn = turnMatch ? parseInt(turnMatch[1]) : index + 1

    // Determine severity based on flag and keywords
    const isCritical = flag === 'Red' || text.toLowerCase().includes('unresolved') || text.toLowerCase().includes('account')
    const severity = isCritical ? 'Critical' : 'Moderate'

    return { turn, text, severity }
  })

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Detected Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">No anomalies detected. This call meets quality standards.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Detected Anomalies</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {anomalies.map((anomaly, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">•</span>
              <span className="text-slate-700">Turn {anomaly.turn} - {anomaly.text}</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  anomaly.severity === 'Critical'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-yellow-300 bg-yellow-50 text-yellow-700'
                )}
              >
                {anomaly.severity}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/**
 * Related Context Card - Shows agent stats and context
 */
function RelatedContextCard({ call }: { call: Call }) {
  const { overallPercentage } = calculateScores(call)

  // DEMO DATA: Comparative/aggregate statistics - requires backend API endpoints:
  // - /AgentStats for agent's average across multiple calls
  // - /TeamStats for team averages and benchmarks
  // - /CallAnalytics for similar calls flagged count, category risk analysis
  // These match Figma mockups for demonstration purposes
  const agentAvgScore = Math.round(overallPercentage * 1.1) // Derived from current score
  const teamAvg = 81.5
  const categoryAtRisk = call.anomaly.flag === 'Red' ? 'Resolution' : 'Opening'
  const riskDiff = -6
  const similarFlagged = call.anomaly.flag === 'Green' ? 0 : 3

  // Agent trend (mock data based on current score)
  const prevScores = [overallPercentage - 7, overallPercentage - 1, overallPercentage]
  const trendPercent = prevScores.length > 1
    ? Math.round(((prevScores[prevScores.length - 1] - prevScores[0]) / prevScores[0]) * 100 * 10) / 10
    : 0

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Related Context</CardTitle>
        <Button variant="outline" size="sm" className="text-xs">
          View Agent Scorecard
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <span><span className="font-medium">Agent's average final score this week:</span> {agentAvgScore.toFixed(1)}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <span><span className="font-medium">Team average:</span> {teamAvg}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <span><span className="font-medium">Category at risk:</span> {categoryAtRisk} ({riskDiff}% vs avg)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <span>{similarFlagged} similar calls flagged this week.</span>
          </li>
        </ul>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-sm">
          <span className="font-medium text-slate-900">Agent Trend (last 7 days):</span>
          <span className="text-slate-700">
            {prevScores.join(' → ')}
          </span>
          <TrendingUp className={cn('h-4 w-4', trendPercent >= 0 ? 'text-green-500' : 'text-red-500')} />
          <span className={cn('font-medium', trendPercent >= 0 ? 'text-green-600' : 'text-red-600')}>
            {trendPercent >= 0 ? '+' : ''}{trendPercent}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * SummaryTab - Main summary view for call detail matching Figma design
 *
 * Layout:
 * - Left column: AI Summary, AI Scoring Breakdown
 * - Right column: Customer Sentiment Overview, Detected Anomalies, Related Context
 */
export function SummaryTab({ call, className }: SummaryTabProps) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      {/* Left Column */}
      <div className="space-y-6">
        <AISummaryCard call={call} />
        <AIScoringBreakdownCard call={call} />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <CustomerSentimentCard call={call} />
        <DetectedAnomaliesCard call={call} />
        <RelatedContextCard call={call} />
      </div>
    </div>
  )
}

/**
 * SummaryTabSkeleton - Loading state for SummaryTab
 */
export function SummaryTabSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-40" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
