// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import LoginPage from './pages/Loginpage'
// import Layout from './components/layout/Layout'
// import Dashboard from './pages/Dashboard'
// import LeadsPage from './pages/LeadsPage'
// import FollowupsPage from './pages/FollowupsPage'
// import PipelinePage from './pages/PipelinePage'
// import ReportsPage from './pages/ReportsPage'
// import { useRealtime } from '@/hooks/useLeads'

// // 🔐 Protected Route Component
// function ProtectedRoute({ children }: { children: JSX.Element }) {
//   const token = localStorage.getItem('token')

//   if (!token) {
//     return <Navigate to="/login" replace />
//   }

//   return children
// }

// function AppRoutes() {
//   useRealtime()

//   return (
//     <Routes>
//       {/* Public Route */}
//       <Route path="/login" element={<LoginPage />} />

//       {/* Protected Routes */}
//       <Route
//         path="/"
//         element={
//           <ProtectedRoute>
//             <Layout />
//           </ProtectedRoute>
//         }
//       >
//         <Route index element={<Navigate to="/dashboard" replace />} />
//         <Route path="dashboard" element={<Dashboard />} />
//         <Route path="leads" element={<LeadsPage />} />
//         <Route path="followups" element={<FollowupsPage />} />
//         <Route path="pipeline" element={<PipelinePage />} />
//         <Route path="reports" element={<ReportsPage />} />
//       </Route>
//     </Routes>
//   )
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AppRoutes />
//     </BrowserRouter>
//   )
// }

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React, { Suspense, useEffect } from 'react'
import Layout from './components/layout/Layout'
import { useRealtime } from '@/hooks/useLeads'

const LoginPage    = React.lazy(() => import('./pages/Loginpage'))
const Dashboard    = React.lazy(() => import('./pages/Dashboard'))
const LeadsPage    = React.lazy(() => import('./pages/LeadsPage'))
const FollowupsPage = React.lazy(() => import('./pages/FollowupsPage'))
const PipelinePage = React.lazy(() => import('./pages/PipelinePage'))
const ReportsPage  = React.lazy(() => import('./pages/ReportsPage'))

// ── Preload all pages immediately on app start ────────────────────────────
function preloadAll() {
  import('./pages/Dashboard')
  import('./pages/LeadsPage')
  import('./pages/FollowupsPage')
  import('./pages/PipelinePage')
  import('./pages/ReportsPage')
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

// ── Smooth skeleton loader ────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      padding: '24px 20px', maxWidth: 900, margin: '0 auto',
    }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ height: 24, width: 160, borderRadius: 8, background: '#f1f5f9', marginBottom: 8 }} className="skeleton" />
          <div style={{ height: 14, width: 220, borderRadius: 6, background: '#f1f5f9' }} className="skeleton" />
        </div>
        <div style={{ height: 36, width: 100, borderRadius: 8, background: '#f1f5f9' }} className="skeleton" />
      </div>
      {/* Cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 8 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 90, borderRadius: 12, background: '#f1f5f9' }} className="skeleton" />
        ))}
      </div>
      {/* Table skeleton */}
      <div style={{ borderRadius: 14, background: '#fff', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ height: 16, width: 120, borderRadius: 6, background: '#f1f5f9' }} className="skeleton" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 20px', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} className="skeleton" />
            <div style={{ flex: 1 }}>
              <div style={{ height: 13, width: `${120 + (i * 30) % 80}px`, borderRadius: 5, background: '#f1f5f9', marginBottom: 6 }} className="skeleton" />
              <div style={{ height: 11, width: `${80 + (i * 20) % 60}px`, borderRadius: 5, background: '#f1f5f9' }} className="skeleton" />
            </div>
            <div style={{ height: 24, width: 80, borderRadius: 99, background: '#f1f5f9' }} className="skeleton" />
            <div style={{ height: 24, width: 70, borderRadius: 99, background: '#f1f5f9' }} className="skeleton" />
          </div>
        ))}
      </div>
    </div>
  )
}

function AppRoutes() {
  useRealtime()
  useEffect(() => { preloadAll() }, [])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="leads"      element={<LeadsPage />} />
          <Route path="followups"  element={<FollowupsPage />} />
          <Route path="pipeline"   element={<PipelinePage />} />
          <Route path="reports"    element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}