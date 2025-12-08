import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCallQuery } from '@/hooks'
import { useThemeStore } from '@/stores'
import { cn } from '@/lib/utils'
import { FileText, MessageSquare, Edit3, AlertCircle } from 'lucide-react'
import {
  CallHeader,
  CallHeaderSkeleton,
  SummaryTab,
  SummaryTabSkeleton,
  TranscriptTab,
  OverridesTab,
} from './components'
import { AudioPlayer } from '@/components/audio'

/**
 * Loading skeleton for the entire page
 */
function CallDetailPageSkeleton() {
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'

  return (
    <div className={cn("min-h-screen", isTeamMode ? "bg-[#0d0d0d]" : "bg-slate-50")}>
      <CallHeaderSkeleton />
      <div className="p-6">
        {/* Tab skeleton */}
        <Skeleton className="mb-6 h-10 w-80" />
        <SummaryTabSkeleton />
      </div>
    </div>
  )
}

/**
 * Error state component
 */
function CallDetailError({
  error,
  transactionId,
}: {
  error: Error
  transactionId?: string
}) {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'

  return (
    <div className={cn(
      "flex min-h-screen items-center justify-center p-6",
      isTeamMode ? "bg-[#0d0d0d]" : "bg-slate-50"
    )}>
      <div className={cn(
        "max-w-md rounded-lg border p-8 text-center",
        isTeamMode ? "border-red-800 bg-red-950" : "border-red-200 bg-red-50"
      )}>
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className={cn(
          "mb-2 text-xl font-semibold",
          isTeamMode ? "text-red-400" : "text-red-700"
        )}>
          Failed to Load Call Details
        </h2>
        <p className={cn(
          "mb-4 text-sm",
          isTeamMode ? "text-red-300" : "text-red-600"
        )}>
          {error.message ||
            `Unable to load call data for transaction: ${transactionId}`}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/calls')}>
            Back to Calls
          </Button>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    </div>
  )
}

/**
 * CallDetailPage - Main page for viewing detailed call information
 *
 * Features:
 * - Header with call info, score, and flag status
 * - Audio player with WaveSurfer.js waveform visualization
 * - Speaker segment colors (Agent=blue, Customer=orange)
 * - Sentiment toggle for color visualization
 * - Tabbed interface:
 *   - Summary: Overall score, anomalies, sentiment, scorecard
 *   - Transcript: Full transcript with speaker diarization and filtering
 *   - Overrides: Manual score and flag override controls
 */
export default function CallDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'

  // Fetch call data from server
  const { data: call, isLoading, error } = useCallQuery(transactionId || '')

  // Show loading state
  if (isLoading) {
    return <CallDetailPageSkeleton />
  }

  // Show error state
  if (error || !call) {
    return (
      <CallDetailError error={error as Error || new Error('Call not found')} transactionId={transactionId} />
    )
  }

  return (
    <div className={cn("min-h-screen", isTeamMode ? "bg-[#0d0d0d]" : "bg-slate-50")}>
      {/* Call Header with back button and info */}
      <CallHeader call={call} />

      {/* Audio Player with Sentiment Visualization - WOW Factor */}
      <div className="px-6 pt-4">
        <AudioPlayer
          audioUrl={`/audio/${call.audioName || 'sample'}.mp3`}
          callId={call.callId}
          diarization={call.transcription.diarization}
          className={cn(
            "shadow-lg border",
            isTeamMode ? "border-gray-700" : "border-slate-200"
          )}
        />
      </div>

      {/* Main content with tabs */}
      <div className="p-6">
        <Tabs defaultValue="summary" className="space-y-6">
          {/* Tab navigation */}
          <TabsList className={cn(
            isTeamMode ? "bg-[#1a1a1a] border border-gray-700" : "bg-white"
          )}>
            <TabsTrigger
              value="summary"
              className={cn(
                "flex items-center gap-2",
                isTeamMode && "data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500 text-gray-400"
              )}
            >
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger
              value="transcript"
              className={cn(
                "flex items-center gap-2",
                isTeamMode && "data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500 text-gray-400"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Transcript
            </TabsTrigger>
            <TabsTrigger
              value="overrides"
              className={cn(
                "flex items-center gap-2",
                isTeamMode && "data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500 text-gray-400"
              )}
            >
              <Edit3 className="h-4 w-4" />
              Overrides
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab Content */}
          <TabsContent value="summary">
            <SummaryTab call={call} />
          </TabsContent>

          {/* Transcript Tab Content */}
          <TabsContent value="transcript">
            <TranscriptTab call={call} />
          </TabsContent>

          {/* Overrides Tab Content */}
          <TabsContent value="overrides">
            <OverridesTab call={call} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
