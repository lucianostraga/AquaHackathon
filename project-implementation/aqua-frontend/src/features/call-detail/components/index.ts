/**
 * Call Detail Feature Components
 *
 * This module exports all components used in the Call Detail page
 * for viewing and analyzing individual call evaluations.
 */

// Header component with back navigation and call info
export { CallHeader, CallHeaderSkeleton } from './CallHeader'

// Tab content components
export { SummaryTab, SummaryTabSkeleton } from './SummaryTab'
export { TranscriptTab, TranscriptTabSkeleton } from './TranscriptTab'
export { OverridesTab, OverridesTabSkeleton } from './OverridesTab'

// Scorecard components for displaying evaluation results
export { ScorecardPanel, ScorecardPanelSkeleton } from './ScorecardPanel'

// Sentiment analysis components
export { SentimentPanel, SentimentPanelSkeleton } from './SentimentPanel'

// Transcript display components
export { TranscriptTurn, TranscriptTurnSkeleton } from './TranscriptTurn'
