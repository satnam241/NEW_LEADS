import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Loginpage'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import LeadsPage from './pages/LeadsPage'
import FollowupsPage from './pages/FollowupsPage'
import PipelinePage from './pages/PipelinePage'
import ReportsPage from './pages/ReportsPage'
import { useRealtime } from '@/hooks/useLeads'

// 🔐 Protected Route Component
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  useRealtime()

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="followups" element={<FollowupsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}