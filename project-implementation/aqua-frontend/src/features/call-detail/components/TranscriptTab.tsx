import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Call, SentimentType } from '@/types'
import { MessageSquare, Search, Filter } from 'lucide-react'
import { useState, useMemo } from 'react'
import { TranscriptTurn, TranscriptTurnSkeleton } from './TranscriptTurn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TranscriptTabProps {
  call: Call
  className?: string
}

type SpeakerFilter = 'All' | 'Agent' | 'Customer'
type SentimentFilter = 'All' | SentimentType

/**
 * TranscriptStats - Display quick stats about the transcript
 */
function TranscriptStats({ call }: { call: Call }) {
  const { diarization } = call.transcription

  const agentTurns = diarization.filter((d) => d.speaker === 'Agent').length
  const customerTurns = diarization.filter((d) => d.speaker === 'Customer').length
  const positiveTurns = diarization.filter((d) => d.sentiment === 'Positive').length
  const negativeTurns = diarization.filter((d) => d.sentiment === 'Negative').length

  return (
    <div className="flex flex-wrap gap-4 rounded-lg bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Total Turns:</span>
        <span className="font-semibold text-slate-700">{diarization.length}</span>
      </div>
      <div className="h-5 w-px bg-slate-300" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Agent:</span>
        <span className="font-semibold text-blue-600">{agentTurns}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Customer:</span>
        <span className="font-semibold text-purple-600">{customerTurns}</span>
      </div>
      <div className="h-5 w-px bg-slate-300" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Positive:</span>
        <span className="font-semibold text-green-600">{positiveTurns}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Negative:</span>
        <span className="font-semibold text-red-600">{negativeTurns}</span>
      </div>
    </div>
  )
}

/**
 * TranscriptFilters - Filter controls for transcript
 */
interface TranscriptFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  speakerFilter: SpeakerFilter
  onSpeakerChange: (value: SpeakerFilter) => void
  sentimentFilter: SentimentFilter
  onSentimentChange: (value: SentimentFilter) => void
  onReset: () => void
}

function TranscriptFilters({
  searchTerm,
  onSearchChange,
  speakerFilter,
  onSpeakerChange,
  sentimentFilter,
  onSentimentChange,
  onReset,
}: TranscriptFiltersProps) {
  const hasFilters =
    searchTerm || speakerFilter !== 'All' || sentimentFilter !== 'All'

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search transcript..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Speaker filter */}
      <Select value={speakerFilter} onValueChange={(v) => onSpeakerChange(v as SpeakerFilter)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Speaker" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Speakers</SelectItem>
          <SelectItem value="Agent">Agent</SelectItem>
          <SelectItem value="Customer">Customer</SelectItem>
        </SelectContent>
      </Select>

      {/* Sentiment filter */}
      <Select value={sentimentFilter} onValueChange={(v) => onSentimentChange(v as SentimentFilter)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Sentiment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Sentiment</SelectItem>
          <SelectItem value="Positive">Positive</SelectItem>
          <SelectItem value="Neutral">Neutral</SelectItem>
          <SelectItem value="Negative">Negative</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset button */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  )
}

/**
 * TranscriptTab - Full transcript view with filtering
 *
 * Displays:
 * - Transcript statistics
 * - Search and filter controls
 * - Full transcript with speaker diarization
 * - Sentiment indicators for each turn
 */
export function TranscriptTab({ call, className }: TranscriptTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [speakerFilter, setSpeakerFilter] = useState<SpeakerFilter>('All')
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('All')

  const { diarization } = call.transcription

  // Filter transcript entries
  const filteredEntries = useMemo(() => {
    return diarization.filter((entry) => {
      // Search filter
      if (
        searchTerm &&
        !entry.text.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Speaker filter
      if (speakerFilter !== 'All' && entry.speaker !== speakerFilter) {
        return false
      }

      // Sentiment filter
      if (sentimentFilter !== 'All' && entry.sentiment !== sentimentFilter) {
        return false
      }

      return true
    })
  }, [diarization, searchTerm, speakerFilter, sentimentFilter])

  const handleReset = () => {
    setSearchTerm('')
    setSpeakerFilter('All')
    setSentimentFilter('All')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats */}
      <TranscriptStats call={call} />

      {/* Filters */}
      <TranscriptFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        speakerFilter={speakerFilter}
        onSpeakerChange={setSpeakerFilter}
        sentimentFilter={sentimentFilter}
        onSentimentChange={setSentimentFilter}
        onReset={handleReset}
      />

      {/* Transcript */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Transcript
            </div>
            <span className="text-sm font-normal text-slate-500">
              {filteredEntries.length} of {diarization.length} turns
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Filter className="mx-auto mb-2 h-8 w-8 text-slate-400" />
              <p className="font-medium text-slate-600">No matching turns</p>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or search term
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleReset}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <TranscriptTurn key={entry.turnIndex} entry={entry} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Full text view */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Full Transcript Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {call.transcription.transcriptionText}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * TranscriptTabSkeleton - Loading state for TranscriptTab
 */
export function TranscriptTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats skeleton */}
      <div className="rounded-lg bg-slate-50 p-4">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Transcript skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <TranscriptTurnSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
