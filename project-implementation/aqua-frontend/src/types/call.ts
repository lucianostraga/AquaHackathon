export interface Call {
  transactionId: string
  callId: string
  companyId: number
  projectId: number
  agentName: string
  audioName: string
  fileExtension?: string
  audioSize?: number
  transcription: Transcription
  scoreCard: ScoreCard
  sentimentAnalisys: SentimentAnalysis
  anomaly: Anomaly
}

export interface Transcription {
  transcriptionText: string
  diarization: DiarizationEntry[]
}

export interface DiarizationEntry {
  turnIndex: number
  speaker: 'Agent' | 'Customer'
  text: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
}

export interface ScoreCard {
  groups: ScorecardGroup[]
}

export interface ScorecardGroup {
  groupId: number
  groupName: string
  questions: Question[]
}

export interface Question {
  id: number
  text: string
  score: number
  maxPoint: number
  result: 'Pass' | 'Fail'
  evidences: Evidence[]
  justification: string
}

export interface Evidence {
  turn: number
  text: string
}

export interface SentimentAnalysis {
  sentiment: SpeakerSentiment[]
  summary: string
}

export interface SpeakerSentiment {
  speaker: 'Agent' | 'Customer'
  averageScore: number
  trend: 'Increasing' | 'Stable' | 'Decreasing'
  highlights: SentimentHighlight[]
}

export interface SentimentHighlight {
  turn: number
  text: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
}

export interface Anomaly {
  flag: 'Red' | 'Yellow' | 'Green'
  justification: string[]
}

export interface CallSummary {
  id: number
  transactionId: string
  callId: string
  agentName: string
  audioName: string
  duration: string
  date: string
  overallScore: number
  flag: 'Red' | 'Yellow' | 'Green'
  status: 'Pending' | 'Reviewed' | 'Processing'
}

export type SentimentType = 'Positive' | 'Neutral' | 'Negative'
export type FlagType = 'Red' | 'Yellow' | 'Green'
export type CallStatus = 'Pending' | 'Reviewed' | 'Processing'
