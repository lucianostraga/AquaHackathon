import { useCallback, useState } from 'react'
import { Upload, FileAudio } from 'lucide-react'
import { cn } from '@/lib/utils'

// Constants for file validation
const ACCEPTED_FILE_TYPES = ['.mp3', '.wav', '.m4a']
const ACCEPTED_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

interface ValidationError {
  fileName: string
  message: string
}

export function UploadDropzone({ onFilesSelected, disabled = false }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  // Validate file type and size
  const validateFile = useCallback((file: File): ValidationError | null => {
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    const isValidType = ACCEPTED_FILE_TYPES.includes(fileExtension) ||
                        ACCEPTED_MIME_TYPES.includes(file.type)

    if (!isValidType) {
      return {
        fileName: file.name,
        message: `Invalid file type. Accepted formats: ${ACCEPTED_FILE_TYPES.join(', ')}`
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        fileName: file.name,
        message: `File exceeds maximum size of 50MB (${formatFileSize(file.size)})`
      }
    }

    return null
  }, [])

  // Process dropped or selected files
  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    const errors: ValidationError[] = []
    const validFiles: File[] = []

    files.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    setValidationErrors(errors)

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }

    // Clear errors after 5 seconds
    if (errors.length > 0) {
      setTimeout(() => setValidationErrors([]), 5000)
    }
  }, [onFilesSelected, validateFile])

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragActive(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set inactive if we're leaving the dropzone entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (disabled) return

    const { files } = e.dataTransfer
    processFiles(files)
  }, [disabled, processFiles])

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (disabled) return
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = ACCEPTED_FILE_TYPES.join(',')
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      processFiles(target.files)
    }
    input.click()
  }, [disabled, processFiles])

  // Handle keyboard accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  return (
    <div className="space-y-4">
      {/* Dropzone area */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload audio files. Click or drag and drop files here."
        aria-disabled={disabled}
        className={cn(
          'relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200',
          // Default state
          'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50',
          // Active drag state
          isDragActive && 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100',
          // Disabled state
          disabled && 'cursor-not-allowed opacity-50 hover:border-slate-300 hover:bg-slate-50/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Icon */}
        <div
          className={cn(
            'mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200',
            isDragActive
              ? 'bg-blue-100 text-blue-600 scale-110'
              : 'bg-slate-100 text-slate-500'
          )}
        >
          {isDragActive ? (
            <FileAudio className="h-8 w-8" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        {/* Text content */}
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700">
            {isDragActive ? 'Drop your audio files here' : 'Drag and drop audio files'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            or <span className="font-medium text-blue-600">click to browse</span>
          </p>
        </div>

        {/* File type info */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {ACCEPTED_FILE_TYPES.map((type) => (
            <span
              key={type}
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {type.toUpperCase()}
            </span>
          ))}
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">Max 50MB per file</span>
        </div>

        {/* Active drag overlay effect */}
        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-blue-500/5" />
        )}
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Some files could not be added:
          </p>
          <ul className="space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">
                <span className="font-medium">{error.fileName}:</span> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
