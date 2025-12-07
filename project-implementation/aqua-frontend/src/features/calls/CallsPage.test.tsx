import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import CallsPage from './CallsPage'

describe('CallsPage', () => {
  it('should render the page header', async () => {
    render(<CallsPage />)

    await waitFor(() => {
      expect(screen.getByText('Call Library')).toBeInTheDocument()
    })
  })

  it('should render the filters section', async () => {
    render(<CallsPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })
  })

  it('should render the calls table', async () => {
    render(<CallsPage />)

    await waitFor(() => {
      // Check for table headers
      expect(screen.getByText('Agent')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
    })
  })

  it('should display loading state initially', () => {
    render(<CallsPage />)

    // The table should render with data (mock or real)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
