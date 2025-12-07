/**
 * Audio Components
 *
 * Professional audio player with waveform visualization for AQUA hackathon.
 * Uses WaveSurfer.js for waveform rendering and visualization.
 */

// Main player components
export {
  AudioPlayer,
  AudioPlayerSkeleton,
  AudioPlayerCompact,
  AudioPlayerMini,
} from './AudioPlayer'

// Sub-components (for custom implementations)
export {
  Waveform,
  WaveformSkeleton,
  WaveformPlaceholder,
  useWaveformControl,
  type SpeakerSegment,
} from './Waveform'

export { PlaybackControls } from './PlaybackControls'

export { VolumeControl, VolumeControlInline } from './VolumeControl'

export { SpeedControl, SpeedControlCompact } from './SpeedControl'

export { TimeDisplay } from './TimeDisplay'
