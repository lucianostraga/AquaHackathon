import { apiClient, audioApiClient } from './client'
import type { Call, CallSummary, FilterParams } from '@/types'

export const callsApi = {
  // Get all calls with optional filters
  getAll: (filters?: FilterParams) =>
    apiClient.get<Call[]>('/Calls', { params: filters }),

  // Get call summaries for the list view
  getSummary: () =>
    apiClient.get<CallSummary[]>('/CallSummary'),

  // Get a single call by transaction ID
  getById: (transactionId: string) =>
    apiClient.get<Call[]>('/Calls', { params: { transactionId } })
      .then(res => res.data[0]),

  // Get call by callId
  getByCallId: (callId: string) =>
    apiClient.get<Call[]>('/Calls', { params: { callId } })
      .then(res => res.data[0]),

  // Get audio file from .NET API
  getAudio: (audioId: string) =>
    audioApiClient.get(`/Audios/${audioId}`, { responseType: 'blob' }),

  // Upload audio file to .NET API
  uploadAudio: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)

    return audioApiClient.post('/IngestAudio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },

  // Batch upload multiple audio files
  uploadMultipleAudios: async (
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ) => {
    const results = []
    for (let i = 0; i < files.length; i++) {
      const result = await callsApi.uploadAudio(files[i], (progress) => {
        onProgress?.(i, progress)
      })
      results.push(result)
    }
    return results
  },
}
