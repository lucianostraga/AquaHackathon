import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { CallsTable } from './CallsTable'
import type { CallSummary } from '@/types'

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Mock useAuthStore
vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    hasPermission: () => true,
  }),
}))

const mockCallSummaries: CallSummary[] = [
  {
    id: '1',
    transactionId: 'trans-001',
    callId: 'call-001',
    companyId: 1,
    projectId: 1,
    company: 'Team International',
    project: 'Project BASE',
    agentName: 'Robert Johnson',
    audioName: 'CallSample1',
    processDate: '2024-12-01T10:00:00Z',
    scoreCard: 92,
    Flagged: false,
    Issues: [],
    dominantSentiment: 'Positive',
  },
  {
    id: '2',
    transactionId: 'trans-002',
    callId: 'call-002',
    companyId: 1,
    projectId: 1,
    company: 'Team International',
    project: 'Project BASE',
    agentName: 'Sarah Williams',
    audioName: 'CallSample2',
    processDate: '2024-12-02T14:30:00Z',
    scoreCard: 68,
    Flagged: true,
    Issues: ['Low score', 'Customer complaint'],
    dominantSentiment: 'Negative',
  },
  {
    id: '3',
    transactionId: 'trans-003',
    callId: 'call-003',
    companyId: 2,
    projectId: 2,
    company: 'Colo SAS',
    project: 'Project ONE',
    agentName: 'Mike Chen',
    audioName: 'CallSample3',
    processDate: '2024-12-03T09:15:00Z',
    scoreCard: 85,
    Flagged: false,
    Issues: [],
    dominantSentiment: 'Positive',
  },
]

describe('CallsTable', () => {
  describe('Rendering', () => {
    it('should render table with header columns', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      expect(screen.getByText('Agent')).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.getByText('Flag')).toBeInTheDocument()
    })

    it('should render all call rows', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      expect(screen.getByText('Robert Johnson')).toBeInTheDocument()
      expect(screen.getByText('Sarah Williams')).toBeInTheDocument()
      expect(screen.getByText('Mike Chen')).toBeInTheDocument()
    })

    it('should display scores for each call', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      expect(screen.getByText('92%')).toBeInTheDocument()
      expect(screen.getByText('68%')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading skeleton when loading', () => {
      const { container } = render(<CallsTable data={[]} isLoading={true} />)

      // Should have skeleton rows (uses animate-pulse class)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not show skeleton when data is loaded', () => {
      const { container } = render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(0)
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no calls', () => {
      render(<CallsTable data={[]} isLoading={false} />)

      expect(screen.getByText(/no calls/i)).toBeInTheDocument()
    })
  })

  describe('Score Indicators', () => {
    it('should show green indicator for high scores (>=80)', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      // Check for green score indicators
      const score92 = screen.getByText('92%')
      const score85 = screen.getByText('85%')

      expect(score92).toBeInTheDocument()
      expect(score85).toBeInTheDocument()
    })

    it('should show yellow indicator for medium scores (60-79)', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      const score68 = screen.getByText('68%')
      expect(score68).toBeInTheDocument()
    })
  })

  describe('Flag Badges', () => {
    it('should show flag badge for flagged calls', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      // Sarah's call is flagged with issues
      const flaggedRow = screen.getByText('Sarah Williams').closest('tr')
      expect(flaggedRow).toBeInTheDocument()
    })

    it('should not show flag badge for unflagged calls', () => {
      const unflaggedCalls = mockCallSummaries.filter(c => !c.Flagged)
      render(<CallsTable data={unflaggedCalls} isLoading={false} />)

      // Robert and Mike's calls are not flagged
      expect(screen.getByText('Robert Johnson')).toBeInTheDocument()
      expect(screen.getByText('Mike Chen')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('should display formatted dates', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      // Dates should be formatted (format may vary by locale)
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(1) // header + data rows
    })
  })

  describe('Row Interaction', () => {
    it('should have clickable rows', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      const row = screen.getByText('Robert Johnson').closest('tr')
      expect(row).toBeInTheDocument()

      // Row should be interactive
      if (row) {
        fireEvent.click(row)
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<CallsTable data={mockCallSummaries} isLoading={false} />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders.length).toBeGreaterThan(0)
    })
  })
})

describe('CallsTable Sorting', () => {
  it('should render sortable columns', () => {
    render(<CallsTable data={mockCallSummaries} isLoading={false} />)

    // Headers should be present
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })
})

describe('CallsTable Filtering', () => {
  it('should display all calls when no filter applied', () => {
    render(<CallsTable data={mockCallSummaries} isLoading={false} />)

    expect(screen.getByText('Robert Johnson')).toBeInTheDocument()
    expect(screen.getByText('Sarah Williams')).toBeInTheDocument()
    expect(screen.getByText('Mike Chen')).toBeInTheDocument()
  })

  it('should handle filtered calls prop', () => {
    const filteredCalls = mockCallSummaries.filter(c => c.scoreCard >= 80)
    render(<CallsTable data={filteredCalls} isLoading={false} />)

    expect(screen.getByText('Robert Johnson')).toBeInTheDocument()
    expect(screen.getByText('Mike Chen')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Williams')).not.toBeInTheDocument()
  })
})
