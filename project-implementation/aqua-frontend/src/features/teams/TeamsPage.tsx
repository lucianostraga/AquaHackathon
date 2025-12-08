import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { usersApi, callsApi } from '@/services/api'
import { cn } from '@/lib/utils'
import type { Agent as ApiAgent, CallSummary } from '@/types'

interface AgentDisplay {
  id: number
  name: string
  role: string
  assignments: string
  timezone: string
  timezoneLabel: string
  score: number
  trend: 'up' | 'down' | 'stable'
  company: string
  projects: string[]
}

export default function TeamsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddAgentModal, setShowAddAgentModal] = useState(false)
  const [showAgentSuccessModal, setShowAgentSuccessModal] = useState(false)
  const [createdAgent, setCreatedAgent] = useState({ name: '', role: '' })
  const [newAgent, setNewAgent] = useState({
    firstName: '',
    lastName: '',
    role: '',
    timezone: '',
    companyId: '',
    projectId: '',
    email: '',
    phone: '',
  })
  const itemsPerPage = 6

  // Fetch agents from API
  const { data: apiAgents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await usersApi.getAgents()
      return response.data
    },
  })

  // Fetch call summaries to calculate agent scores
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

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (agentData: {
      firstname: string
      lastname: string
      role: string
      email: string
      phone: string
      company: string
      project: string[]
    }) => {
      const response = await usersApi.createAgent(agentData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const isLoading = isLoadingAgents || isLoadingCalls

  // Transform API agents to display format with calculated scores
  const agents: AgentDisplay[] = useMemo(() => {
    return apiAgents.map((agent: ApiAgent) => {
      // Calculate average score from agent's calls
      const agentCalls = callSummaries.filter(
        (call: CallSummary) => call.agentName === agent.firstname
      )
      const avgScore = agentCalls.length > 0
        ? Math.round(agentCalls.reduce((sum: number, c: CallSummary) => sum + (c.scoreCard || 0), 0) / agentCalls.length)
        : 0

      // Determine trend based on recent calls (simplified)
      const trend: 'up' | 'down' | 'stable' = avgScore >= 75 ? 'up' : avgScore >= 50 ? 'stable' : 'down'

      // Get projects as array
      const agentProjects = Array.isArray(agent.project) ? agent.project : agent.project ? [agent.project] : []
      const projectCount = agentProjects.length

      return {
        id: agent.id,
        name: `${agent.firstname} ${agent.lastname}`,
        role: agent.role || 'Agent',
        assignments: `1 Company / ${projectCount} Projects`,
        timezone: 'America/New_York (UTC-5)',
        timezoneLabel: 'Eastern Time',
        score: avgScore,
        trend,
        company: agent.company || '',
        projects: agentProjects,
      }
    })
  }, [apiAgents, callSummaries])

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent: AgentDisplay) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!agent.name.toLowerCase().includes(query)) return false
      }

      // Company filter
      if (companyFilter && companyFilter !== 'all') {
        const selectedCompany = companies.find((c: { id: number; name: string }) => String(c.id) === companyFilter)
        if (selectedCompany && agent.company !== selectedCompany.name) return false
      }

      // Project filter
      if (projectFilter && projectFilter !== 'all') {
        const selectedProject = projects.find((p: { id: number; name: string }) => String(p.id) === projectFilter)
        if (selectedProject && !agent.projects.includes(selectedProject.name)) return false
      }

      // Score filter
      if (scoreFilter === 'high' && agent.score < 80) return false
      if (scoreFilter === 'medium' && (agent.score < 60 || agent.score >= 80)) return false
      if (scoreFilter === 'low' && agent.score >= 60) return false

      return true
    })
  }, [agents, searchQuery, companyFilter, projectFilter, scoreFilter, companies, projects])

  // Paginate
  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAgents.slice(start, start + itemsPerPage)
  }, [filteredAgents, currentPage])

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)
  const totalAgents = agents.length

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <ArrowRight className="h-4 w-4 text-slate-400" />
    }
  }

  const handleCreateAgent = async () => {
    const roleLabels: Record<string, string> = {
      'agent': 'Call Center Operator',
      'shift-lead': 'Shift Lead',
      'team-lead': 'Team Lead',
      'qc': 'QC Analyst',
    }

    // Get company name from selected ID
    const selectedCompany = companies.find((c: { id: number; name: string }) => String(c.id) === newAgent.companyId)
    const selectedProject = projects.find((p: { id: number; name: string }) => String(p.id) === newAgent.projectId)

    try {
      await createAgentMutation.mutateAsync({
        firstname: newAgent.firstName,
        lastname: newAgent.lastName,
        role: roleLabels[newAgent.role] || 'Agent',
        email: newAgent.email,
        phone: newAgent.phone,
        company: selectedCompany?.name || '',
        project: selectedProject ? [selectedProject.name] : [],
      })

      setCreatedAgent({
        name: `${newAgent.firstName} ${newAgent.lastName}`.trim(),
        role: roleLabels[newAgent.role] || 'Call Center Operator',
      })
      setShowAddAgentModal(false)
      setShowAgentSuccessModal(true)
      setNewAgent({
        firstName: '',
        lastName: '',
        role: '',
        timezone: '',
        companyId: '',
        projectId: '',
        email: '',
        phone: '',
      })
    } catch (error) {
      console.error('Failed to create agent:', error)
    }
  }

  return (
    <>
      <Header title="Team" />
      <PageContainer>
        <div className="space-y-6">
          {/* Header with title and Add Agent button */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Team
            </h1>
            <Button
              className="bg-slate-900 hover:bg-slate-800"
              onClick={() => setShowAddAgentModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search member..."
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
                  {companies.map((company: { id: number; name: string }) => (
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
                  {projects.map((project: { id: number; name: string }) => (
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
            Showing {filteredAgents.length} of {totalAgents} agents
          </p>

          {/* Agents Table */}
          {isLoading ? (
            <AgentsTableSkeleton />
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-300 hover:bg-transparent">
                    <TableHead className="text-sm font-medium text-slate-500">Name</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Role</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Assignments</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Timezone</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Score</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAgents.map((agent: AgentDisplay) => (
                    <TableRow
                      key={agent.id}
                      className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/team/${agent.id}`)}
                    >
                      <TableCell className="text-sm text-slate-900 font-medium">
                        {agent.name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {agent.role}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {agent.assignments}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        <span>{agent.timezone}</span>
                        <span className="italic text-slate-500 ml-1">— {agent.timezoneLabel}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={agent.score}
                            className={cn('h-2 w-24', getScoreColor(agent.score))}
                          />
                          <span className="text-sm font-medium text-slate-900">{agent.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTrendIcon(agent.trend)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedAgents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                        No agents found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

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

      {/* Add Agent Modal */}
      <Dialog open={showAddAgentModal} onOpenChange={setShowAddAgentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <Input
                value={newAgent.firstName}
                onChange={(e) => setNewAgent({ ...newAgent, firstName: e.target.value })}
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <Input
                value={newAgent.lastName}
                onChange={(e) => setNewAgent({ ...newAgent, lastName: e.target.value })}
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Select
                value={newAgent.role}
                onValueChange={(value) => setNewAgent({ ...newAgent, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="shift-lead">Shift Lead</SelectItem>
                  <SelectItem value="team-lead">Team Lead</SelectItem>
                  <SelectItem value="qc">QC Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Timezone</label>
              <Select
                value={newAgent.timezone}
                onValueChange={(value) => setNewAgent({ ...newAgent, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="est">America/New_York (UTC-5)</SelectItem>
                  <SelectItem value="gmt">Europe/London (UTC+0)</SelectItem>
                  <SelectItem value="jst">Asia/Tokyo (UTC+9)</SelectItem>
                  <SelectItem value="aest">Australia/Sydney (UTC+10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned Company</label>
              <Select
                value={newAgent.companyId}
                onValueChange={(value) => setNewAgent({ ...newAgent, companyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company: { id: number; name: string }) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned Project</label>
              <Select
                value={newAgent.projectId}
                onValueChange={(value) => setNewAgent({ ...newAgent, projectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: { id: number; name: string }) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={newAgent.email}
                onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                type="tel"
                value={newAgent.phone}
                onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                placeholder=""
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddAgentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAgent} disabled={createAgentMutation.isPending}>
                {createAgentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agent Success Modal */}
      <Dialog open={showAgentSuccessModal} onOpenChange={setShowAgentSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agent successfully created</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
              {createdAgent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CO'}
            </div>
            <div>
              <p className="font-medium text-slate-900">{createdAgent.name || 'David Kim'}</p>
              <p className="text-sm text-slate-600">{createdAgent.role || 'Call Center Operator'}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowAgentSuccessModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Loading skeleton for the agents table
 */
function AgentsTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-300 hover:bg-transparent">
            {['Name', 'Role', 'Assignments', 'Timezone', 'Score', 'Trend'].map((header) => (
              <TableHead key={header} className="text-sm font-medium text-slate-500">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-b border-slate-200">
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-36" /></TableCell>
              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-6" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
