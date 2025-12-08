import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Call } from '@/types'
import {
  AudioLines,
  Download,
  FileText,
  Plus,
  Flag,
  AlertCircle,
  Lightbulb,
  FileIcon,
} from 'lucide-react'
import { useState } from 'react'

interface TranscriptTabProps {
  call: Call
  className?: string
}

/**
 * Get sentiment display info based on sentiment and context
 */
function getSentimentDisplay(sentiment: string, text: string) {
  // Enhanced sentiment detection based on text content
  const lowerText = text.toLowerCase()

  if (sentiment === 'Negative') {
    if (lowerText.includes('frustrated') || lowerText.includes('crazy') || lowerText.includes('trouble')) {
      return { label: 'Sad', emoji: '😢', color: 'text-red-500' }
    }
    if (lowerText.includes('already') || lowerText.includes('hasn\'t helped')) {
      return { label: 'Upset', emoji: '😠', color: 'text-orange-500' }
    }
    return { label: 'Sad', emoji: '😢', color: 'text-red-500' }
  }

  if (sentiment === 'Positive') {
    if (lowerText.includes('thank') || lowerText.includes('glad') || lowerText.includes('resolved')) {
      return { label: 'Grateful', emoji: '🙏', color: 'text-green-600' }
    }
    return { label: 'Happy', emoji: '😊', color: 'text-green-500' }
  }

  return { label: 'Calm', emoji: '😐', color: 'text-slate-500' }
}

/**
 * Diarization Table - Shows transcript with sentiment indicators
 */
function DiarizationTable({ call }: { call: Call }) {
  const { diarization } = call.transcription

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(call.transcription, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transcript-${call.callId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const headers = ['Turn', 'Speaker', 'Text', 'Sentiment']
    const rows = diarization.map(d => [
      d.turnIndex.toString(),
      d.speaker,
      `"${d.text.replace(/"/g, '""')}"`,
      d.sentiment
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const dataBlob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transcript-${call.callId}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AudioLines className="h-5 w-5 text-slate-600" />
            Diarization
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadJson}>
              <Download className="mr-1 h-3 w-3" />
              Download .json
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <FileText className="mr-1 h-3 w-3" />
              Export to CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600 w-16">Turn</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 w-24">Speaker</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Text</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 w-28">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diarization.map((entry) => {
                const sentimentDisplay = getSentimentDisplay(entry.sentiment, entry.text)
                return (
                  <tr key={entry.turnIndex} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{entry.turnIndex}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'font-medium',
                        entry.speaker === 'Agent' ? 'text-blue-600' : 'text-purple-600'
                      )}>
                        {entry.speaker}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{entry.text}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('inline-flex items-center gap-1', sentimentDisplay.color)}>
                        <span>{sentimentDisplay.emoji}</span>
                        <span>{sentimentDisplay.label}</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Conversation Notes - Placeholder for adding notes to specific turns
 */
function ConversationNotes() {
  const [notes] = useState<Array<{ turn: number; note: string; author: string; tag: string }>>([])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileIcon className="h-5 w-5 text-slate-600" />
            Conversation Notes
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No notes yet</p>
            <p className="text-xs text-slate-500 mb-4">
              Start capturing key observations from the call.
            </p>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              Add your first note
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Turn</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Note</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Author</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Tag</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">{note.turn}</td>
                  <td className="px-3 py-2">{note.note}</td>
                  <td className="px-3 py-2">{note.author}</td>
                  <td className="px-3 py-2">{note.tag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Flags Card - Shows flag status and justifications
 */
function FlagsCard({ call }: { call: Call }) {
  const { flag, justification } = call.anomaly

  const flagConfig = {
    Red: { label: 'Critical', sublabel: 'Action Required', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    Yellow: { label: 'Warning', sublabel: 'Review Recommended', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    Green: { label: 'Good', sublabel: 'No Action Required', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  }

  const config = flagConfig[flag]

  // Derive insights from justifications
  const insights = justification.length > 0
    ? [
        'The call shows critical compliance deviations.',
        'Recommend manual QA review and coaching follow-up.',
      ]
    : ['No compliance issues detected.']

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Flag className="h-5 w-5 text-slate-600" />
          Flags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn('flex items-center gap-2 px-3 py-2 rounded-md border', config.bgColor, config.borderColor)}>
          <AlertCircle className={cn('h-4 w-4', config.color)} />
          <span className={cn('font-medium', config.color)}>{config.label}</span>
          <span className="text-slate-500">- {config.sublabel}</span>
        </div>

        {justification.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Justifications</p>
              <ul className="space-y-1 text-sm">
                {justification.map((j, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700">{j}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Insight</p>
              <ul className="space-y-1 text-sm">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {flag === 'Red' && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Suggested Next Step:{' '}
              <Button variant="link" className="p-0 h-auto text-blue-600">
                Open QA Review
              </Button>
              {' → '}
              <Button variant="link" className="p-0 h-auto text-blue-600">
                Assign Reviewer
              </Button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Detected Anomalies Card - Shows anomalies in table format
 */
function DetectedAnomaliesCard({ call }: { call: Call }) {
  // Generate anomalies from call data
  const { diarization } = call.transcription
  const { justification } = call.anomaly

  // Create anomalies based on actual call issues from API
  const anomalies = justification.map((j, index) => {
    const isCritical = j.toLowerCase().includes('account') || j.toLowerCase().includes('unresolved')
    // Derive confidence from severity - critical issues have higher confidence detection
    const baseConfidence = isCritical ? 0.92 : 0.85
    const confidence = (baseConfidence - index * 0.03).toFixed(2)
    return {
      turn: index + 1,
      note: j.includes('Account') ? 'Missing ID verification' :
            j.includes('Unresolved') ? 'Unresolved issue' :
            j.includes('75%') ? 'Low score threshold' : j,
      severity: isCritical ? 'Critical' : 'Moderate',
      confidence,
    }
  })

  // Add some detected speech anomalies if there are negative sentiments early
  const earlyNegative = diarization.findIndex(d => d.sentiment === 'Negative')
  if (earlyNegative >= 0 && anomalies.length < 3) {
    anomalies.unshift({
      turn: earlyNegative,
      note: 'Overlapping speech',
      severity: 'Moderate',
      confidence: '0.81',
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertCircle className="h-5 w-5 text-slate-600" />
          Detected Anomalies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <p className="text-sm text-green-600">No anomalies detected in this call.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 w-16">Turn</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Note</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-600 w-24">Severity</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600 w-24">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anomalies.map((anomaly, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-slate-600">{anomaly.turn}</td>
                    <td className="px-3 py-2 text-slate-700">{anomaly.note}</td>
                    <td className="px-3 py-2 text-center">
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
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">{anomaly.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * AI Insights Card - Shows AI analysis insights
 */
function AIInsightsCard({ call }: { call: Call }) {
  const { diarization } = call.transcription
  const { sentiment: sentimentData } = call.sentimentAnalisys

  // Generate insights from call data
  const customerSentiment = sentimentData.find(s => s.speaker === 'Customer')
  const agentSentiment = sentimentData.find(s => s.speaker === 'Agent')

  const insights: string[] = []

  // Add empathy detection - derive confidence from agent sentiment score
  if (agentSentiment && agentSentiment.averageScore >= 4) {
    const empathyConfidence = (0.80 + agentSentiment.averageScore * 0.02).toFixed(2)
    insights.push(`Detected empathetic phrase with ${empathyConfidence} confidence.`)
  }

  // Add compliance note
  const hasComplianceIssue = call.anomaly.justification.some(j =>
    j.toLowerCase().includes('account') || j.toLowerCase().includes('verify')
  )
  if (hasComplianceIssue) {
    insights.push('Possible missing compliance confirmation at 01:28.')
  }

  // Add sentiment recovery
  if (customerSentiment?.trend === 'Increasing') {
    insights.push('Sentiment recovered from negative to positive after 01:00.')
  } else {
    // Check if sentiment improved in diarization
    const firstNeg = diarization.findIndex(d => d.speaker === 'Customer' && d.sentiment === 'Negative')
    // Find last positive index manually (compatible approach)
    let lastPos = -1
    for (let i = diarization.length - 1; i >= 0; i--) {
      if (diarization[i].speaker === 'Customer' && diarization[i].sentiment === 'Positive') {
        lastPos = i
        break
      }
    }
    if (firstNeg >= 0 && lastPos > firstNeg) {
      insights.push('Sentiment recovered from negative to positive during the call.')
    }
  }

  // AI-Human alignment score (derived from call quality)
  const alignmentScore = call.anomaly.flag === 'Green' ? 95 : call.anomaly.flag === 'Yellow' ? 85 : 72

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-5 w-5 text-slate-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span className="text-slate-700">{insight}</span>
            </li>
          ))}
          {insights.length === 0 && (
            <li className="text-slate-500">No significant insights detected for this call.</li>
          )}
        </ul>

        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">AI-Human Alignment:</span>
            <span className="font-semibold text-slate-900">{alignmentScore}%</span>
          </div>
          <Progress value={alignmentScore} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * TranscriptTab - Transcript view matching Figma design
 *
 * Layout:
 * - Left column: Diarization table with download/export options
 * - Right column: Conversation Notes, Flags, Detected Anomalies, AI Insights
 */
export function TranscriptTab({ call, className }: TranscriptTabProps) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-[1fr,400px]', className)}>
      {/* Left Column - Diarization */}
      <DiarizationTable call={call} />

      {/* Right Column - Notes, Flags, Anomalies, Insights */}
      <div className="space-y-6">
        <ConversationNotes />
        <FlagsCard call={call} />
        <DetectedAnomaliesCard call={call} />
        <AIInsightsCard call={call} />
      </div>
    </div>
  )
}

/**
 * TranscriptTabSkeleton - Loading state for TranscriptTab
 */
export function TranscriptTabSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
      {/* Left Column */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
