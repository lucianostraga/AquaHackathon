import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Call } from '@/types'
import { ArrowLeft, User, FileAudio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FlagBadge } from '@/features/calls/components/FlagBadge'
import { AudioPlayer } from '@/components/audio/AudioPlayer'

interface CallHeaderProps {
  call: Call
  className?: string
}

/**
 * Overall score calculation helper
 */
function calculateOverallScore(call: Call): number {
  const groups = call.scoreCard.groups
  const totalScore = groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + q.score, 0),
    0
  )
  const maxScore = groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + q.maxPoint, 0),
    0
  )
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
}

/**
 * Score color helper based on percentage
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

/**
 * CallHeader - Header section for call detail page
 *
 * Displays:
 * - Back navigation button
 * - Call ID and transaction ID
 * - Agent name
 * - Audio file name
 * - Overall score badge
 * - Flag indicator
 */
export function CallHeader({ call, className }: CallHeaderProps) {
  const navigate = useNavigate()
  const overallScore = calculateOverallScore(call)
  const scoreColorClass = getScoreColor(overallScore)

  const handleBack = () => {
    navigate('/calls')
  }

  return (
    <div className={cn('border-b border-slate-200 bg-white', className)}>
      <div className="p-6">
        {/* Top row with back button and badges */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calls
          </Button>

          <div className="flex items-center gap-3">
            {/* Overall Score Badge */}
            <div
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2',
                scoreColorClass
              )}
            >
              <span className="text-sm font-medium">Score:</span>
              <span className="text-lg font-bold">{overallScore}%</span>
            </div>

            {/* Flag Badge */}
            <FlagBadge flag={call.anomaly.flag} size="lg" showLabel />
          </div>
        </div>

        {/* Call information */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Call: {call.callId}
            </h1>
            <Badge variant="outline" className="text-slate-500">
              TX: {call.transactionId}
            </Badge>
          </div>

          {/* Meta information row */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium">Agent:</span>
              <span>{call.agentName}</span>
            </div>

            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-slate-400" />
              <span className="font-medium">Audio:</span>
              <span className="font-mono text-xs">{call.audioName}</span>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="mt-6">
          <AudioPlayer
            audioUrl={call.audioName ? `/audio/${call.audioName}${call.fileExtension || '.mp3'}` : null}
            callId={call.callId}
            diarization={call.transcription?.diarization || []}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * CallHeaderSkeleton - Loading state for CallHeader
 */
export function CallHeaderSkeleton() {
  return (
    <div className="border-b border-slate-200 bg-white p-6">
      {/* Top row */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Call info */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="flex items-center gap-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Audio player skeleton */}
      <div className="mt-6">
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}
