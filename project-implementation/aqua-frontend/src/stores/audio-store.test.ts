import { describe, it, expect, beforeEach } from 'vitest'
import { useAudioStore } from './audio-store'

describe('useAudioStore', () => {
  beforeEach(() => {
    useAudioStore.getState().reset()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useAudioStore.getState()
      expect(state.isPlaying).toBe(false)
      expect(state.currentTime).toBe(0)
      expect(state.volume).toBe(1)
      expect(state.playbackRate).toBe(1)
    })
  })

  describe('playback controls', () => {
    it('should set playing state', () => {
      useAudioStore.getState().setPlaying(true)
      expect(useAudioStore.getState().isPlaying).toBe(true)
    })

    it('should set current time', () => {
      useAudioStore.getState().setCurrentTime(30)
      expect(useAudioStore.getState().currentTime).toBe(30)
    })

    it('should set playback rate', () => {
      useAudioStore.getState().setPlaybackRate(1.5)
      expect(useAudioStore.getState().playbackRate).toBe(1.5)
    })
  })

  describe('volume controls', () => {
    it('should set volume', () => {
      useAudioStore.getState().setVolume(0.5)
      expect(useAudioStore.getState().volume).toBe(0.5)
    })

    it('should toggle mute', () => {
      useAudioStore.getState().toggleMute()
      expect(useAudioStore.getState().isMuted).toBe(true)
      useAudioStore.getState().toggleMute()
      expect(useAudioStore.getState().isMuted).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useAudioStore.getState().setPlaying(true)
      useAudioStore.getState().setCurrentTime(100)
      useAudioStore.getState().setCurrentCallId('call-123')

      useAudioStore.getState().reset()

      expect(useAudioStore.getState().isPlaying).toBe(false)
      expect(useAudioStore.getState().currentTime).toBe(0)
      expect(useAudioStore.getState().currentCallId).toBeNull()
    })
  })
})
