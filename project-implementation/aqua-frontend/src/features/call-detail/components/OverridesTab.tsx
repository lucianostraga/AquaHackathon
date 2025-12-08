import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores'
import type { Call } from '@/types'
import {
  Settings,
  MessageSquare,
  Upload,
  X,
  History,
  CheckCircle,
  FileAudio,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'

interface OverridesTabProps {
  call: Call
  className?: string
}

/**
 * Calculate group scores from call data
 */
function calculateGroupScores(call: Call) {
  const groups = call.scoreCard.groups
  const totalMax = groups.reduce((sum, g) => sum + g.questions.reduce((s, q) => s + q.maxPoint, 0), 0)

  return groups.map(g => {
    const groupScore = g.questions.reduce((sum, q) => sum + q.score, 0)
    const groupMax = g.questions.reduce((sum, q) => sum + q.maxPoint, 0)
    const aiScore = groupMax > 0 ? Math.round((groupScore / groupMax) * 100) : 0

    // DEMO DATA: Override workflow - requires backend API endpoints:
    // - /CallOverrides for score adjustments per group
    // - /ReviewHistory for who adjusted scores and when
    // These match Figma mockups for demonstration purposes
    const hasOverride = g.groupName === 'Paraphrasing_and_Assurance' || g.groupName === 'Closing'
    const overrideAmount = g.groupName === 'Paraphrasing_and_Assurance' ? 2 :
                          g.groupName === 'Solving_the_Issue' ? -5 :
                          g.groupName === 'Closing' ? 10 : 0
    const finalScore = aiScore + overrideAmount
    const adjustedBy = hasOverride ? (g.groupName === 'Closing' ? 'TL_Jorge' : 'QC_Maria') : 'AI'
    const isPositive = overrideAmount > 0
    const isNegative = overrideAmount < 0

    return {
      name: g.groupName.replace(/_/g, ' '),
      aiScore,
      finalScore: Math.min(100, Math.max(0, finalScore)),
      maxScore: Math.round((groupMax / totalMax) * 100),
      adjustedBy,
      adjustment: overrideAmount,
      isPositive,
      isNegative,
      date: '09-12-2025',
    }
  })
}

/**
 * AI vs Human Scoring Table
 */
function AIScoringTable({ call }: { call: Call }) {
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'
  const groupScores = calculateGroupScores(call)
  const totalAI = Math.round(groupScores.reduce((sum, g) => sum + g.aiScore, 0) / groupScores.length)
  const totalFinal = Math.round(groupScores.reduce((sum, g) => sum + g.finalScore, 0) / groupScores.length)
  const diff = totalFinal - totalAI

  return (
    <Card className={cn(isTeamMode && "bg-[#1a1a1a] border-gray-700")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "flex items-center gap-2 text-base font-semibold",
          isTeamMode && "text-white"
        )}>
          <Settings className={cn("h-5 w-5", isTeamMode ? "text-yellow-500" : "text-slate-600")} />
          AI vs Human Scoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn(
          "overflow-hidden rounded-lg border",
          isTeamMode ? "border-gray-700" : "border-slate-200"
        )}>
          <table className="w-full text-sm">
            <thead className={isTeamMode ? "bg-gray-800" : "bg-slate-50"}>
              <tr>
                <th className={cn("px-3 py-2 text-left font-medium", isTeamMode ? "text-gray-400" : "text-slate-600")}>Group</th>
                <th className={cn("px-3 py-2 text-center font-medium", isTeamMode ? "text-gray-400" : "text-slate-600")}>AI → Final</th>
                <th className={cn("px-3 py-2 text-center font-medium", isTeamMode ? "text-gray-400" : "text-slate-600")}>Max</th>
                <th className={cn("px-3 py-2 text-left font-medium", isTeamMode ? "text-gray-400" : "text-slate-600")}>Adjusted by</th>
                <th className={cn("px-3 py-2 text-left font-medium", isTeamMode ? "text-gray-400" : "text-slate-600")}>Date</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isTeamMode ? "divide-gray-800" : "divide-slate-100")}>
              {groupScores.map((group, i) => (
                <tr key={i}>
                  <td className={cn("px-3 py-2", isTeamMode ? "text-gray-300" : "text-slate-700")}>{group.name}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={isTeamMode ? "text-gray-400" : "text-slate-600"}>{group.aiScore}</span>
                    <span className={cn("mx-1", isTeamMode ? "text-gray-600" : "text-slate-400")}>→</span>
                    <span className={cn(
                      'font-medium',
                      group.isPositive && 'text-green-500',
                      group.isNegative && 'text-red-500',
                      !group.isPositive && !group.isNegative && (isTeamMode ? 'text-white' : 'text-slate-900')
                    )}>
                      {group.finalScore}
                    </span>
                  </td>
                  <td className={cn("px-3 py-2 text-center", isTeamMode ? "text-gray-400" : "text-slate-600")}>{group.maxScore}</td>
                  <td className="px-3 py-2">
                    {group.adjustedBy === 'AI' ? (
                      <span className={isTeamMode ? "text-gray-500" : "text-slate-500"}>AI</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn(
                          'h-2.5 w-2.5 rounded-sm',
                          group.adjustedBy === 'QC_Maria' ? 'bg-blue-500' : 'bg-yellow-500'
                        )} />
                        <span className={isTeamMode ? "text-gray-300" : "text-slate-700"}>{group.adjustedBy}</span>
                        <span className={isTeamMode ? "text-gray-600" : "text-slate-400"}>|</span>
                        <span className={cn(
                          'text-xs',
                          group.isPositive ? 'text-green-500' : 'text-red-500'
                        )}>
                          {group.isPositive ? '▲' : '▼'} {group.isPositive ? '+' : ''}{group.adjustment}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className={cn("px-3 py-2", isTeamMode ? "text-gray-500" : "text-slate-500")}>{group.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm space-y-1">
          <p>
            <span className={isTeamMode ? "text-gray-400" : "text-slate-600"}>AI Score: </span>
            <span className={cn("font-semibold", isTeamMode ? "text-white" : "text-slate-900")}>{totalAI}</span>
            <span className={cn("mx-2", isTeamMode ? "text-gray-600" : "")}>|</span>
            <span className={isTeamMode ? "text-gray-400" : "text-slate-600"}>Final Score: </span>
            <span className="font-semibold text-green-500">{totalFinal}</span>
            <CheckCircle className="inline h-4 w-4 text-green-500 ml-1" />
            <span className="text-green-500 ml-1">(+{diff})</span>
          </p>
          <p className={isTeamMode ? "text-gray-500" : "text-slate-500"}>AI Confidence Average: 0.83</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Override Justification Form
 */
function OverrideJustificationForm({ call }: { call: Call }) {
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'
  const [group, setGroup] = useState('')
  const [overrideType, setOverrideType] = useState('')
  const [newScore, setNewScore] = useState('')
  const [reason, setReason] = useState('')

  const groups = call.scoreCard.groups.map(g => g.groupName.replace(/_/g, ' '))

  const handleReset = () => {
    setGroup('')
    setOverrideType('')
    setNewScore('')
    setReason('')
  }

  return (
    <Card className={cn(isTeamMode && "bg-[#1a1a1a] border-gray-700")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "flex items-center gap-2 text-base font-semibold",
          isTeamMode && "text-white"
        )}>
          <Settings className={cn("h-5 w-5", isTeamMode ? "text-yellow-500" : "text-slate-600")} />
          Override Justification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Group to adjust</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className={cn(isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className={cn(isTeamMode && "bg-gray-800 border-gray-700")}>
                {groups.map(g => (
                  <SelectItem key={g} value={g} className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Override Type</Label>
            <Select value={overrideType} onValueChange={setOverrideType}>
              <SelectTrigger className={cn(isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className={cn(isTeamMode && "bg-gray-800 border-gray-700")}>
                <SelectItem value="misclassification" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Misclassification</SelectItem>
                <SelectItem value="context-missing" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Context Missing</SelectItem>
                <SelectItem value="partial-detection" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Partial Detection</SelectItem>
                <SelectItem value="false-positive" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>False Positive</SelectItem>
                <SelectItem value="false-negative" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>False Negative</SelectItem>
                <SelectItem value="ambiguous" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Ambiguous Case</SelectItem>
                <SelectItem value="policy-update" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Policy Update / Rule Change</SelectItem>
                <SelectItem value="human-error" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Human Error Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>New Score (max 15)</Label>
            <Input
              type="number"
              min={0}
              max={15}
              value={newScore}
              onChange={e => setNewScore(e.target.value)}
              placeholder=""
              className={cn(isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Reason for Override</Label>
          <Textarea
            placeholder="Explain why the AI score was adjusted..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className={cn("min-h-[80px]", isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}
          />
        </div>

        {/* Status message - shown after save */}
        <div className={cn(
          "p-3 rounded-lg border text-sm",
          isTeamMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-slate-50 border-slate-200 text-slate-600"
        )}>
          Override justification saved — awaiting Team Lead review.
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className={cn(isTeamMode && "border-gray-600 text-gray-300 hover:bg-gray-800")}
          >
            Reset Form
          </Button>
          <Button size="sm" className={cn(isTeamMode && "bg-yellow-500 text-black hover:bg-yellow-600")}>
            Save Override
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Coaching Feedback Summary
 */
function CoachingFeedbackSummary() {
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'
  const feedbackItems = [
    'Great empathy and resolution handling.',
    'Missing compliance step now corrected.',
    'Suggest follow-up training on ID protocol.',
  ]

  return (
    <Card className={cn(isTeamMode && "bg-[#1a1a1a] border-gray-700")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "flex items-center gap-2 text-base font-semibold",
          isTeamMode && "text-white"
        )}>
          <MessageSquare className={cn("h-5 w-5", isTeamMode ? "text-yellow-500" : "text-slate-600")} />
          Coaching Feedback Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={cn("text-xs italic", isTeamMode ? "text-gray-500" : "text-slate-500")}>Auto-generated summary (editable)</p>
        <ul className="space-y-2 text-sm">
          {feedbackItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={isTeamMode ? "text-gray-500" : "text-slate-400"}>•</span>
              <span className={isTeamMode ? "text-gray-300" : "text-slate-700"}>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/**
 * Feedback & Coaching Card
 */
function FeedbackCoachingCard() {
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'
  const [feedback, setFeedback] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(['Coaching'])
  const [linkUrl, setLinkUrl] = useState('')
  const [customTag, setCustomTag] = useState('')
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)

  const availableTags = ['Coaching', 'Empathy', 'Compliance', 'Tone', 'Resolution', 'Listening skills', 'Product knowledge']

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()])
      setCustomTag('')
      setShowCustomTagInput(false)
    }
  }

  const attachments = [
    { name: 'empathy_segment.wav', type: 'audio' },
    { name: 'CRM Case #40251', type: 'link' },
  ]

  return (
    <Card className={cn(isTeamMode && "bg-[#1a1a1a] border-gray-700")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "flex items-center gap-2 text-base font-semibold",
          isTeamMode && "text-white"
        )}>
          <MessageSquare className={cn("h-5 w-5", isTeamMode ? "text-yellow-500" : "text-slate-600")} />
          Feedback & Coaching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Write your feedback for this call</Label>
          <Textarea
            placeholder="Describe the agent's strengths, areas for improvement, or coaching notes..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className={cn("min-h-[80px]", isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}
          />
        </div>

        <div className="space-y-2">
          <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer',
                  selectedTags.includes(tag)
                    ? isTeamMode ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
                    : isTeamMode ? 'hover:bg-gray-800 border-gray-600 text-gray-300' : 'hover:bg-slate-100'
                )}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            <Badge
              variant="outline"
              className={cn(
                "cursor-pointer",
                isTeamMode ? "hover:bg-gray-800 border-gray-600 text-gray-300" : "hover:bg-slate-100"
              )}
              onClick={() => setShowCustomTagInput(true)}
            >
              + Add Custom Tag
            </Badge>
          </div>
          {showCustomTagInput && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Text"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                className={cn("flex-1", isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}
                onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              />
              <Button size="sm" onClick={addCustomTag} className={cn(isTeamMode && "bg-yellow-500 text-black hover:bg-yellow-600")}>Add Tag</Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Attachments</Label>
          <div className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center",
            isTeamMode ? "border-gray-600 hover:border-gray-500" : "border-slate-200"
          )}>
            <Upload className={cn("mx-auto h-8 w-8 mb-2", isTeamMode ? "text-gray-600" : "text-slate-400")} />
            <p className={cn("text-sm font-medium", isTeamMode ? "text-gray-300" : "text-slate-600")}>Upload Files</p>
            <p className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Drag and Drop or click to upload</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Add Link</Label>
          <Input
            placeholder="Enter an URL..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            className={cn(isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}
          />
        </div>

        {/* Attached files */}
        <div className="space-y-2">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {att.type === 'audio' ? (
                <FileAudio className={cn("h-4 w-4", isTeamMode ? "text-yellow-500" : "text-blue-500")} />
              ) : (
                <ExternalLink className={cn("h-4 w-4", isTeamMode ? "text-yellow-500" : "text-blue-500")} />
              )}
              <span className={isTeamMode ? "text-yellow-500" : "text-blue-600"}>{att.name}</span>
              <X className="h-3 w-3 text-red-500 cursor-pointer" />
            </div>
          ))}
        </div>

        <div className={cn("text-xs space-y-1", isTeamMode ? "text-gray-500" : "text-slate-500")}>
          <p><span className="font-medium">Added by:</span> TL_Jorge</p>
          <p><span className="font-medium">Timestamp:</span> Sept 12, 2025 - 14:22</p>
        </div>

        <div className={cn("flex justify-end gap-2 pt-2 border-t", isTeamMode ? "border-gray-700" : "border-slate-200")}>
          <Button variant="outline" size="sm" className={cn(isTeamMode && "border-gray-600 text-gray-300 hover:bg-gray-800")}>Clear</Button>
          <Button variant="outline" size="sm" className={cn(isTeamMode && "border-gray-600 text-gray-300 hover:bg-gray-800")}>Share with Agent</Button>
          <Button size="sm" className={cn(isTeamMode && "bg-yellow-500 text-black hover:bg-yellow-600")}>Save Feedback</Button>
        </div>

        {/* Shared status indicator */}
        <div className={cn("flex items-center gap-2 pt-2 border-t text-sm", isTeamMode ? "border-gray-700" : "border-slate-200")}>
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className={isTeamMode ? "text-gray-400" : "text-slate-600"}>Shared with Agent Portal on Sept 13, 2025.</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Reviewer History Card
 */
function ReviewerHistoryCard() {
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'
  const [activeFilter, setActiveFilter] = useState('All')
  const filters = ['All', 'QC', 'TL', 'SA', 'System']
  const filterColors: Record<string, string> = {
    All: 'bg-slate-600',
    QC: 'bg-blue-500',
    TL: 'bg-yellow-500',
    SA: 'bg-green-500',
    System: 'bg-purple-500',
  }

  const historyRecords = [
    {
      user: 'QC_Maria',
      userType: 'QC',
      date: '23 Oct 2025  10:42 AM',
      action: 'Override applied on',
      target: 'Solving the issue',
      details: 'Old: 14 → New: 9  (Type: Score Adjustment)',
      reason: 'AI penalized silence incorrectly',
    },
    {
      user: 'TL_Jorge',
      userType: 'TL',
      date: '23 Oct 2025  11:05 AM',
      action: 'Override reviewed and approved.',
      comment: 'Valid adjustment - customer confirmed resolution.',
    },
    {
      user: 'System',
      userType: 'System',
      date: '2025-09-12 10:34',
      action: 'Exported report to Agent Portal.',
    },
  ]

  return (
    <Card className={cn(isTeamMode && "bg-[#1a1a1a] border-gray-700")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "flex items-center gap-2 text-base font-semibold",
          isTeamMode && "text-white"
        )}>
          <History className={cn("h-5 w-5", isTeamMode ? "text-yellow-500" : "text-slate-600")} />
          Reviewer History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {filters.map(filter => (
              <Badge
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer',
                  activeFilter === filter && filterColors[filter],
                  activeFilter !== filter && isTeamMode && 'border-gray-600 text-gray-300'
                )}
                onClick={() => setActiveFilter(filter)}
              >
                <span className={cn(
                  'mr-1.5 h-2 w-2 rounded-sm',
                  filterColors[filter]
                )} />
                {filter}
              </Badge>
            ))}
          </div>
          <Select defaultValue="all">
            <SelectTrigger className={cn("w-36 h-8 text-xs", isTeamMode && "bg-gray-800 border-gray-700 text-gray-300")}>
              <SelectValue placeholder="Show all actions" />
            </SelectTrigger>
            <SelectContent className={cn(isTeamMode && "bg-gray-800 border-gray-700")}>
              <SelectItem value="all" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Show all actions</SelectItem>
              <SelectItem value="overrides" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Overrides only</SelectItem>
              <SelectItem value="comments" className={cn(isTeamMode && "text-gray-300 focus:bg-gray-700")}>Comments only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className={cn("text-xs", isTeamMode ? "text-gray-500" : "text-slate-500")}>Showing 123 records</p>

        <div className="space-y-3">
          {historyRecords.map((record, i) => (
            <div
              key={i}
              className={cn(
                'p-3 rounded-lg border text-sm',
                record.userType === 'TL'
                  ? isTeamMode ? 'bg-yellow-950 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
                  : record.userType === 'System'
                    ? isTeamMode ? 'bg-purple-950 border-purple-800' : 'bg-purple-50 border-purple-200'
                    : isTeamMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'h-2.5 w-2.5 rounded-sm',
                  filterColors[record.userType]
                )} />
                <span className={cn("font-medium", isTeamMode ? "text-white" : "text-slate-900")}>{record.user}</span>
                <span className={isTeamMode ? "text-gray-600" : "text-slate-400"}>•</span>
                <span className={isTeamMode ? "text-gray-500" : "text-slate-500"}>{record.date}</span>
              </div>
              <p className={isTeamMode ? "text-gray-300" : "text-slate-700"}>
                {record.action}{' '}
                {record.target && <span className="font-medium">{record.target}</span>}
              </p>
              {record.details && (
                <p className={cn("mt-1", isTeamMode ? "text-gray-400" : "text-slate-600")}>
                  {record.details.split('(')[0]}
                  {record.details.includes('(') && (
                    <span className={isTeamMode ? "text-gray-500" : "text-slate-500"}>({record.details.split('(')[1]}</span>
                  )}
                </p>
              )}
              {record.reason && (
                <p className={cn("mt-1", isTeamMode ? "text-gray-400" : "text-slate-600")}>
                  <span className="text-red-500">Reason:</span> {record.reason}
                </p>
              )}
              {record.comment && (
                <p className={cn("mt-1", isTeamMode ? "text-gray-400" : "text-slate-600")}>
                  <span className="font-medium">Comment:</span> {record.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * OverridesTab - Matching Figma design
 *
 * Layout:
 * - Left column: AI vs Human Scoring, Override Justification, Coaching Summary
 * - Right column: Feedback & Coaching, Reviewer History
 */
export function OverridesTab({ call, className }: OverridesTabProps) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      {/* Left Column */}
      <div className="space-y-6">
        <AIScoringTable call={call} />
        <OverrideJustificationForm call={call} />
        <CoachingFeedbackSummary />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <FeedbackCoachingCard />
        <ReviewerHistoryCard />
      </div>
    </div>
  )
}

/**
 * OverridesTabSkeleton - Loading state for OverridesTab
 */
export function OverridesTabSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
