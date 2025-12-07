import { http, HttpResponse } from 'msw'
import type { Call, CallSummary } from '@/types'

// Mock data matching the db.json structure
export const mockCall: Call = {
  transactionId: '731e6393-1e79-4155-aae0-29d16836d8eb',
  callId: '44505f02-745a-4ad4-9e4b-280ba43ed1ae',
  companyId: 1,
  projectId: 1,
  agentName: 'Robert',
  audioName: 'CallSample1',
  transcription: {
    transcriptionText: 'Hi, I\'m having trouble with my internet connection...',
    diarization: [
      {
        turnIndex: 0,
        speaker: 'Customer',
        text: 'Hi, I\'m having trouble with my internet connection.',
        sentiment: 'Negative',
      },
      {
        turnIndex: 1,
        speaker: 'Agent',
        text: 'I\'m so sorry to hear that. Let\'s troubleshoot.',
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
            evidences: [{ turn: 1, text: 'I\'m so sorry to hear that.' }],
            justification: 'Agent showed empathy in greeting.',
          },
        ],
      },
    ],
  },
  sentimentAnalisys: {
    sentiment: [
      {
        speaker: 'Agent',
        averageScore: 75,
        trend: 'Stable',
        highlights: [{ turn: 1, text: 'I\'m so sorry to hear that.', sentiment: 'Neutral' }],
      },
      {
        speaker: 'Customer',
        averageScore: 60,
        trend: 'Increasing',
        highlights: [{ turn: 0, text: 'Hi, I\'m having trouble...', sentiment: 'Negative' }],
      },
    ],
    summary: 'Customer started frustrated but became satisfied.',
  },
  anomaly: {
    flag: 'Green',
    justification: ['No critical issues detected', 'Agent followed protocol'],
  },
}

export const mockCallSummaries: CallSummary[] = [
  {
    id: 1,
    transactionId: '731e6393-1e79-4155-aae0-29d16836d8eb',
    callId: '44505f02-745a-4ad4-9e4b-280ba43ed1ae',
    agentName: 'Robert',
    audioName: 'CallSample1',
    duration: '5:32',
    date: '2024-12-01',
    overallScore: 85,
    flag: 'Green',
    status: 'Reviewed',
  },
  {
    id: 2,
    transactionId: 'abc123-def456',
    callId: 'call-002',
    agentName: 'Sarah',
    audioName: 'CallSample2',
    duration: '3:45',
    date: '2024-12-02',
    overallScore: 72,
    flag: 'Yellow',
    status: 'Pending',
  },
]

const BASE_URL = 'http://localhost:3000'

export const handlers = [
  // Get all calls
  http.get(`${BASE_URL}/Calls`, () => {
    return HttpResponse.json([mockCall])
  }),

  // Get call summaries
  http.get(`${BASE_URL}/CallSummary`, () => {
    return HttpResponse.json(mockCallSummaries)
  }),

  // Get call by transaction ID
  http.get(`${BASE_URL}/Calls`, ({ request }) => {
    const url = new URL(request.url)
    const transactionId = url.searchParams.get('transactionId')
    if (transactionId === mockCall.transactionId) {
      return HttpResponse.json([mockCall])
    }
    return HttpResponse.json([])
  }),

  // Upload audio (mock .NET API)
  http.post('http://localhost:8080/IngestAudio', () => {
    return HttpResponse.json({ success: true, id: 'new-upload-id' })
  }),

  // Get audio file
  http.get('http://localhost:8080/Audios/:audioId', () => {
    return new HttpResponse(new Blob(['mock audio data']), {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  }),
]
