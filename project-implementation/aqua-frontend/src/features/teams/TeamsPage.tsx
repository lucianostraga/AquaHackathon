import { useQuery } from '@tanstack/react-query'
import { Header, PageContainer } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users } from 'lucide-react'
import { usersApi } from '@/services/api'

interface Team {
  id: string
  name: string
}

export default function TeamsPage() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await usersApi.getTeams()
      return response.data
    },
  })

  return (
    <>
      <Header title="Teams" />
      <PageContainer>
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : teams?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Active teams in the system</p>
              </CardContent>
            </Card>
          </div>

          {/* Teams Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Teams</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Team Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams?.map((team: Team) => (
                      <TableRow key={`${team.id}-${team.name}`}>
                        <TableCell className="font-medium">{team.id}</TableCell>
                        <TableCell>{team.name}</TableCell>
                      </TableRow>
                    ))}
                    {(!teams || teams.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No teams found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}
