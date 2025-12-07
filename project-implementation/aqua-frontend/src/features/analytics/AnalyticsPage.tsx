import { useState, useMemo } from 'react'
import { Phone, TrendingUp, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import {
  KPICard,
  ScoreDistributionChart,
  FlagDistributionChart,
  ScoreTrendChart,
  TopPerformersChart,
  TeamPerformanceTable,
  DateRangeFilterInline,
  formatDateRange,
  type DateRangeOption,
  type AgentPerformance,
} from './components'

/**
 * Mock KPI data
 */
const mockKPIs = {
  '7days': { totalCalls: 1247, avgScore: 78.5, passRate: 72, redFlags: 45 },
  '30days': { totalCalls: 4823, avgScore: 76.2, passRate: 69, redFlags: 187 },
  '90days': { totalCalls: 14521, avgScore: 74.8, passRate: 67, redFlags: 612 },
  'all': { totalCalls: 28934, avgScore: 75.3, passRate: 68, redFlags: 1245 },
}

/**
 * Mock score distribution data
 */
const mockScoreDistribution = {
  '7days': [
    { range: '0-20', count: 15 },
    { range: '21-40', count: 45 },
    { range: '41-60', count: 120 },
    { range: '61-80', count: 450 },
    { range: '81-100', count: 617 },
  ],
  '30days': [
    { range: '0-20', count: 58 },
    { range: '21-40', count: 175 },
    { range: '41-60', count: 465 },
    { range: '61-80', count: 1745 },
    { range: '81-100', count: 2380 },
  ],
  '90days': [
    { range: '0-20', count: 182 },
    { range: '21-40', count: 548 },
    { range: '41-60', count: 1456 },
    { range: '61-80', count: 5234 },
    { range: '81-100', count: 7101 },
  ],
  'all': [
    { range: '0-20', count: 378 },
    { range: '21-40', count: 1123 },
    { range: '41-60', count: 2987 },
    { range: '61-80', count: 10456 },
    { range: '81-100', count: 13990 },
  ],
}

/**
 * Mock flag distribution data
 */
const mockFlagDistribution = {
  '7days': [
    { name: 'Green', value: 897, color: '#22C55E' },
    { name: 'Yellow', value: 305, color: '#EAB308' },
    { name: 'Red', value: 45, color: '#EF4444' },
  ],
  '30days': [
    { name: 'Green', value: 3328, color: '#22C55E' },
    { name: 'Yellow', value: 1308, color: '#EAB308' },
    { name: 'Red', value: 187, color: '#EF4444' },
  ],
  '90days': [
    { name: 'Green', value: 9729, color: '#22C55E' },
    { name: 'Yellow', value: 4180, color: '#EAB308' },
    { name: 'Red', value: 612, color: '#EF4444' },
  ],
  'all': [
    { name: 'Green', value: 19675, color: '#22C55E' },
    { name: 'Yellow', value: 8014, color: '#EAB308' },
    { name: 'Red', value: 1245, color: '#EF4444' },
  ],
}

/**
 * Mock trend data (weekly)
 */
const mockTrendData = {
  '7days': [
    { date: 'Mon', score: 75, calls: 180 },
    { date: 'Tue', score: 78, calls: 195 },
    { date: 'Wed', score: 72, calls: 170 },
    { date: 'Thu', score: 80, calls: 210 },
    { date: 'Fri', score: 82, calls: 225 },
    { date: 'Sat', score: 79, calls: 130 },
    { date: 'Sun', score: 77, calls: 137 },
  ],
  '30days': [
    { date: 'Week 1', score: 74, calls: 1150 },
    { date: 'Week 2', score: 76, calls: 1230 },
    { date: 'Week 3', score: 75, calls: 1180 },
    { date: 'Week 4', score: 79, calls: 1263 },
  ],
  '90days': [
    { date: 'Jan', score: 72, calls: 4520 },
    { date: 'Feb', score: 74, calls: 4780 },
    { date: 'Mar', score: 78, calls: 5221 },
  ],
  'all': [
    { date: 'Q1', score: 71, calls: 6823 },
    { date: 'Q2', score: 73, calls: 7124 },
    { date: 'Q3', score: 76, calls: 7456 },
    { date: 'Q4', score: 79, calls: 7531 },
  ],
}

/**
 * Mock top performers data
 */
const mockTopPerformers = [
  { name: 'Sarah Johnson', score: 94, calls: 156 },
  { name: 'John Smith', score: 91, calls: 142 },
  { name: 'Emily Davis', score: 89, calls: 138 },
  { name: 'Michael Brown', score: 87, calls: 145 },
  { name: 'Lisa Anderson', score: 85, calls: 131 },
]

/**
 * Mock team performance data
 */
const mockTeamPerformance: AgentPerformance[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    team: 'Team Alpha',
    callsHandled: 156,
    avgScore: 94,
    passRate: 96,
    flagBreakdown: { green: 150, yellow: 5, red: 1 },
    trend: 'up',
    trendValue: 3.2,
  },
  {
    id: '2',
    name: 'John Smith',
    team: 'Team Beta',
    callsHandled: 142,
    avgScore: 91,
    passRate: 92,
    flagBreakdown: { green: 131, yellow: 8, red: 3 },
    trend: 'up',
    trendValue: 1.8,
  },
  {
    id: '3',
    name: 'Emily Davis',
    team: 'Team Alpha',
    callsHandled: 138,
    avgScore: 89,
    passRate: 88,
    flagBreakdown: { green: 121, yellow: 12, red: 5 },
    trend: 'stable',
    trendValue: 0,
  },
  {
    id: '4',
    name: 'Michael Brown',
    team: 'Team Gamma',
    callsHandled: 145,
    avgScore: 87,
    passRate: 85,
    flagBreakdown: { green: 123, yellow: 15, red: 7 },
    trend: 'up',
    trendValue: 2.1,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    team: 'Team Beta',
    callsHandled: 131,
    avgScore: 85,
    passRate: 82,
    flagBreakdown: { green: 107, yellow: 18, red: 6 },
    trend: 'down',
    trendValue: -1.5,
  },
  {
    id: '6',
    name: 'David Wilson',
    team: 'Team Alpha',
    callsHandled: 128,
    avgScore: 82,
    passRate: 78,
    flagBreakdown: { green: 100, yellow: 20, red: 8 },
    trend: 'up',
    trendValue: 4.2,
  },
  {
    id: '7',
    name: 'Jennifer Martinez',
    team: 'Team Gamma',
    callsHandled: 135,
    avgScore: 79,
    passRate: 75,
    flagBreakdown: { green: 101, yellow: 24, red: 10 },
    trend: 'stable',
    trendValue: 0,
  },
  {
    id: '8',
    name: 'Robert Taylor',
    team: 'Team Beta',
    callsHandled: 122,
    avgScore: 76,
    passRate: 71,
    flagBreakdown: { green: 87, yellow: 26, red: 9 },
    trend: 'down',
    trendValue: -2.3,
  },
  {
    id: '9',
    name: 'Amanda White',
    team: 'Team Alpha',
    callsHandled: 118,
    avgScore: 72,
    passRate: 68,
    flagBreakdown: { green: 80, yellow: 28, red: 10 },
    trend: 'up',
    trendValue: 1.1,
  },
  {
    id: '10',
    name: 'Christopher Lee',
    team: 'Team Gamma',
    callsHandled: 125,
    avgScore: 68,
    passRate: 62,
    flagBreakdown: { green: 77, yellow: 32, red: 16 },
    trend: 'down',
    trendValue: -3.8,
  },
]

/**
 * AnalyticsPage - Comprehensive analytics dashboard for call center metrics
 *
 * Features:
 * - KPI cards showing key metrics
 * - Score distribution bar chart
 * - Flag distribution pie chart
 * - Score trend line chart
 * - Top performers horizontal bar chart
 * - Team performance leaderboard table
 * - Date range filtering
 */
export default function AnalyticsPage() {
  // State
  const [dateRange, setDateRange] = useState<DateRangeOption>('7days')
  const [isLoading, setIsLoading] = useState(false)

  // Get data based on date range
  const kpis = useMemo(() => mockKPIs[dateRange], [dateRange])
  const scoreDistribution = useMemo(() => mockScoreDistribution[dateRange], [dateRange])
  const flagDistribution = useMemo(() => mockFlagDistribution[dateRange], [dateRange])
  const trendData = useMemo(() => mockTrendData[dateRange], [dateRange])

  // Simulate data refresh
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  // Handle date range change with loading simulation
  const handleDateRangeChange = (range: DateRangeOption) => {
    setIsLoading(true)
    setDateRange(range)
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <>
      <Header title="Analytics" />
      <PageContainer>
        <div className="space-y-6">
          {/* Page header with filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Performance Overview
              </h2>
              <p className="text-sm text-slate-500">
                {formatDateRange(dateRange)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangeFilterInline
                value={dateRange}
                onChange={handleDateRangeChange}
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="shrink-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Calls Analyzed"
              value={kpis.totalCalls}
              icon={Phone}
              variant="default"
              change={5.2}
              isLoading={isLoading}
            />
            <KPICard
              title="Average Score"
              value={kpis.avgScore}
              valueSuffix="%"
              icon={TrendingUp}
              variant="default"
              change={2.3}
              isLoading={isLoading}
            />
            <KPICard
              title="Pass Rate"
              value={kpis.passRate}
              valueSuffix="%"
              icon={CheckCircle2}
              variant="success"
              change={1.8}
              isLoading={isLoading}
            />
            <KPICard
              title="Red Flags"
              value={kpis.redFlags}
              subtitle="Calls needing attention"
              icon={AlertTriangle}
              variant="danger"
              isLoading={isLoading}
            />
          </div>

          {/* Charts Grid - 2x2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Score Distribution */}
            <ScoreDistributionChart
              data={scoreDistribution}
              isLoading={isLoading}
            />

            {/* Flag Distribution */}
            <FlagDistributionChart
              data={flagDistribution}
              isLoading={isLoading}
            />

            {/* Score Trend */}
            <ScoreTrendChart
              data={trendData}
              isLoading={isLoading}
            />

            {/* Top Performers */}
            <TopPerformersChart
              data={mockTopPerformers}
              isLoading={isLoading}
            />
          </div>

          {/* Team Performance Table */}
          <TeamPerformanceTable
            data={mockTeamPerformance}
            isLoading={isLoading}
          />
        </div>
      </PageContainer>
    </>
  )
}
