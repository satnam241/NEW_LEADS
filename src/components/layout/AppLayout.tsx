import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, BarChart3, ClipboardList } from 'lucide-react'

export default function AppLayout({ children }) {
  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          LeadFlow
        </div>

        <nav className="nav">
          <NavLink to="/" className="nav-link">
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>

          <NavLink to="/leads" className="nav-link">
            <Users size={16} /> Leads
          </NavLink>

          <NavLink to="/reports" className="nav-link">
            <BarChart3 size={16} /> Reports
          </NavLink>

          <NavLink to="/pipeline" className="nav-link">
            <ClipboardList size={16} /> Pipeline
          </NavLink>
        </nav>

      </aside>

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-title">CRM Dashboard</div>

          <div className="topbar-actions">
            <span className="user">Kunal</span>
          </div>
        </header>

        {/* CONTENT */}
        <main className="content">
          {children}
        </main>

      </div>
    </div>
  )
}