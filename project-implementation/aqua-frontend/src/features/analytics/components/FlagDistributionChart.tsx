import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Data point for flag distribution
 */
interface FlagDistributionData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

/**
 * Props for the FlagDistributionChart component
 */
interface FlagDistributionChartProps {
  /** Array of flag distribution data */
  data: FlagDistributionData[]
  /** Whether data is loading */
  isLoading?: boolean
}

/**
 * Custom tooltip for the pie chart
 */
interface TooltipPayload {
  name: string
  value: number
  payload: FlagDistributionData
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-sm font-semibold text-slate-900">{data.name}</span>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          <span className="font-medium">{data.value.toLocaleString()}</span> calls
        </p>
      </div>
    )
  }
  return null
}

/**
 * Custom legend component for better styling
 */
interface CustomLegendProps {
  payload?: Array<{
    value: string
    color: string
    payload: FlagDistributionData
  }>
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null

  const total = payload.reduce((sum, entry) => sum + entry.payload.value, 0)

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : '0'
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-600">
              {entry.value}:{' '}
              <span className="font-semibold text-slate-900">
                {entry.payload.value.toLocaleString()}
              </span>{' '}
              <span className="text-slate-400">({percentage}%)</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * FlagDistributionChart - Donut chart showing distribution of call flags
 *
 * Features:
 * - Displays Green, Yellow, and Red flag counts
 * - Donut style with center text showing total
 * - Custom tooltip with detailed information
 * - Custom legend with percentages
 */
export function FlagDistributionChart({
  data,
  isLoading = false,
}: FlagDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Flag Distribution
        </CardTitle>
        <p className="text-sm text-slate-500">
          Call quality status breakdown
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {/* Center text showing total */}
            <text
              x="50%"
              y="42%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-900"
            >
              <tspan
                x="50%"
                dy="-0.5em"
                fontSize="28"
                fontWeight="bold"
              >
                {total.toLocaleString()}
              </tspan>
              <tspan
                x="50%"
                dy="1.8em"
                fontSize="12"
                className="fill-slate-500"
              >
                Total Calls
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
