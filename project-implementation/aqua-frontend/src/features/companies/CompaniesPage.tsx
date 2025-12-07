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
import { Building2 } from 'lucide-react'
import { usersApi } from '@/services/api'

interface Company {
  id: string
  name: string
}

export default function CompaniesPage() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await usersApi.getCompanies()
      return response.data
    },
  })

  return (
    <>
      <Header title="Companies" />
      <PageContainer>
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : companies?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Registered companies</p>
              </CardContent>
            </Card>
          </div>

          {/* Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Companies</CardTitle>
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
                      <TableHead>Company Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies?.map((company: Company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.id}</TableCell>
                        <TableCell>{company.name}</TableCell>
                      </TableRow>
                    ))}
                    {(!companies || companies.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No companies found
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
