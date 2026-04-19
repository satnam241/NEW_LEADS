// import { useState } from 'react'
// import { format } from 'date-fns'
// import { Download, AlertCircle } from 'lucide-react'
// import { useDailyReport, useStats } from '@/hooks/useLeads'

// export default function ReportsPage() {
//   const today = format(new Date(), 'yyyy-MM-dd')
//   const [date, setDate] = useState(today)

//   const { data: report } = useDailyReport(date)
//   const { data: stats } = useStats()

//   const newLeads = report?.newLeads ?? []
//   const updatedLeads = report?.updatedLeads ?? []
//   const followups = report?.followups ?? []

//   const getCount = (status: string) =>
//     [...newLeads, ...updatedLeads].filter(l => l.status === status).length

//   const getSourceCount = (src: string) =>
//     [...newLeads, ...updatedLeads].filter(l => l.source === src).length

//   // ✅ CLEAN DOWNLOAD (CSV — FAST + RELIABLE)
//   const downloadReport = () => {
//     const rows = [
//       ['Name', 'Status', 'Source', 'Phone'],
//       ...[...newLeads, ...updatedLeads].map(l => [
//         l.name, l.status, l.source, l.phone
//       ])
//     ]

//     const csv = rows.map(r => r.join(',')).join('\n')

//     const blob = new Blob([csv], { type: 'text/csv' })
//     const a = document.createElement('a')
//     a.href = URL.createObjectURL(blob)
//     a.download = `report-${date}.csv`
//     a.click()
//   }

//   return (
//     <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

//       {/* HEADER */}
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Daily Report</h1>
//           <p className="page-sub">Track performance and activities</p>
//         </div>

//         <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
//           <input
//             type="date"
//             className="input-base"
//             value={date}
//             max={today}
//             onChange={e => setDate(e.target.value)}
//           />

//           <button className="btn-primary" onClick={downloadReport}>
//             <Download size={14} /> Download Report
//           </button>
//         </div>
//       </div>

//       {/* STATS */}
//       <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
//         <StatCard title="New Today" value={newLeads.length} />
//         <StatCard title="Total Leads" value={stats?.total ?? 0} />
//         <StatCard title="Overdue Follow-ups" value={followups.length} />
//         <StatCard title="Closed Deals" value={getCount('Closed')} />
//       </div>

//       {/* PIPELINE */}
//       <div className="card" style={{ padding:18 }}>
//         <h3 style={{ fontSize:14, fontWeight:600, marginBottom:10 }}>Pipeline Status</h3>

//         {['New','Contacted','Interested','Closed','Lost'].map(s => (
//           <div key={s} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
//             <span style={{ color:'#94a3b8' }}>{s}</span>
//             <span style={{ fontWeight:600, color: s === 'Lost' ? '#ef4444' : '#38bdf8' }}>
//               {getCount(s)}
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* SOURCES */}
//       <div className="card" style={{ padding:18 }}>
//         <h3 style={{ fontSize:14, fontWeight:600, marginBottom:10 }}>Lead Sources</h3>

//         {['Meta Ads','Manual','Imported'].map(s => (
//           <div key={s} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
//             <span style={{ color:'#94a3b8' }}>{s}</span>
//             <span style={{ fontWeight:600 }}>{getSourceCount(s)}</span>
//           </div>
//         ))}
//       </div>

//       {/* ACTION ITEMS */}
//       <div className="card" style={{ padding:18 }}>
//         <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
//           <AlertCircle size={14} color="#ef4444" />
//           <h3 style={{ fontSize:14, fontWeight:600 }}>Action Items</h3>
//         </div>

//         <div style={{ fontSize:13, color:'#94a3b8' }}>
//           <p>• {followups.length} leads need follow-up today</p>
//           <p>• {getCount('Interested')} leads in negotiation stage</p>
//         </div>
//       </div>

//     </div>
//   )
// }

// // ✅ MATCHING YOUR EXISTING CARD STYLE
// function StatCard({ title, value }: { title: string; value: number }) {
//   return (
//     <div className="card" style={{ padding:16 }}>
//       <p style={{ fontSize:22, fontWeight:700 }}>{value}</p>
//       <p style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{title}</p>
//     </div>
//   )
// }

// src/pages/ReportsPage.tsx
// ✅ FIXED: All counts from backend stats (PascalCase keys), all sources, accurate metrics

import { useState } from 'react'
import { format } from 'date-fns'
import { Download, AlertCircle, TrendingUp, Users, CheckCircle, XCircle, Phone, MessageCircle, Import } from 'lucide-react'
import { useDailyReport, useStats, useFollowups } from '@/hooks/useLeads'

export default function ReportsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(today)

  const { data: report }  = useDailyReport(date)
  const { data: stats }   = useStats()
  const { data: todayFU = [] } = useFollowups('today')

  const newLeads     = report?.newLeads     ?? []
  const updatedLeads = report?.updatedLeads ?? []
  const followups    = report?.followups    ?? []

  // ✅ All leads in report for that day
  const allReportLeads = [...newLeads, ...updatedLeads]

  // ✅ Status counts — from backend stats (already PascalCase after api.ts fix)
  const byStatus = stats?.byStatus ?? {}
  const totalLeads     = stats?.total ?? 0
  const newCount       = byStatus['New']        ?? 0
  const contactedCount = byStatus['Contacted']  ?? 0
  const interestedCount= byStatus['Interested'] ?? 0
  const closedCount    = byStatus['Closed']     ?? 0
  const lostCount      = byStatus['Lost']       ?? 0

  // Win rate
  const winRate = totalLeads > 0 ? Math.round((closedCount / totalLeads) * 100) : 0

  // ✅ Source counts — from backend stats
  const bySource       = stats?.bySource ?? {}
  const facebookCount  = bySource['facebook']  ?? bySource['Facebook']  ?? 0
  const whatsappCount  = bySource['whatsapp']  ?? bySource['WhatsApp']  ?? 0
  const metaAdsCount   = bySource['Meta Ads']  ?? bySource['meta ads']  ?? 0
  const manualCount    = bySource['Manual']    ?? bySource['manual']    ?? 0
  const importedCount  = bySource['Imported']  ?? bySource['imported']  ?? 0

  // ✅ Follow-up metrics
  const todayFollowups   = stats?.todayFollowups   ?? todayFU.length
  const overdueFollowups = stats?.overdueFollowups ?? 0
  const activeLeads      = interestedCount  // "negotiations / active leads"

  // ✅ CSV download
  const downloadReport = () => {
    const rows: string[][] = [
      ['Name', 'Status', 'Source', 'Phone', 'Email', 'Follow-up Date'],
      ...allReportLeads.map(l => [
        l.name,
        l.status,
        l.source,
        l.phone ?? '',
        l.email ?? '',
        l.followup_date ?? '',
      ]),
    ]
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `report-${date}.csv`
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Report</h1>
          <p className="page-sub">Track performance and activities · {format(new Date(date), 'MMM d, yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="input-base"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            style={{ height: 36 }}
          />
          <button className="btn-primary" onClick={downloadReport} style={{ height: 36 }}>
            <Download size={14} /> Download CSV
          </button>
        </div>
      </div>

      {/* ── TOP SUMMARY CARDS ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        <StatCard title="Total Leads"     value={totalLeads}       color="#4c6ef5" icon={<Users size={16} color="#4c6ef5" />}      bg="#eff4ff" />
        <StatCard title="New Today"       value={newLeads.length}  color="#0284c7" icon={<TrendingUp size={16} color="#0284c7" />}  bg="#f0f9ff" />
        <StatCard title="Closed Won"      value={closedCount}      color="#16a34a" icon={<CheckCircle size={16} color="#16a34a" />} bg="#f0fdf4" sub={`${winRate}% win rate`} />
        <StatCard title="Lost"            value={lostCount}        color="#dc2626" icon={<XCircle size={16} color="#dc2626" />}     bg="#fef2f2" />
        <StatCard title="Today Follow-ups" value={todayFollowups}  color="#d97706" icon={<Phone size={16} color="#d97706" />}      bg="#fffbeb" />
        <StatCard title="Overdue"         value={overdueFollowups} color="#ef4444" icon={<AlertCircle size={16} color="#ef4444" />} bg="#fef2f2" urgent={overdueFollowups > 0} />
      </div>

      {/* ── PIPELINE STATUS ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
            📊 Lead Status Breakdown
          </h3>
          {[
            { label: 'New',        value: newCount,        color: '#0284c7', bg: '#f0f9ff' },
            { label: 'Contacted',  value: contactedCount,  color: '#d97706', bg: '#fffbeb' },
            { label: 'Interested', value: interestedCount, color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Closed',     value: closedCount,     color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Lost',       value: lostCount,       color: '#dc2626', bg: '#fef2f2' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  height: 6, width: totalLeads > 0 ? `${Math.max(4, (value / totalLeads) * 100)}px` : '4px',
                  background: color, borderRadius: 99, minWidth: 4, maxWidth: 80, opacity: 0.4,
                }} />
                <span style={{ fontSize: 13, fontWeight: 700, color, background: bg, padding: '2px 10px', borderRadius: 99, minWidth: 36, textAlign: 'center' }}>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── SOURCE BREAKDOWN ─────────────────────────────────────────── */}
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
            📣 Lead Sources
          </h3>
          {[
            { label: '📘 Facebook',  value: facebookCount,  color: '#4c6ef5' },
            { label: '💬 WhatsApp',  value: whatsappCount,  color: '#16a34a' },
            { label: '🎯 Meta Ads',  value: metaAdsCount,   color: '#3b5bdb' },
            { label: '✍️ Manual',    value: manualCount,    color: '#475569' },
            { label: '📥 Imported',  value: importedCount,  color: '#0f766e' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
            Total: {facebookCount + whatsappCount + metaAdsCount + manualCount + importedCount}
          </p>
        </div>
      </div>

      {/* ── ACTIVITY / ACTION ITEMS ────────────────────────────────────── */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <AlertCircle size={14} color="#ef4444" />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>⚡ Activity Metrics</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          <MetricRow label="Today's Follow-ups"      value={todayFollowups}    color="#d97706" />
          <MetricRow label="Overdue Follow-ups"       value={overdueFollowups}  color="#ef4444" urgent />
          <MetricRow label="Active / Negotiations"    value={activeLeads}       color="#7c3aed" />
          <MetricRow label="New Leads (selected day)" value={newLeads.length}   color="#0284c7" />
          <MetricRow label="Win Rate"                 value={`${winRate}%`}     color="#16a34a" />
        </div>
      </div>

      {/* ── TODAY'S FOLLOW-UP LIST ────────────────────────────────────── */}
      {followups.length > 0 && (
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            📅 Follow-ups for {format(new Date(date), 'MMM d, yyyy')} ({followups.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {followups.slice(0, 10).map(l => (
              <div key={l.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#f8fafc', borderRadius: 10,
                border: '1px solid #f1f5f9',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.name}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{l.followup_note || 'No note'}</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: l.status === 'Interested' ? '#f5f3ff' : '#fffbeb',
                  color: l.status === 'Interested' ? '#7c3aed' : '#d97706',
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  title, value, color, icon, bg, sub, urgent,
}: {
  title: string; value: number | string; color: string; icon: React.ReactNode
  bg: string; sub?: string; urgent?: boolean
}) {
  return (
    <div className="card" style={{
      padding: 16,
      borderColor: urgent ? '#fecaca' : '#e8edf3',
      background:  urgent ? '#fff5f5' : '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color: urgent ? '#dc2626' : color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function MetricRow({ label, value, color, urgent }: { label: string; value: number | string; color: string; urgent?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', background: urgent ? '#fff5f5' : '#f8fafc',
      borderRadius: 10, border: `1px solid ${urgent ? '#fecaca' : '#f1f5f9'}`,
    }}>
      <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}