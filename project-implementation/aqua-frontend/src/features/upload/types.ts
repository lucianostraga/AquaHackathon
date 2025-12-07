/**
 * Represents a file in the upload queue with its current status and progress
 */
export interface UploadFile {
  /** Unique identifier for the file in the queue */
  id: string
  /** The actual File object */
  file: File
  /** File name for display */
  name: string
  /** File size in bytes */
  size: number
  /** Upload progress percentage (0-100) */
  progress: number
  /** Current upload status */
  status: 'pending' | 'uploading' | 'success' | 'error'
  /** Error message if status is 'error' */
  errorMessage?: string
}

/**
 * Summary of upload batch results
 */
export interface UploadSummary {
  total: number
  successful: number
  failed: number
}
