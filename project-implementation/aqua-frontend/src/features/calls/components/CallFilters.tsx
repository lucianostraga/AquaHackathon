import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Filter, X } from 'lucide-react'
import type { FlagType, CallStatus } from '@/types'

export interface CallFiltersState {
  dateRange: string
  flag: FlagType | 'all'
  status: CallStatus | 'all'
}

interface CallFiltersProps {
  filters: CallFiltersState
  onFiltersChange: (filters: CallFiltersState) => void
  onReset: () => void
  totalResults?: number
}

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
]

const flagOptions: { value: FlagType | 'all'; label: string; color?: string }[] = [
  { value: 'all', label: 'All Flags' },
  { value: 'Green', label: 'Green', color: '#22C55E' },
  { value: 'Yellow', label: 'Yellow', color: '#EAB308' },
  { value: 'Red', label: 'Red', color: '#EF4444' },
]

const statusOptions: { value: CallStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Reviewed', label: 'Reviewed' },
]

/**
 * CallFilters - Filter controls for the Call Library
 *
 * Provides filtering by:
 * - Date range (today, last 7/30/90 days, all time)
 * - Flag status (green/yellow/red)
 * - Call status (pending/processing/reviewed)
 */
export function CallFilters({
  filters,
  onFiltersChange,
  onReset,
  totalResults,
}: CallFiltersProps) {
  const hasActiveFilters =
    filters.dateRange !== 'all' ||
    filters.flag !== 'all' ||
    filters.status !== 'all'

  const updateFilter = <K extends keyof CallFiltersState>(
    key: K,
    value: CallFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Date Range Filter */}
        <Select
          value={filters.dateRange}
          onValueChange={(value) => updateFilter('dateRange', value)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <Calendar className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Flag Filter */}
        <Select
          value={filters.flag}
          onValueChange={(value) =>
            updateFilter('flag', value as FlagType | 'all')
          }
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Flag" />
          </SelectTrigger>
          <SelectContent>
            {flagOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.color && (
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            updateFilter('status', value as CallStatus | 'all')
          }
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-3 text-slate-500 hover:text-slate-700"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      {totalResults !== undefined && (
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{totalResults}</span>{' '}
          {totalResults === 1 ? 'call' : 'calls'} found
        </div>
      )}
    </div>
  )
}

/**
 * Default filter state
 */
export const defaultFilters: CallFiltersState = {
  dateRange: 'all',
  flag: 'all',
  status: 'all',
}
