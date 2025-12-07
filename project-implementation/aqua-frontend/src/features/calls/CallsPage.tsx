import { useState, useMemo, useCallback } from 'react'
import { Header, PageContainer } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { useCallSummariesQuery } from '@/hooks'
import { CallsTable } from './components/CallsTable'
import { CallFilters, defaultFilters, type CallFiltersState } from './components/CallFilters'
import type { CallSummary } from '@/types'

/**
 * Mock data for testing when API is unavailable
 */
const mockCalls: CallSummary[] = [
  {
    id: 1,
    transactionId: 'TXN-001',
    callId: 'CALL-001',
    agentName: 'John Smith',
    audioName: 'call_001.mp3',
    duration: '5:32',
    date: '2024-12-05',
    overallScore: 85,
    flag: 'Green',
    status: 'Reviewed',
  },
  {
    id: 2,
    transactionId: 'TXN-002',
    callId: 'CALL-002',
    agentName: 'Jane Doe',
    audioName: 'call_002.mp3',
    duration: '8:15',
    date: '2024-12-05',
    overallScore: 62,
    flag: 'Yellow',
    status: 'Pending',
  },
  {
    id: 3,
    transactionId: 'TXN-003',
    callId: 'CALL-003',
    agentName: 'Bob Wilson',
    audioName: 'call_003.mp3',
    duration: '3:45',
    date: '2024-12-04',
    overallScore: 45,
    flag: 'Red',
    status: 'Processing',
  },
  {
    id: 4,
    transactionId: 'TXN-004',
    callId: 'CALL-004',
    agentName: 'Sarah Johnson',
    audioName: 'call_004.mp3',
    duration: '12:20',
    date: '2024-12-04',
    overallScore: 92,
    flag: 'Green',
    status: 'Reviewed',
  },
  {
    id: 5,
    transactionId: 'TXN-005',
    callId: 'CALL-005',
    agentName: 'Michael Brown',
    audioName: 'call_005.mp3',
    duration: '6:55',
    date: '2024-12-03',
    overallScore: 78,
    flag: 'Yellow',
    status: 'Reviewed',
  },
  {
    id: 6,
    transactionId: 'TXN-006',
    callId: 'CALL-006',
    agentName: 'Emily Davis',
    audioName: 'call_006.mp3',
    duration: '4:30',
    date: '2024-12-03',
    overallScore: 38,
    flag: 'Red',
    status: 'Reviewed',
  },
  {
    id: 7,
    transactionId: 'TXN-007',
    callId: 'CALL-007',
    agentName: 'John Smith',
    audioName: 'call_007.mp3',
    duration: '9:12',
    date: '2024-12-02',
    overallScore: 88,
    flag: 'Green',
    status: 'Reviewed',
  },
  {
    id: 8,
    transactionId: 'TXN-008',
    callId: 'CALL-008',
    agentName: 'Jane Doe',
    audioName: 'call_008.mp3',
    duration: '7:45',
    date: '2024-12-02',
    overallScore: 71,
    flag: 'Yellow',
    status: 'Processing',
  },
  {
    id: 9,
    transactionId: 'TXN-009',
    callId: 'CALL-009',
    agentName: 'Robert Taylor',
    audioName: 'call_009.mp3',
    duration: '5:00',
    date: '2024-12-01',
    overallScore: 95,
    flag: 'Green',
    status: 'Reviewed',
  },
  {
    id: 10,
    transactionId: 'TXN-010',
    callId: 'CALL-010',
    agentName: 'Lisa Anderson',
    audioName: 'call_010.mp3',
    duration: '11:30',
    date: '2024-12-01',
    overallScore: 52,
    flag: 'Red',
    status: 'Pending',
  },
  {
    id: 11,
    transactionId: 'TXN-011',
    callId: 'CALL-011',
    agentName: 'David Martinez',
    audioName: 'call_011.mp3',
    duration: '8:00',
    date: '2024-11-30',
    overallScore: 81,
    flag: 'Green',
    status: 'Reviewed',
  },
  {
    id: 12,
    transactionId: 'TXN-012',
    callId: 'CALL-012',
    agentName: 'Jennifer White',
    audioName: 'call_012.mp3',
    duration: '6:15',
    date: '2024-11-30',
    overallScore: 67,
    flag: 'Yellow',
    status: 'Reviewed',
  },
]

/**
 * CallsPage - Main page for the Call Library feature
 *
 * Displays a searchable, filterable list of call recordings with:
 * - Search functionality in the header
 * - Date range, flag, and status filters
 * - Sortable data table with pagination
 * - Click-through to call details
 */
export default function CallsPage() {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<CallFiltersState>(defaultFilters)

  // Fetch call summaries from API
  const { data: apiCalls, isLoading, isError } = useCallSummariesQuery()

  // Use mock data if API fails or returns nothing, otherwise use API data
  const calls = useMemo(() => {
    if (apiCalls && apiCalls.length > 0) {
      return apiCalls
    }
    // Fall back to mock data for demo purposes
    return mockCalls
  }, [apiCalls])

  // Apply filters to the data
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      // Date range filter
      if (filters.dateRange !== 'all') {
        const callDate = new Date(call.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (filters.dateRange) {
          case 'today': {
            const callDateNormalized = new Date(callDate)
            callDateNormalized.setHours(0, 0, 0, 0)
            if (callDateNormalized.getTime() !== today.getTime()) {
              return false
            }
            break
          }
          case '7days': {
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            if (callDate < weekAgo) {
              return false
            }
            break
          }
          case '30days': {
            const monthAgo = new Date(today)
            monthAgo.setDate(monthAgo.getDate() - 30)
            if (callDate < monthAgo) {
              return false
            }
            break
          }
          case '90days': {
            const threeMonthsAgo = new Date(today)
            threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90)
            if (callDate < threeMonthsAgo) {
              return false
            }
            break
          }
        }
      }

      // Flag filter
      if (filters.flag !== 'all' && call.flag !== filters.flag) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && call.status !== filters.status) {
        return false
      }

      return true
    })
  }, [calls, filters])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: CallFiltersState) => {
    setFilters(newFilters)
  }, [])

  // Reset filters to default
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <>
      <Header title="Call Library" showSearch onSearch={handleSearch} />
      <PageContainer>
        <div className="space-y-6">
          {/* Page description and stats */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-slate-600">
                Browse and analyze call recordings. Click on a call to view detailed
                evaluation results.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4">
              <QuickStat
                label="Total Calls"
                value={calls.length}
                color="slate"
              />
              <QuickStat
                label="Needs Review"
                value={calls.filter((c) => c.flag === 'Red').length}
                color="red"
              />
              <QuickStat
                label="Pending"
                value={calls.filter((c) => c.status === 'Pending').length}
                color="yellow"
              />
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <CallFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              totalResults={filteredCalls.length}
            />
          </Card>

          {/* Error state */}
          {isError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Unable to connect to the API. Showing demo data.
              </p>
            </div>
          )}

          {/* Data table */}
          <CallsTable
            data={filteredCalls}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        </div>
      </PageContainer>
    </>
  )
}

/**
 * Quick stat display component
 */
function QuickStat({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'slate' | 'red' | 'yellow' | 'green'
}) {
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${colorClasses[color]}`}
      >
        {value}
      </span>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  )
}
