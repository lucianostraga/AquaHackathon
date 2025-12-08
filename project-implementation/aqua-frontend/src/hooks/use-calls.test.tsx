import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCallQuery, useCallSummariesQuery } from './use-calls'
import { mockCall } from '@/test/mocks/handlers'

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useCallQuery', () => {
  it('should fetch call by transaction ID', async () => {
    const { result } = renderHook(
      () => useCallQuery(mockCall.transactionId),
      { wrapper: createWrapper() }
    )

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify call data
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.transactionId).toBe(mockCall.transactionId)
    expect(result.current.data?.agentName).toBe(mockCall.agentName)
  })

  it('should return call with scorecard data', async () => {
    const { result } = renderHook(
      () => useCallQuery(mockCall.transactionId),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const call = result.current.data
    expect(call?.scoreCard).toBeDefined()
    expect(call?.scoreCard.groups).toHaveLength(1)
    expect(call?.scoreCard.groups[0].groupName).toBe('Opening')
  })

  it('should return call with transcription diarization', async () => {
    const { result } = renderHook(
      () => useCallQuery(mockCall.transactionId),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const call = result.current.data
    expect(call?.transcription).toBeDefined()
    expect(call?.transcription.diarization).toHaveLength(2)
    expect(call?.transcription.diarization[0].speaker).toBe('Customer')
    expect(call?.transcription.diarization[1].speaker).toBe('Agent')
  })

  it('should return call with sentiment analysis', async () => {
    const { result } = renderHook(
      () => useCallQuery(mockCall.transactionId),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const call = result.current.data
    expect(call?.sentimentAnalisys).toBeDefined()
    expect(call?.sentimentAnalisys.sentiment).toHaveLength(2)
    expect(call?.sentimentAnalisys.summary).toBeDefined()
  })

  it('should return call with anomaly flag', async () => {
    const { result } = renderHook(
      () => useCallQuery(mockCall.transactionId),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const call = result.current.data
    expect(call?.anomaly).toBeDefined()
    expect(call?.anomaly.flag).toBe('Green')
    expect(call?.anomaly.justification).toContain('No critical issues detected')
  })

  it('should be disabled when transactionId is empty', async () => {
    const { result } = renderHook(
      () => useCallQuery(''),
      { wrapper: createWrapper() }
    )

    // Should not be loading when disabled
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCallSummariesQuery', () => {
  it('should fetch all call summaries', async () => {
    const { result } = renderHook(
      () => useCallSummariesQuery(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data).toHaveLength(2)
  })

  it('should return call summaries with required fields', async () => {
    const { result } = renderHook(
      () => useCallSummariesQuery(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const summaries = result.current.data
    expect(summaries?.[0]).toHaveProperty('transactionId')
    expect(summaries?.[0]).toHaveProperty('agentName')
    expect(summaries?.[0]).toHaveProperty('scoreCard')
    expect(summaries?.[0]).toHaveProperty('processDate')
  })

  it('should include flagged status in summaries', async () => {
    const { result } = renderHook(
      () => useCallSummariesQuery(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const summaries = result.current.data
    const flaggedCall = summaries?.find(s => s.Flagged === true)
    const unflaggedCall = summaries?.find(s => s.Flagged === false)

    expect(flaggedCall).toBeDefined()
    expect(unflaggedCall).toBeDefined()
    expect(flaggedCall?.Issues).toContain('Low score')
  })

  it('should return summaries sorted by process date', async () => {
    const { result } = renderHook(
      () => useCallSummariesQuery(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const summaries = result.current.data
    expect(summaries?.[0].processDate).toBeDefined()
    expect(summaries?.[1].processDate).toBeDefined()
  })
})

describe('Call Data Integrity', () => {
  it('should have matching transactionId in call and summary', async () => {
    const { result: callResult } = renderHook(
      () => useCallQuery(mockCall.transactionId),
      { wrapper: createWrapper() }
    )

    const { result: summaryResult } = renderHook(
      () => useCallSummariesQuery(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(callResult.current.isLoading).toBe(false)
      expect(summaryResult.current.isLoading).toBe(false)
    })

    const call = callResult.current.data
    const summary = summaryResult.current.data?.find(
      s => s.transactionId === call?.transactionId
    )

    expect(summary).toBeDefined()
    expect(summary?.agentName).toBe(call?.agentName)
  })
})
