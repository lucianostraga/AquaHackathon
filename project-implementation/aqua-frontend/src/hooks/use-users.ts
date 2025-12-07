import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/services/api'

export const usersKeys = {
  all: ['users'] as const,
  profiles: () => [...usersKeys.all, 'profiles'] as const,
  profile: (id: number) => [...usersKeys.all, 'profile', id] as const,
  users: () => [...usersKeys.all, 'list'] as const,
  user: (id: number) => [...usersKeys.all, 'user', id] as const,
  roles: () => [...usersKeys.all, 'roles'] as const,
  role: (id: number) => [...usersKeys.all, 'role', id] as const,
  teams: () => [...usersKeys.all, 'teams'] as const,
  team: (id: number) => [...usersKeys.all, 'team', id] as const,
  companies: () => [...usersKeys.all, 'companies'] as const,
  company: (id: number) => [...usersKeys.all, 'company', id] as const,
  projects: () => [...usersKeys.all, 'projects'] as const,
  project: (id: number) => [...usersKeys.all, 'project', id] as const,
  agents: () => [...usersKeys.all, 'agents'] as const,
  agent: (id: number) => [...usersKeys.all, 'agent', id] as const,
}

// Profiles
export function useProfilesQuery() {
  return useQuery({
    queryKey: usersKeys.profiles(),
    queryFn: () => usersApi.getProfiles().then(res => res.data),
  })
}

export function useProfileQuery(id: number) {
  return useQuery({
    queryKey: usersKeys.profile(id),
    queryFn: () => usersApi.getProfileById(id).then(res => res.data),
    enabled: !!id,
  })
}

// Users
export function useUsersQuery() {
  return useQuery({
    queryKey: usersKeys.users(),
    queryFn: () => usersApi.getUsers().then(res => res.data),
  })
}

// Roles
export function useRolesQuery() {
  return useQuery({
    queryKey: usersKeys.roles(),
    queryFn: () => usersApi.getRoles().then(res => res.data),
  })
}

// Teams
export function useTeamsQuery() {
  return useQuery({
    queryKey: usersKeys.teams(),
    queryFn: () => usersApi.getTeams().then(res => res.data),
  })
}

export function useTeamQuery(id: number) {
  return useQuery({
    queryKey: usersKeys.team(id),
    queryFn: () => usersApi.getTeamById(id).then(res => res.data),
    enabled: !!id,
  })
}

// Companies
export function useCompaniesQuery() {
  return useQuery({
    queryKey: usersKeys.companies(),
    queryFn: () => usersApi.getCompanies().then(res => res.data),
  })
}

export function useCompanyQuery(id: number) {
  return useQuery({
    queryKey: usersKeys.company(id),
    queryFn: () => usersApi.getCompanyById(id).then(res => res.data),
    enabled: !!id,
  })
}

// Projects
export function useProjectsQuery() {
  return useQuery({
    queryKey: usersKeys.projects(),
    queryFn: () => usersApi.getProjects().then(res => res.data),
  })
}

export function useProjectsByCompanyQuery(companyId: number) {
  return useQuery({
    queryKey: [...usersKeys.projects(), 'company', companyId],
    queryFn: () => usersApi.getProjectsByCompany(companyId).then(res => res.data),
    enabled: !!companyId,
  })
}

// Agents
export function useAgentsQuery() {
  return useQuery({
    queryKey: usersKeys.agents(),
    queryFn: () => usersApi.getAgents().then(res => res.data),
  })
}

export function useAgentsByTeamQuery(teamId: number) {
  return useQuery({
    queryKey: [...usersKeys.agents(), 'team', teamId],
    queryFn: () => usersApi.getAgentsByTeam(teamId).then(res => res.data),
    enabled: !!teamId,
  })
}

// Mutations
export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.users() })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof usersApi.updateUser>[1] }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.users() })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.users() })
    },
  })
}
