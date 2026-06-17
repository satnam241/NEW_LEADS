// src/layouts/AppLayout.tsx
import {
  LayoutDashboard, FileText, Bell, BarChart2,
  LogOut, X, Menu, CalendarCheck, CalendarPlus,
  AlertCircle, Clock, Calendar, ChevronRight,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '@/lib/api'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',      icon: FileText,        label: 'Leads'      },
  { to: '/followups',  icon: Bell,            label: 'Follow Ups' },
  { to: '/reports',    icon: BarChart2,        label: 'Report'     },
]

// ─── Types ─────────────────────────────────────────────────────
interface Notification {
  id: string
  leadId: string
  leadName: string
  phone: string | null
  message: string
  type: 'overdue' | 'due_today' | 'upcoming_30min' | 'upcoming_1day' | 'upcoming_2days'
  priority: 'critical' | 'high' | 'medium' | 'low'
  followUpDate: string
  overdueLabel?: string
}

// ─── Notification Hook ─────────────────────────────────────────
function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(false)

  const fetch_ = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') ?? ''
      const res   = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.data ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetch_()
    // Har 60 seconds mein refresh
    const interval = setInterval(fetch_, 60_000)
    return () => clearInterval(interval)
  }, [])

  return { notifications, loading, refetch: fetch_ }
}

// ─── Admin Profile Hook ────────────────────────────────────────
function useAdminProfile() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') ?? ''
        const res   = await fetch(`${API_BASE}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setAdmin({ name: data.name ?? 'Admin', email: data.email ?? '' })
      } catch { /* ignore */ }
    }
    load()
  }, [])

  return admin
}

// ─── Notification Panel ────────────────────────────────────────
function NotificationPanel({
  notifications,
  onClose,
}: {
  notifications: Notification[]
  onClose: () => void
}) {
  const navigate = useNavigate()

  const priorityConfig = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  icon: AlertCircle, label: 'Overdue'   },
    high:     { color: '#f97316', bg: 'rgba(249,115,22,0.10)', icon: Clock,       label: 'Urgent'    },
    medium:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', icon: Clock,       label: 'Today'     },
    low:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', icon: Calendar,    label: 'Upcoming'  },
  }

  const grouped = {
    critical: notifications.filter(n => n.priority === 'critical'),
    high:     notifications.filter(n => n.priority === 'high'),
    medium:   notifications.filter(n => n.priority === 'medium'),
    low:      notifications.filter(n => n.priority === 'low'),
  }

  const groupLabels: Record<string, string> = {
    critical: '🔴 Overdue',
    high:     '🟠 In 30 Minutes',
    medium:   '🟡 Due Today',
    low:      '🔵 Tomorrow',
  }

  return (
    <div style={{
      position: 'absolute', top: '110%', right: 0, zIndex: 9999,
      width: 360, maxHeight: 520,
      background: '#2a2d3e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14,
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Notifications</p>
          <p style={{ fontSize: 11, color: '#9ca3b8', margin: '2px 0 0' }}>
            {notifications.length} follow-up alert{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#9ca3b8', display: 'flex' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 28, margin: '0 0 8px' }}>✅</p>
            <p style={{ fontSize: 13, color: '#9ca3b8', margin: 0 }}>Sab clear! Koi pending follow-up nahi</p>
          </div>
        ) : (
          (Object.keys(grouped) as (keyof typeof grouped)[]).map(priority => {
            const group = grouped[priority]
            if (group.length === 0) return null
            const cfg   = priorityConfig[priority]
            const Icon  = cfg.icon

            return (
              <div key={priority}>
                {/* Group label */}
                <div style={{
                  padding: '8px 16px 4px',
                  fontSize: 10.5, fontWeight: 700,
                  color: cfg.color,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: 'rgba(0,0,0,0.15)',
                }}>
                  {groupLabels[priority]} ({group.length})
                </div>

                {group.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      navigate('/followups?tab=' + (priority === 'critical' ? 'overdue' : priority === 'low' ? 'upcoming' : 'today'))
                      onClose()
                    }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      background: 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = cfg.bg)}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: cfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={cfg.color} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12.5, fontWeight: 600, color: '#fff',
                        margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {notif.leadName}
                      </p>
                      <p style={{ fontSize: 11.5, color: cfg.color, margin: '2px 0 0', fontWeight: 500 }}>
                        {notif.message}
                      </p>
                      {notif.phone && (
                        <p style={{ fontSize: 10.5, color: '#6b7280', margin: '1px 0 0' }}>
                          {notif.phone}
                        </p>
                      )}
                    </div>

                    <ChevronRight size={13} color="#4b5563" style={{ flexShrink: 0, marginTop: 4 }} />
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => { navigate('/followups'); onClose() }}
            style={{
              width: '100%', padding: '8px', background: 'transparent',
              border: '1px solid rgba(76,111,245,0.4)', color: '#77a8ff',
              borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            View All Follow-ups →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const loc = useLocation()
  const nav = useNavigate()

  return (
    <div style={{
      background: '#3C3C3C', width: 282, height: 281,
      padding: '14px 10px', position: 'relative',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      borderBottomRightRadius: '24px',
      boxShadow: '10px 25px 35px rgba(0,0,0,0.35)',
      letterSpacing: '0.5px',
    }}>
      {onClose && (
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none', color: '#9ca3b8',
          fontSize: 17, cursor: 'pointer', lineHeight: 1,
        }}>
          <X size={16} />
        </button>
      )}

      <nav style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '12px 6px', overflow: 'hidden',
        margin: '20px 0 0 0', justifyContent: 'space-around',
      }}>
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to || loc.pathname.startsWith(to)
          return (
            <NavLink
              key={to} to={to} onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '10px 13px', borderRadius: 10,
                fontSize: 16.5, fontWeight: 500, textDecoration: 'none',
                color: '#77a8ff',
                background: active ? '#E8F0FF' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#E8F0FF' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={21} />
              {label}
            </NavLink>
          )
        })}

        <button
          onClick={() => nav('/login', { replace: true })}
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '10px 13px', borderRadius: 10,
            fontSize: 14.5, fontWeight: 500,
            color: '#77a8ff', background: 'transparent', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            transition: 'background 0.10s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#E8F0FF')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <LogOut size={21} />
          Logout
        </button>
      </nav>
    </div>
  )
}

// ─── Google Calendar Hook ──────────────────────────────────────
function useGoogleCalendarStatus() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [checking,  setChecking]  = useState(true)

  const check = async () => {
    try {
      const token = localStorage.getItem('token') ?? ''
      const res   = await fetch(`${API_BASE}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const isConnected = !!(data.googleCalendar?.isConnected || data.googleCalendar?.refreshToken)
      setConnected(isConnected)
      localStorage.setItem('google_connected', String(isConnected))
    } catch {
      const cached = localStorage.getItem('google_connected')
      setConnected(cached === 'true')
    } finally { setChecking(false) }
  }

  useEffect(() => { check() }, [])
  useEffect(() => {
    const onFocus = () => check()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  return { connected, checking, refetch: check }
}

// ─── Navbar ────────────────────────────────────────────────────
function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { connected, checking } = useGoogleCalendarStatus()
  const { notifications }       = useNotifications()
  const admin                   = useAdminProfile()

  const [tooltip,      setTooltip]      = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Critical/high count for badge
  const urgentCount = notifications.filter(
    n => n.priority === 'critical' || n.priority === 'high'
  ).length
  const totalCount  = notifications.length

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleConnect = () => {
    window.location.href = `${API_BASE.replace('/api', '')}/api/google/auth`
  }

  // Admin name — first word only for display
  const adminName    = admin?.name ?? 'Admin'
  const adminInitial = adminName.trim()[0]?.toUpperCase() ?? 'A'

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#565656', padding: '10px 24px', height: 60,
      flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>

      {/* Left — Admin Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="md-hide"
          onClick={onMenuClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3b8', display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>
          Welcome, <span style={{ color: '#A8CCFF' }}>{adminName}</span>
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Google Calendar */}
        {!checking && (
          connected ? (
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setTooltip(true)}
              onMouseLeave={() => setTooltip(false)}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 13px',
                background: 'rgba(22,163,74,0.15)',
                border: '1px solid rgba(22,163,74,0.4)',
                borderRadius: 10, color: '#4ade80',
                fontWeight: 600, fontSize: 12, cursor: 'default',
              }}>
                <CalendarCheck size={14} />
                Connected
              </div>
              {tooltip && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 999,
                  background: '#2a2d3e', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: 12, color: '#9ca3b8', whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <p style={{ margin: 0, color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>Google Calendar Synced</p>
                  <p style={{ margin: 0 }}>Follow-ups auto-synced</p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 13px',
                background: 'rgba(76,111,245,0.15)',
                border: '1px solid rgba(76,111,245,0.4)',
                borderRadius: 10, color: '#77a8ff',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(76,111,245,0.3)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(76,111,245,0.15)')}
            >
              <CalendarPlus size={14} />
              Connect Calendar
            </button>
          )
        )}

        {/* ── Notification Bell ── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              position: 'relative', background: notifOpen ? '#4c6ef5' : '#3b82f6',
              border: 'none', borderRadius: '50%',
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
              transition: 'background 0.15s',
              boxShadow: urgentCount > 0 ? '0 0 0 3px rgba(239,68,68,0.3)' : 'none',
            }}
          >
            <Bell size={16} />

            {/* Badge — total count */}
            {totalCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 18, height: 18,
                background: urgentCount > 0 ? '#ef4444' : '#f97316',
                borderRadius: 9, border: '2px solid #565656',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#fff',
                padding: '0 3px',
              }}>
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        {/* ── Admin Avatar ── */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4c6ef5, #77a8ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14,
          border: '2px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', color: '#fff',
          title: adminName,
        }}>
          {adminInitial}
        </div>
      </div>
    </header>
  )
}

// ─── App Layout ────────────────────────────────────────────────
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#3C3C3C' }}>
      <Navbar onMenuClick={() => setMobileOpen(true)} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <aside className="md-sidebar" style={{ width: 300, display: 'none', alignSelf: 'flex-start', flexShrink: 0, marginBottom: 'auto' }}>
          <SidebarContent />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setMobileOpen(false)}
            />
            <div style={{ position: 'relative', zIndex: 1, animation: 'slideRight 200ms ease both' }}>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Page content */}
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: '24px 24px 24px 0',
          marginLeft: -300, width: 'calc(100% + 300px)', paddingLeft: 324,
        }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes slideRight { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        @media (min-width: 768px) {
          .md-sidebar { display: block !important; }
          .md-hide    { display: none  !important; }
        }
      `}</style>
    </div>
  )
}