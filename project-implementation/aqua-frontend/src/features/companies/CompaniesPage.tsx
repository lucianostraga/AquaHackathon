import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { usersApi } from '@/services/api'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores'
import type { Company as ApiCompany, Project, Agent as ApiAgent } from '@/types'

interface CompanyDisplay {
  id: number
  name: string
  status: 'Active' | 'On hold' | 'Archived'
  mainContact: string
  escalationContact: string
  projects: string[]
  agents: number
  agentIds: number[]
}

export default function CompaniesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdCompany, setCreatedCompany] = useState({ name: '', address: '' })
  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    mainContactName: '',
    mainContactEmail: '',
    mainContactPhone: '',
    escalationName: '',
    escalationEmail: '',
    escalationPhone: '',
    timezone: '',
  })
  const itemsPerPage = 6

  // Fetch companies from API
  const { data: apiCompanies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await usersApi.getCompanies()
      return response.data
    },
  })

  // Fetch projects from API
  const { data: apiProjects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await usersApi.getProjects()
      return response.data
    },
  })

  // Fetch agents from API
  const { data: apiAgents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await usersApi.getAgents()
      return response.data
    },
  })

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: { name: string }) => {
      const response = await usersApi.createCompany({
        ...companyData,
        projectCount: 0,
        teamCount: 0,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })

  const isLoading = isLoadingCompanies || isLoadingProjects || isLoadingAgents

  // Transform API companies to display format
  const companies: CompanyDisplay[] = useMemo(() => {
    return apiCompanies.map((company: ApiCompany) => {
      // Find agents belonging to this company
      const companyAgents = apiAgents.filter(
        (agent: ApiAgent) => agent.company === company.name
      )

      // Get projects from company agents
      const companyProjects = new Set<string>()
      companyAgents.forEach((agent: ApiAgent) => {
        if (Array.isArray(agent.project)) {
          agent.project.forEach((p: string) => companyProjects.add(p))
        } else if (agent.project) {
          companyProjects.add(agent.project as string)
        }
      })

      // Get first agent as main contact (simplified)
      const mainContact = companyAgents.length > 0
        ? `${companyAgents[0].firstname} ${companyAgents[0].lastname}`
        : 'Not assigned'

      return {
        id: company.id,
        name: company.name,
        status: 'Active' as const,
        mainContact,
        escalationContact: mainContact,
        projects: Array.from(companyProjects).length > 0
          ? Array.from(companyProjects)
          : apiProjects.map((p: Project) => p.name).slice(0, 2),
        agents: companyAgents.length,
        agentIds: companyAgents.map((a: ApiAgent) => a.id),
      }
    })
  }, [apiCompanies, apiProjects, apiAgents])

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company: CompanyDisplay) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!company.name.toLowerCase().includes(query)) return false
      }

      // Status filter
      if (statusFilter !== 'all' && company.status.toLowerCase().replace(' ', '-') !== statusFilter) {
        return false
      }

      // Project filter
      if (projectFilter && projectFilter !== 'all') {
        const selectedProject = apiProjects.find((p: Project) => String(p.id) === projectFilter)
        if (selectedProject && !company.projects.includes(selectedProject.name)) return false
      }

      // Agent filter
      if (agentFilter && agentFilter !== 'all') {
        if (!company.agentIds.includes(Number(agentFilter))) return false
      }

      return true
    })
  }, [companies, searchQuery, statusFilter, projectFilter, agentFilter, apiProjects])

  // Paginate
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCompanies.slice(start, start + itemsPerPage)
  }, [filteredCompanies, currentPage])

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const totalCompanies = companies.length

  const handleCreateCompany = async () => {
    try {
      await createCompanyMutation.mutateAsync({
        name: newCompany.name,
      })

      setCreatedCompany({
        name: newCompany.name,
        address: newCompany.address || 'Not specified',
      })
      setShowAddModal(false)
      setShowSuccessModal(true)
      setNewCompany({
        name: '',
        address: '',
        mainContactName: '',
        mainContactEmail: '',
        mainContactPhone: '',
        escalationName: '',
        escalationEmail: '',
        escalationPhone: '',
        timezone: '',
      })
    } catch (error) {
      console.error('Failed to create company:', error)
    }
  }

  return (
    <>
      <Header title="Companies" />
      <PageContainer>
        <div className="space-y-6">
          {/* Header with title and Add Company button */}
          <div className="flex items-center justify-between">
            <h1 className={cn(
              "text-3xl font-semibold tracking-tight",
              isTeamMode ? "text-yellow-500" : "text-slate-900"
            )}>
              Companies
            </h1>
            <Button
              className={isTeamMode ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-slate-900 hover:bg-slate-800"}
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", isTeamMode ? "text-gray-400" : "text-slate-600")}>Project</span>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {apiProjects.map((project: Project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", isTeamMode ? "text-gray-400" : "text-slate-600")}>Status</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On hold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", isTeamMode ? "text-gray-400" : "text-slate-600")}>Agent</span>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {apiAgents.map((agent: ApiAgent) => (
                    <SelectItem key={agent.id} value={String(agent.id)}>
                      {agent.firstname} {agent.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Record Count */}
          <p className={cn("text-sm", isTeamMode ? "text-gray-400" : "text-slate-600")}>
            Showing {filteredCompanies.length} of {totalCompanies} companies
          </p>

          {/* Companies Table - Figma exact styling */}
          {isLoading ? (
            <CompaniesTableSkeleton />
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className={cn(
                    "border-b hover:bg-transparent",
                    isTeamMode ? "border-gray-700" : "border-[#757575]"
                  )}>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-[#62748e]")}>Company</TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-[#62748e]")}>Main Contact</TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-[#62748e]")}>Escalation Contact</TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-[#62748e]")}>Project</TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-[#62748e]")}>Agents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company: CompanyDisplay) => {
                    return (
                      <TableRow
                        key={company.id}
                        className={cn(
                          "border-b cursor-pointer",
                          isTeamMode
                            ? "border-gray-800 hover:bg-gray-800/50"
                            : "border-[#e2e8f0] hover:bg-slate-50"
                        )}
                        onClick={() => navigate(`/companies/${company.id}`)}
                      >
                        <TableCell className={cn("text-sm", isTeamMode ? "text-white" : "text-[#020618]")}>
                          {company.name}
                        </TableCell>
                        <TableCell className={cn("text-sm", isTeamMode ? "text-gray-300" : "text-[#020618]")}>
                          {company.mainContact}
                        </TableCell>
                        <TableCell className={cn("text-sm", isTeamMode ? "text-gray-300" : "text-[#020618]")}>
                          {company.escalationContact}
                        </TableCell>
                        <TableCell>
                          {company.projects.length > 1 ? (
                            <Popover>
                              <PopoverTrigger className={cn(
                                "text-sm",
                                isTeamMode ? "text-gray-300 hover:text-white" : "text-[#020618] hover:text-slate-700"
                              )}>
                                {company.projects[0]} <span className={isTeamMode ? "text-gray-400" : "text-[#020618]"}>(+{company.projects.length - 1})</span>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-2">
                                <ul className="text-sm space-y-1">
                                  {company.projects.map((project, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <span className="text-slate-400">•</span>
                                      {project}
                                    </li>
                                  ))}
                                </ul>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <span className={cn("text-sm", isTeamMode ? "text-gray-300" : "text-[#020618]")}>{company.projects[0]}</span>
                          )}
                        </TableCell>
                        <TableCell className={cn("text-sm", isTeamMode ? "text-gray-300" : "text-[#020618]")}>
                          {company.agents}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {paginatedCompanies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className={cn("text-center py-8", isTeamMode ? "text-gray-500" : "text-slate-500")}>
                        No companies found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination - Figma style */}
          <div className="flex items-center justify-center gap-2 py-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "flex items-center gap-1 h-10 pl-2.5 pr-4 text-sm font-medium rounded-md disabled:opacity-50",
                isTeamMode
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-[#020618] hover:bg-slate-50"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 2) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-10 h-10 rounded-md text-sm font-medium',
                  currentPage === page
                    ? isTeamMode
                      ? 'bg-yellow-500 text-black'
                      : 'bg-white border border-[#e2e8f0] text-[#020618]'
                    : isTeamMode
                      ? 'text-gray-400 hover:bg-gray-800'
                      : 'text-[#020618] hover:bg-slate-50'
                )}
              >
                {page}
              </button>
            ))}
            {totalPages > 2 && (
              <div className="w-9 h-9 flex items-center justify-center">
                <span className={isTeamMode ? "text-gray-600" : "text-[#020618]"}>...</span>
              </div>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "flex items-center gap-1 h-10 pl-4 pr-2.5 text-sm font-medium rounded-md disabled:opacity-50",
                isTeamMode
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-[#020618] hover:bg-slate-50"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </PageContainer>

      {/* Add Company Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <Input
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Address</label>
              <Input
                value={newCompany.address}
                onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <h3 className="font-semibold text-slate-900 mb-3">Main Contact Point</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input
                    value={newCompany.mainContactName}
                    onChange={(e) => setNewCompany({ ...newCompany, mainContactName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={newCompany.mainContactEmail}
                      onChange={(e) => setNewCompany({ ...newCompany, mainContactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <Input
                      type="tel"
                      value={newCompany.mainContactPhone}
                      onChange={(e) => setNewCompany({ ...newCompany, mainContactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="font-semibold text-slate-900 mb-3">Escalation Contact Point</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input
                    value={newCompany.escalationName}
                    onChange={(e) => setNewCompany({ ...newCompany, escalationName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={newCompany.escalationEmail}
                      onChange={(e) => setNewCompany({ ...newCompany, escalationEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <Input
                      type="tel"
                      value={newCompany.escalationPhone}
                      onChange={(e) => setNewCompany({ ...newCompany, escalationPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Timezone</label>
              <Select
                value={newCompany.timezone}
                onValueChange={(value) => setNewCompany({ ...newCompany, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="est">America/New_York (UTC-5)</SelectItem>
                  <SelectItem value="pst">America/Los_Angeles (UTC-8)</SelectItem>
                  <SelectItem value="gmt">Europe/London (UTC+0)</SelectItem>
                  <SelectItem value="cet">Europe/Berlin (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCompany} disabled={createCompanyMutation.isPending || !newCompany.name}>
                {createCompanyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Company'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Success Modal - Figma exact styling */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#020618]">Company successfully added</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="font-bold text-sm text-[#020618]">{createdCompany.name || 'ACME CORP'}</p>
            <p className="text-sm text-[#020618]">Address</p>
            <p className="text-sm text-[#020618]">{createdCompany.address || 'Bogotá, Colombia'}</p>
          </div>
          <div className="flex justify-end">
            <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Loading skeleton for the companies table
 */
function CompaniesTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#757575] hover:bg-transparent">
            {['Company', 'Main Contact', 'Escalation Contact', 'Project', 'Agents'].map((header) => (
              <TableHead key={header} className="text-sm font-bold text-[#62748e]">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-b border-[#e2e8f0]">
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
