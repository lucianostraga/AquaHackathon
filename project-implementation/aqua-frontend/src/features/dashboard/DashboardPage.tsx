import { Navigate } from 'react-router-dom'

/**
 * DashboardPage - Redirects to Analytics page
 *
 * The Analytics page serves as the main dashboard with KPIs, charts, and metrics.
 * This redirect ensures users with 'monitor' permission see the full analytics dashboard.
 */
export default function DashboardPage() {
  return <Navigate to="/analytics" replace />
}
