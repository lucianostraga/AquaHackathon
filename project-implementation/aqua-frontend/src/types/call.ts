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

/**
 * CallSummary - matches server response from /CallSummary endpoint
 */
export interface CallSummary {
  id: string
  transactionId: string
  callId: string
  companyId: number
  projectId: number
  company: string // company name (denormalized for display)
  project: string // project name (denormalized for display)
  agentName: string
  audioName: string
  processDate: string
  scoreCard: number // overall score percentage
  Flagged: boolean
  Issues: string[]
  dominantSentiment?: 'Positive' | 'Neutral' | 'Negative' // derived from call sentiment analysis
}

export type SentimentType = 'Positive' | 'Neutral' | 'Negative'
export type FlagType = 'Red' | 'Yellow' | 'Green'
export type CallStatus = 'Pending' | 'Reviewed' | 'Processing'
