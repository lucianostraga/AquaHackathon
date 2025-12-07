import { memo } from 'react'
import {
  FileAudio,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { UploadFile } from '../types'

interface FileItemProps {
  file: UploadFile
  onRemove: (id: string) => void
  disabled?: boolean
}

// File extension to icon color mapping
const FILE_TYPE_COLORS: Record<string, string> = {
  mp3: 'text-purple-500',
  wav: 'text-blue-500',
  m4a: 'text-green-500',
}

function FileItemComponent({ file, onRemove, disabled = false }: FileItemProps) {
  const { id, name, size, progress, status, errorMessage } = file

  // Get file extension
  const extension = name.split('.').pop()?.toLowerCase() || 'unknown'
  const iconColor = FILE_TYPE_COLORS[extension] || 'text-slate-500'

  // Format file size
  const formattedSize = formatFileSize(size)

  // Determine if we can remove the file
  const canRemove = status !== 'uploading' && !disabled

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-lg border p-4 transition-all duration-200',
        status === 'success' && 'border-green-200 bg-green-50/50',
        status === 'error' && 'border-red-200 bg-red-50/50',
        status === 'pending' && 'border-slate-200 bg-white hover:border-slate-300',
        status === 'uploading' && 'border-blue-200 bg-blue-50/30'
      )}
    >
      {/* File icon */}
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
          status === 'success' && 'bg-green-100',
          status === 'error' && 'bg-red-100',
          status === 'pending' && 'bg-slate-100',
          status === 'uploading' && 'bg-blue-100'
        )}
      >
        {status === 'success' ? (
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        ) : status === 'error' ? (
          <AlertCircle className="h-6 w-6 text-red-600" />
        ) : status === 'uploading' ? (
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        ) : (
          <FileAudio className={cn('h-6 w-6', iconColor)} />
        )}
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-900" title={name}>
            {name}
          </p>
          <span
            className={cn(
              'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium uppercase',
              FILE_TYPE_COLORS[extension]?.replace('text-', 'bg-').replace('500', '100') || 'bg-slate-100',
              FILE_TYPE_COLORS[extension] || 'text-slate-600'
            )}
          >
            {extension}
          </span>
        </div>

        {/* Size and status info */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-slate-500">{formattedSize}</span>

          {status === 'uploading' && (
            <>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-medium text-blue-600">
                Uploading... {progress}%
              </span>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-medium text-green-600">
                Uploaded successfully
              </span>
            </>
          )}

          {status === 'error' && errorMessage && (
            <>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-medium text-red-600" title={errorMessage}>
                {errorMessage.length > 40
                  ? `${errorMessage.slice(0, 40)}...`
                  : errorMessage}
              </span>
            </>
          )}
        </div>

        {/* Progress bar for uploading state */}
        {status === 'uploading' && (
          <div className="mt-2">
            <Progress
              value={progress}
              className="h-1.5 bg-blue-100"
            />
          </div>
        )}
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100',
          !canRemove && 'cursor-not-allowed opacity-0 group-hover:opacity-30',
          status === 'error' && 'opacity-100'
        )}
        onClick={() => canRemove && onRemove(id)}
        disabled={!canRemove}
        aria-label={`Remove ${name}`}
      >
        <X className="h-4 w-4 text-slate-500" />
      </Button>
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

// Memoize the component to prevent unnecessary re-renders
export const FileItem = memo(FileItemComponent)
