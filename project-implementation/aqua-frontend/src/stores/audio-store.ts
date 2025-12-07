import { create } from 'zustand'

interface AudioState {
  // Playback state
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  volume: number
  isMuted: boolean

  // Current call/audio
  currentCallId: string | null
  audioUrl: string | null

  // Transcript sync
  currentTurnIndex: number

  // Actions
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setCurrentCallId: (callId: string | null) => void
  setAudioUrl: (url: string | null) => void
  setCurrentTurnIndex: (index: number) => void
  reset: () => void
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  isMuted: false,
  currentCallId: null,
  audioUrl: null,
  currentTurnIndex: 0,

  // Actions
  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing })
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time })
  },

  setDuration: (duration: number) => {
    set({ duration: duration })
  },

  setPlaybackRate: (rate: number) => {
    set({ playbackRate: rate })
  },

  setVolume: (volume: number) => {
    set({ volume, isMuted: volume === 0 })
  },

  toggleMute: () => {
    set({ isMuted: !get().isMuted })
  },

  setCurrentCallId: (callId: string | null) => {
    set({ currentCallId: callId })
  },

  setAudioUrl: (url: string | null) => {
    set({ audioUrl: url })
  },

  setCurrentTurnIndex: (index: number) => {
    set({ currentTurnIndex: index })
  },

  reset: () => {
    set({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      currentCallId: null,
      audioUrl: null,
      currentTurnIndex: 0,
    })
  },
}))
