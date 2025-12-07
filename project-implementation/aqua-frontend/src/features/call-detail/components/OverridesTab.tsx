import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Call, FlagType } from '@/types'
import {
  Edit3,
  Save,
  AlertCircle,
  RefreshCw,
  MessageSquarePlus,
  Flag,
  ClipboardCheck
} from 'lucide-react'
import { useState } from 'react'

interface OverridesTabProps {
  call: Call
  className?: string
}

/**
 * OverridesTab - Form for overriding automated scores
 *
 * Placeholder implementation with:
 * - Score override controls
 * - Flag override dropdown
 * - Notes section
 * - Review status toggle
 *
 * This is a placeholder for the hackathon - actual implementation
 * would connect to backend API for persisting overrides.
 */
export function OverridesTab({ call, className }: OverridesTabProps) {
  const [notes, setNotes] = useState('')
  const [flagOverride, setFlagOverride] = useState<FlagType | 'none'>('none')
  const [isReviewed, setIsReviewed] = useState(false)
  const [scoreAdjustment, setScoreAdjustment] = useState([0])

  const handleSave = () => {
    // Placeholder - would submit to API
    // TODO: Implement API call to persist overrides
    void { notes, flagOverride, isReviewed, scoreAdjustment: scoreAdjustment[0] }
  }

  const handleReset = () => {
    setNotes('')
    setFlagOverride('none')
    setIsReviewed(false)
    setScoreAdjustment([0])
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-800">Manual Override Mode</h4>
            <p className="mt-1 text-sm text-blue-700">
              Use this section to manually override AI-generated scores and flags.
              All changes are logged for audit purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Override Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="h-5 w-5" />
              Score Adjustment
            </CardTitle>
            <CardDescription>
              Adjust the overall score if the AI assessment was incorrect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Score Adjustment</Label>
                <span className="text-sm font-medium text-slate-700">
                  {scoreAdjustment[0] >= 0 ? '+' : ''}
                  {scoreAdjustment[0]} points
                </span>
              </div>
              <Slider
                value={scoreAdjustment}
                onValueChange={setScoreAdjustment}
                min={-20}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Drag to adjust the score. Negative values decrease the score,
                positive values increase it.
              </p>
            </div>

            <div className="rounded-md bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current AI Score:</span>
                <span className="font-semibold text-slate-700">78%</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-slate-500">Adjusted Score:</span>
                <span
                  className={cn(
                    'font-semibold',
                    scoreAdjustment[0] > 0
                      ? 'text-green-600'
                      : scoreAdjustment[0] < 0
                      ? 'text-red-600'
                      : 'text-slate-700'
                  )}
                >
                  {78 + scoreAdjustment[0]}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flag Override Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flag className="h-5 w-5" />
              Flag Override
            </CardTitle>
            <CardDescription>
              Override the AI-assigned flag if it needs correction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Override Flag</Label>
              <Select
                value={flagOverride}
                onValueChange={(v) => setFlagOverride(v as FlagType | 'none')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select flag override" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      No Override (Use AI Flag)
                    </span>
                  </SelectItem>
                  <SelectItem value="Green">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Green - Good Quality
                    </span>
                  </SelectItem>
                  <SelectItem value="Yellow">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      Yellow - Needs Attention
                    </span>
                  </SelectItem>
                  <SelectItem value="Red">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Red - Critical Issue
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current AI Flag:</span>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      call.anomaly.flag === 'Green'
                        ? 'bg-green-500'
                        : call.anomaly.flag === 'Yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    )}
                  />
                  <span className="font-medium text-slate-700">
                    {call.anomaly.flag}
                  </span>
                </span>
              </div>
              {flagOverride !== 'none' && (
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Override Flag:</span>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        flagOverride === 'Green'
                          ? 'bg-green-500'
                          : flagOverride === 'Yellow'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      )}
                    />
                    <span className="font-medium text-slate-700">
                      {flagOverride}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Edit3 className="h-5 w-5" />
            Review Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reviewed-switch" className="text-base">
                Mark as Reviewed
              </Label>
              <p className="text-sm text-slate-500">
                Toggle to indicate this call has been manually reviewed
              </p>
            </div>
            <Switch
              id="reviewed-switch"
              checked={isReviewed}
              onCheckedChange={setIsReviewed}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquarePlus className="h-5 w-5" />
            Review Notes
          </CardTitle>
          <CardDescription>
            Add any additional notes or comments about this call review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your review notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[150px]"
          />
          <p className="text-xs text-slate-500">
            Notes are visible to all reviewers and will be included in audit logs.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Changes
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Overrides
        </Button>
      </div>

      {/* Audit Info */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        <p>
          <strong>Note:</strong> All override actions are logged with timestamp
          and user information for audit compliance. Changes can be reverted by
          administrators if needed.
        </p>
      </div>
    </div>
  )
}

/**
 * OverridesTabSkeleton - Loading state for OverridesTab
 */
export function OverridesTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Info banner skeleton */}
      <Skeleton className="h-20 w-full rounded-lg" />

      {/* Cards grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review status skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Notes skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>

      {/* Buttons skeleton */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
