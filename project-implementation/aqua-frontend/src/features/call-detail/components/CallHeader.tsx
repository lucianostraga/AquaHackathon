import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Call } from '@/types'
import { ChevronLeft, CheckSquare, AlertTriangle, XSquare, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
 * Get flag icon and label
 */
function getFlagDisplay(flag: string) {
  switch (flag) {
    case 'Green':
      return { icon: CheckSquare, label: 'Good', color: 'text-green-600' }
    case 'Yellow':
      return { icon: AlertTriangle, label: 'Warning', color: 'text-yellow-600' }
    case 'Red':
      return { icon: XSquare, label: 'Critical', color: 'text-red-600' }
    default:
      return { icon: CheckSquare, label: 'Good', color: 'text-green-600' }
  }
}

/**
 * CallHeader - Header section for call detail page matching Figma design
 *
 * Displays:
 * - Back to Calls link
 * - Call ID title
 * - Status line
 * - Metadata bar with Agent, Date, Duration, Company, Project, Flag, AI Score, Override, Final
 */
export function CallHeader({ call, className }: CallHeaderProps) {
  const navigate = useNavigate()
  const overallScore = calculateOverallScore(call)
  const flagDisplay = getFlagDisplay(call.anomaly.flag)
  const FlagIcon = flagDisplay.icon

  // DEMO DATA: Override workflow values - requires backend API endpoints:
  // - /CallOverrides for override history (who, when, why)
  // - /CallConfidence for AI confidence metrics
  // These match Figma mockups for demonstration purposes
  const aiConfidence = 0.83
  const overrideUser = 'QC_Maria'
  const finalScore = overallScore + 7
  const scoreDiff = finalScore - overallScore

  const handleBack = () => {
    navigate('/calls')
  }

  // Format date - use current date as processDate isn't in the Call type
  const processDate = new Date()
  const formattedDate = processDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={cn('bg-white', className)}>
      <div className="px-5 py-4">
        {/* Back link */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Calls
        </button>

        {/* Call ID Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Call ID: {String(call.callId).padStart(5, '0')}
        </h1>

        {/* Status line */}
        <p className="text-sm text-slate-500 mb-4">
          <span className="text-slate-900">AI Analysis Completed</span>
          {' | '}Reviewed by {overrideUser}
          {' | '}{formattedDate}
          {' | '}<span className="italic text-slate-400">Powered by AQUA AI Scoring Engine — Results may require human review.</span>
        </p>

        {/* Metadata bar */}
        <div className="flex items-center gap-6 border border-slate-200 rounded-lg p-4 bg-white">
          {/* Agent */}
          <div>
            <p className="text-xs text-slate-500">Agent</p>
            <p className="text-sm font-semibold text-slate-900">{call.agentName}</p>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs text-slate-500">Date</p>
            <p className="text-sm font-semibold text-slate-900">
              {processDate.toISOString().split('T')[0]} {processDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs text-slate-500">Duration</p>
            <p className="text-sm font-semibold text-slate-900">05:12</p>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs text-slate-500">Company</p>
            <p className="text-sm font-semibold text-slate-900">{call.audioName?.split(' - ')[0] || 'Acme Corp'}</p>
          </div>

          {/* Project */}
          <div>
            <p className="text-xs text-slate-500">Project</p>
            <p className="text-sm font-semibold text-slate-900">{call.audioName?.split(' - ')[1] || 'Retention'}</p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Flag */}
          <div className="flex items-center gap-2">
            <FlagIcon className={cn('h-5 w-5', flagDisplay.color)} />
            <div>
              <p className="text-xs text-slate-500">Flag: {flagDisplay.label}</p>
            </div>
          </div>

          {/* AI Score */}
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{overallScore} <span className="text-sm font-normal text-slate-500">({aiConfidence.toFixed(2)})</span></p>
            <p className="text-xs text-slate-500">AI Score</p>
          </div>

          {/* Override */}
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">{overrideUser}</p>
            <p className="text-xs text-slate-500">Override</p>
          </div>

          {/* Final Score */}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{finalScore} <span className="text-sm font-normal">(+{scoreDiff})</span></p>
              <p className="text-xs text-slate-500">Final</p>
            </div>
          </div>
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
    <div className="bg-white px-5 py-4">
      {/* Back link */}
      <Skeleton className="h-5 w-28 mb-2" />

      {/* Title */}
      <Skeleton className="h-8 w-48 mb-1" />

      {/* Status line */}
      <Skeleton className="h-5 w-full max-w-2xl mb-4" />

      {/* Metadata bar */}
      <div className="flex items-center gap-6 border border-slate-200 rounded-lg p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
        <div className="flex-1" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}
