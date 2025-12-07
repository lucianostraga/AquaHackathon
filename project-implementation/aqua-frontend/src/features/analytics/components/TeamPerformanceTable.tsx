import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'

/**
 * Agent performance data
 */
interface AgentPerformance {
  id: string
  name: string
  team: string
  callsHandled: number
  avgScore: number
  passRate: number
  flagBreakdown: {
    green: number
    yellow: number
    red: number
  }
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

/**
 * Props for the TeamPerformanceTable component
 */
interface TeamPerformanceTableProps {
  /** Array of agent performance data */
  data: AgentPerformance[]
  /** Whether data is loading */
  isLoading?: boolean
}

/**
 * Sort configuration
 */
type SortField = 'name' | 'callsHandled' | 'avgScore' | 'passRate'
type SortDirection = 'asc' | 'desc'

/**
 * Get score color based on value
 */
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get score background color based on value
 */
const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-50'
  if (score >= 60) return 'bg-yellow-50'
  return 'bg-red-50'
}

/**
 * Trend indicator component
 */
function TrendIndicator({
  trend,
  value,
}: {
  trend: 'up' | 'down' | 'stable'
  value: number
}) {
  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
    down: { icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-50' },
    stable: { icon: Minus, color: 'text-slate-500', bgColor: 'bg-slate-50' },
  }

  const config = trendConfig[trend]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color
      )}
    >
      <Icon className="h-3 w-3" />
      {trend !== 'stable' && <span>{value > 0 ? '+' : ''}{value}%</span>}
    </div>
  )
}

/**
 * Flag breakdown mini chart
 */
function FlagBreakdown({
  green,
  yellow,
  red,
}: {
  green: number
  yellow: number
  red: number
}) {
  const total = green + yellow + red
  if (total === 0) return <span className="text-slate-400">-</span>

  const greenPct = (green / total) * 100
  const yellowPct = (yellow / total) * 100
  const redPct = (red / total) * 100

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-24 rounded-full overflow-hidden bg-slate-100">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${greenPct}%` }}
        />
        <div
          className="bg-yellow-500 transition-all"
          style={{ width: `${yellowPct}%` }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${redPct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap">
        {green}/{yellow}/{red}
      </span>
    </div>
  )
}

/**
 * Sortable header component
 */
function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: {
  label: string
  field: SortField
  currentField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
}) {
  const isActive = currentField === field

  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors',
        isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
      )}
    >
      {label}
      {isActive ? (
        direction === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  )
}

/**
 * TeamPerformanceTable - Comprehensive agent leaderboard table
 *
 * Features:
 * - Sortable columns
 * - Score indicators with color coding
 * - Flag breakdown visualization
 * - Trend indicators
 * - Responsive design
 */
export function TeamPerformanceTable({
  data,
  isLoading = false,
}: TeamPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('avgScore')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Handle sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [data, sortField, sortDirection])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Team Performance
            </CardTitle>
            <p className="text-sm text-slate-500">
              Agent leaderboard and performance metrics
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {data.length} agents
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rank
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Agent"
                    field="name"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Calls"
                    field="callsHandled"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Avg Score"
                    field="avgScore"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Pass Rate"
                    field="passRate"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Flags (G/Y/R)
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Trend
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((agent, index) => (
                <tr
                  key={agent.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Rank */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-8 h-8">
                      {index === 0 && sortField === 'avgScore' && sortDirection === 'desc' ? (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <span
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                            index < 3
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Agent name and team */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.team}</p>
                    </div>
                  </td>

                  {/* Calls handled */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700">
                      {agent.callsHandled.toLocaleString()}
                    </span>
                  </td>

                  {/* Average score */}
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold',
                        getScoreBgColor(agent.avgScore),
                        getScoreColor(agent.avgScore)
                      )}
                    >
                      {agent.avgScore}%
                    </span>
                  </td>

                  {/* Pass rate */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            agent.passRate >= 80
                              ? 'bg-green-500'
                              : agent.passRate >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${agent.passRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {agent.passRate}%
                      </span>
                    </div>
                  </td>

                  {/* Flag breakdown */}
                  <td className="px-6 py-4">
                    <FlagBreakdown {...agent.flagBreakdown} />
                  </td>

                  {/* Trend */}
                  <td className="px-6 py-4">
                    <TrendIndicator trend={agent.trend} value={agent.trendValue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {sortedData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">No agent data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Type export for external use
 */
export type { AgentPerformance }
