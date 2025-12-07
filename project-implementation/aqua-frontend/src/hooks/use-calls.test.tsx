import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCallsQuery, useCallQuery, useCallSummariesQuery } from './use-calls'
import { mockCall } from '@/test/mocks/handlers'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCallsQuery', () => {
  it('should fetch calls successfully', async () => {
    const { result } = renderHook(() => useCallsQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  it('should handle loading state', () => {
    const { result } = renderHook(() => useCallsQuery(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })
})

describe('useCallSummariesQuery', () => {
  it('should fetch call summaries', async () => {
    const { result } = renderHook(() => useCallSummariesQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useCallQuery', () => {
  it('should fetch a single call by transactionId', async () => {
    const { result } = renderHook(
      () => useCallQuery(mockCall.transactionId),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })

  it('should not fetch when transactionId is empty', () => {
    const { result } = renderHook(() => useCallQuery(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})
