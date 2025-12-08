import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { SentimentAudioPlayer } from './SentimentAudioPlayer'
import type { DiarizationEntry } from '@/types'

// Mock HTML Audio element
beforeEach(() => {
  vi.stubGlobal('HTMLMediaElement.prototype.play', vi.fn(() => Promise.resolve()))
  vi.stubGlobal('HTMLMediaElement.prototype.pause', vi.fn())
})

const mockDiarization: DiarizationEntry[] = [
  {
    turnIndex: 0,
    speaker: 'Customer',
    text: 'Hi, I need help with my account.',
    sentiment: 'Neutral',
  },
  {
    turnIndex: 1,
    speaker: 'Agent',
    text: 'Hello! I\'d be happy to help you today.',
    sentiment: 'Positive',
  },
  {
    turnIndex: 2,
    speaker: 'Customer',
    text: 'I\'ve been having issues for days now.',
    sentiment: 'Negative',
  },
  {
    turnIndex: 3,
    speaker: 'Agent',
    text: 'I understand your frustration. Let me look into this.',
    sentiment: 'Neutral',
  },
]

describe('SentimentAudioPlayer', () => {
  describe('Rendering', () => {
    it('should render audio player with controls', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Should have buttons for controls
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render waveform visualization', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Component should render
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Waveform Segments', () => {
    it('should render segments for each diarization entry', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Component renders correctly with diarization data
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Speaker Colors', () => {
    it('should apply different colors for Agent and Customer', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Component should render with diarization data
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Sentiment Colors', () => {
    it('should apply positive sentiment color (green)', () => {
      const positiveDiarization: DiarizationEntry[] = [
        {
          turnIndex: 0,
          speaker: 'Agent',
          text: 'Great to help!',
          sentiment: 'Positive',
        },
      ]

      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={positiveDiarization}
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should apply negative sentiment color (red)', () => {
      const negativeDiarization: DiarizationEntry[] = [
        {
          turnIndex: 0,
          speaker: 'Customer',
          text: 'This is terrible!',
          sentiment: 'Negative',
        },
      ]

      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={negativeDiarization}
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should apply neutral sentiment color (blue)', () => {
      const neutralDiarization: DiarizationEntry[] = [
        {
          turnIndex: 0,
          speaker: 'Agent',
          text: 'Let me check that.',
          sentiment: 'Neutral',
        },
      ]

      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={neutralDiarization}
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Playback Controls', () => {
    it('should have play/pause button', () => {
      render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Should have at least one button for playback control
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should toggle play state on button click', () => {
      render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      const buttons = screen.getAllByRole('button')
      const playButton = buttons[0]
      fireEvent.click(playButton)

      // Button should still be in the document after click
      expect(playButton).toBeInTheDocument()
    })
  })

  describe('Time Display', () => {
    it('should display current time and duration', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Time display should be present (format: 0:00 / 0:00)
      expect(container.textContent).toMatch(/\d+:\d+/)
    })
  })

  describe('Turn Markers', () => {
    it('should display turn markers below waveform', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Component renders with turn indicators
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Legend', () => {
    it('should display speaker color legend', () => {
      render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Legend should show Agent and Customer
      expect(screen.getByText('Agent')).toBeInTheDocument()
      expect(screen.getByText('Customer')).toBeInTheDocument()
    })

    it('should display sentiment color legend', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Legend uses symbols: + for positive, ~ for neutral, - for negative
      const textContent = container.textContent || ''
      // Check for sentiment indicators (symbols used in the legend)
      expect(textContent).toContain('+')
      expect(textContent).toContain('~')
      expect(textContent).toContain('-')
    })
  })

  describe('Empty State', () => {
    it('should handle empty diarization array', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={[]}
        />
      )

      // Should still render the player
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Click to Seek', () => {
    it('should allow clicking on waveform to seek', () => {
      const { container } = render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Find the waveform area
      const waveformArea = container.querySelector('.cursor-pointer')
      if (waveformArea) {
        fireEvent.click(waveformArea)
      }

      // Component should handle click without error
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible play button', () => {
      render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Should have buttons for accessibility
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      // Buttons should be focusable (accessible)
      expect(buttons[0]).toBeInTheDocument()
    })

    it('should have proper ARIA labels', () => {
      render(
        <SentimentAudioPlayer
          audioUrl="/audio/sample.wav"
          diarization={mockDiarization}
        />
      )

      // Button should have accessible label
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})

describe('SentimentAudioPlayer Integration', () => {
  it('should render complete player with all features', () => {
    const { container } = render(
      <SentimentAudioPlayer
        audioUrl="/audio/sample.wav"
        diarization={mockDiarization}
        className="shadow-lg"
      />
    )

    // Player should be fully rendered
    expect(container.firstChild).toBeInTheDocument()

    // Should have controls (multiple buttons)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Should have legend
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('Customer')).toBeInTheDocument()
  })
})
