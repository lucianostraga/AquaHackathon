import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ScoreCard, ScorecardGroup, Question } from '@/types'
import { CheckCircle2, XCircle, Quote, Target } from 'lucide-react'

interface ScorecardPanelProps {
  scorecard: ScoreCard
  className?: string
}

interface QuestionItemProps {
  question: Question
  index: number
}

/**
 * QuestionItem - Displays a single scorecard question with its evaluation
 */
function QuestionItem({ question, index }: QuestionItemProps) {
  const { text, score, maxPoint, result, evidences, justification } = question
  const isPassing = result === 'Pass'
  const scorePercentage = maxPoint > 0 ? (score / maxPoint) * 100 : 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      {/* Question header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-slate-700">{text}</p>
        </div>
        <Badge
          className={cn(
            'flex-shrink-0',
            isPassing
              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-50'
              : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-50'
          )}
        >
          {isPassing ? (
            <CheckCircle2 className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {result}
        </Badge>
      </div>

      {/* Score display */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            {score}/{maxPoint}
          </span>
        </div>
        <div className="flex-1">
          <Progress
            value={scorePercentage}
            className={cn(
              'h-2',
              isPassing ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'
            )}
          />
        </div>
      </div>

      {/* Justification */}
      <div className="mb-3 rounded-md bg-slate-50 p-3">
        <h5 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Justification
        </h5>
        <p className="text-sm text-slate-600">{justification}</p>
      </div>

      {/* Evidences */}
      {evidences.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Evidence
          </h5>
          {evidences.map((evidence, evidenceIndex) => (
            <blockquote
              key={evidenceIndex}
              className="flex items-start gap-2 rounded-md border-l-4 border-blue-300 bg-blue-50 p-3"
            >
              <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm italic text-slate-600">"{evidence.text}"</p>
                <span className="mt-1 text-xs text-blue-600">
                  Turn {evidence.turn}
                </span>
              </div>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  )
}

interface GroupHeaderProps {
  group: ScorecardGroup
}

/**
 * GroupHeader - Displays the group name and aggregate score in accordion trigger
 */
function GroupHeader({ group }: GroupHeaderProps) {
  const totalScore = group.questions.reduce((sum, q) => sum + q.score, 0)
  const maxScore = group.questions.reduce((sum, q) => sum + q.maxPoint, 0)
  const passCount = group.questions.filter((q) => q.result === 'Pass').length
  const failCount = group.questions.filter((q) => q.result === 'Fail').length
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return (
    <div className="flex flex-1 items-center justify-between pr-4">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-700">{group.groupName}</span>
        <div className="flex items-center gap-1">
          {passCount > 0 && (
            <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {passCount}
            </Badge>
          )}
          {failCount > 0 && (
            <Badge className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50">
              <XCircle className="mr-1 h-3 w-3" />
              {failCount}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-semibold',
            percentage >= 70
              ? 'text-green-600'
              : percentage >= 40
              ? 'text-yellow-600'
              : 'text-red-600'
          )}
        >
          {totalScore}/{maxScore}
        </span>
        <span className="text-xs text-slate-500">({percentage}%)</span>
      </div>
    </div>
  )
}

/**
 * ScorecardPanel - Displays the complete scorecard with collapsible groups
 *
 * Each group can be expanded to show individual questions with:
 * - Pass/Fail status
 * - Score out of maximum
 * - Justification text
 * - Evidence quotes from the transcript
 */
export function ScorecardPanel({ scorecard, className }: ScorecardPanelProps) {
  const { groups } = scorecard

  // Calculate overall score
  const totalScore = groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + q.score, 0),
    0
  )
  const maxScore = groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + q.maxPoint, 0),
    0
  )

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Scorecard</CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Total:</span>
          <span className="font-bold text-slate-700">
            {totalScore}/{maxScore}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {groups.map((group) => (
            <AccordionItem
              key={group.groupId}
              value={`group-${group.groupId}`}
              className="rounded-lg border border-slate-200 px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <GroupHeader group={group} />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  {group.questions.map((question, index) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

/**
 * ScorecardPanelSkeleton - Loading state for ScorecardPanel
 */
export function ScorecardPanelSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-20" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
