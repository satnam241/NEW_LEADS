
import { Users, TrendingUp, CheckCircle, Bell, AlertCircle } from 'lucide-react'
import { useStats } from '@/hooks/useLeads'
import { useNavigate } from 'react-router-dom'

interface CardProps {
  label: string; value: number | string; sub: string
  icon: React.ReactNode; accent: string; bg: string
  onClick?: () => void; urgent?: boolean
}

function Card({ label, value, sub, icon, accent, bg, onClick, urgent }: CardProps) {
  return (
    <div
      className={`card stat-card ${accent}`}
      onClick={onClick}
      style={{
        padding: '18px 18px 18px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 120ms ease',
        borderColor: urgent ? '#fecaca' : '#e8edf3',
        background:  urgent ? '#fff5f5' : '#fff',
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.borderColor = urgent ? '#fecaca' : '#e8edf3')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, color: urgent ? '#dc2626' : '#0f172a', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: 11.5, color: '#94a3b8' }}>{sub}</p>
    </div>
  )
}

export default function StatCards() {
  const { data: s, isLoading } = useStats()
  const nav = useNavigate()

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div className="skeleton" style={{ height: 11, width: 80, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: 50, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: 100 }} />
          </div>
        ))}
      </div>
    )
  }

  // ✅ All status keys are PascalCase after api.ts normalization
  const st = s ?? { total: 0, byStatus: {}, bySource: {}, thisMonth: 0, todayFollowups: 0, overdueFollowups: 0 }
// StatCards.tsx mein — safe access
const newCount       = st.byStatus['New']       ?? st.byStatus['new']       ?? 0
const contactedCount = st.byStatus['Contacted'] ?? st.byStatus['contacted'] ?? 0
const closedCount    = st.byStatus['Closed']    ?? st.byStatus['closed']    ?? st.byStatus['converted'] ?? 0
  const winRate         = st.total > 0 ? Math.round((closedCount / st.total) * 100) : 0

  const cards: CardProps[] = [
    {
      label: 'Total Leads',
      value: st.total,
      sub:   `+${st.thisMonth} this month`,
      icon:  <Users size={14} color="#4c6ef5" />,
      accent: 'ac-blue', bg: '#eff4ff',
    },
    {
      label: 'New',
      value: newCount,
      sub:   'Awaiting contact',
      icon:  <TrendingUp size={14} color="#0284c7" />,
      accent: 'ac-sky', bg: '#f0f9ff',
      onClick: () => nav('/leads?status=New'),
    },
    {
      label: 'Contacted',
      value: contactedCount,
      sub:   'In conversation',
      icon:  <TrendingUp size={14} color="#7c3aed" />,
      accent: 'ac-violet', bg: '#f5f3ff',
      onClick: () => nav('/leads?status=Contacted'),
    },
    {
      label: 'Closed Won',
      value: closedCount,
      sub:   `${winRate}% win rate`,
      icon:  <CheckCircle size={14} color="#16a34a" />,
      accent: 'ac-green', bg: '#f0fdf4',
      onClick: () => nav('/leads?status=Closed'),
    },
    {
      label: "Today's Follow-ups",
      value: st.todayFollowups,
      sub:   'Due today',
      icon:  <Bell size={14} color="#d97706" />,
      accent: 'ac-amber', bg: '#fffbeb',
      onClick: () => nav('/followups'),
    },
    {
      label: 'Overdue',
      value: st.overdueFollowups,
      sub:   'Need immediate attention',
      icon:  <AlertCircle size={14} color="#dc2626" />,
      accent: 'ac-red', bg: '#fef2f2',
      onClick: () => nav('/followups?tab=overdue'),
      urgent: st.overdueFollowups > 0,
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 14 }}>
      {cards.map(c => <Card key={c.label} {...c} />)}
    </div>
  )
}