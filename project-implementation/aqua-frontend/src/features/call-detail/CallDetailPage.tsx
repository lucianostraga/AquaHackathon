import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCallQuery } from '@/hooks'
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
  return (
    <div className="min-h-screen bg-slate-50">
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-semibold text-red-700">
          Failed to Load Call Details
        </h2>
        <p className="mb-4 text-sm text-red-600">
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
    <div className="min-h-screen bg-slate-50">
      {/* Call Header with back button and info */}
      <CallHeader call={call} />

      {/* Audio Player with Sentiment Visualization - WOW Factor */}
      <div className="px-6 pt-4">
        <AudioPlayer
          audioUrl={`/audio/${call.audioName || 'sample'}.mp3`}
          callId={call.callId}
          diarization={call.transcription.diarization}
          className="shadow-lg border border-slate-200"
        />
      </div>

      {/* Main content with tabs */}
      <div className="p-6">
        <Tabs defaultValue="summary" className="space-y-6">
          {/* Tab navigation */}
          <TabsList className="bg-white">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="overrides" className="flex items-center gap-2">
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
