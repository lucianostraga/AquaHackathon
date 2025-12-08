import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Phone,
  Users,
  Building2,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Flag,
  BarChart3,
  Clock,
} from 'lucide-react'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { callsApi, usersApi } from '@/services/api'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores'
import type { CallSummary, Agent as ApiAgent } from '@/types'

/**
 * DashboardPage - Overview dashboard with key metrics and quick access
 *
 * Displays:
 * - Summary stats cards (Total Calls, Agents, Companies, Projects)
 * - Recent calls table
 * - Top performing agents
 * - Quick actions
 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'

  // Theme-aware class helpers
  const cardClass = isTeamMode
    ? "bg-[#1a1a1a] border-gray-800"
    : "bg-white border-slate-200 shadow-sm"
  const textPrimary = isTeamMode ? "text-white" : "text-slate-900"
  const textSecondary = isTeamMode ? "text-gray-400" : "text-slate-500"
  const textMuted = isTeamMode ? "text-gray-500" : "text-slate-600"
  const borderColor = isTeamMode ? "border-gray-700" : "border-slate-200"
  const hoverBg = isTeamMode ? "hover:bg-gray-800" : "hover:bg-slate-50"

  // Fetch call summaries
  const { data: calls = [], isLoading: isLoadingCalls } = useQuery({
    queryKey: ['callSummary'],
    queryFn: async () => {
      const response = await callsApi.getSummary()
      return response.data as CallSummary[]
    },
  })

  // Fetch agents
  const { data: agents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await usersApi.getAgents()
      return response.data as ApiAgent[]
    },
  })

  // Fetch companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await usersApi.getCompanies()
      return response.data
    },
  })

  // Fetch projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await usersApi.getProjects()
      return response.data
    },
  })

  const isLoading = isLoadingCalls || isLoadingAgents || isLoadingCompanies || isLoadingProjects

  // Calculate stats
  const stats = useMemo(() => {
    const totalCalls = calls.length
    const avgScore = calls.length > 0
      ? Math.round(calls.reduce((sum, c) => sum + c.scoreCard, 0) / calls.length)
      : 0
    const flaggedCalls = calls.filter(c => c.Flagged).length
    const recentCalls = [...calls]
      .sort((a, b) => new Date(b.processDate).getTime() - new Date(a.processDate).getTime())
      .slice(0, 5)

    return {
      totalCalls,
      avgScore,
      flaggedCalls,
      totalAgents: agents.length,
      totalCompanies: companies.length,
      totalProjects: projects.length,
      recentCalls,
    }
  }, [calls, agents, companies, projects])

  // Top agents by score
  const topAgents = useMemo(() => {
    const agentScores = agents.map((agent: ApiAgent) => {
      const agentCalls = calls.filter(c => c.agentName === agent.firstname)
      const avgScore = agentCalls.length > 0
        ? Math.round(agentCalls.reduce((sum, c) => sum + c.scoreCard, 0) / agentCalls.length)
        : 0
      return {
        id: agent.id,
        name: `${agent.firstname} ${agent.lastname}`,
        score: avgScore,
        callCount: agentCalls.length,
      }
    })
    return agentScores
      .filter(a => a.callCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [agents, calls])

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
        <PageContainer>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
            <Skeleton className="h-[300px]" />
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Header title="Dashboard" />
      <PageContainer>
        <div className="space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <h1 className={cn(
              "text-3xl font-semibold tracking-tight",
              isTeamMode ? "text-yellow-500" : "text-slate-900"
            )}>
              Dashboard
            </h1>
            <Button onClick={() => navigate('/analytics')} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Full Analytics
            </Button>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isTeamMode ? "bg-blue-500/20" : "bg-blue-100")}>
                    <Phone className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className={cn("text-sm", textSecondary)}>Total Calls</p>
                    <p className={cn("text-2xl font-semibold", textPrimary)}>{stats.totalCalls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isTeamMode ? "bg-green-500/20" : "bg-green-100")}>
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className={cn("text-sm", textSecondary)}>Active Agents</p>
                    <p className={cn("text-2xl font-semibold", textPrimary)}>{stats.totalAgents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isTeamMode ? "bg-purple-500/20" : "bg-purple-100")}>
                    <Building2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className={cn("text-sm", textSecondary)}>Companies</p>
                    <p className={cn("text-2xl font-semibold", textPrimary)}>{stats.totalCompanies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isTeamMode ? "bg-orange-500/20" : "bg-orange-100")}>
                    <FolderOpen className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className={cn("text-sm", textSecondary)}>Projects</p>
                    <p className={cn("text-2xl font-semibold", textPrimary)}>{stats.totalProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className={cn("text-sm", textSecondary)}>Average Score</p>
                  <p className={cn("text-3xl font-semibold", textPrimary)}>{stats.avgScore}%</p>
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  stats.avgScore >= 75 ? 'text-green-500' : stats.avgScore >= 50 ? 'text-orange-500' : 'text-red-500'
                )}>
                  {stats.avgScore >= 75 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {stats.avgScore >= 75 ? 'Good' : stats.avgScore >= 50 ? 'Average' : 'Needs Attention'}
                </div>
              </CardContent>
            </Card>

            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className={cn("text-sm", textSecondary)}>Flagged Calls</p>
                  <p className={cn("text-3xl font-semibold", textPrimary)}>{stats.flaggedCalls}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-red-500">
                  <Flag className="h-4 w-4" />
                  Requires Review
                </div>
              </CardContent>
            </Card>

            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className={cn("text-sm", textSecondary)}>Resolution Rate</p>
                  <p className={cn("text-3xl font-semibold", textPrimary)}>
                    {stats.totalCalls > 0 ? Math.round(((stats.totalCalls - stats.flaggedCalls) / stats.totalCalls) * 100) : 0}%
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  On Track
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Calls */}
            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className={cn("h-5 w-5", textSecondary)} />
                    <h3 className={cn("text-lg font-semibold", textPrimary)}>Recent Calls</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/calls')}>
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className={cn("border-b hover:bg-transparent", borderColor)}>
                      <TableHead className={cn("text-sm font-bold", textSecondary)}>Call ID</TableHead>
                      <TableHead className={cn("text-sm font-bold", textSecondary)}>Agent</TableHead>
                      <TableHead className={cn("text-sm font-bold", textSecondary)}>Score</TableHead>
                      <TableHead className={cn("text-sm font-bold", textSecondary)}>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentCalls.map((call) => (
                      <TableRow
                        key={call.callId}
                        className={cn("border-b cursor-pointer", borderColor, hoverBg)}
                        onClick={() => navigate(`/calls/${call.callId}`)}
                      >
                        <TableCell className={cn("text-sm font-medium", textPrimary)}>
                          {call.callId.slice(0, 8)}...
                        </TableCell>
                        <TableCell className={cn("text-sm", textMuted)}>
                          {call.agentName}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'text-sm font-medium',
                            call.scoreCard >= 75 ? 'text-green-500' : call.scoreCard >= 50 ? 'text-orange-500' : 'text-red-500'
                          )}>
                            {call.scoreCard}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {call.Flagged ? (
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                              isTeamMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                            )}>
                              Flagged
                            </span>
                          ) : (
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                              isTeamMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                            )}>
                              OK
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.recentCalls.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className={cn("text-center py-8", textSecondary)}>
                          No calls yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className={cn("border", cardClass)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={cn("h-5 w-5", textSecondary)} />
                    <h3 className={cn("text-lg font-semibold", textPrimary)}>Top Performers</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/teams')}>
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className={cn("border-b hover:bg-transparent", borderColor)}>
                      <TableHead className={cn("text-sm font-bold", textSecondary)}>Agent</TableHead>
                      <TableHead className={cn("text-sm font-bold", textSecondary)}>Calls</TableHead>
                      <TableHead className={cn("text-sm font-bold", textSecondary)}>Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topAgents.map((agent, idx) => (
                      <TableRow
                        key={agent.id}
                        className={cn("border-b cursor-pointer", borderColor, hoverBg)}
                        onClick={() => navigate(`/team/${agent.id}`)}
                      >
                        <TableCell className={cn("text-sm", textPrimary)}>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                              idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-500 text-white'
                            )}>
                              {idx + 1}
                            </span>
                            {agent.name}
                          </div>
                        </TableCell>
                        <TableCell className={cn("text-sm", textMuted)}>
                          {agent.callCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-20 h-2 rounded-full overflow-hidden", isTeamMode ? "bg-gray-700" : "bg-slate-200")}>
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  agent.score >= 75 ? 'bg-green-500' : agent.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                )}
                                style={{ width: `${agent.score}%` }}
                              />
                            </div>
                            <span className={cn("text-sm font-medium", textPrimary)}>{agent.score}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {topAgents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className={cn("text-center py-8", textSecondary)}>
                          No agent data yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className={cn("border", cardClass)}>
            <CardContent className="p-6">
              <h3 className={cn("text-lg font-semibold mb-4", textPrimary)}>Quick Actions</h3>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/calls')} variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Review Calls
                </Button>
                <Button onClick={() => navigate('/teams')} variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
                <Button onClick={() => navigate('/companies')} variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Companies
                </Button>
                <Button onClick={() => navigate('/analytics')} variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}
