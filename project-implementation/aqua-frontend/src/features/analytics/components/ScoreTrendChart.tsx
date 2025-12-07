import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Data point for score trend
 */
interface TrendData {
  date: string
  score: number
  calls: number
}

/**
 * Props for the ScoreTrendChart component
 */
interface ScoreTrendChartProps {
  /** Array of trend data points */
  data: TrendData[]
  /** Whether data is loading */
  isLoading?: boolean
}

/**
 * Custom tooltip for the trend chart
 */
interface TooltipPayload {
  dataKey: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const scoreData = payload.find((p) => p.dataKey === 'score')
    const callsData = payload.find((p) => p.dataKey === 'calls')

    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[140px]">
        <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
        {scoreData && (
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-600">Avg Score</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {scoreData.value}%
            </span>
          </div>
        )}
        {callsData && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="text-sm text-slate-600">Calls</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {callsData.value.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    )
  }
  return null
}

/**
 * ScoreTrendChart - Combined area/line chart showing score trends over time
 *
 * Features:
 * - Area chart showing average score trend
 * - Overlaid bar chart showing call volume
 * - Custom tooltip with both metrics
 * - Gradient fill for visual appeal
 */
export function ScoreTrendChart({
  data,
  isLoading = false,
}: ScoreTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Calculate statistics
  const avgScore = data.length > 0
    ? (data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(1)
    : '0'
  const totalCalls = data.reduce((sum, d) => sum + d.calls, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Score Trend
            </CardTitle>
            <p className="text-sm text-slate-500">
              Average score and call volume over time
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Avg Score</p>
              <p className="text-lg font-bold text-blue-600">{avgScore}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total Calls</p>
              <p className="text-lg font-bold text-slate-700">{totalCalls.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {/* Calls bar chart */}
            <Bar
              yAxisId="right"
              dataKey="calls"
              fill="#E2E8F0"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            {/* Score area chart */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
