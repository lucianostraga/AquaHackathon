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
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <Button onClick={() => navigate('/analytics')} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Full Analytics
            </Button>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Calls</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.totalCalls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active Agents</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.totalAgents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Companies</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.totalCompanies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Projects</p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.totalProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Average Score</p>
                  <p className="text-3xl font-semibold text-slate-900">{stats.avgScore}%</p>
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  stats.avgScore >= 75 ? 'text-green-600' : stats.avgScore >= 50 ? 'text-orange-500' : 'text-red-500'
                )}>
                  {stats.avgScore >= 75 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {stats.avgScore >= 75 ? 'Good' : stats.avgScore >= 50 ? 'Average' : 'Needs Attention'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Flagged Calls</p>
                  <p className="text-3xl font-semibold text-slate-900">{stats.flaggedCalls}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-red-500">
                  <Flag className="h-4 w-4" />
                  Requires Review
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Resolution Rate</p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {stats.totalCalls > 0 ? Math.round(((stats.totalCalls - stats.flaggedCalls) / stats.totalCalls) * 100) : 0}%
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  On Track
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Calls */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-500" />
                    <h3 className="text-lg font-semibold text-slate-900">Recent Calls</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/calls')}>
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-300 hover:bg-transparent">
                      <TableHead className="text-sm font-bold text-slate-500">Call ID</TableHead>
                      <TableHead className="text-sm font-bold text-slate-500">Agent</TableHead>
                      <TableHead className="text-sm font-bold text-slate-500">Score</TableHead>
                      <TableHead className="text-sm font-bold text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentCalls.map((call) => (
                      <TableRow
                        key={call.callId}
                        className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/calls/${call.callId}`)}
                      >
                        <TableCell className="text-sm text-slate-900 font-medium">
                          {call.callId.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {call.agentName}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'text-sm font-medium',
                            call.scoreCard >= 75 ? 'text-green-600' : call.scoreCard >= 50 ? 'text-orange-500' : 'text-red-500'
                          )}>
                            {call.scoreCard}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {call.Flagged ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              Flagged
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              OK
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.recentCalls.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                          No calls yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-slate-500" />
                    <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/team')}>
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-300 hover:bg-transparent">
                      <TableHead className="text-sm font-bold text-slate-500">Agent</TableHead>
                      <TableHead className="text-sm font-bold text-slate-500">Calls</TableHead>
                      <TableHead className="text-sm font-bold text-slate-500">Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topAgents.map((agent, idx) => (
                      <TableRow
                        key={agent.id}
                        className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/team/${agent.id}`)}
                      >
                        <TableCell className="text-sm text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                              idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-600' : 'bg-slate-300'
                            )}>
                              {idx + 1}
                            </span>
                            {agent.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {agent.callCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  agent.score >= 75 ? 'bg-green-500' : agent.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                )}
                                style={{ width: `${agent.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{agent.score}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {topAgents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-slate-500 py-8">
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
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/calls')} variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Review Calls
                </Button>
                <Button onClick={() => navigate('/team')} variant="outline">
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
