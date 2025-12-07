import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Phone, ArrowRight, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { UploadSummary } from '../types'

interface UploadSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: UploadSummary
  onUploadMore: () => void
}

export function UploadSuccessDialog({
  open,
  onOpenChange,
  summary,
  onUploadMore,
}: UploadSuccessDialogProps) {
  const navigate = useNavigate()

  const handleViewCalls = () => {
    onOpenChange(false)
    navigate('/calls')
  }

  const handleUploadMore = () => {
    onOpenChange(false)
    onUploadMore()
  }

  const allSuccessful = summary.failed === 0
  const hasPartialSuccess = summary.successful > 0 && summary.failed > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          {/* Success icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <DialogTitle className="text-xl">
            {allSuccessful
              ? 'Upload Complete!'
              : hasPartialSuccess
              ? 'Upload Partially Complete'
              : 'Upload Failed'}
          </DialogTitle>

          <DialogDescription className="text-center">
            {allSuccessful ? (
              <>
                {summary.successful} {summary.successful === 1 ? 'file has' : 'files have'} been
                successfully uploaded and will be processed shortly.
              </>
            ) : hasPartialSuccess ? (
              <>
                {summary.successful} {summary.successful === 1 ? 'file' : 'files'} uploaded
                successfully, {summary.failed} {summary.failed === 1 ? 'file' : 'files'} failed.
              </>
            ) : (
              <>All {summary.failed} files failed to upload. Please try again.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Stats summary */}
        <div className="my-4 grid grid-cols-3 gap-4">
          <StatCard
            label="Total"
            value={summary.total}
            variant="neutral"
          />
          <StatCard
            label="Successful"
            value={summary.successful}
            variant="success"
          />
          <StatCard
            label="Failed"
            value={summary.failed}
            variant={summary.failed > 0 ? 'error' : 'neutral'}
          />
        </div>

        {/* Processing note */}
        {summary.successful > 0 && (
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="text-sm text-blue-700">
              Your audio files are being processed by our AI.
              <br />
              This typically takes 2-5 minutes per file.
            </p>
          </div>
        )}

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-col">
          {summary.successful > 0 && (
            <Button
              onClick={handleViewCalls}
              className="w-full"
            >
              <Phone className="mr-2 h-4 w-4" />
              View Calls
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleUploadMore}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload More Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Stat card component
interface StatCardProps {
  label: string
  value: number
  variant: 'neutral' | 'success' | 'error'
}

function StatCard({ label, value, variant }: StatCardProps) {
  const bgStyles = {
    neutral: 'bg-slate-50',
    success: 'bg-green-50',
    error: 'bg-red-50',
  }

  const textStyles = {
    neutral: 'text-slate-900',
    success: 'text-green-600',
    error: 'text-red-600',
  }

  return (
    <div className={`rounded-lg p-3 text-center ${bgStyles[variant]}`}>
      <p className={`text-2xl font-bold ${textStyles[variant]}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
