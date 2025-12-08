import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  AlertTriangle,
  XSquare,
  Play,
  Loader2,
  Copy,
  Check,
} from 'lucide-react'
import { usersApi, callsApi } from '@/services/api'
import { cn } from '@/lib/utils'
import type { CallSummary, Company, Project } from '@/types'

interface TeamMemberCall {
  callId: string
  date: string
  company: string
  project: string
  aiScore: number | null
  flag: 'Good' | 'Warning' | 'Critical'
  sentiment: string
  sentimentIcon: string
  finalScore: number | null
  status: 'ready' | 'processing'
}

export default function TeamMemberPage() {
  const navigate = useNavigate()
  const { memberId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Fetch agent from API
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['agent', memberId],
    queryFn: async () => {
      const response = await usersApi.getAgentById(Number(memberId))
      return response.data
    },
    enabled: !!memberId,
  })

  // Fetch call summaries
  const { data: callSummaries = [], isLoading: isLoadingCalls } = useQuery({
    queryKey: ['callSummary'],
    queryFn: async () => {
      const response = await callsApi.getSummary()
      return response.data
    },
  })

  // Fetch companies for filter dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await usersApi.getCompanies()
      return response.data
    },
  })

  // Fetch projects for filter dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await usersApi.getProjects()
      return response.data
    },
  })

  const isLoading = isLoadingAgent || isLoadingCalls

  // Transform agent data for display
  const member = useMemo(() => {
    if (!agent) return null

    // Filter calls for this agent
    const agentCalls = callSummaries.filter(
      (c: CallSummary) => c.agentName === agent.firstname
    )

    const goodFlags = agentCalls.filter((c: CallSummary) => !c.Flagged && c.scoreCard >= 75).length
    const warningFlags = agentCalls.filter((c: CallSummary) => c.scoreCard >= 50 && c.scoreCard < 75).length
    const criticalFlags = agentCalls.filter((c: CallSummary) => c.Flagged || c.scoreCard < 50).length
    const avgScore = agentCalls.length > 0
      ? Math.round(agentCalls.reduce((sum: number, c: CallSummary) => sum + c.scoreCard, 0) / agentCalls.length)
      : 0

    return {
      id: agent.id,
      name: `${agent.firstname} ${agent.lastname}`,
      role: agent.role || 'Agent',
      email: agent.email,
      phone: agent.phone ? `Phone ${agent.phone}` : 'No phone',
      location: 'Not specified',
      supervisor: 'Not assigned',
      teamLead: 'Not assigned',
      company: agent.company || 'Not assigned',
      project: Array.isArray(agent.project) ? agent.project.join(', ') : agent.project || 'Not assigned',
      score: avgScore,
      flags: {
        good: goodFlags,
        warning: warningFlags,
        critical: criticalFlags,
      },
    }
  }, [agent, callSummaries])

  // Transform calls for this agent
  const agentCalls: TeamMemberCall[] = useMemo(() => {
    if (!agent) return []

    return callSummaries
      .filter((c: CallSummary) => c.agentName === agent.firstname)
      .map((call: CallSummary) => {
        const flag: 'Good' | 'Warning' | 'Critical' = call.Flagged
          ? 'Critical'
          : call.scoreCard >= 75
          ? 'Good'
          : 'Warning'

        const sentimentMap: Record<string, { sentiment: string; icon: string }> = {
          Positive: { sentiment: 'Happy', icon: '😊' },
          Neutral: { sentiment: 'Calm', icon: '😐' },
          Negative: { sentiment: 'Upset', icon: '😠' },
        }
        const sentimentKey = call.dominantSentiment || 'Neutral'
        const sentimentInfo = sentimentMap[sentimentKey] || { sentiment: 'Calm', icon: '😐' }

        return {
          callId: call.callId,
          date: call.processDate,
          company: call.company,
          project: call.project,
          aiScore: call.scoreCard,
          flag,
          sentiment: sentimentInfo.sentiment,
          sentimentIcon: sentimentInfo.icon,
          finalScore: call.scoreCard,
          status: 'ready' as const,
        }
      })
  }, [agent, callSummaries])

  // Filter calls
  const filteredCalls = useMemo(() => {
    return agentCalls.filter(call => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!call.callId.includes(query) && !call.company.toLowerCase().includes(query)) {
          return false
        }
      }
      return true
    })
  }, [agentCalls, searchQuery])

  // Paginate
  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCalls.slice(start, start + itemsPerPage)
  }, [filteredCalls, currentPage])

  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage)

  // Get flag icon
  const getFlagIcon = (flag: string) => {
    switch (flag) {
      case 'Good':
        return <CheckSquare className="h-4 w-4 text-green-500" />
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'Critical':
        return <XSquare className="h-4 w-4 text-red-500" />
      default:
        return <CheckSquare className="h-4 w-4 text-green-500" />
    }
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (isLoading) {
    return (
      <>
        <Header title="Team member" />
        <PageContainer>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </PageContainer>
      </>
    )
  }

  if (!member) {
    return (
      <>
        <Header title="Team member" />
        <PageContainer>
          <div className="text-center py-16">
            <p className="text-slate-500">Agent not found</p>
            <Button onClick={() => navigate('/team')} className="mt-4">
              Back to Team
            </Button>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Header title="Team member" />
      <PageContainer>
        <div className="space-y-6">
          {/* Header with title and Edit button */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Team member
            </h1>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Agent
            </Button>
          </div>

          {/* Profile Card */}
          <div className="border border-slate-200 rounded-lg p-6 bg-white grid grid-cols-4 gap-6">
            {/* Profile Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-slate-200 text-slate-600">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-slate-900">{member.name}</h2>
                <p className="text-sm text-slate-600">{member.role}</p>
                <p className="text-sm text-blue-600">{member.email}</p>
                <p className="text-sm text-slate-500">{member.phone}</p>
                <p className="text-sm text-slate-500">{member.location}</p>
              </div>
            </div>

            {/* Supervisor Info */}
            <div>
              <p className="text-sm text-slate-500">
                Supervisor: <span className="font-medium text-slate-900">{member.supervisor}</span>
              </p>
              <p className="text-sm text-slate-500">
                Team Lead: <span className="font-medium text-slate-900">{member.teamLead}</span>
              </p>
              <p className="text-sm text-slate-500">
                Company/Projects: <span className="font-medium text-slate-900">{member.company}, {member.project}</span>
              </p>
            </div>

            {/* Flags Breakdown */}
            <div className="flex items-center gap-4 justify-center">
              <span className="text-sm text-slate-600">Flags</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span className="font-bold">{member.flags.good}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{member.flags.warning}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XSquare className="h-4 w-4 text-red-500" />
                  <span className="font-bold">{member.flags.critical}</span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-sm text-slate-500">Score</p>
              <p className="text-4xl font-bold text-slate-900">{member.score}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search Call..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Company</span>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Company..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company: Company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Project</span>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project: Project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Score</span>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select Score..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">80+ (Good)</SelectItem>
                  <SelectItem value="medium">60-79 (Warning)</SelectItem>
                  <SelectItem value="low">Below 60 (Critical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Record Count */}
          <p className="text-sm text-slate-600">
            Showing {filteredCalls.length} records
          </p>

          {/* Calls Table */}
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-300 hover:bg-transparent">
                  <TableHead className="text-sm font-medium text-slate-500">Call ID</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">Date / Time</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">Company</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">Project</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">AI Score</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">Flag</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">Sentiment</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">Final Score</TableHead>
                  <TableHead className="text-sm font-medium text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCalls.map((call) => (
                  <TableRow
                    key={call.callId}
                    className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/calls/${call.callId}`)}
                  >
                    <TableCell className="text-sm text-slate-900 font-medium">
                      {call.callId}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {call.date}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {call.company}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {call.project}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {call.aiScore || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFlagIcon(call.flag)}
                        <span className="text-sm">{call.flag}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {call.status === 'processing' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        ) : (
                          <span>{call.sentimentIcon}</span>
                        )}
                        <span className="text-sm">{call.sentiment}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {call.status === 'processing' ? (
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{call.finalScore}</span>
                          {call.finalScore && call.finalScore >= 80 && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {call.finalScore && call.finalScore < 60 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          {call.finalScore && call.finalScore !== call.aiScore && (
                            <Copy className="h-3 w-3 text-slate-400" />
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        className="p-1 hover:bg-slate-200 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Play audio
                        }}
                      >
                        <Play className="h-5 w-5 text-slate-600" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedCalls.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                      No calls found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-8 h-8 rounded text-sm',
                    currentPage === page
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {page}
                </button>
              ))}
              {totalPages > 3 && <span className="text-slate-400">...</span>}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  )
}
