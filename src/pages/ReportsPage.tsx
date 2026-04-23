
// import { useState } from 'react'
// import { format } from 'date-fns'
// import { Download, AlertCircle, TrendingUp, Users, CheckCircle, XCircle, Phone, MessageCircle, Import } from 'lucide-react'
// import { useDailyReport, useStats, useFollowups } from '@/hooks/useLeads'

// export default function ReportsPage() {
//   const today = format(new Date(), 'yyyy-MM-dd')
//   const [date, setDate] = useState(today)

//   const { data: report }  = useDailyReport(date)
//   const { data: stats }   = useStats()
//   const { data: todayFU = [] } = useFollowups('today')

//   const newLeads     = report?.newLeads     ?? []
//   const updatedLeads = report?.updatedLeads ?? []
//   const followups    = report?.followups    ?? []

//   // ✅ All leads in report for that day
//   const allReportLeads = [...newLeads, ...updatedLeads]

//   // ✅ Status counts — from backend stats (already PascalCase after api.ts fix)
//   const byStatus = stats?.byStatus ?? {}
//   const totalLeads     = stats?.total ?? 0
//   const newCount       = byStatus['New']        ?? 0
//   const contactedCount = byStatus['Contacted']  ?? 0
//   const interestedCount= byStatus['Interested'] ?? 0
//   const closedCount    = byStatus['Closed']     ?? 0
//   const lostCount      = byStatus['Lost']       ?? 0

//   // Win rate
//   const winRate = totalLeads > 0 ? Math.round((closedCount / totalLeads) * 100) : 0

//   // ✅ Source counts — from backend stats
//   const bySource       = stats?.bySource ?? {}
//   const facebookCount  = bySource['facebook']     ?? 0
//   const whatsappCount  = bySource['whatsapp']     ?? 0  
//   const metaAdsCount   = bySource['Meta Ads']     ?? 0
//   const manualCount    = (bySource['Manual'] ?? 0) + (bySource['admin-manual'] ?? 0)  
//   const importedCount  = bySource['Imported']     ?? 0
  
//   // ✅ Follow-up metrics
//   const todayFollowups   = stats?.todayFollowups   ?? todayFU.length
//   const overdueFollowups = stats?.overdueFollowups ?? 0
//   const activeLeads      = interestedCount  // "negotiations / active leads"

//   // ✅ CSV download
//   const downloadReport = () => {
//     const rows: string[][] = [
//       ['Name', 'Status', 'Source', 'Phone', 'Email', 'Follow-up Date'],
//       ...allReportLeads.map(l => [
//         l.name,
//         l.status,
//         l.source,
//         l.phone ?? '',
//         l.email ?? '',
//         l.followup_date ?? '',
//       ]),
//     ]
//     const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
//     const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
//     const a    = document.createElement('a')
//     a.href     = URL.createObjectURL(blob)
//     a.download = `report-${date}.csv`
//     a.click()
//   }

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

//       {/* HEADER */}
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Daily Report</h1>
//           <p className="page-sub">Track performance and activities · {format(new Date(date), 'MMM d, yyyy')}</p>
//         </div>
//         <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
//           <input
//             type="date"
//             className="input-base"
//             value={date}
//             max={today}
//             onChange={e => setDate(e.target.value)}
//             style={{ height: 36 }}
//           />
//           <button className="btn-primary" onClick={downloadReport} style={{ height: 36 }}>
//             <Download size={14} /> Download CSV
//           </button>
//         </div>
//       </div>

//       {/* ── TOP SUMMARY CARDS ─────────────────────────────────────────── */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
//         <StatCard title="Total Leads"     value={totalLeads}       color="#4c6ef5" icon={<Users size={16} color="#4c6ef5" />}      bg="#eff4ff" />
//         <StatCard title="New Today"       value={newLeads.length}  color="#0284c7" icon={<TrendingUp size={16} color="#0284c7" />}  bg="#f0f9ff" />
//         <StatCard title="Closed Won"      value={closedCount}      color="#16a34a" icon={<CheckCircle size={16} color="#16a34a" />} bg="#f0fdf4" sub={`${winRate}% win rate`} />
//         <StatCard title="Lost"            value={lostCount}        color="#dc2626" icon={<XCircle size={16} color="#dc2626" />}     bg="#fef2f2" />
//         <StatCard title="Today Follow-ups" value={todayFollowups}  color="#d97706" icon={<Phone size={16} color="#d97706" />}      bg="#fffbeb" />
//         <StatCard title="Overdue"         value={overdueFollowups} color="#ef4444" icon={<AlertCircle size={16} color="#ef4444" />} bg="#fef2f2" urgent={overdueFollowups > 0} />
//       </div>

//       {/* ── PIPELINE STATUS ────────────────────────────────────────────── */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

//         <div className="card" style={{ padding: 18 }}>
//           <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
//             Lead Status Breakdown
//           </h3>
//           {[
//             { label: 'New',        value: newCount,        color: '#0284c7', bg: '#f0f9ff' },
//             { label: 'Contacted',  value: contactedCount,  color: '#d97706', bg: '#fffbeb' },
//             //{ label: 'Interested', value: interestedCount, color: '#7c3aed', bg: '#f5f3ff' },
//             { label: 'Closed',     value: closedCount,     color: '#16a34a', bg: '#f0fdf4' },
//             { label: 'Lost',       value: lostCount,       color: '#dc2626', bg: '#fef2f2' },
//           ].map(({ label, value, color, bg }) => (
//             <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               
//                 <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
//               </div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <div style={{
//                   height: 6, width: totalLeads > 0 ? `${Math.max(4, (value / totalLeads) * 100)}px` : '4px',
//                   background: color, borderRadius: 99, minWidth: 4, maxWidth: 80, opacity: 0.4,
//                 }} />
//                 <span style={{ fontSize: 13, fontWeight: 700, color, background: bg, padding: '2px 10px', borderRadius: 99, minWidth: 36, textAlign: 'center' }}>
//                   {value}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ── SOURCE BREAKDOWN ─────────────────────────────────────────── */}
//         <div className="card" style={{ padding: 18 }}>
//           <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
//              Lead Sources
//           </h3>
//           {[
//             { label: ' Facebook',  value: facebookCount,  color: '#4c6ef5' },
//             { label: ' WhatsApp',  value: whatsappCount,  color: '#16a34a' },
//             { label: ' Meta Ads',  value: metaAdsCount,   color: '#3b5bdb' },
//             { label: ' Manual',    value: manualCount,    color: '#475569' },
//             { label: ' Imported',  value: importedCount,  color: '#0f766e' },
//           ].map(({ label, value, color }) => (
//             <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
//               <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
//               <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
//             </div>
//           ))}
//           <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
//             Total: {facebookCount + whatsappCount + metaAdsCount + manualCount + importedCount}
//           </p>
//         </div>
//       </div>

//       {/* ── ACTIVITY / ACTION ITEMS ────────────────────────────────────── */}
//       <div className="card" style={{ padding: 18 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
//           <AlertCircle size={14} color="#ef4444" />
//           <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}> Activity Metrics</h3>
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
//           <MetricRow label="Today's Follow-ups"      value={todayFollowups}    color="#d97706" />
//           <MetricRow label="Overdue Follow-ups"       value={overdueFollowups}  color="#ef4444" urgent />
//           <MetricRow label="Active / Negotiations"    value={activeLeads}       color="#7c3aed" />
//           <MetricRow label="New Leads (selected day)" value={newLeads.length}   color="#0284c7" />
//           <MetricRow label="Win Rate"                 value={`${winRate}%`}     color="#16a34a" />
//         </div>
//       </div>

//       {/* ── TODAY'S FOLLOW-UP LIST ────────────────────────────────────── */}
//       {followups.length > 0 && (
//         <div className="card" style={{ padding: 18 }}>
//           <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
//             Follow-ups for {format(new Date(date), 'MMM d, yyyy')} ({followups.length})
//           </h3>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//             {followups.slice(0, 10).map(l => (
//               <div key={l.id} style={{
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 padding: '8px 12px', background: '#f8fafc', borderRadius: 10,
//                 border: '1px solid #f1f5f9',
//               }}>
//                 <div>
//                   <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.name}</p>
//                   <p style={{ fontSize: 12, color: '#94a3b8' }}>{l.followup_note || 'No note'}</p>
//                 </div>
//                 <span style={{
//                   fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
//                   background: l.status === 'Interested' ? '#f5f3ff' : '#fffbeb',
//                   color: l.status === 'Interested' ? '#7c3aed' : '#d97706',
//                 }}>
//                   {l.status}
//                 </span>
//               </div>
//             ))}
//             {followups.length > 10 && (
//               <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
//                 +{followups.length - 10} more — download CSV to see all
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//     </div>
//   )
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────
// function StatCard({
//   title, value, color, icon, bg, sub, urgent,
// }: {
//   title: string; value: number | string; color: string; icon: React.ReactNode
//   bg: string; sub?: string; urgent?: boolean
// }) {
//   return (
//     <div className="card" style={{
//       padding: 16,
//       borderColor: urgent ? '#fecaca' : '#e8edf3',
//       background:  urgent ? '#fff5f5' : '#fff',
//     }}>
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
//         <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
//         <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           {icon}
//         </div>
//       </div>
//       <p style={{ fontSize: 24, fontWeight: 700, color: urgent ? '#dc2626' : color, lineHeight: 1 }}>{value}</p>
//       {sub && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</p>}
//     </div>
//   )
// }

// function MetricRow({ label, value, color, urgent }: { label: string; value: number | string; color: string; urgent?: boolean }) {
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//       padding: '10px 14px', background: urgent ? '#fff5f5' : '#f8fafc',
//       borderRadius: 10, border: `1px solid ${urgent ? '#fecaca' : '#f1f5f9'}`,
//     }}>
//       <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
//       <span style={{ fontSize: 15, fontWeight: 700, color }}>{value}</span>
//     </div>
//   )
// }

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Download, AlertCircle, TrendingUp, Users, CheckCircle,
  XCircle, Phone, Eye, Target, BarChart2,
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useDailyReport, useStats, useFollowups } from '@/hooks/useLeads'

const STATUS_COLORS: Record<string, string> = {
  New:         '#3b82f6',
  Contacted:   '#f59e0b',
  Negotiation: '#8b5cf6',
  Visitor:     '#06b6d4',
  Closed:      '#10b981',
  Lost:        '#ef4444',
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      {label && <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: 13, fontWeight: 700, color: p.fill || '#0f172a' }}>
          {p.name ?? p.dataKey}: <span style={{ color: '#0f172a' }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(today)

  const { data: report }       = useDailyReport(date)
  const { data: stats }        = useStats()
  const { data: todayFU = [] } = useFollowups('today')

  const newLeads       = report?.newLeads     ?? []
  const updatedLeads   = report?.updatedLeads ?? []
  const followups      = report?.followups    ?? []
  const allReportLeads = [...newLeads, ...updatedLeads]

  const byStatus   = stats?.byStatus ?? {}
  const bySource   = stats?.bySource ?? {}
  const totalLeads = stats?.total    ?? 0

  // ✅ FIX 1: No wrong fallbacks — exact 0 dikhao agar key nahi hai
  const newCount         = byStatus['New']         ?? 0
  const contactedCount   = byStatus['Contacted']   ?? 0
  const closedCount      = byStatus['Closed']      ?? 0
  const lostCount        = byStatus['Lost']        ?? 0
  const negotiationCount = byStatus['Negotiation'] ?? 0  // ❌ was: ?? interestedCount
  const visitorCount     = byStatus['Visitor']     ?? 0  // ❌ was: ?? newCount (causing 81!)

  const winRate          = totalLeads > 0 ? Math.round((closedCount / totalLeads) * 100) : 0
  const todayFollowups   = stats?.todayFollowups   ?? todayFU.length
  const overdueFollowups = stats?.overdueFollowups ?? 0

  // ✅ FIX 2: Source keys — both lowercase and PascalCase try karo
  const facebookCount = bySource['facebook']  ?? bySource['Facebook']  ?? 0
  const whatsappCount = bySource['whatsapp']  ?? bySource['WhatsApp']  ?? 0
  const metaAdsCount  = bySource['Meta Ads']  ?? bySource['meta ads']  ?? bySource['metaads']  ?? 0
  const manualCount   = (bySource['Manual']   ?? bySource['manual']    ?? 0)
                      + (bySource['admin-manual'] ?? 0)
  const importedCount = bySource['Imported']  ?? bySource['imported']  ?? 0

  const statusData = [
    { name: 'New',         value: newCount,         fill: STATUS_COLORS.New },
    { name: 'Contacted',   value: contactedCount,   fill: STATUS_COLORS.Contacted },
    { name: 'Negotiation', value: negotiationCount, fill: STATUS_COLORS.Negotiation },
    { name: 'Visitor',     value: visitorCount,     fill: STATUS_COLORS.Visitor },
    { name: 'Closed',      value: closedCount,      fill: STATUS_COLORS.Closed },
    { name: 'Lost',        value: lostCount,        fill: STATUS_COLORS.Lost },
  ]

  const sourceData = [
    { name: 'Facebook', value: facebookCount, fill: '#4f46e5' },
    { name: 'WhatsApp', value: whatsappCount, fill: '#10b981' },
    { name: 'Meta Ads', value: metaAdsCount,  fill: '#6366f1' },
    { name: 'Manual',   value: manualCount,   fill: '#64748b' },
    { name: 'Imported', value: importedCount, fill: '#0891b2' },
  ].filter(d => d.value > 0)

  const downloadReport = () => {
    const rows: string[][] = [
      ['Name', 'Status', 'Source', 'Phone', 'Email', 'Follow-up Date'],
      ...allReportLeads.map(l => [
        l.name ?? '', l.status ?? '', l.source ?? '',
        l.phone ?? '', l.email ?? '', l.followup_date ?? '',
      ]),
    ]
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `report-${date}.csv`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Report</h1>
          <p className="page-sub">Track performance · {format(new Date(date + 'T00:00:00'), 'MMM d, yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" className="input-base" value={date} max={today}
            onChange={e => setDate(e.target.value)} style={{ height: 36 }} />
          <button className="btn-primary" onClick={downloadReport} style={{ height: 36, gap: 6 }}>
            <Download size={13} />
            {date === today ? 'Download Today' : `Download ${format(new Date(date + 'T00:00:00'), 'MMM d')}`}
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <StatCard title="Total Leads"      value={totalLeads}       color="#4c6ef5" icon={<Users size={15} color="#4c6ef5"/>}       bg="#eff4ff" />
        <StatCard title="New Today"        value={newLeads.length}  color="#0284c7" icon={<TrendingUp size={15} color="#0284c7"/>}   bg="#f0f9ff" />
        <StatCard title="Closed Won"       value={closedCount}      color="#16a34a" icon={<CheckCircle size={15} color="#16a34a"/>}  bg="#f0fdf4" sub={`${winRate}% win rate`} />
        <StatCard title="Lost"             value={lostCount}        color="#dc2626" icon={<XCircle size={15} color="#dc2626"/>}      bg="#fef2f2" />
        <StatCard title="Today Follow-ups" value={todayFollowups}   color="#d97706" icon={<Phone size={15} color="#d97706"/>}        bg="#fffbeb" />
        <StatCard title="Overdue"          value={overdueFollowups} color="#ef4444" icon={<AlertCircle size={15} color="#ef4444"/>}  bg="#fef2f2" urgent={overdueFollowups > 0} />
      </div>

      {/* NEGOTIATION + VISITOR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={20} color="#8b5cf6" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Negotiation</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#8b5cf6', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{negotiationCount}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Leads in active deal stage</p>
          </div>
          {negotiationCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: '#f5f3ff', color: '#7c3aed', borderRadius: 20, padding: '4px 10px', border: '1px solid #ede9fe', whiteSpace: 'nowrap' }}>
              🔥 {negotiationCount} active
            </span>
          )}
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid #06b6d4' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Eye size={20} color="#06b6d4" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visitors</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#0891b2', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{visitorCount}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Leads with visitor status</p>
          </div>
          {visitorCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: '#ecfeff', color: '#0891b2', borderRadius: 20, padding: '4px 10px', border: '1px solid #cffafe', whiteSpace: 'nowrap' }}>
              👁 {visitorCount} new
            </span>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
            <BarChart2 size={14} color="#6366f1" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Lead Status Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={statusData} barSize={34} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                outerRadius={68} innerRadius={36} dataKey="value" paddingAngle={3}>
                {statusData.filter(d => d.value > 0).map((e, i) => (
                  <Cell key={i} fill={e.fill} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 10px', marginTop: 8 }}>
            {statusData.filter(d => d.value > 0).map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {d.name} <strong style={{ color: '#0f172a' }}>{d.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATUS + SOURCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Lead Status Breakdown</h3>
          {[
            { label: 'New',         value: newCount,         color: STATUS_COLORS.New },
            { label: 'Contacted',   value: contactedCount,   color: STATUS_COLORS.Contacted },
            { label: 'Negotiation', value: negotiationCount, color: STATUS_COLORS.Negotiation },
            { label: 'Visitor',     value: visitorCount,     color: STATUS_COLORS.Visitor },
            { label: 'Closed',      value: closedCount,      color: STATUS_COLORS.Closed },
            { label: 'Lost',        value: lostCount,        color: STATUS_COLORS.Lost },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 5, width: totalLeads > 0 ? `${Math.max(6,(value/totalLeads)*80)}px` : '6px', background: color, borderRadius: 99, opacity: 0.35, maxWidth: 80 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}18`, padding: '2px 10px', borderRadius: 99, minWidth: 32, textAlign: 'center' }}>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Lead Sources</h3>
          {[
            { label: 'Facebook', value: facebookCount, color: '#4f46e5' },
            { label: 'WhatsApp', value: whatsappCount, color: '#10b981' },
            { label: 'Meta Ads', value: metaAdsCount,  color: '#6366f1' },
            { label: 'Manual',   value: manualCount,   color: '#64748b' },
            { label: 'Imported', value: importedCount, color: '#0891b2' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 5, width: totalLeads > 0 ? `${Math.max(6,(value/totalLeads)*80)}px` : '6px', background: color, borderRadius: 99, opacity: 0.4, maxWidth: 80 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
            Total: {facebookCount + whatsappCount + metaAdsCount + manualCount + importedCount}
          </p>
        </div>
      </div>

      {/* ACTIVITY METRICS */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <AlertCircle size={14} color="#ef4444" />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Activity Metrics</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {[
            { label: "Today's Follow-ups",    value: todayFollowups,   color: '#d97706' },
            { label: 'Overdue Follow-ups',     value: overdueFollowups, color: '#ef4444', urgent: overdueFollowups > 0 },
            { label: 'In Negotiation',         value: negotiationCount, color: '#8b5cf6' },
            { label: 'Visitors',               value: visitorCount,     color: '#06b6d4' },
            { label: 'Win Rate',               value: `${winRate}%`,   color: '#16a34a' },
            { label: 'New (selected day)',      value: newLeads.length, color: '#0284c7' },
          ].map(m => (
            <div key={m.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10,
              background: m.urgent ? '#fff5f5' : '#f8fafc',
              border: `1px solid ${m.urgent ? '#fecaca' : '#f1f5f9'}`,
            }}>
              <span style={{ fontSize: 12, color: '#475569' }}>{m.label}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOLLOW-UP LIST */}
      {followups.length > 0 && (
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            Follow-ups · {format(new Date(date + 'T00:00:00'), 'MMM d, yyyy')}
            <span style={{ marginLeft: 8, background: '#f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 8px' }}>
              {followups.length}
            </span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {followups.slice(0, 10).map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.name}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{l.followup_note || 'No note'}</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: STATUS_COLORS[l.status] ? `${STATUS_COLORS[l.status]}18` : '#fffbeb',
                  color: STATUS_COLORS[l.status] ?? '#d97706',
                }}>
                  {l.status}
                </span>
              </div>
            ))}
            {followups.length > 10 && (
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                +{followups.length - 10} more — download CSV to see all
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

function StatCard({ title, value, color, icon, bg, sub, urgent }: {
  title: string; value: number | string; color: string
  icon: React.ReactNode; bg: string; sub?: string; urgent?: boolean
}) {
  return (
    <div className="card" style={{ padding: 16, borderColor: urgent ? '#fecaca' : undefined, background: urgent ? '#fff5f5' : '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: urgent ? '#dc2626' : color, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}