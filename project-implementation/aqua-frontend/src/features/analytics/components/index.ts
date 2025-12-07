/**
 * Analytics Components
 *
 * This module exports all components used in the Analytics Dashboard feature.
 * These components provide visualizations and metrics for call center performance.
 */

// KPI Cards
export { KPICard, KPICardSkeleton } from './KPICard'

// Charts
export { ScoreDistributionChart } from './ScoreDistributionChart'
export { FlagDistributionChart } from './FlagDistributionChart'
export { ScoreTrendChart } from './ScoreTrendChart'
export { TopPerformersChart } from './TopPerformersChart'

// Tables
export { TeamPerformanceTable } from './TeamPerformanceTable'
export type { AgentPerformance } from './TeamPerformanceTable'

// Filters
export {
  DateRangeFilter,
  DateRangeFilterInline,
  getDateRangeBounds,
  formatDateRange,
  dateRangeDescriptions,
} from './DateRangeFilter'
export type { DateRangeOption } from './DateRangeFilter'
