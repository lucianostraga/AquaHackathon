import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Check, X, AlertTriangle, Pencil, Eye } from 'lucide-react'
import { usersApi } from '@/services/api'
import { useThemeStore } from '@/stores'
import { cn } from '@/lib/utils'

interface Role {
  id: number
  code: string
  name: string
  usersAssigned: number
  editable: 'yes' | 'system' | 'limited'
  lastModified: string
  permissions: string[]
}

/**
 * RolesPage - Roles Management matching Figma design
 *
 * Displays a table of roles with:
 * - Role code (short name)
 * - Description (full name)
 * - Users Assigned count
 * - Editable status (Yes/System/Limited)
 * - Last Modified date
 * - Actions (edit)
 */
export default function RolesPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isTeamMode = theme === 'team-dark'
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await usersApi.getRoles()
      return response.data as Role[]
    },
  })

  // Render editable status with appropriate icon and color
  const renderEditableStatus = (editable: Role['editable']) => {
    switch (editable) {
      case 'yes':
        return (
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-green-500" />
            <span className={cn("text-sm", isTeamMode ? "text-white" : "text-slate-900")}>Yes</span>
          </div>
        )
      case 'system':
        return (
          <div className="flex items-center gap-3">
            <X className="h-6 w-6 text-red-500" />
            <span className={cn("text-sm", isTeamMode ? "text-white" : "text-slate-900")}>System</span>
          </div>
        )
      case 'limited':
        return (
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <span className={cn("text-sm", isTeamMode ? "text-white" : "text-slate-900")}>Limited</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Header title="Roles Management" />
      <PageContainer>
        <div className="space-y-4">
          {/* Header with title and New Role button */}
          <div className="flex items-center justify-between">
            <h1 className={cn(
              "text-3xl font-semibold tracking-tight",
              isTeamMode ? "text-yellow-500" : "text-slate-900"
            )}>
              Roles Management
            </h1>
            <Button
              className={isTeamMode ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-slate-900 hover:bg-slate-800"}
              onClick={() => navigate('/roles/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Role
            </Button>
          </div>

          {/* Showing count */}
          <p className={cn("text-base", isTeamMode ? "text-gray-400" : "text-slate-600")}>
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              `Showing ${roles?.length || 0} roles`
            )}
          </p>

          {/* Roles Table */}
          {isLoading ? (
            <RolesTableSkeleton isTeamMode={isTeamMode} />
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className={cn(
                    "border-b hover:bg-transparent",
                    isTeamMode ? "border-gray-700" : "border-slate-400"
                  )}>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-slate-500")}>
                      Role
                    </TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-slate-500")}>
                      Description
                    </TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-slate-500")}>
                      Users Assigned
                    </TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-slate-500")}>
                      Editable
                    </TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-slate-500")}>
                      Last Modified
                    </TableHead>
                    <TableHead className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-slate-500")}>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles?.map((role) => (
                    <TableRow
                      key={role.id}
                      className={cn(
                        "border-b",
                        isTeamMode
                          ? "border-gray-800 hover:bg-gray-800/50"
                          : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <TableCell className={cn("text-sm", isTeamMode ? "text-white" : "text-slate-900")}>
                        {role.code}
                      </TableCell>
                      <TableCell className={cn("text-sm", isTeamMode ? "text-gray-300" : "text-slate-900")}>
                        {role.name}
                      </TableCell>
                      <TableCell className={cn("text-sm", isTeamMode ? "text-gray-300" : "text-slate-900")}>
                        {role.usersAssigned}
                      </TableCell>
                      <TableCell>
                        {renderEditableStatus(role.editable)}
                      </TableCell>
                      <TableCell className={cn("text-sm", isTeamMode ? "text-gray-300" : "text-slate-900")}>
                        {role.lastModified}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Edit button - shown for 'yes' and 'limited' editable */}
                          {role.editable !== 'system' && (
                            <button
                              className={cn(
                                "p-1 rounded transition-colors",
                                isTeamMode ? "hover:bg-gray-700" : "hover:bg-slate-100"
                              )}
                              aria-label={`Edit ${role.name}`}
                              onClick={() => navigate(`/roles/${role.id}`)}
                            >
                              <Pencil className={cn("h-5 w-5", isTeamMode ? "text-yellow-500" : "text-amber-600")} />
                            </button>
                          )}
                          {/* View button - shown for 'yes' and 'system' editable */}
                          {role.editable !== 'limited' && (
                            <button
                              className={cn(
                                "p-1 rounded transition-colors",
                                isTeamMode ? "hover:bg-gray-700" : "hover:bg-slate-100"
                              )}
                              aria-label={`View ${role.name}`}
                              onClick={() => navigate(`/roles/${role.id}`)}
                            >
                              <Eye className={cn("h-5 w-5", isTeamMode ? "text-purple-400" : "text-purple-600")} />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!roles || roles.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className={cn("text-center py-8", isTeamMode ? "text-gray-500" : "text-slate-500")}
                      >
                        No roles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Footer notes */}
          <div className={cn("text-base space-y-1 pt-4", isTeamMode ? "text-gray-400" : "text-slate-600")}>
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
 * Loading skeleton for the roles table
 */
function RolesTableSkeleton({ isTeamMode }: { isTeamMode: boolean }) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className={cn(
            "border-b hover:bg-transparent",
            isTeamMode ? "border-gray-700" : "border-slate-400"
          )}>
            {['Role', 'Description', 'Users Assigned', 'Editable', 'Last Modified', 'Actions'].map(
              (header) => (
                <TableHead key={header} className={cn("text-sm font-bold", isTeamMode ? "text-gray-400" : "text-slate-500")}>
                  {header}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className={cn("border-b", isTeamMode ? "border-gray-800" : "border-slate-200")}>
              <TableCell>
                <Skeleton className="h-5 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-6" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
