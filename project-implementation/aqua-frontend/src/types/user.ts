export interface User {
  id: number
  name: string
  email: string
  roleId: number
  teamId?: number
  companyId?: number
  avatar?: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

// Profile as returned by the API
export interface ApiProfile {
  id: string
  idUser: number
  user: {
    id: number
    name: string
    lastName: string
    roleId: number
  }
  role: {
    id: number
    name: string
    permissions: Permission[]
  }
}

// Normalized profile for internal use
export interface Profile {
  id: number
  userId: number
  name: string
  email: string
  roleName: string
  permissions: Permission[]
}

// Helper to normalize API profile to internal profile
export function normalizeProfile(apiProfile: ApiProfile): Profile {
  return {
    id: parseInt(apiProfile.id, 10),
    userId: apiProfile.idUser,
    name: `${apiProfile.user.name} ${apiProfile.user.lastName}`,
    email: '', // API doesn't provide email
    roleName: apiProfile.role.name,
    permissions: apiProfile.role.permissions,
  }
}

export type Permission =
  | 'users'
  | 'scorecard'
  | 'teams'
  | 'companies'
  | 'projects'
  | 'roles'
  | 'monitor'
  | 'reports'
  | 'exportinfo'
  | 'upload'
  | 'reviewcalls'
  | 'score'
  | 'notes'
  | 'coachingcalls'

export interface Team {
  id: number
  name: string
  companyId: number
  projectId?: number
  memberCount: number
}

export interface Company {
  id: number
  name: string
  industry?: string
  projectCount: number
  teamCount: number
}

export interface Project {
  id: number
  name: string
  companyId: number
  description?: string
  agentCount: number
}

export interface Agent {
  id: number
  name: string
  email: string
  teamId: number
  projectId: number
  performance?: number
  callsHandled?: number
}
