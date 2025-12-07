import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Medal, Award } from 'lucide-react'

/**
 * Data point for top performers
 */
interface PerformerData {
  name: string
  score: number
  calls: number
}

/**
 * Props for the TopPerformersChart component
 */
interface TopPerformersChartProps {
  /** Array of performer data (should be sorted by score descending) */
  data: PerformerData[]
  /** Whether data is loading */
  isLoading?: boolean
}

/**
 * Get color based on rank position
 */
const getRankColor = (index: number): string => {
  const colors = [
    '#F59E0B', // Gold - 1st
    '#9CA3AF', // Silver - 2nd
    '#D97706', // Bronze - 3rd
    '#3B82F6', // Blue - Others
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ]
  return colors[index] || colors[3]
}

/**
 * Get rank icon based on position
 */
const RankIcon = ({ rank }: { rank: number }) => {
  const iconProps = { className: 'h-4 w-4' }

  switch (rank) {
    case 1:
      return <Trophy {...iconProps} className="h-4 w-4 text-yellow-500" />
    case 2:
      return <Medal {...iconProps} className="h-4 w-4 text-slate-400" />
    case 3:
      return <Award {...iconProps} className="h-4 w-4 text-amber-600" />
    default:
      return (
        <span className="text-xs font-bold text-slate-400 w-4 text-center">
          {rank}
        </span>
      )
  }
}

/**
 * Custom tooltip for the horizontal bar chart
 */
interface TooltipPayload {
  value: number
  payload: PerformerData
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[160px]">
        <p className="text-sm font-semibold text-slate-900 mb-2">{data.name}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Score</span>
            <span className="text-sm font-bold text-green-600">{data.score}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Calls Handled</span>
            <span className="text-sm font-medium text-slate-700">
              {data.calls.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

/**
 * TopPerformersChart - Horizontal bar chart showing top performing agents
 *
 * Features:
 * - Horizontal bars sorted by score
 * - Rank indicators with medals for top 3
 * - Color-coded bars based on rank
 * - Score labels on bars
 */
export function TopPerformersChart({
  data,
  isLoading = false,
}: TopPerformersChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[100, 90, 80, 70, 60].map((width, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-8 rounded" style={{ width: `${width}%` }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data with rank
  const rankedData = data.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Top Performers
        </CardTitle>
        <p className="text-sm text-slate-500">
          Agents with highest average scores
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={rankedData}
            layout="vertical"
            margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#475569' }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
            />
            <Bar
              dataKey="score"
              radius={[0, 6, 6, 0]}
              maxBarSize={35}
            >
              {rankedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getRankColor(index)}
                />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                formatter={(value) => `${value}%`}
                style={{ fontSize: 12, fontWeight: 600, fill: '#475569' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Rank indicators below chart */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-3">
            {rankedData.slice(0, 3).map((performer, index) => (
              <div
                key={performer.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50"
              >
                <RankIcon rank={index + 1} />
                <span className="text-sm font-medium text-slate-700">
                  {performer.name}
                </span>
                <span className="text-xs text-slate-500">
                  ({performer.calls} calls)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
