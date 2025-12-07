import { apiClient } from './client'
import type { User, Role, ApiProfile, Team, Company, Project, Agent } from '@/types'

export const usersApi = {
  // Profiles (for auth) - returns raw API profiles
  getProfiles: () =>
    apiClient.get<ApiProfile[]>('/Profiles'),

  getProfileById: (id: number) =>
    apiClient.get<ApiProfile>(`/Profiles/${id}`),

  // Users
  getUsers: () =>
    apiClient.get<User[]>('/Users'),

  getUserById: (id: number) =>
    apiClient.get<User>(`/Users/${id}`),

  createUser: (user: Omit<User, 'id'>) =>
    apiClient.post<User>('/Users', user),

  updateUser: (id: number, user: Partial<User>) =>
    apiClient.patch<User>(`/Users/${id}`, user),

  deleteUser: (id: number) =>
    apiClient.delete(`/Users/${id}`),

  // Roles
  getRoles: () =>
    apiClient.get<Role[]>('/Roles'),

  getRoleById: (id: number) =>
    apiClient.get<Role>(`/Roles/${id}`),

  updateRole: (id: number, role: Partial<Role>) =>
    apiClient.patch<Role>(`/Roles/${id}`, role),

  // Teams
  getTeams: () =>
    apiClient.get<Team[]>('/Teams'),

  getTeamById: (id: number) =>
    apiClient.get<Team>(`/Teams/${id}`),

  createTeam: (team: Omit<Team, 'id'>) =>
    apiClient.post<Team>('/Teams', team),

  updateTeam: (id: number, team: Partial<Team>) =>
    apiClient.patch<Team>(`/Teams/${id}`, team),

  deleteTeam: (id: number) =>
    apiClient.delete(`/Teams/${id}`),

  // Companies
  getCompanies: () =>
    apiClient.get<Company[]>('/Companies'),

  getCompanyById: (id: number) =>
    apiClient.get<Company>(`/Companies/${id}`),

  createCompany: (company: Omit<Company, 'id'>) =>
    apiClient.post<Company>('/Companies', company),

  updateCompany: (id: number, company: Partial<Company>) =>
    apiClient.patch<Company>(`/Companies/${id}`, company),

  deleteCompany: (id: number) =>
    apiClient.delete(`/Companies/${id}`),

  // Projects
  getProjects: () =>
    apiClient.get<Project[]>('/Projects'),

  getProjectById: (id: number) =>
    apiClient.get<Project>(`/Projects/${id}`),

  getProjectsByCompany: (companyId: number) =>
    apiClient.get<Project[]>('/Projects', { params: { companyId } }),

  createProject: (project: Omit<Project, 'id'>) =>
    apiClient.post<Project>('/Projects', project),

  updateProject: (id: number, project: Partial<Project>) =>
    apiClient.patch<Project>(`/Projects/${id}`, project),

  deleteProject: (id: number) =>
    apiClient.delete(`/Projects/${id}`),

  // Agents
  getAgents: () =>
    apiClient.get<Agent[]>('/Agents'),

  getAgentById: (id: number) =>
    apiClient.get<Agent>(`/Agents/${id}`),

  getAgentsByTeam: (teamId: number) =>
    apiClient.get<Agent[]>('/Agents', { params: { teamId } }),

  createAgent: (agent: Omit<Agent, 'id'>) =>
    apiClient.post<Agent>('/Agents', agent),

  updateAgent: (id: number, agent: Partial<Agent>) =>
    apiClient.patch<Agent>(`/Agents/${id}`, agent),

  deleteAgent: (id: number) =>
    apiClient.delete(`/Agents/${id}`),
}
