import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import {  useStats, useMonthlyReport, useLeads, useFollowups, useRealtime } from '@/hooks/useLeads'
import { useNavigate } from 'react-router-dom'
import type { Lead } from '@/types'

const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ✅ Optional — map known Facebook formIds → readable property/campaign names.
// Add entries like '24791584367188487': 'VIP Enclave Property' as you identify them.
const FORM_NAME_MAP: Record<string, string> = {
  // '24791584367188487': 'VIP Enclave Property',
}

// ─────────────────────────────────────────────────────────────────
// Responsive helper — breakpoints for mobile / tablet / desktop(mac)
// (mobile <640px, tablet 640–1023px, desktop/mac ≥1024px)
// ✅ Same approach as the existing month-dropdown / bar-chart logic —
//    plain useState + resize listener, no extra deps.
// ─────────────────────────────────────────────────────────────────
function useViewport() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return {
    width,
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
  }
}

// ─────────────────────────────────────────────────────────────────
// Ring Chart  (unchanged — center fix already applied)
// ✅ size/strokeWidth are optional now so the dashboard can shrink the
//    rings a bit on mobile. Defaults (115 / 14) match the original
//    exactly, so desktop/tablet rendering is byte-for-byte the same.
// ─────────────────────────────────────────────────────────────────
interface RingProps {
  value: number; max: number; color: string
  label: string; sublabel?: string; note?: string
  size?: number; strokeWidth?: number
}
function Ring({ value, max, color, label, sublabel, note, size = 115, strokeWidth = 14 }: RingProps) {
  const stroke = strokeWidth
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const pct    = max > 0 ? Math.min(value / max, 1) : 0
  const dash   = pct * circ
  const valueFontSize = Math.round(size * 0.243)   // ✅ keeps the same proportions as the original 28px @ 115px

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7 }}>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)', display:'block' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ececec" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="butt"/>
        </svg>
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%, -46%)',
          fontSize:valueFontSize, fontWeight:700, color:'#fff', lineHeight:1, whiteSpace:'nowrap',
        }}>
          {value}
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:12, color, fontWeight:600, margin:0 }}>{label}</p>
        {sublabel && <p style={{ fontSize:10.5, color:'#9ca3b8', margin:'2px 0 0' }}>{sublabel}</p>}
        {note    && <p style={{ fontSize:10,   color:'#A8CCFF',  margin:'1px 0 0' }}>{note}</p>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Bar Chart — full month days, horizontal scroll, today highlighted
// (unchanged — already handles small screens via its own horizontal scroll)
// ─────────────────────────────────────────────────────────────────
interface BarItem { day: number; count: number }

function MiniBarChart({ data, highlightDay }: { data: BarItem[]; highlightDay: number | null }) {
  // ✅ Same size/structure as your original chart — chartH=118, paddingLeft=26
  const chartH   = 118
  const maxCount = Math.max(...data.map(d => d.count), 1)

  const yLabels = [
    maxCount,
    Math.round(maxCount * 0.75),
    Math.round(maxCount * 0.5),
    Math.round(maxCount * 0.25),
    0,
  ]

  const barBoxW   = 21   // 16px bar + 5px gap — fixed so scroll kicks in for 28-31 days
  const scrollRef = useRef<HTMLDivElement>(null)

  // ✅ Current-day priority — auto-scroll so today's bar is in view
  useEffect(() => {
    if (highlightDay == null || !scrollRef.current) return
    const target = scrollRef.current.querySelector<HTMLElement>(`[data-day="${highlightDay}"]`)
    target?.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' })
  }, [highlightDay, data.length])

  return (
    <div style={{ position:'relative', height:chartH + 18, paddingLeft:26 }}>

      {/* Y-axis labels + grid lines — fixed, don't scroll (same as original) */}
      {yLabels.map((v, i) => (
        <div key={i} style={{ position:'absolute', left:0, right:0, top:`${((maxCount - v) / maxCount) * chartH}px`, display:'flex', alignItems:'center', gap:4, pointerEvents:'none' }}>
          <span style={{ fontSize:9, color:'#4b5563', width:22, textAlign:'right', flexShrink:0 }}>{v}</span>
          <div style={{ flex:1, borderTop:'1px solid rgba(255,255,255,0.05)' }}/>
        </div>
      ))}

      {/* ✅ Scrollable bars — left/right slide, sticks grow upward */}
      <div
        ref={scrollRef}
        style={{ position:'absolute', left:26, right:0, top:0, bottom:0, overflowX:'auto', overflowY:'hidden', WebkitOverflowScrolling:'touch' }}
      >
        <div style={{ display:'flex', gap:5, alignItems:'flex-end', height:chartH, paddingTop:8, width: data.length * barBoxW, minWidth:'100%' }}>
          {data.map(({ day, count }) => {
            const isToday = day === highlightDay
            const isHigh  = count > maxCount * 0.55
            return (
              <div
                key={day} data-day={day}
                title={`Day ${day}: ${count} leads`}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, width:16, flexShrink:0, height:'100%', justifyContent:'flex-end' }}
              >
                <div style={{
                  width:'100%', maxWidth:16,
                  height:`${(count / maxCount) * (chartH - 10)}px`,   // ✅ value badhne pe stick upar jaati hai
                  background: isToday ? '#4c6ef5' : isHigh ? '#A8CCFF' : '#ececec',
                  boxShadow:  isToday ? '0 0 0 1.5px #4c6ef5' : 'none',
                  borderRadius:'3px 3px 0 0', minHeight:3,
                  transition:'height 0.3s ease',
                }}/>
                <span style={{ fontSize:8.5, color: isToday ? '#A8CCFF' : '#4b5563', fontWeight: isToday ? 700 : 400, marginTop:6 }}>
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Dashboard Home
// ─────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  useRealtime()   // ✅ keeps leads/stats/followups fresh every 30s — "abhi ayi" leads show up live

  // ✅ Responsive flags — drives layout-only tweaks below (grid stacking,
  //    padding, ring size, table scroll). No data/logic depends on this.
  const { isMobile, isTablet, isDesktop } = useViewport()

  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const now      = new Date()

  // ✅ Month selector — drives both rings AND bar chart
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1)   // 1-12
  const [selYear]               = useState(now.getFullYear())
  const isCurrentMonth = selMonth === now.getMonth() + 1 && selYear === now.getFullYear()

  // ✅ useStats(month, year) — requires fetchStats/useStats patch (see useStats-patch.ts)
  const { data: s } = useMonthlyReport(selMonth, selYear)
  const st = s ?? {
    total:0, byStatus:{}, thisMonth:0,
    todayFollowups:0, overdueFollowups:0,
    growthPercentage:0, dailyGrowth:[],
  }

  const presentCount  = st.total
  const verifiedCount = st.byStatus['Contacted'] ?? st.byStatus['contacted'] ?? 0
  // const dismissCount  =
  //   (st.byStatus['Lost']      ?? 0) +
  //   (st.byStatus['lost']      ?? 0) +
  //   (st.byStatus['Dismissed'] ?? 0)
  const closedCount = (st.byStatus['Closed'] ?? 0) + (st.byStatus['closed'] ?? 0)
const lostCount    = (st.byStatus['Lost']   ?? 0) + (st.byStatus['lost']   ?? 0)

  const ringMax = Math.max(presentCount, 30)

  const growthNote =
    st.growthPercentage > 0 ? `↑ ${Math.abs(st.growthPercentage).toFixed(1)}% vs last month` :
    st.growthPercentage < 0 ? `↓ ${Math.abs(st.growthPercentage).toFixed(1)}% vs last month` :
    'Same as last month'

  // ✅ Full month days — Feb=28/29, Apr=30, etc. (works for all months incl. Dec)
  const daysInSelectedMonth = new Date(selYear, selMonth, 0).getDate()

  const barData: BarItem[] = useMemo(() => {
    const map = new Map<number, number>(
      (st.dailyGrowth ?? []).map(({ day, count }: BarItem) => [day, count])
    )
    return Array.from({ length: daysInSelectedMonth }, (_, i) => ({
      day:   i + 1,
      count: map.get(i + 1) ?? 0,
    }))
  }, [st.dailyGrowth, daysInSelectedMonth])

  const highlightDay = isCurrentMonth ? now.getDate() : null

  // ✅ Recent Leads — latest leads overall (no date filter), most-recent-first from backend
  const { data: recentData, isLoading: loadingLeads } = useLeads(
    { search, status:'', source:'', dateFrom:'', dateTo:'' }, 1
  )
  const recentLeads: Lead[] = recentData?.data ?? []

  // ✅ Follow-up counts — reuse existing tab-based hook (always "live", independent of month selector)
  const { data: overdueLeads  = [] } = useFollowups('overdue')
  const { data: dueTodayLeads = [] } = useFollowups('today')
  const { data: upcomingLeads = [] } = useFollowups('upcoming')

  const dateStr = `${now.getDate()}/${now.getMonth()+1}/${String(now.getFullYear()).slice(2)}`
  const cardStyle: React.CSSProperties = { background:'#565656', borderRadius:14 }

  // ✅ Ring size shrinks a touch on mobile only — tablet/desktop keep the
  //    original 115/14 so nothing changes above the mobile breakpoint.
  const ringSize   = isMobile ? 80 : 115
  const ringStroke = isMobile ? 10 : 14

  // ── Helpers ───────────────────────────────────────────────────
  const trunc = (s?: string | null, n = 20) =>
    s && s.length > n ? s.slice(0, n) + '…' : (s ?? '—')

  const fmtBudget = (v?: string | null) => {
    if (!v) return '—'
    const map: Record<string, string> = {
      '0-35_lakhs_':     '₹0-35L',
      '35-50_lakhs':     '₹35-50L',
      '50-75_lakhs':     '₹50-75L',
      '75_lakhs_above':  '₹75L+',
      '75_lakhs_above_': '₹75L+',
    }
    return map[v] ?? v.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const fmtTimeline = (v?: string | null) => {
    if (!v) return '—'
    const map: Record<string, string> = {
      'less_than_1_month': '< 1 Month',
      '1-3_months':        '1-3 Months',
      '3_months_or_more':  '3+ Months',
      '3_months_or_more_': '3+ Months',
    }
    return map[v] ?? v.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // ✅ "1m ago / 1h ago / 1d ago" — exactly as requested
  const timeAgo = (iso?: string | null) => {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)    return 'Just now'
    if (m < 60)   return `${m}m ago`
    if (m < 1440) return `${Math.floor(m/60)}h ago`
    return `${Math.floor(m/1440)}d ago`
  }

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      gap: isMobile ? 12 : isTablet ? 14 : 16,
      margin: isMobile ? '16px 0 0 0' : isTablet ? '20px 0 0 0' : '25px 0 0 0',
    }}>

      {/* ── ROW 1: Analytics + Bar Chart ── */}
      {/* ✅ Side-by-side stays desktop/mac only (≥1024px). Tablet & mobile
          stack into a single column so the 3 rings + chart never get cramped. */}
      <div style={{
        display:'grid',
        gridTemplateColumns: isDesktop ? '1.25fr 1fr' : '1fr',
        gap:10, background:'#565656', borderRadius:'8px',
        padding: isMobile ? '14px 0' : '20px 0',
      }}>

        {/* Analytics */}
        <div style={{ ...cardStyle, padding: isMobile ? '16px 14px' : isTablet ? '18px 20px' : '20px 26px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:8 }}>
            <h2 style={{ fontSize:19, fontWeight:700, color:'#fff', margin:0 }}>Analytics</h2>
            <span style={{ fontSize:12.5, color:'#9ca3b8' }}>
              Date: <strong style={{ color:'#fff' }}>{dateStr}</strong>
            </span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-around', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <Ring value={presentCount}  max={ringMax} color="#A8CCFF" size={ringSize} strokeWidth={ringStroke}
              label={`Present | ${MONTH_SHORT[selMonth-1]}`}
              sublabel={`${st.total} leads in ${MONTH_SHORT[selMonth-1]}`}
              note={growthNote}
            />
            <Ring value={verifiedCount} max={ringMax} color="#A8CCFF" size={ringSize} strokeWidth={ringStroke}
              label={`Verified | ${MONTH_SHORT[selMonth-1]}`}
              sublabel="In conversation"
            />
           <Ring value={closedCount} max={ringMax} color="#A8CCFF" size={ringSize} strokeWidth={ringStroke}
    label={`Closed | ${MONTH_SHORT[selMonth-1]}`}
    sublabel="Deal won"
  />
  {/* ✅ Lost — alag ring, red color */}
  <Ring value={lostCount} max={ringMax} color="#A8CCFF" size={ringSize} strokeWidth={ringStroke}
    label={`Lost | ${MONTH_SHORT[selMonth-1]}`}
    sublabel="Deal lost"
  />
          </div>
        </div>

        {/* Bar Chart — with working month dropdown */}
        <div style={{
          ...cardStyle, padding: isMobile ? '14px 14px' : '18px 20px',
          background:'#3C3C3C', margin: isDesktop ? '0 10px 0 0' : 0,
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8 }}>
            <h3 style={{ fontSize:10.5, fontWeight:700, color:'#9ca3b8', letterSpacing:'0.06em', textTransform:'uppercase', margin:0 }}>
              {MONTH_FULL[selMonth-1]} Working Progress
            </h3>

            {/* ✅ Functional month dropdown — same visual style as old "Month ▾" */}

           <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
  <select
    value={selMonth}
    onChange={e => setSelMonth(Number(e.target.value))}
    style={{
      appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
      background:'rgba(255,255,255,0.08)',
      border:'1px solid rgba(255,255,255,0.14)',
      borderRadius:10,
      outline:'none',
      color:'#fff',
      fontSize:13,
      fontWeight:500,
      fontFamily:'inherit',
      cursor:'pointer',
      padding:'7px 32px 7px 12px',
    }}
  >
    {MONTH_SHORT.map((m, i) => (
      <option key={m} value={i+1} style={{ background:'#2a2a2a', color:'#fff' }}>
        {m}
      </option>
    ))}
  </select>
  <ChevronDown size={13} style={{ position:'absolute', right:10, color:'#9ca3b8', pointerEvents:'none' }}/>
</div>
          </div>
          <MiniBarChart data={barData} highlightDay={highlightDay}/>
        </div>
      </div>

      {/* ── ROW 2: Recent Leads + Follow-ups ── */}
      {/* ✅ The "calc(100% + 300px)" full-bleed trick is a desktop/mac-only
          layout escape — disabled on tablet/mobile so nothing clips or
          scrolls the whole page sideways on smaller screens. */}
      <div style={{
        display:'grid',
        gridTemplateColumns: isDesktop ? 'minmax(0,2fr) 518px' : '1fr',
        gap: isMobile ? 14 : isTablet ? 16 : 18,
        width: isDesktop ? 'calc(100% + 300px)' : '100%',
        marginLeft: isDesktop ? -300 : 0,
      }}>

        {/* Recent Leads */}
        <div style={{ ...cardStyle, overflow:'hidden', width:'100%' }}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding: isMobile ? '14px 14px 10px' : '18px 20px 12px',
            flexWrap:'wrap', gap:8,
          }}>
            <h2 style={{ fontSize:19, fontWeight:700, color:'#fff', margin:0 }}>Recent Leads</h2>
            <div style={{ display:'flex', alignItems:'center', gap:7, background:'#1e2130', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'6px 14px' }}>
              <Search size={13} color="#6b7280"/>
              <input
                value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
                style={{ background:'none', border:'none', outline:'none', color:'#9ca3b8', fontSize:12.5, fontFamily:'inherit', width: isMobile ? 70 : 90 }}
              />
            </div>
          </div>

          {/* ✅ Table headers + rows share one horizontally-scrollable wrapper
              on tablet/mobile so all 6 columns stay exactly the same widths/
              design — you just swipe sideways to see the rest, instead of
              the columns getting redesigned or squeezed. Desktop/mac is
              untouched (overflow visible, no min-width). */}
          <div style={{ overflowX: isDesktop ? 'visible' : 'auto', WebkitOverflowScrolling:'touch' }}>
            <div style={{ minWidth: isDesktop ? 'auto' : 640 }}>

              {/* ✅ Table headers — 6 columns matching backend fields */}
              <div style={{
                display:'grid',
                gridTemplateColumns: '1.45fr 1.05fr 0.95fr 0.7fr 1.05fr 0.6fr',
                padding:'7px 20px',
                borderTop:'1px solid rgba(255,255,255,0.06)',
                borderBottom:'1px solid rgba(255,255,255,0.06)',
              }}>
                {['Lead Name', 'Email', 'Source', 'Budget', 'Message', 'Time'].map(h => (
                  <span key={h} style={{ fontSize:10.5, color:'#9ca3b8', fontWeight:600 }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {loadingLeads ? (
                <div style={{ padding:'14px 20px' }}>
                  {[...Array(3)].map((_,i) => (
                    <div key={i} style={{ height:42, background:'rgba(255,255,255,0.04)', borderRadius:8, marginBottom:8 }}/>
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <div style={{ padding:'30px 20px', textAlign:'center', color:'#6b7280', fontSize:13 }}>
                  No leads found
                </div>
              ) : (
                recentLeads.slice(0, 6).map((lead: Lead) => {
                  const raw = lead as any

                  const name  = raw.fullName ?? lead.name ?? '—'
                  const phone = lead.phone   ?? raw.phone  ?? '—'
                  const email = lead.email   ?? raw.email  ?? '—'

                  // ✅ Source + form name (mapped if known, else capitalized source) + formId badge
                  const source   = (lead.source ?? raw.source ?? 'direct') as string
                  const formId   = raw.formId ? String(raw.formId) : null
                  const formName = (formId && FORM_NAME_MAP[formId])
                    ?? (source.charAt(0).toUpperCase() + source.slice(1))

                  // ✅ Budget from extraFields
                 // ✅ Budget — sahi field se, fallback ke sath (naye + purane dono type leads ke liye)
                          const budget = fmtBudget(
                                raw.whatIsYourBudget ??
                         raw.extraFields?.what_is_your_budget_ ??
                           raw.rawData?.extraFields?.what_is_your_budget_
                         )

                                  // ✅ Message — sirf tab dikhao jab genuinely message ho, placeholder text na ho
                                const rawMsg = raw.message && raw.message !== 'No message provided' ? raw.message : null
                           const message = lead.note ?? rawMsg ?? '—'
                  // ✅ Time ago — "1m ago / 1h ago / 1d ago"
                  const arrived = timeAgo(raw.receivedAt ?? raw.createdAt ?? lead.created_at)

                  return (
                    <div
                      key={lead._id ?? lead.id ?? raw._id}
                      onClick={() => navigate('/leads')}
                      style={{
                        display:'grid',
                        gridTemplateColumns: '1.45fr 1.05fr 0.95fr 0.7fr 1.05fr 0.6fr',
                        padding:'8px 20px',
                        borderBottom:'1px solid rgba(255,255,255,0.04)',
                        alignItems:'center',
                        cursor:'pointer',
                        transition:'background 0.15s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.035)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                    >
                      {/* Name + Phone */}
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:12.5, color:'#fff', fontWeight:500, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {name}
                        </p>
                        <p style={{ fontSize:10.5, color:'#9ca3b8', margin:'1px 0 0' }}>
                          {phone}
                        </p>
                      </div>

                      {/* Email */}
                      <p style={{ fontSize:11, color:'#9ca3b8', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {trunc(email, 22)}
                      </p>

                      {/* Source / Form */}
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:11.5, color:'#A8CCFF', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {formName}
                        </p>
                        {formId && (
                          <p style={{ fontSize:9.5, color:'#4b5563', margin:'1px 0 0' }}>
                            #{formId.slice(-6)}
                          </p>
                        )}
                      </div>

                      {/* Budget */}
                      <p style={{ fontSize:11.5, color:'#22c55e', fontWeight:500, margin:0 }}>
                        {budget}
                      </p>

                      {/* Message */}
                     
                      {raw.message && raw.message !== 'No message provided' && (
                        <p style={{ fontSize:11, color:'#77a8ff', margin:'1px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {trunc(raw.message, 26)}
                        </p>
                           )}
                      

                      {/* Time ago */}
                      <p style={{ fontSize:11, color:'#9ca3b8', margin:0 }}>
                        {arrived}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Follow Ups — Overdue / Due Today / Upcoming ── */}
        <div style={{ ...cardStyle, padding: isMobile ? '16px' : isTablet ? '18px' : '20px' }}>
          <h2 style={{ fontSize:19, fontWeight:700, color:'#fff', marginBottom:14 }}>Follow Ups</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>

            {/* Overdue */}
            <div
              onClick={() => navigate('/followups?tab=overdue')}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderRadius:11, cursor:'pointer', background: overdueLeads.length > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${overdueLeads.length > 0 ? 'rgba(239,68,68,0.28)' : 'rgba(255,255,255,0.07)'}`, transition:'opacity 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0.8')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = '1')}
            >
              <div>
                <p style={{ fontSize:13, fontWeight:600, margin:0, color: overdueLeads.length > 0 ? '#ef4444' : '#9ca3b8' }}>Overdue</p>
                <p style={{ fontSize:11, color:'#9ca3b8', margin:'2px 0 0' }}>Need immediate attention</p>
              </div>
              <span style={{ background: overdueLeads.length > 0 ? '#ef4444' : '#4b5563', color:'#fff', fontSize:13, fontWeight:700, borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {overdueLeads.length}
              </span>
            </div>

            {/* Due Today */}
            <div
              onClick={() => navigate('/followups?tab=today')}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderRadius:11, cursor:'pointer', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', transition:'opacity 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0.8')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = '1')}
            >
              <div>
                <p style={{ fontSize:13, color:'#fbbf24', fontWeight:600, margin:0 }}>Due Today</p>
                <p style={{ fontSize:11, color:'#9ca3b8', margin:'2px 0 0' }}>Scheduled for today</p>
              </div>
              <span style={{ background:'#fbbf24', color:'#fff', fontSize:13, fontWeight:700, borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {dueTodayLeads.length}
              </span>
            </div>

            {/* Upcoming */}
            <div
              onClick={() => navigate('/followups?tab=upcoming')}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderRadius:11, cursor:'pointer', background:'rgba(76,111,245,0.1)', border:'1px solid rgba(76,111,245,0.22)', transition:'opacity 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0.8')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = '1')}
            >
              <div>
                <p style={{ fontSize:13, color:'#77a8ff', fontWeight:600, margin:0 }}>Upcoming</p>
                <p style={{ fontSize:11, color:'#9ca3b8', margin:'2px 0 0' }}>Scheduled ahead</p>
              </div>
              <span style={{ background:'#4c6ef5', color:'#fff', fontSize:13, fontWeight:700, borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {upcomingLeads.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/followups')}
            style={{ marginTop:14, width:'100%', padding:'10px', background:'transparent', border:'1.5px solid rgba(76,111,245,0.4)', color:'#77a8ff', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'border-color 0.15s, background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#4c6ef5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(76,111,245,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(76,111,245,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            View All Follow-ups →
          </button>
        </div>
      </div>
    </div>
  )
}