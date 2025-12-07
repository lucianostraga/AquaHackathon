import { Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Available date range options
 */
export type DateRangeOption = '7days' | '30days' | '90days' | 'all'

/**
 * Props for the DateRangeFilter component
 */
interface DateRangeFilterProps {
  /** Currently selected date range */
  value: DateRangeOption
  /** Callback when date range changes */
  onChange: (value: DateRangeOption) => void
  /** Whether the filter is disabled */
  disabled?: boolean
}

/**
 * Date range option labels
 */
const dateRangeLabels: Record<DateRangeOption, string> = {
  '7days': 'Last 7 days',
  '30days': 'Last 30 days',
  '90days': 'Last 90 days',
  'all': 'All time',
}

/**
 * Date range option descriptions (available for extended tooltip/descriptions)
 */
export const dateRangeDescriptions: Record<DateRangeOption, string> = {
  '7days': 'Past week',
  '30days': 'Past month',
  '90days': 'Past quarter',
  'all': 'Since beginning',
}

/**
 * DateRangeFilter - Dropdown for selecting analytics date range
 *
 * Features:
 * - Clean dropdown with icon
 * - Preset date range options
 * - Optional descriptions for each option
 */
export function DateRangeFilter({
  value,
  onChange,
  disabled = false,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-slate-400" />
      <Select
        value={value}
        onValueChange={(val) => onChange(val as DateRangeOption)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(dateRangeLabels) as DateRangeOption[]).map((option) => (
            <SelectItem key={option} value={option}>
              <div className="flex flex-col">
                <span>{dateRangeLabels[option]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * DateRangeFilterInline - Alternative inline button group style
 */
interface DateRangeFilterInlineProps {
  value: DateRangeOption
  onChange: (value: DateRangeOption) => void
  disabled?: boolean
}

export function DateRangeFilterInline({
  value,
  onChange,
  disabled = false,
}: DateRangeFilterInlineProps) {
  const options: DateRangeOption[] = ['7days', '30days', '90days', 'all']

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          disabled={disabled}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all
            ${
              value === option
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {dateRangeLabels[option]}
        </button>
      ))}
    </div>
  )
}

/**
 * Helper function to get date range boundaries
 */
export function getDateRangeBounds(range: DateRangeOption): {
  startDate: Date | null
  endDate: Date
} {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  let startDate: Date | null = null

  switch (range) {
    case '7days':
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
      break
    case '30days':
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
      break
    case '90days':
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'all':
      startDate = null
      break
  }

  return { startDate, endDate }
}

/**
 * Format date range for display
 */
export function formatDateRange(range: DateRangeOption): string {
  const { startDate, endDate } = getDateRangeBounds(range)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (range === 'all') {
    return 'All time'
  }

  if (startDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  return formatDate(endDate)
}
