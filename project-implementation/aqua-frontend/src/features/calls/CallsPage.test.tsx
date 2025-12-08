import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import CallsPage from './CallsPage'

describe('CallsPage', () => {
  it('should render the page header', async () => {
    render(<CallsPage />)

    await waitFor(() => {
      // Multiple elements might have this text, check at least one exists
      const headers = screen.getAllByText('Call Library')
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  it('should render the filters section', async () => {
    render(<CallsPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })
  })

  it('should render the calls table container', async () => {
    render(<CallsPage />)

    await waitFor(() => {
      // Check for table element
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('should display stats cards', async () => {
    render(<CallsPage />)

    await waitFor(() => {
      // Check for stat card content
      expect(screen.getByText('Total calls')).toBeInTheDocument()
    })
  })
})
