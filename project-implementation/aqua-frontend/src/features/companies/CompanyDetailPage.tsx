import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Pencil,
  FolderOpen,
  Users,
  BarChart3,
  CheckCircle,
  MinusCircle,
  XCircle,
  Phone as PhoneIcon,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Clock,
  Flag,
} from 'lucide-react'
import { usersApi, callsApi } from '@/services/api'
import { cn } from '@/lib/utils'
import type { Company as ApiCompany, Project as ApiProject, Agent as ApiAgent, CallSummary } from '@/types'

type TabType = 'overview' | 'projects' | 'agents'

interface ProjectDisplay {
  id: number
  name: string
  status: 'Active' | 'On hold' | 'Archived'
  assignedAgents: number
  startDate: string
  endDate: string
  progress: number
}

interface AgentDisplay {
  id: number
  name: string
  role: string
  assignments: string
  timezone: string
  score: number
  trend: 'up' | 'down' | 'stable'
}

interface ActivityItem {
  date: string
  text: string
  highlight?: string
}

export default function CompanyDetailPage() {
  const navigate = useNavigate()
  const { companyId } = useParams()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Projects tab state
  const [projectSearch, setProjectSearch] = useState('')
  const [projectStatusFilter, setProjectStatusFilter] = useState('all')
  const [projectPage, setProjectPage] = useState(1)
  const [showAddProjectModal, setShowAddProjectModal] = useState(false)
  const [showProjectSuccessModal, setShowProjectSuccessModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: '',
    startDate: '',
    endDate: '',
    assignedAgents: [] as string[],
  })

  // Agents tab state
  const [agentSearch, setAgentSearch] = useState('')
  const [agentProjectFilter, setAgentProjectFilter] = useState('all')
  const [agentScoreFilter, setAgentScoreFilter] = useState('all')
  const [agentPage, setAgentPage] = useState(1)

  const itemsPerPage = 6

  // Fetch company data
  const { data: apiCompany } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const response = await usersApi.getCompanies()
      return response.data?.find((c: ApiCompany) => c.id === Number(companyId))
    },
  })

  // Fetch projects
  const { data: apiProjects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await usersApi.getProjects()
      return response.data
    },
  })

  // Fetch agents
  const { data: apiAgents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await usersApi.getAgents()
      return response.data
    },
  })

  // Fetch call summaries for statistics
  const { data: callSummaries = [] } = useQuery({
    queryKey: ['callSummary'],
    queryFn: async () => {
      const response = await callsApi.getSummary()
      return response.data
    },
  })

  // Transform company data with calculated stats
  const company = useMemo(() => {
    if (!apiCompany) return null

    // Find agents for this company
    const companyAgents = apiAgents.filter(
      (agent: ApiAgent) => agent.company === apiCompany.name
    )

    // Find calls for this company
    const companyCalls = callSummaries.filter(
      (call: CallSummary) => call.company === apiCompany.name
    )

    // Calculate stats
    const avgScore = companyCalls.length > 0
      ? Math.round(companyCalls.reduce((sum: number, c: CallSummary) => sum + c.scoreCard, 0) / companyCalls.length)
      : 0
    const goodFlags = companyCalls.filter((c: CallSummary) => !c.Flagged && c.scoreCard >= 75).length
    const warningFlags = companyCalls.filter((c: CallSummary) => c.scoreCard >= 50 && c.scoreCard < 75).length
    const criticalFlags = companyCalls.filter((c: CallSummary) => c.Flagged || c.scoreCard < 50).length

    return {
      id: apiCompany.id,
      name: apiCompany.name,
      status: 'Active' as const,
      address: 'Not specified',
      timezone: 'America/New_York (UTC-5) — Eastern Time',
      mainContact: {
        name: companyAgents.length > 0 ? `${companyAgents[0].firstname} ${companyAgents[0].lastname}` : 'Not assigned',
        role: 'Operations Manager (Main)',
        phone: companyAgents.length > 0 ? companyAgents[0].phone || 'Not available' : 'Not available',
        email: companyAgents.length > 0 ? companyAgents[0].email : 'Not available',
      },
      escalationContact: {
        name: companyAgents.length > 1 ? `${companyAgents[1].firstname} ${companyAgents[1].lastname}` : 'Not assigned',
        role: 'Customer Success (Escalation)',
        email: companyAgents.length > 1 ? companyAgents[1].email : 'Not available',
      },
      stats: {
        activeProjects: apiProjects.length,
        assignedAgents: companyAgents.length,
        averageScore: avgScore,
        totalProjects: apiProjects.length,
        activeCount: apiProjects.length,
        onHoldCount: 0,
        archivedCount: 0,
        totalCalls: companyCalls.length,
        flags: { good: goodFlags, warning: warningFlags, critical: criticalFlags },
      },
    }
  }, [apiCompany, apiAgents, apiProjects, callSummaries])

  // Transform projects for display
  const projects: ProjectDisplay[] = useMemo(() => {
    return apiProjects.map((project: ApiProject, index: number) => ({
      id: project.id,
      name: project.name,
      status: 'Active' as const,
      assignedAgents: Math.max(1, apiAgents.filter((a: ApiAgent) =>
        Array.isArray(a.project) ? a.project.includes(project.name) : a.project === project.name
      ).length),
      startDate: 'Jan 2025',
      endDate: 'Dec 2025',
      progress: 75 + (index * 5) % 25,
    }))
  }, [apiProjects, apiAgents])

  // Transform agents for display with calculated scores
  const agents: AgentDisplay[] = useMemo(() => {
    if (!apiCompany) return []

    return apiAgents
      .filter((agent: ApiAgent) => agent.company === apiCompany.name)
      .map((agent: ApiAgent) => {
        const agentCalls = callSummaries.filter(
          (c: CallSummary) => c.agentName === agent.firstname
        )
        const avgScore = agentCalls.length > 0
          ? Math.round(agentCalls.reduce((sum: number, c: CallSummary) => sum + c.scoreCard, 0) / agentCalls.length)
          : 0

        const projectCount = Array.isArray(agent.project) ? agent.project.length : 1

        return {
          id: agent.id,
          name: `${agent.firstname} ${agent.lastname}`,
          role: agent.role || 'Agent',
          assignments: `${projectCount} Projects`,
          timezone: 'America/New_York (UTC-5) — Eastern Time',
          score: avgScore,
          trend: avgScore >= 75 ? 'up' : avgScore >= 50 ? 'stable' : 'down' as 'up' | 'down' | 'stable',
        }
      })
  }, [apiCompany, apiAgents, callSummaries])

  // Activity from recent calls
  const activity: ActivityItem[] = useMemo(() => {
    if (!apiCompany) return []

    return callSummaries
      .filter((c: CallSummary) => c.company === apiCompany.name)
      .slice(0, 3)
      .map((call: CallSummary) => ({
        date: new Date(call.processDate).toLocaleDateString(),
        text: 'Call processed: ',
        highlight: `"${call.callId}" by ${call.agentName}`,
      }))
  }, [apiCompany, callSummaries])

  // Recent projects
  const recentProjects = useMemo(() => {
    return projects.slice(0, 3).map(p => ({
      name: p.name,
      status: p.status,
      progress: p.progress,
    }))
  }, [projects])

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (projectSearch && !project.name.toLowerCase().includes(projectSearch.toLowerCase())) {
        return false
      }
      if (projectStatusFilter !== 'all' && project.status.toLowerCase().replace(' ', '-') !== projectStatusFilter) {
        return false
      }
      return true
    })
  }, [projects, projectSearch, projectStatusFilter])

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      if (agentSearch && !agent.name.toLowerCase().includes(agentSearch.toLowerCase())) {
        return false
      }
      return true
    })
  }, [agents, agentSearch])

  // Pagination
  const paginatedProjects = filteredProjects.slice((projectPage - 1) * itemsPerPage, projectPage * itemsPerPage)
  const paginatedAgents = filteredAgents.slice((agentPage - 1) * itemsPerPage, agentPage * itemsPerPage)
  const totalProjectPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const totalAgentPages = Math.ceil(filteredAgents.length / itemsPerPage)

  const handleCreateProject = () => {
    console.log('Creating project:', newProject)
    setShowAddProjectModal(false)
    setShowProjectSuccessModal(true)
    setNewProject({
      name: '',
      description: '',
      status: '',
      startDate: '',
      endDate: '',
      assignedAgents: [],
    })
  }

  if (!company) {
    return (
      <>
        <Header title="Company" />
        <PageContainer>
          <div className="text-center py-16">
            <p className="text-slate-500">Company not found</p>
            <Button onClick={() => navigate('/companies')} className="mt-4">
              Back to Companies
            </Button>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Header title={company.name} />
      <PageContainer>
        <div className="space-y-6">
          {/* Back link */}
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Companies
          </button>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              {company.name}
            </h1>
            {(activeTab === 'overview' || activeTab === 'agents') && (
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Company
              </Button>
            )}
            {activeTab === 'projects' && (
              <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => setShowAddProjectModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            )}
          </div>

          {/* Tabs - Pill/Segmented style matching Figma */}
          <div className="flex items-start gap-0 p-[5px] bg-slate-100 rounded-md w-fit">
            {(['overview', 'projects', 'agents'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium capitalize rounded transition-colors',
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards - Figma style with shadow */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-2.5">
                    <FolderOpen className="h-6 w-6 text-slate-700" />
                    <span className="text-xl font-semibold text-slate-900 tracking-tight">Active Projects</span>
                    <span className="text-3xl font-semibold text-slate-900 tracking-tight">{company.stats.activeProjects}</span>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-2.5">
                    <Users className="h-6 w-6 text-slate-700" />
                    <span className="text-xl font-semibold text-slate-900 tracking-tight">Assigned Agents</span>
                    <span className="text-3xl font-semibold text-slate-900 tracking-tight">{company.stats.assignedAgents}</span>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-2.5">
                    <BarChart3 className="h-6 w-6 text-slate-700" />
                    <span className="text-xl font-semibold text-slate-900 tracking-tight">Average Score</span>
                    <span className="text-3xl font-semibold text-slate-900 tracking-tight">{company.stats.averageScore}%</span>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-lg font-semibold text-slate-900">Overview</h2>

              {/* Two column layout */}
              <div className="grid grid-cols-2 gap-5">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Company Info Card */}
                  <div className="border border-slate-300 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-slate-700" />
                        <h3 className="text-xl font-semibold text-slate-700 tracking-tight">Company Info</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="text-sm text-slate-900">Active</span>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-1 border-r border-slate-300 pr-6">
                        <p className="text-sm font-bold text-slate-900">Address</p>
                        <p className="text-sm text-slate-900 whitespace-pre-line">{company.address}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Timezone</p>
                        <p className="text-sm text-slate-900">
                          {company.timezone.split(' — ')[0]} — <span className="italic">{company.timezone.split(' — ')[1]}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Contacts Card */}
                  <div className="border border-slate-300 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-slate-700" />
                      <h3 className="text-xl font-semibold text-slate-700 tracking-tight">Key Contacts</h3>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 text-sm">
                        <p className="font-bold text-slate-900">{company.mainContact.name}</p>
                        <p className="text-slate-900">{company.mainContact.role}</p>
                        <p className="text-slate-900">{company.mainContact.phone}</p>
                        <p className="text-slate-900">{company.mainContact.email}</p>
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-bold text-slate-900">{company.escalationContact.name}</p>
                        <p className="text-slate-900">{company.escalationContact.role}</p>
                        <p className="text-slate-900">{company.escalationContact.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Activity Feed Card */}
                  <div className="border border-slate-300 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-6 w-6 text-slate-700" />
                        <h3 className="text-xl font-semibold text-slate-700 tracking-tight">Activity Feed / Log</h3>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-700">
                        View full log
                      </Button>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-base text-slate-700">
                      {activity.length > 0 ? activity.map((item, i) => (
                        <li key={i}>
                          <span>{item.date} </span>
                          <span className="font-bold">{item.highlight}</span>
                        </li>
                      )) : <li>No recent activity</li>}
                    </ul>
                  </div>

                  {/* Recent Projects Card */}
                  <div className="border border-slate-300 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-6 w-6 text-slate-700" />
                        <h3 className="text-xl font-semibold text-slate-700 tracking-tight">Recent Projects</h3>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-700" onClick={() => setActiveTab('projects')}>
                        See all projects
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-400 hover:bg-transparent">
                          <TableHead className="text-sm font-bold text-slate-500">Project Name</TableHead>
                          <TableHead className="text-sm font-bold text-slate-500">Status</TableHead>
                          <TableHead className="text-sm font-bold text-slate-500">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentProjects.length > 0 ? recentProjects.map((project, i) => (
                          <TableRow key={i} className="border-b border-slate-200">
                            <TableCell className="text-sm text-slate-900">{project.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {project.status === 'Active' && <CheckCircle className="h-6 w-6 text-green-600" />}
                                {project.status === 'On hold' && <MinusCircle className="h-6 w-6 text-slate-400" />}
                                {project.status === 'Archived' && <XCircle className="h-6 w-6 text-slate-700" />}
                                <span className="text-sm text-slate-900">{project.status}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-4 bg-slate-300 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      project.progress >= 90 ? 'bg-green-600' : 'bg-orange-500'
                                    )}
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-slate-500 w-10">
                                  {project.progress === 100 ? '100' : `${project.progress}%`}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-slate-500">No projects</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {/* Stats Cards - Figma style with exact colors */}
              <div className="grid grid-cols-4 gap-3">
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-2.5">
                    <FolderOpen className="h-6 w-6 text-slate-700" />
                    <span className="text-xl font-semibold text-slate-900 tracking-[-0.1px]">Total Projects</span>
                    <span className="text-3xl font-semibold text-slate-900 tracking-[-0.225px]">{company.stats.totalProjects}</span>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-4">
                    <span className="text-xl font-semibold text-slate-900 tracking-[-0.1px]">Active</span>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="h-6 w-6 text-[#009951]" />
                      <span className="text-2xl font-semibold text-slate-900 tracking-[-0.144px]">{company.stats.activeCount}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-4">
                    <span className="text-xl font-semibold text-slate-900 tracking-[-0.1px]">On hold</span>
                    <div className="flex items-center gap-2.5">
                      <MinusCircle className="h-6 w-6 text-[#99a0aa]" />
                      <span className="text-2xl font-semibold text-slate-900 tracking-[-0.144px]">{company.stats.onHoldCount}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-4">
                    <span className="text-xl font-semibold text-slate-900 tracking-[-0.1px]">Archived</span>
                    <div className="flex items-center gap-2.5">
                      <XCircle className="h-6 w-6 text-[#334155]" />
                      <span className="text-2xl font-semibold text-slate-900 tracking-[-0.144px]">{company.stats.archivedCount}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search Project..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Status</span>
                  <Select value={projectStatusFilter} onValueChange={setProjectStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On hold</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Data Range</span>
                  <Select>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="From..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jan">Jan 2024</SelectItem>
                      <SelectItem value="feb">Feb 2024</SelectItem>
                      <SelectItem value="mar">Mar 2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="To..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dec">Dec 2025</SelectItem>
                      <SelectItem value="nov">Nov 2025</SelectItem>
                      <SelectItem value="oct">Oct 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-base text-[#334155]">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>

              {/* Projects Table - Figma exact styling */}
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#757575] hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-[#62748e]">Project</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Status</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Assigned Agents</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Start Date</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">End Date</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Progress</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="border-b border-[#e2e8f0] hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/companies/${companyId}/projects/${project.id}`)}
                    >
                      <TableCell className="text-sm text-[#020618]">{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {project.status === 'Active' && <CheckCircle className="h-6 w-6 text-[#009951]" />}
                          {project.status === 'On hold' && <MinusCircle className="h-6 w-6 text-[#99a0aa]" />}
                          {project.status === 'Archived' && <XCircle className="h-6 w-6 text-[#334155]" />}
                          <span className="text-sm text-[#020618]">{project.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#020618] text-center">{project.assignedAgents}</TableCell>
                      <TableCell className="text-sm text-[#020618]">{project.startDate}</TableCell>
                      <TableCell className="text-sm text-[#020618]">{project.endDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-4 bg-[#cccfd5] rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-l-full',
                                project.progress >= 90 ? 'bg-[#009951] rounded-r-full' : project.progress >= 70 ? 'bg-[#fc8600]' : 'bg-[#ec221f]'
                              )}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#71717a] w-10">
                            {project.progress === 100 ? '100' : `${project.progress}%`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          className="p-1 hover:bg-slate-100 rounded transition-colors"
                          onClick={(e) => { e.stopPropagation() }}
                        >
                          <Pencil className="h-6 w-6 text-[#99a0aa]" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination - Figma style */}
              <div className="flex items-center justify-center gap-2 py-6">
                <button
                  onClick={() => setProjectPage(p => Math.max(1, p - 1))}
                  disabled={projectPage === 1}
                  className="flex items-center gap-1 h-10 pl-2.5 pr-4 text-sm font-medium text-[#020618] hover:bg-slate-50 rounded-md disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                {Array.from({ length: Math.min(totalProjectPages, 2) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setProjectPage(page)}
                    className={cn(
                      'w-10 h-10 rounded-md text-sm font-medium',
                      projectPage === page
                        ? 'bg-white border border-[#e2e8f0] text-[#020618]'
                        : 'text-[#020618] hover:bg-slate-50'
                    )}
                  >
                    {page}
                  </button>
                ))}
                {totalProjectPages > 2 && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <span className="text-[#020618]">...</span>
                  </div>
                )}
                <button
                  onClick={() => setProjectPage(p => Math.min(totalProjectPages, p + 1))}
                  disabled={projectPage === totalProjectPages}
                  className="flex items-center gap-1 h-10 pl-4 pr-2.5 text-sm font-medium text-[#020618] hover:bg-slate-50 rounded-md disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              {/* Stats Cards - Figma exact styling */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-2.5">
                    <PhoneIcon className="h-6 w-6 text-slate-700" />
                    <span className="text-xl font-semibold text-slate-900 tracking-[-0.1px]">Total calls</span>
                    <span className="text-3xl font-semibold text-slate-900 tracking-[-0.225px]">{company.stats.totalCalls}</span>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-4">
                    <span className="text-xl font-semibold text-slate-900 tracking-[-0.1px]">Flags</span>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <Flag className="h-6 w-6 text-[#009951]" />
                        <span className="text-2xl font-semibold text-slate-900 tracking-[-0.144px]">{company.stats.flags.good}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Flag className="h-6 w-6 text-[#fc8600]" />
                        <span className="text-2xl font-semibold text-slate-900 tracking-[-0.144px]">{company.stats.flags.warning}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Flag className="h-6 w-6 text-[#ec221f]" />
                        <span className="text-2xl font-semibold text-slate-900 tracking-[-0.144px]">{company.stats.flags.critical}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
                  <CardContent className="p-6 flex items-center gap-2">
                    <span className="text-xl font-semibold text-slate-900 tracking-[-0.1px]">Average Score</span>
                    <span className="text-3xl font-semibold text-slate-900 tracking-[-0.225px]">78/100</span>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search Agent..."
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Project</span>
                  <Select value={agentProjectFilter} onValueChange={setAgentProjectFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {apiProjects.map((project: ApiProject) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Score</span>
                  <Select value={agentScoreFilter} onValueChange={setAgentScoreFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select Score..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="high">High (90+)</SelectItem>
                      <SelectItem value="medium">Medium (70-89)</SelectItem>
                      <SelectItem value="low">Low (&lt;70)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-slate-900">Agents</h2>

              {/* Agents Table - Figma exact styling */}
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#757575] hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-[#62748e]">Name</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Role</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Assignments</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Timezone</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Score</TableHead>
                    <TableHead className="text-sm font-bold text-[#62748e]">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAgents.map((agent) => (
                    <TableRow
                      key={agent.id}
                      className="border-b border-[#e2e8f0] hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/team/${agent.id}`)}
                    >
                      <TableCell className="text-sm text-[#020618]">{agent.name}</TableCell>
                      <TableCell className="text-sm text-[#020618]">{agent.role}</TableCell>
                      <TableCell className="text-sm text-[#020618]">{agent.assignments}</TableCell>
                      <TableCell className="text-sm text-[#020618]">
                        <span>{agent.timezone.split(' — ')[0]} — </span>
                        <span className="italic">{agent.timezone.split(' — ')[1]}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-28 h-4 bg-[#cccfd5] rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-l-full',
                                agent.score >= 90 ? 'bg-[#009951] rounded-r-full' : agent.score >= 70 ? 'bg-[#fc8600]' : 'bg-[#ec221f]'
                              )}
                              style={{ width: `${agent.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#71717a] w-10">
                            {agent.score === 100 ? '100' : `${agent.score}%`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.trend === 'up' && <TrendingUp className="h-5 w-5 text-[#009951]" />}
                        {agent.trend === 'down' && <TrendingDown className="h-5 w-5 text-[#ec221f]" />}
                        {agent.trend === 'stable' && <ArrowRight className="h-5 w-5 text-[#334155]" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination - Figma style */}
              <div className="flex items-center justify-center gap-2 py-6">
                <button
                  onClick={() => setAgentPage(p => Math.max(1, p - 1))}
                  disabled={agentPage === 1}
                  className="flex items-center gap-1 h-10 pl-2.5 pr-4 text-sm font-medium text-[#020618] hover:bg-slate-50 rounded-md disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                {Array.from({ length: Math.min(totalAgentPages, 2) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setAgentPage(page)}
                    className={cn(
                      'w-10 h-10 rounded-md text-sm font-medium',
                      agentPage === page
                        ? 'bg-white border border-[#e2e8f0] text-[#020618]'
                        : 'text-[#020618] hover:bg-slate-50'
                    )}
                  >
                    {page}
                  </button>
                ))}
                {totalAgentPages > 2 && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <span className="text-[#020618]">...</span>
                  </div>
                )}
                <button
                  onClick={() => setAgentPage(p => Math.min(totalAgentPages, p + 1))}
                  disabled={agentPage === totalAgentPages}
                  className="flex items-center gap-1 h-10 pl-4 pr-2.5 text-sm font-medium text-[#020618] hover:bg-slate-50 rounded-md disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Add Project Modal */}
      <Dialog open={showAddProjectModal} onOpenChange={setShowAddProjectModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Project Name</label>
              <Input
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full min-h-[80px] px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select
                value={newProject.status}
                onValueChange={(value) => setNewProject({ ...newProject, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On hold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start Date</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="From..."
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End Date</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="To..."
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned Agents</label>
              <div className="flex items-center gap-2 flex-wrap p-2 border border-slate-300 rounded-md min-h-[40px]">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-sm">
                  David Kim
                  <button className="text-slate-400 hover:text-slate-600">×</button>
                </span>
                <Input
                  className="flex-1 border-0 p-0 h-auto focus-visible:ring-0"
                  placeholder=""
                />
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddProjectModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>
                Add Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Success Modal */}
      <Dialog open={showProjectSuccessModal} onOpenChange={setShowProjectSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Project successfully added</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="font-semibold text-slate-900">Retention Q3</p>
            <p className="text-sm text-slate-600">Retention initiative for Q3 customers.</p>
            <p className="text-sm text-slate-600">Mar 12, 2025 - Dec 31, 2025</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowProjectSuccessModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
