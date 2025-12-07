import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Data point for score distribution
 */
interface ScoreDistributionData {
  range: string
  count: number
}

/**
 * Props for the ScoreDistributionChart component
 */
interface ScoreDistributionChartProps {
  /** Array of score distribution data */
  data: ScoreDistributionData[]
  /** Whether data is loading */
  isLoading?: boolean
}

/**
 * Color mapping for score ranges
 * - Lower scores get warmer (red/yellow) colors
 * - Higher scores get cooler (green/blue) colors
 */
const getBarColor = (range: string): string => {
  const rangeColors: Record<string, string> = {
    '0-20': '#EF4444', // Red
    '21-40': '#F97316', // Orange
    '41-60': '#EAB308', // Yellow
    '61-80': '#22C55E', // Green
    '81-100': '#10B981', // Emerald
  }
  return rangeColors[range] || '#3B82F6'
}

/**
 * Custom tooltip for the bar chart
 */
interface TooltipPayload {
  value: number
  payload: ScoreDistributionData
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3">
        <p className="text-sm font-semibold text-slate-900">Score: {label}</p>
        <p className="text-sm text-slate-600">
          <span className="font-medium">{payload[0].value.toLocaleString()}</span> calls
        </p>
      </div>
    )
  }
  return null
}

/**
 * ScoreDistributionChart - Bar chart showing distribution of call scores
 *
 * Features:
 * - Displays score ranges on X-axis and call counts on Y-axis
 * - Color-coded bars based on score performance
 * - Custom tooltip with detailed information
 * - Responsive container that adapts to parent width
 */
export function ScoreDistributionChart({
  data,
  isLoading = false,
}: ScoreDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end gap-2 pt-8">
            {[40, 60, 80, 100, 85].map((height, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Score Distribution
        </CardTitle>
        <p className="text-sm text-slate-500">
          Number of calls by score range
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.range)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
