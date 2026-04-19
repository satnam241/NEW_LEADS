// import { Outlet, NavLink, useLocation } from 'react-router-dom'
// import { LayoutDashboard, Users, Bell, GitBranch, BarChart3, Zap, Menu, X } from 'lucide-react'
// import { useState } from 'react'
// import { useStats } from '@/hooks/useLeads'

// const NAV = [
//   { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
//   { to: '/leads', icon: Users, label: 'All Leads' },
//   { to: '/followups', icon: Bell, label: 'Follow-ups', badge: true },
//   { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
//   { to: '/reports', icon: BarChart3, label: 'Reports' },
// ]

// function SidebarContent({ onClose }: { onClose?: () => void }) {
//   const { data: stats } = useStats()
//   const urgent = (stats?.todayFollowups ?? 0) + (stats?.overdueFollowups ?? 0)
//   const loc = useLocation()

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRight: '1px solid #f1f5f9' }}>
//       {/* Logo */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 60, borderBottom: '1px solid #f8fafc', flexShrink: 0 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4c6ef5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(76,110,245,0.35)' }}>
//             <Zap size={15} color="#fff" />
//           </div>
//           <div>
//             <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>LeadFlow</p>
//             <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.2 }}>CRM Pro</p>
//           </div>
//         </div>
//         {onClose && (
//           <button onClick={onClose} style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', borderRadius: 6 }}>
//             <X size={16} />
//           </button>
//         )}
//       </div>

//       <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
//         {NAV.map(({ to, icon: Icon, label, badge }) => {
//           const active = loc.pathname === to || (to !== '/dashboard' && loc.pathname.startsWith(to))
//           return (
//             <NavLink
//               key={to} to={to}
//               onClick={onClose}
//               style={{
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 padding: '9px 12px', borderRadius: 9, fontSize: 13.5, fontWeight: 500,
//                 textDecoration: 'none', color: active ? '#3b5bdb' : '#64748b',
//                 background: active ? '#eff4ff' : 'transparent',
//                 transition: 'background-color 100ms ease, color 100ms ease',
//               }}
//               onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc' }}
//               onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
//             >
//               <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
//                 <Icon size={16} />
//                 {label}
//               </span>
//               {badge && urgent > 0 && (
//                 <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, minWidth: 18, textAlign: 'center' }}>
//                   {urgent}
//                 </span>
//               )}
//             </NavLink>
//           )
//         })}
//       </nav>

//       {/* Bottom live dot */}
//       <div style={{ padding: '12px 18px', borderTop: '1px solid #f8fafc', flexShrink: 0 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
//           <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} className="animate-pulse-dot" />
//           <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>Live sync</span>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function Layout() {
//   const [mobileOpen, setMobileOpen] = useState(false)

//   return (
//     <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>
      
//       {/* Desktop sidebar - FIXED: Only one aside block now */}
//       <aside className="hidden md:block" style={{ width: 220, flexShrink: 0 }}>
//         <div style={{ height: '100%' }}>
//           <SidebarContent />
//         </div>
//       </aside>

//       {/* Mobile drawer */}
//       {mobileOpen && (
//         <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
//           <div 
//             style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', animation: 'backdropIn 180ms ease both' }} 
//             onClick={() => setMobileOpen(false)} 
//           />
//           <div style={{ position: 'relative', width: 220, flexShrink: 0, animation: 'slideRight 220ms cubic-bezier(0.16,1,0.3,1) both', height: '100%' }}>
//             <SidebarContent onClose={() => setMobileOpen(false)} />
//           </div>
//         </div>
//       )}

//       {/* Main Area */}
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        
//         {/* Mobile topbar */}
//         <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }} className="md:hidden">
//           <button onClick={() => setMobileOpen(true)} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8 }}>
//             <Menu size={18} style={{ color: '#374151' }} />
//           </button>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#4c6ef5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Zap size={12} color="#fff" />
//             </div>
//             <span style={{ fontSize: 14, fontWeight: 700 }}>LeadFlow</span>
//           </div>
//           <div style={{ width: 30 }} />
//         </header>

//         {/* Page content */}
//         <main style={{ flex: 1, overflowY: 'auto', padding: '24px', WebkitOverflowScrolling: 'touch' }}>
//           <Outlet />
//         </main>
//       </div>

//       <style>{`
//         @keyframes slideRight { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
//         @keyframes backdropIn { from{opacity:0} to{opacity:1} }
//         @media (min-width: 768px) { 
//           .md\\:hidden { display: none !important; } 
//           .md\\:block { display: block !important; } 
//           .md\\:flex { display: flex !important; } 
//           .md\\:flex-col { flex-direction: column !important; } 
//         }
//       `}</style>
//     </div>
//   )
// }

// src/components/Layout.tsx
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, GitBranch, BarChart3, Zap, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useStats } from '@/hooks/useLeads'
import { adminLogout } from '@/lib/api'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',     icon: Users,           label: 'All Leads' },
  { to: '/followups', icon: Bell,            label: 'Follow-ups', badge: true },
  { to: '/pipeline',  icon: GitBranch,       label: 'Pipeline'  },
  { to: '/reports',   icon: BarChart3,       label: 'Reports'   },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { data: stats } = useStats()
  const urgent = (stats?.todayFollowups ?? 0) + (stats?.overdueFollowups ?? 0)
  const loc  = useLocation()
  const nav  = useNavigate()

  const handleLogout = () => {
    adminLogout()
    nav('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRight: '1px solid #f1f5f9' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 60, borderBottom: '1px solid #f8fafc', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4c6ef5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(76,110,245,0.35)' }}>
            <Zap size={15} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>LeadFlow</p>
            <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.2 }}>CRM Pro</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', borderRadius: 6 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, icon: Icon, label, badge }) => {
          const active = loc.pathname === to || (to !== '/dashboard' && loc.pathname.startsWith(to))
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 9, fontSize: 13.5, fontWeight: 500,
                textDecoration: 'none',
                color:      active ? '#3b5bdb'  : '#64748b',
                background: active ? '#eff4ff'  : 'transparent',
                transition: 'background-color 100ms ease, color 100ms ease',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon size={16} />
                {label}
              </span>
              {badge && urgent > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, minWidth: 18, textAlign: 'center' }}>
                  {urgent}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: live dot + logout */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #f8fafc', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} className="animate-pulse-dot" />
          <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>Live sync</span>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: 12, fontWeight: 500, padding: '4px 6px',
            borderRadius: 7, transition: 'color 120ms, background 120ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>

      {/* Desktop sidebar */}
      <aside style={{ width: 220, flexShrink: 0, display: 'none' }} className="md-sidebar">
        <div style={{ height: '100%' }}>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', animation: 'backdropIn 180ms ease both' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ position: 'relative', width: 220, flexShrink: 0, animation: 'slideRight 220ms cubic-bezier(0.16,1,0.3,1) both', height: '100%' }}>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Mobile topbar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }} className="md-topbar">
          <button onClick={() => setMobileOpen(true)} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8 }}>
            <Menu size={18} style={{ color: '#374151' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#4c6ef5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={12} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>LeadFlow</span>
          </div>
          <div style={{ width: 30 }} />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', WebkitOverflowScrolling: 'touch' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes slideRight   { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        @keyframes backdropIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin         { to { transform: rotate(360deg) } }
        @media (min-width: 768px) {
          .md-sidebar  { display: block !important; }
          .md-topbar   { display: none !important;  }
        }
      `}</style>
    </div>
  )
}