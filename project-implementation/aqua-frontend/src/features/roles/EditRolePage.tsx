import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Loader2, ChevronLeft } from 'lucide-react'
import { usersApi } from '@/services/api'
import { apiClient } from '@/services/api'

interface PermissionCategory {
  id: number
  name: string
  note: string
}

interface Role {
  id: number
  code: string
  name: string
  usersAssigned: number
  editable: 'yes' | 'system' | 'limited'
  lastModified: string
  permissions: string[]
}

interface PermissionState {
  view: boolean
  edit: boolean
  manage: boolean
}

/**
 * EditRolePage - Role editing with permissions matrix
 *
 * Displays a form to edit role details with:
 * - Role Name input
 * - Description input
 * - Permissions matrix with View/Edit/Manage toggles
 * - Notes for each permission category
 */
export default function EditRolePage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNewRole = !roleId || roleId === 'new'

  // Fetch permission categories from backend
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['permissionCategories'],
    queryFn: async () => {
      const response = await apiClient.get('/PermissionCategories')
      return response.data as PermissionCategory[]
    },
  })

  // Fetch role data if editing
  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      const response = await usersApi.getRoles()
      return (response.data as Role[]).find((r) => String(r.id) === String(roleId))
    },
    enabled: !isNewRole,
  })

  // Form state
  const [roleName, setRoleName] = useState(role?.name || '')
  const [description, setDescription] = useState('')

  // Permission matrix state - initialize with all false
  const [permissions, setPermissions] = useState<Record<number, PermissionState>>(() => {
    const initial: Record<number, PermissionState> = {}
    for (let i = 1; i <= 7; i++) {
      initial[i] = { view: false, edit: false, manage: false }
    }
    return initial
  })

  // Toggle a specific permission
  const togglePermission = (categoryId: number, permType: keyof PermissionState) => {
    setPermissions((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [permType]: !prev[categoryId]?.[permType],
      },
    }))
  }

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { name: string; code?: string }) => {
      const response = await usersApi.updateRole(Number(roleId), data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', roleId] })
      navigate('/roles')
    },
  })

  // Populate form and permissions when role data is loaded
  useEffect(() => {
    if (role) {
      setRoleName(role.name || '')
      setDescription(role.code || '')

      // Map role permissions to category toggles
      // Permission mapping: which role permissions enable which category toggles
      const permissionMapping: Record<string, { categoryId: number; types: (keyof PermissionState)[] }[]> = {
        'teams': [{ categoryId: 1, types: ['view', 'edit'] }],          // Users & Roles
        'score': [{ categoryId: 2, types: ['view', 'edit', 'manage'] }], // Scorecards & Thresholds
        'reviewcalls': [{ categoryId: 3, types: ['view', 'edit'] }],    // Workflows
        'coachingcalls': [{ categoryId: 3, types: ['view'] }],          // Workflows
        'notes': [{ categoryId: 4, types: ['view'] }],                  // Data & Privacy Policies
        'reports': [{ categoryId: 5, types: ['view', 'edit'] }],        // Reports & Exports
        'upload': [{ categoryId: 6, types: ['view', 'edit'] }],         // API & Webhooks
        'monitor': [{ categoryId: 7, types: ['view'] }],                // Monitoring
      }

      // Build new permissions state based on role permissions
      const newPermissions: Record<number, PermissionState> = {}
      for (let i = 1; i <= 7; i++) {
        newPermissions[i] = { view: false, edit: false, manage: false }
      }

      role.permissions?.forEach((perm: string) => {
        const mappings = permissionMapping[perm.toLowerCase()]
        if (mappings) {
          mappings.forEach(({ categoryId, types }) => {
            types.forEach((type) => {
              newPermissions[categoryId][type] = true
            })
          })
        }
      })

      setPermissions(newPermissions)
    }
  }, [role])

  const isLoading = categoriesLoading || (!isNewRole && roleLoading)

  const handleSave = async () => {
    try {
      await updateRoleMutation.mutateAsync({
        name: roleName,
        code: description,
      })
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  return (
    <>
      <Header title={isNewRole ? 'New Role' : 'Edit Role'} />
      <PageContainer>
        <div className="space-y-6">
          {/* Back link */}
          <button
            onClick={() => navigate('/roles')}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Roles
          </button>

          {/* Header with title and Save button */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              {isNewRole ? 'New Role' : 'Edit Role'}
            </h1>
            <Button
              className="bg-slate-900 hover:bg-slate-800"
              onClick={handleSave}
              disabled={updateRoleMutation.isPending || !roleName}
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>

          {/* Role Name Input */}
          <div className="space-y-1">
            <Label htmlFor="roleName" className="text-sm font-medium text-slate-600">
              Role Name
            </Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
              className="h-10 border-slate-400"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm font-medium text-slate-600">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description"
              className="h-10 border-slate-400"
            />
          </div>

          {/* Permissions Matrix Table */}
          {isLoading ? (
            <PermissionsTableSkeleton />
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-400 hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-slate-500">
                      Role
                    </TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">
                      View
                    </TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">
                      Edit
                    </TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">
                      Manage
                    </TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.map((category) => (
                    <TableRow
                      key={category.id}
                      className="border-b border-slate-200 hover:bg-slate-50 h-12"
                    >
                      <TableCell className="text-sm text-slate-900">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={permissions[category.id]?.view || false}
                          onCheckedChange={() => togglePermission(category.id, 'view')}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={permissions[category.id]?.edit || false}
                          onCheckedChange={() => togglePermission(category.id, 'edit')}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={permissions[category.id]?.manage || false}
                          onCheckedChange={() => togglePermission(category.id, 'manage')}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {category.note}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Footer notes */}
          <div className="text-base text-slate-600 space-y-1 pt-4">
            <p>System roles can't be modified or deleted.</p>
            <p>Editable roles allow permission changes within approved limits.</p>
            <p>Limited roles inherit restricted scopes — read-only dashboards, no exports.</p>
          </div>
        </div>
      </PageContainer>
    </>
  )
}

/**
 * Loading skeleton for the permissions table
 */
function PermissionsTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-400 hover:bg-transparent">
            {['Role', 'View', 'Edit', 'Manage', 'Notes'].map((header) => (
              <TableHead key={header} className="text-sm font-bold text-slate-500">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 7 }).map((_, i) => (
            <TableRow key={i} className="border-b border-slate-200 h-12">
              <TableCell>
                <Skeleton className="h-5 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-11 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-11 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-11 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
