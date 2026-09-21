import React from 'react'
import { Users, TrendingUp, CheckCircle, Bell, AlertCircle } from 'lucide-react'
import { useStats } from '@/hooks/useLeads'
import { useNavigate } from 'react-router-dom'

interface CardProps {
  label: string
  value: number | string
  sub: string
  icon: React.ReactNode
  accent: string
  bg: string
  onClick?: () => void
  urgent?: boolean
}

function Card({ label, value, sub, icon, accent, bg, onClick, urgent }: CardProps) {
  return (
    <div
      className={`stat-card ${accent}`}
      onClick={onClick}
      style={{
        padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        background: urgent ? 'rgba(239, 68, 68, 0.1)' : '#3C3C3C',
        borderColor: urgent ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 110,
      }}
      onMouseEnter={e => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.borderColor = urgent
            ? 'rgba(239, 68, 68, 0.6)'
            : 'rgba(255, 255, 255, 0.22)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.borderColor = urgent
            ? 'rgba(239, 68, 68, 0.35)'
            : 'rgba(255, 255, 255, 0.08)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          {label}
        </p>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div>
        <p style={{
          fontSize: 24,
          fontWeight: 800,
          color: urgent ? '#f87171' : '#ffffff',
          lineHeight: 1.1,
          margin: '0 0 4px 0',
          letterSpacing: '-0.02em',
        }}>
          {value}
        </p>
        <p style={{ fontSize: 11.5, color: urgent ? '#fca5a5' : '#94a3b8', margin: 0 }}>
          {sub}
        </p>
      </div>
    </div>
  )
}

export default function StatCards() {
  const { data: s, isLoading } = useStats()
  const nav = useNavigate()

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card" style={{ padding: 18, background: '#3C3C3C', borderRadius: 16 }}>
            <div className="skeleton" style={{ height: 11, width: 80, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 26, width: 50, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 11, width: 100 }} />
          </div>
        ))}
      </div>
    )
  }

  const st = s ?? { total: 0, byStatus: {}, bySource: {}, thisMonth: 0, todayFollowups: 0, overdueFollowups: 0 }
  const newCount       = st.byStatus['New']       ?? st.byStatus['new']       ?? 0
  const contactedCount = st.byStatus['Contacted'] ?? st.byStatus['contacted'] ?? 0
  const closedCount    = st.byStatus['Closed']    ?? st.byStatus['closed']    ?? st.byStatus['converted'] ?? 0
  const winRate        = st.total > 0 ? Math.round((closedCount / st.total) * 100) : 0

  const cards: CardProps[] = [
    {
      label: 'Total Leads',
      value: st.total,
      sub:   `+${st.thisMonth} this month`,
      icon:  <Users size={15} color="#77a8ff" />,
      accent: 'ac-blue',
      bg: 'rgba(76, 110, 245, 0.16)',
      onClick: () => nav('/leads'),
    },
    {
      label: 'New',
      value: newCount,
      sub:   'Awaiting contact',
      icon:  <TrendingUp size={15} color="#38bdf8" />,
      accent: 'ac-sky',
      bg: 'rgba(56, 189, 248, 0.16)',
      onClick: () => nav('/leads?status=New'),
    },
    {
      label: 'Contacted',
      value: contactedCount,
      sub:   'In conversation',
      icon:  <TrendingUp size={15} color="#c084fc" />,
      accent: 'ac-violet',
      bg: 'rgba(167, 139, 250, 0.16)',
      onClick: () => nav('/leads?status=Contacted'),
    },
    {
      label: 'Closed Won',
      value: closedCount,
      sub:   `${winRate}% win rate`,
      icon:  <CheckCircle size={15} color="#4ade80" />,
      accent: 'ac-green',
      bg: 'rgba(34, 197, 94, 0.16)',
      onClick: () => nav('/leads?status=Closed'),
    },
    {
      label: "Today's Follow-ups",
      value: st.todayFollowups,
      sub:   'Due today',
      icon:  <Bell size={15} color="#fbbf24" />,
      accent: 'ac-amber',
      bg: 'rgba(245, 158, 11, 0.16)',
      onClick: () => nav('/followups'),
    },
    {
      label: 'Overdue',
      value: st.overdueFollowups,
      sub:   st.overdueFollowups > 0 ? 'Need immediate action' : 'All clear',
      icon:  <AlertCircle size={15} color="#f87171" />,
      accent: 'ac-red',
      bg: 'rgba(239, 68, 68, 0.16)',
      onClick: () => nav('/followups?tab=overdue'),
      urgent: st.overdueFollowups > 0,
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
      {cards.map(c => <Card key={c.label} {...c} />)}
    </div>
  )
}