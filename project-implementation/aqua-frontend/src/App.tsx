import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout'
import { LoginPage, ProtectedRoute } from '@/features/auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Lazy load pages for code splitting
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const CallsPage = lazy(() => import('@/features/calls/CallsPage'))
const CallDetailPage = lazy(() => import('@/features/call-detail/CallDetailPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const UploadPage = lazy(() => import('@/features/upload/UploadPage'))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'))
const TeamsPage = lazy(() => import('@/features/teams/TeamsPage'))
const CompaniesPage = lazy(() => import('@/features/companies/CompaniesPage'))
const RolesPage = lazy(() => import('@/features/roles/RolesPage'))
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Loading fallback
function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/calls" replace />} />

              {/* Main pages */}
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="/calls"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CallsPage />
                  </Suspense>
                }
              />
              <Route
                path="/calls/:transactionId"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CallDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/upload"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <UploadPage />
                  </Suspense>
                }
              />
              <Route
                path="/analytics"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AnalyticsPage />
                  </Suspense>
                }
              />

              {/* Admin pages */}
              <Route
                path="/teams"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TeamsPage />
                  </Suspense>
                }
              />
              <Route
                path="/companies"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CompaniesPage />
                  </Suspense>
                }
              />
              <Route
                path="/roles"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RolesPage />
                  </Suspense>
                }
              />
              <Route
                path="/projects"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProjectsPage />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Catch all - redirect to calls */}
            <Route path="*" element={<Navigate to="/calls" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
