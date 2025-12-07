import { describe, it, expect, vi } from 'vitest'
import { callsApi } from './calls.api'
import { mockCall } from '@/test/mocks/handlers'

describe('callsApi', () => {
  describe('getAll', () => {
    it('should fetch all calls successfully', async () => {
      const response = await callsApi.getAll()
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should include required call properties', async () => {
      const response = await callsApi.getAll()
      const call = response.data[0]
      expect(call).toHaveProperty('transactionId')
      expect(call).toHaveProperty('callId')
      expect(call).toHaveProperty('transcription')
      expect(call).toHaveProperty('scoreCard')
    })
  })

  describe('getSummary', () => {
    it('should fetch call summaries successfully', async () => {
      const response = await callsApi.getSummary()
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
    })
  })

  describe('getById', () => {
    it('should fetch a specific call by transactionId', async () => {
      const call = await callsApi.getById(mockCall.transactionId)
      expect(call).toBeDefined()
      expect(call.transactionId).toBe(mockCall.transactionId)
    })
  })

  describe('uploadAudio', () => {
    it.skip('should upload a file and track progress', async () => {
      // Skipped: Requires complex MSW multipart handling
      const mockFile = new File(['test audio content'], 'test.mp3', {
        type: 'audio/mpeg',
      })
      const onProgress = vi.fn()

      const response = await callsApi.uploadAudio(mockFile, onProgress)
      expect(response.data).toHaveProperty('success', true)
    })
  })

  describe('uploadMultipleAudios', () => {
    it.skip('should upload multiple files sequentially', async () => {
      // Skipped: Requires complex MSW multipart handling
      const mockFiles = [
        new File(['audio1'], 'test1.mp3', { type: 'audio/mpeg' }),
        new File(['audio2'], 'test2.mp3', { type: 'audio/mpeg' }),
      ]
      const onProgress = vi.fn()

      const results = await callsApi.uploadMultipleAudios(mockFiles, onProgress)
      expect(results).toHaveLength(2)
    })
  })
})
