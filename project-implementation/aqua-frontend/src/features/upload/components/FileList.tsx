import { useMemo } from 'react'
import { Files, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileItem } from './FileItem'
import { cn } from '@/lib/utils'
import type { UploadFile } from '../types'

interface FileListProps {
  files: UploadFile[]
  onRemoveFile: (id: string) => void
  onClearAll: () => void
  onStartUpload: () => void
  onCancelUpload: () => void
  isUploading: boolean
}

export function FileList({
  files,
  onRemoveFile,
  onClearAll,
  onStartUpload,
  onCancelUpload,
  isUploading,
}: FileListProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const pending = files.filter(f => f.status === 'pending').length
    const uploading = files.filter(f => f.status === 'uploading').length
    const success = files.filter(f => f.status === 'success').length
    const error = files.filter(f => f.status === 'error').length
    const totalSize = files.reduce((acc, f) => acc + f.size, 0)

    return { pending, uploading, success, error, totalSize }
  }, [files])

  // Check if there are files that can be uploaded
  const canStartUpload = stats.pending > 0 && !isUploading
  const hasFiles = files.length > 0
  const allComplete = stats.pending === 0 && stats.uploading === 0 && hasFiles

  if (!hasFiles) {
    return null
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <Files className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </h3>
            <p className="text-xs text-slate-500">
              Total size: {formatFileSize(stats.totalSize)}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {stats.pending > 0 && (
            <StatusBadge count={stats.pending} label="pending" variant="pending" />
          )}
          {stats.uploading > 0 && (
            <StatusBadge count={stats.uploading} label="uploading" variant="uploading" />
          )}
          {stats.success > 0 && (
            <StatusBadge count={stats.success} label="complete" variant="success" />
          )}
          {stats.error > 0 && (
            <StatusBadge count={stats.error} label="failed" variant="error" />
          )}
        </div>
      </div>

      {/* File list */}
      <ScrollArea className="max-h-[320px]">
        <div className="space-y-2 p-4">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onRemove={onRemoveFile}
              disabled={isUploading && file.status === 'uploading'}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          disabled={isUploading}
          className="text-slate-600 hover:text-slate-900"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear all
        </Button>

        <div className="flex items-center gap-2">
          {isUploading ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelUpload}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel upload
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onStartUpload}
              disabled={!canStartUpload}
              className={cn(
                'min-w-[140px]',
                allComplete && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {allComplete ? (
                <>All uploads complete</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {stats.pending} {stats.pending === 1 ? 'file' : 'files'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Status badge component
interface StatusBadgeProps {
  count: number
  label: string
  variant: 'pending' | 'uploading' | 'success' | 'error'
}

function StatusBadge({ count, label, variant }: StatusBadgeProps) {
  const variantStyles = {
    pending: 'bg-slate-100 text-slate-600',
    uploading: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        variantStyles[variant]
      )}
    >
      {count} {label}
    </span>
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
