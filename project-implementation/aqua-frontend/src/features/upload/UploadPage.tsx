import { useState, useCallback, useRef } from 'react'
import { HelpCircle, Headphones } from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { useUploadAudioMutation } from '@/hooks'
import { useAppStore } from '@/stores'
import { useToast } from '@/hooks/use-toast'
import {
  UploadDropzone,
  FileList,
  UploadSuccessDialog,
} from './components'
import type { UploadFile, UploadSummary } from './types'

// Generate unique ID for each file
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export default function UploadPage() {
  // State for managing files in the queue
  const [files, setFiles] = useState<UploadFile[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [uploadSummary, setUploadSummary] = useState<UploadSummary>({
    total: 0,
    successful: 0,
    failed: 0,
  })

  // Ref to track if upload was cancelled
  const uploadCancelledRef = useRef(false)

  // Hooks
  const { toast } = useToast()
  const uploadMutation = useUploadAudioMutation()
  const { isUploading, setUploading } = useAppStore()

  // Add files to the queue
  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending',
    }))

    setFiles((prev) => [...prev, ...uploadFiles])

    toast({
      title: 'Files added',
      description: `${newFiles.length} ${newFiles.length === 1 ? 'file' : 'files'} added to upload queue`,
    })
  }, [toast])

  // Remove a file from the queue
  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }, [])

  // Clear all files from the queue
  const handleClearAll = useCallback(() => {
    setFiles([])
  }, [])

  // Update file status
  const updateFileStatus = useCallback(
    (
      id: string,
      updates: Partial<Pick<UploadFile, 'progress' | 'status' | 'errorMessage'>>
    ) => {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === id ? { ...file, ...updates } : file
        )
      )
    },
    []
  )

  // Start uploading files
  const handleStartUpload = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    uploadCancelledRef.current = false
    setUploading(true, 0)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < pendingFiles.length; i++) {
      // Check if upload was cancelled
      if (uploadCancelledRef.current) {
        break
      }

      const file = pendingFiles[i]

      // Update status to uploading
      updateFileStatus(file.id, { status: 'uploading', progress: 0 })

      try {
        await uploadMutation.mutateAsync({
          file: file.file,
          onProgress: (progress) => {
            // Update individual file progress
            updateFileStatus(file.id, { progress })
            // Update global progress (average of all files)
            const overallProgress = Math.round(
              ((i * 100 + progress) / pendingFiles.length)
            )
            setUploading(true, overallProgress)
          },
        })

        // Mark as successful
        updateFileStatus(file.id, { status: 'success', progress: 100 })
        successCount++
      } catch (error) {
        // Mark as failed
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed'
        updateFileStatus(file.id, {
          status: 'error',
          errorMessage,
          progress: 0,
        })
        failCount++
      }
    }

    setUploading(false, 0)

    // Show success dialog with summary
    const summary: UploadSummary = {
      total: pendingFiles.length,
      successful: successCount,
      failed: failCount,
    }
    setUploadSummary(summary)
    setShowSuccessDialog(true)
  }, [files, uploadMutation, updateFileStatus, setUploading])

  // Cancel ongoing upload
  const handleCancelUpload = useCallback(() => {
    uploadCancelledRef.current = true
    setUploading(false, 0)

    // Mark any uploading files as pending again
    setFiles((prev) =>
      prev.map((file) =>
        file.status === 'uploading'
          ? { ...file, status: 'pending', progress: 0 }
          : file
      )
    )

    toast({
      title: 'Upload cancelled',
      description: 'The upload has been cancelled. You can try again.',
      variant: 'destructive',
    })
  }, [setUploading, toast])

  // Handle upload more action from success dialog
  const handleUploadMore = useCallback(() => {
    // Clear successful files, keep failed ones for retry
    setFiles((prev) => prev.filter((file) => file.status !== 'success'))
  }, [])

  return (
    <>
      <Header title="Upload Audio" />
      <PageContainer>
        <div className="mx-auto max-w-3xl">
          {/* Page intro */}
          <div className="mb-6">
            <div className="flex items-start gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Headphones className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Upload Call Recordings
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Upload audio files from your call center for AI-powered quality
                  analysis and evaluation. Supported formats include MP3, WAV, and
                  M4A files up to 50MB each.
                </p>
              </div>
            </div>
          </div>

          {/* Main upload card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <UploadDropzone
              onFilesSelected={handleFilesSelected}
              disabled={isUploading}
            />

            <FileList
              files={files}
              onRemoveFile={handleRemoveFile}
              onClearAll={handleClearAll}
              onStartUpload={handleStartUpload}
              onCancelUpload={handleCancelUpload}
              isUploading={isUploading}
            />
          </div>

          {/* Help section */}
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <HelpCircle className="h-5 w-5 shrink-0 text-slate-400" />
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-700">Tips for best results:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Use clear audio recordings without background noise</li>
                <li>Ensure both parties are audible in the recording</li>
                <li>Longer calls provide more comprehensive analysis</li>
                <li>Standard phone call quality (8kHz) works well</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success dialog */}
        <UploadSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          summary={uploadSummary}
          onUploadMore={handleUploadMore}
        />
      </PageContainer>
    </>
  )
}
