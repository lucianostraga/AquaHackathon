import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeft,
  Pencil,
  Users,
  Phone as PhoneIcon,
  BarChart3,
  Cpu,
  FolderOpen,
  Hourglass,
  CheckCircle2,
  Target,
  TrendingUp,
} from 'lucide-react'
import { usersApi, callsApi } from '@/services/api'
import { cn } from '@/lib/utils'
import type { Project as ApiProject, Agent as ApiAgent, Company as ApiCompany, CallSummary } from '@/types'

interface AgentSnapshot {
  name: string
  progress: number
}

export default function ProjectDetailPage() {
  const navigate = useNavigate()
  const { companyId, projectId } = useParams()

  // Fetch project data
  const { data: apiProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await usersApi.getProjects()
      return response.data?.find((p: ApiProject) => p.id === Number(projectId))
    },
  })

  // Fetch company data
  const { data: apiCompany } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const response = await usersApi.getCompanies()
      return response.data?.find((c: ApiCompany) => c.id === Number(companyId))
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

  // Fetch call summaries
  const { data: callSummaries = [] } = useQuery({
    queryKey: ['callSummary'],
    queryFn: async () => {
      const response = await callsApi.getSummary()
      return response.data
    },
  })

  // Transform project data
  const project = useMemo(() => {
    if (!apiProject || !apiCompany) return null

    // Find agents assigned to this project
    const projectAgents = apiAgents.filter((agent: ApiAgent) =>
      Array.isArray(agent.project)
        ? agent.project.includes(apiProject.name)
        : agent.project === apiProject.name
    )

    // Find calls for this project
    const projectCalls = callSummaries.filter(
      (call: CallSummary) => call.project === apiProject.name
    )

    const avgScore = projectCalls.length > 0
      ? Math.round(projectCalls.reduce((sum: number, c: CallSummary) => sum + c.scoreCard, 0) / projectCalls.length)
      : 0

    return {
      id: apiProject.id,
      name: apiProject.name,
      company: apiCompany.name,
      status: 'Active',
      startDate: 'Jan 2025',
      endDate: 'Dec 2025',
      stats: {
        assignedAgents: projectAgents.length,
        calls: projectCalls.length,
        averageScore: avgScore,
        aiHumanScore: avgScore > 0 ? avgScore + 4 : 0,
      },
    }
  }, [apiProject, apiCompany, apiAgents, callSummaries])

  // Activity from recent calls
  const activity = useMemo(() => {
    if (!apiProject) return []

    return callSummaries
      .filter((c: CallSummary) => c.project === apiProject.name)
      .slice(0, 3)
      .map((call: CallSummary) => ({
        date: new Date(call.processDate).toLocaleDateString(),
        text: 'Call processed: ',
        highlight: `"${call.callId}" by ${call.agentName}`,
      }))
  }, [apiProject, callSummaries])

  // DEMO DATA: Project milestones - requires backend API endpoint:
  // - /ProjectMilestones for milestone tracking per project
  // These match Figma mockups for demonstration purposes
  const milestones = useMemo(() => {
    return [
      { name: 'Data Audit', status: 'Complete' },
      { name: 'QA Align', status: 'In Progress' },
      { name: 'Client Review', status: 'Pending' },
    ]
  }, [])

  // Agents snapshot
  const agentsSnapshot: AgentSnapshot[] = useMemo(() => {
    if (!apiProject) return []

    return apiAgents
      .filter((agent: ApiAgent) =>
        Array.isArray(agent.project)
          ? agent.project.includes(apiProject.name)
          : agent.project === apiProject.name
      )
      .slice(0, 3)
      .map((agent: ApiAgent) => {
        const agentCalls = callSummaries.filter(
          (c: CallSummary) => c.agentName === agent.firstname
        )
        const avgScore = agentCalls.length > 0
          ? Math.round(agentCalls.reduce((sum: number, c: CallSummary) => sum + c.scoreCard, 0) / agentCalls.length)
          : 0

        return {
          name: `${agent.firstname} ${agent.lastname}`,
          progress: avgScore,
        }
      })
  }, [apiProject, apiAgents, callSummaries])

  if (!project) {
    return (
      <>
        <Header title="Project" />
        <PageContainer>
          <div className="text-center py-16">
            <p className="text-slate-500">Project not found</p>
            <Button onClick={() => navigate(`/companies/${companyId}`)} className="mt-4">
              Back to Company
            </Button>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Header title={`${project.name} - ${project.company}`} />
      <PageContainer>
        <div className="space-y-4">
          {/* Back link - Figma exact styling */}
          <button
            onClick={() => navigate(`/companies/${companyId}`)}
            className="flex items-center gap-2.5 text-sm font-medium text-[#334155] hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 opacity-50" />
            Back to {project.company} Projects
          </button>

          {/* Header - Figma exact styling */}
          <div className="flex items-center justify-between">
            <h1 className="text-[30px] font-semibold text-slate-900 leading-9 tracking-[-0.225px]">
              <span className="font-semibold">{project.name} - </span>
              <span className="font-normal">{project.company}</span>
            </h1>
            <Button className="bg-[#0F172A] hover:bg-slate-800 gap-2">
              <Pencil className="h-[10.67px] w-[10.67px]" />
              Edit Project
            </Button>
          </div>

          {/* Stats Cards - Figma exact styling */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-white border border-[#E2E8F0] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] rounded-md">
              <CardContent className="p-6 flex items-center gap-2.5">
                <Users className="h-6 w-6 text-slate-900" />
                <span className="text-xl font-semibold text-slate-900 leading-7 tracking-[-0.1px]">Assigned Agents</span>
                <span className="text-[30px] font-semibold text-slate-900 leading-9 tracking-[-0.225px]">{project.stats.assignedAgents}</span>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#E2E8F0] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] rounded-md">
              <CardContent className="p-6 flex items-center gap-2.5">
                <PhoneIcon className="h-6 w-6 text-slate-900" />
                <span className="text-xl font-semibold text-slate-900 leading-7 tracking-[-0.1px]">Calls</span>
                <span className="text-[30px] font-semibold text-slate-900 leading-9 tracking-[-0.225px]">{project.stats.calls}</span>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#E2E8F0] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] rounded-md">
              <CardContent className="p-6 flex items-center gap-2.5">
                <BarChart3 className="h-6 w-6 text-slate-900" />
                <span className="text-xl font-semibold text-slate-900 leading-7 tracking-[-0.1px]">Average Score</span>
                <span className="text-[30px] font-semibold text-slate-900 leading-9 tracking-[-0.225px]">{project.stats.averageScore}%</span>
                <TrendingUp className="h-6 w-6 text-[#009951]" />
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#E2E8F0] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] rounded-md">
              <CardContent className="p-6 flex items-center gap-2.5">
                <Cpu className="h-6 w-6 text-slate-900" />
                <span className="text-xl font-semibold text-slate-900 leading-7 tracking-[-0.1px]">AI-Human</span>
                <span className="text-[30px] font-semibold text-slate-900 leading-9 tracking-[-0.225px]">{project.stats.aiHumanScore}%</span>
              </CardContent>
            </Card>
          </div>

          {/* Two column layout - Figma exact styling */}
          <div className="grid grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Project Info Card - Figma exact styling */}
              <div className="border border-[#cccfd5] rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-6 w-6 text-[#334155]" />
                    <h3 className="text-xl font-semibold text-[#334155] leading-7 tracking-[-0.1px]">Project Info</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-[#009951]" />
                    <span className="text-sm text-[#020618]">{project.status}</span>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-1 border-r border-[#cccfd5] pr-6">
                    <p className="text-sm font-bold text-[#020618] leading-5">Company</p>
                    <p className="text-sm text-[#020618] leading-5">{project.company}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-sm font-bold text-[#020618] leading-5">Start Date</p>
                      <p className="text-sm text-[#020618] leading-5">{project.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#020618] leading-5">End Date</p>
                      <p className="text-sm text-[#020618] leading-5">{project.endDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agents Snapshot Card - Figma exact styling */}
              <div className="border border-[#cccfd5] rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-[#334155]" />
                  <h3 className="text-xl font-semibold text-[#334155] leading-7 tracking-[-0.1px]">Agents Snapshot</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#757575] hover:bg-transparent">
                      <TableHead className="text-sm font-bold text-[#62748e] leading-5">Project Name</TableHead>
                      <TableHead className="text-sm font-bold text-[#62748e] leading-5">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentsSnapshot.length > 0 ? agentsSnapshot.map((agent, i) => (
                      <TableRow key={i} className="border-b border-[#e2e8f0] hover:bg-transparent">
                        <TableCell className="text-sm text-[#020618] leading-5">{agent.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-4 bg-[#cccfd5] rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full',
                                  agent.progress >= 90 ? 'bg-[#009951] rounded-full' : 'bg-[#fc8600] rounded-l-full'
                                )}
                                style={{ width: `${agent.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-[#71717a] w-10">
                              {agent.progress === 100 ? '100' : `${agent.progress}%`}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-slate-500">No agents assigned</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Activity Feed Card - Figma exact styling */}
              <div className="border border-[#cccfd5] rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-6 w-6 text-[#334155]" />
                  <h3 className="text-xl font-semibold text-[#334155] leading-7 tracking-[-0.1px]">Activity Feed / Log</h3>
                </div>
                <ul className="list-disc pl-6 space-y-0 text-base text-[#334155] leading-7">
                  {activity.length > 0 ? activity.map((item, i) => (
                    <li key={i}>
                      <span>{item.date} </span>
                      <span className="font-bold">{item.highlight}</span>
                    </li>
                  )) : <li>No recent activity</li>}
                </ul>
              </div>

              {/* Milestones Card - Figma exact styling */}
              <div className="border border-[#cccfd5] rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-[#334155]" />
                  <h3 className="text-xl font-semibold text-[#334155] leading-7 tracking-[-0.1px]">Milestones</h3>
                </div>
                <ul className="list-disc pl-6 space-y-0 text-base text-[#334155] leading-7">
                  {milestones.map((milestone, i) => (
                    <li key={i}>
                      <span>{milestone.name}</span>
                      <span> – {milestone.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
