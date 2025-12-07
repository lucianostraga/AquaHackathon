import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { callsApi } from '@/services/api'
import type { FilterParams } from '@/types'

export const callsKeys = {
  all: ['calls'] as const,
  lists: () => [...callsKeys.all, 'list'] as const,
  list: (filters?: FilterParams) => [...callsKeys.lists(), filters] as const,
  summaries: () => [...callsKeys.all, 'summaries'] as const,
  details: () => [...callsKeys.all, 'detail'] as const,
  detail: (id: string) => [...callsKeys.details(), id] as const,
}

export function useCallsQuery(filters?: FilterParams) {
  return useQuery({
    queryKey: callsKeys.list(filters),
    queryFn: () => callsApi.getAll(filters).then(res => res.data),
  })
}

export function useCallSummariesQuery() {
  return useQuery({
    queryKey: callsKeys.summaries(),
    queryFn: () => callsApi.getSummary().then(res => res.data),
  })
}

export function useCallQuery(transactionId: string) {
  return useQuery({
    queryKey: callsKeys.detail(transactionId),
    queryFn: () => callsApi.getById(transactionId),
    enabled: !!transactionId,
  })
}

export function useUploadAudioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (progress: number) => void
    }) => callsApi.uploadAudio(file, onProgress),
    onSuccess: () => {
      // Invalidate calls queries to refresh the list
      queryClient.invalidateQueries({ queryKey: callsKeys.all })
    },
  })
}

export function useUploadMultipleAudiosMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: File[]
      onProgress?: (fileIndex: number, progress: number) => void
    }) => callsApi.uploadMultipleAudios(files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callsKeys.all })
    },
  })
}
