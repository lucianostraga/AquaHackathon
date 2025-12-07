import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCallQuery } from '@/hooks'
import type { Call } from '@/types'
import { FileText, MessageSquare, Edit3, AlertCircle } from 'lucide-react'
import {
  CallHeader,
  CallHeaderSkeleton,
  SummaryTab,
  SummaryTabSkeleton,
  TranscriptTab,
  OverridesTab,
} from './components'

/**
 * Mock call data for testing/demo purposes
 * This will be replaced by actual API data in production
 */
const mockCall: Call = {
  transactionId: 'TXN-001',
  callId: 'CALL-001',
  companyId: 1,
  projectId: 1,
  agentName: 'John Smith',
  audioName: 'call_001.mp3',
  transcription: {
    transcriptionText:
      'Thank you for calling TechSupport, my name is John. How can I help you today? Hi, I\'m having issues with my internet connection. It keeps dropping every few minutes. I understand how frustrating that can be. Let me help you troubleshoot this issue. Can you tell me what router model you have? Sure, it\'s the XR500 model. Great, thank you. I\'m going to run a diagnostic on your connection. This will only take a moment.',
    diarization: [
      {
        turnIndex: 1,
        speaker: 'Agent',
        text: 'Thank you for calling TechSupport, my name is John. How can I help you today?',
        sentiment: 'Positive',
      },
      {
        turnIndex: 2,
        speaker: 'Customer',
        text: "Hi, I'm having issues with my internet connection. It keeps dropping every few minutes.",
        sentiment: 'Negative',
      },
      {
        turnIndex: 3,
        speaker: 'Agent',
        text: 'I understand how frustrating that can be. Let me help you troubleshoot this issue. Can you tell me what router model you have?',
        sentiment: 'Positive',
      },
      {
        turnIndex: 4,
        speaker: 'Customer',
        text: "Sure, it's the XR500 model.",
        sentiment: 'Neutral',
      },
      {
        turnIndex: 5,
        speaker: 'Agent',
        text: "Great, thank you. I'm going to run a diagnostic on your connection. This will only take a moment.",
        sentiment: 'Positive',
      },
      {
        turnIndex: 6,
        speaker: 'Customer',
        text: 'Okay, I appreciate your help with this.',
        sentiment: 'Positive',
      },
      {
        turnIndex: 7,
        speaker: 'Agent',
        text: 'I can see there are some packet losses on your connection. Let me check if there are any outages in your area.',
        sentiment: 'Neutral',
      },
      {
        turnIndex: 8,
        speaker: 'Customer',
        text: 'That would be great. I really need the internet for work.',
        sentiment: 'Neutral',
      },
    ],
  },
  scoreCard: {
    groups: [
      {
        groupId: 1,
        groupName: 'Opening',
        questions: [
          {
            id: 1,
            text: 'Did the agent greet the customer professionally?',
            score: 10,
            maxPoint: 10,
            result: 'Pass',
            evidences: [
              {
                turn: 1,
                text: 'Thank you for calling TechSupport, my name is John.',
              },
            ],
            justification: 'Agent provided professional greeting with name.',
          },
          {
            id: 2,
            text: 'Did the agent verify customer identity?',
            score: 0,
            maxPoint: 10,
            result: 'Fail',
            evidences: [],
            justification:
              'Agent did not verify customer account or identity before proceeding with support.',
          },
        ],
      },
      {
        groupId: 2,
        groupName: 'Paraphrasing and Assurance',
        questions: [
          {
            id: 3,
            text: 'Did the agent paraphrase the customer issue?',
            score: 10,
            maxPoint: 10,
            result: 'Pass',
            evidences: [
              {
                turn: 3,
                text: 'I understand how frustrating that can be.',
              },
            ],
            justification:
              'Agent acknowledged and empathized with customer frustration.',
          },
          {
            id: 4,
            text: 'Did the agent provide assurance that the issue would be resolved?',
            score: 8,
            maxPoint: 10,
            result: 'Pass',
            evidences: [
              {
                turn: 3,
                text: 'Let me help you troubleshoot this issue.',
              },
            ],
            justification:
              'Agent offered to help but could have been more explicit about resolution commitment.',
          },
        ],
      },
      {
        groupId: 3,
        groupName: 'Solving the Issue',
        questions: [
          {
            id: 5,
            text: 'Did the agent attempt to resolve the issue?',
            score: 10,
            maxPoint: 10,
            result: 'Pass',
            evidences: [
              {
                turn: 5,
                text: "I'm going to run a diagnostic on your connection.",
              },
              {
                turn: 7,
                text: 'Let me check if there are any outages in your area.',
              },
            ],
            justification:
              'Agent initiated troubleshooting steps and actively worked to diagnose the problem.',
          },
          {
            id: 6,
            text: 'Did the agent ask relevant diagnostic questions?',
            score: 10,
            maxPoint: 10,
            result: 'Pass',
            evidences: [
              {
                turn: 3,
                text: 'Can you tell me what router model you have?',
              },
            ],
            justification:
              'Agent asked appropriate questions to gather relevant technical information.',
          },
        ],
      },
      {
        groupId: 4,
        groupName: 'Closing',
        questions: [
          {
            id: 7,
            text: 'Did the agent confirm issue resolution with customer?',
            score: 0,
            maxPoint: 10,
            result: 'Fail',
            evidences: [],
            justification:
              'Call ended without explicit confirmation that the issue was resolved.',
          },
          {
            id: 8,
            text: 'Did the agent offer additional assistance?',
            score: 0,
            maxPoint: 10,
            result: 'Fail',
            evidences: [],
            justification:
              'Agent did not ask if there was anything else they could help with.',
          },
        ],
      },
      {
        groupId: 5,
        groupName: 'Interaction Health',
        questions: [
          {
            id: 9,
            text: 'Did the agent maintain a professional tone throughout?',
            score: 10,
            maxPoint: 10,
            result: 'Pass',
            evidences: [
              {
                turn: 5,
                text: 'Great, thank you.',
              },
            ],
            justification:
              'Agent maintained courteous and professional demeanor throughout the interaction.',
          },
          {
            id: 10,
            text: 'Was the conversation clear and easy to follow?',
            score: 10,
            maxPoint: 10,
            result: 'Pass',
            evidences: [],
            justification:
              'Communication was clear and agent guided the customer through the process effectively.',
          },
        ],
      },
    ],
  },
  sentimentAnalisys: {
    sentiment: [
      {
        speaker: 'Agent',
        averageScore: 85,
        trend: 'Stable',
        highlights: [
          {
            turn: 1,
            text: 'Thank you for calling',
            sentiment: 'Positive',
          },
          {
            turn: 3,
            text: 'I understand how frustrating that can be',
            sentiment: 'Positive',
          },
        ],
      },
      {
        speaker: 'Customer',
        averageScore: 55,
        trend: 'Increasing',
        highlights: [
          {
            turn: 2,
            text: "I'm having issues with my internet connection",
            sentiment: 'Negative',
          },
          {
            turn: 6,
            text: 'I appreciate your help',
            sentiment: 'Positive',
          },
        ],
      },
    ],
    summary:
      'The agent maintained a consistently positive and professional tone throughout the call. Customer sentiment improved from negative to neutral/positive as the agent provided assistance and showed empathy. The agent successfully de-escalated initial customer frustration through effective listening and proactive troubleshooting.',
  },
  anomaly: {
    flag: 'Yellow',
    justification: [
      'Customer identity not verified before providing support',
      'Call ended without explicit resolution confirmation',
      'No follow-up or additional assistance offered at close',
    ],
  },
}

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
 * - Audio player placeholder (waveform coming soon)
 * - Tabbed interface:
 *   - Summary: Overall score, anomalies, sentiment, scorecard
 *   - Transcript: Full transcript with speaker diarization and filtering
 *   - Overrides: Manual score and flag override controls
 */
export default function CallDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>()

  // Use the hook but fallback to mock data for demo
  const { data: apiCall, isLoading, error } = useCallQuery(transactionId || '')

  // Use mock data for demo, or API data when available
  const call = apiCall || mockCall

  // Show loading state
  if (isLoading && !mockCall) {
    return <CallDetailPageSkeleton />
  }

  // Show error state (only if no mock data fallback)
  if (error && !mockCall) {
    return (
      <CallDetailError error={error as Error} transactionId={transactionId} />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Call Header with back button and info */}
      <CallHeader call={call} />

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
