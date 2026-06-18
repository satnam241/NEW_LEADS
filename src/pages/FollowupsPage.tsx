import { useState, useMemo, useEffect } from 'react'
import { format, isToday, isPast, parseISO, isValid } from 'date-fns'
import {
  CheckCircle2, Calendar, Edit2,
  CalendarPlus, X, Search,
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  useFollowups, useMarkFollowupDone, useUpdateLead, useScheduleFollowUp,
} from '@/hooks/useLeads'
import LeadModal from '@/components/modals/LeadModal'
import type { Lead, LeadInsert, FollowUpPayload } from '@/types'

// ─────────────────────────────────────────────────────────────────
type Tab = 'today' | 'overdue' | 'upcoming' | 'all'

const TAB_CONFIG: Record<Tab, {
  label: string
  subLabel: string
  color: string
  badgeBg: string
  activeBorder: string
  activeBg: string
}> = {
  today: {
    label: 'Due Today', subLabel: 'leads due today',
    color: 'white', badgeBg: '#3c3c3c',
    activeBorder: '#565656', activeBg: '#3c3c3c',
  },
  overdue: {
    label: 'Overdue', subLabel: 'need attention',
    color: 'white', badgeBg: '#3c3c3c',
    activeBorder: '#565656', activeBg: '#3c3c3c',
  },
  upcoming: {
    label: 'Upcoming', subLabel: 'scheduled ahead',
    color: 'white', badgeBg: '#3c3c3c',
    activeBorder: '#565656', activeBg: '#3c3c3c',
  },
  all: {
    label: 'All Active', subLabel: 'total follow-ups',
    color: 'white', badgeBg: '#3c3c3c',
    activeBorder: '#565656', activeBg: '#3c3c3c',
  },
}

// ─────────────────────────────────────────────────────────────────
// Responsive helper — breakpoints for mobile / tablet / desktop(mac)
// (mobile <640px, tablet 640–1023px, desktop/mac ≥1024px)
// ✅ Same lightweight pattern used on the Dashboard page — plain
//    useState + resize listener, no extra deps.
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
// Helpers
// ─────────────────────────────────────────────────────────────────
function safeParseDate(d?: string | null): Date | null {
  if (!d) return null
  try { const p = parseISO(d); return isValid(p) ? p : null } catch { return null }
}

function avatarColor(name: string) {
  const colors = ['#3c3c3c', '#3c3c3c', '#3c3c3c', '#3c3c3c', '#3c3c3c', '#3c3c3c']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
  return colors[Math.abs(h)]
}

// ─────────────────────────────────────────────────────────────────
// Schedule Modal
// ✅ Only addition: a little horizontal breathing room around the
//    overlay (16px) so the dialog never touches the screen edges on
//    narrow phones. The dialog itself (size/colors/fields) is untouched.
// ─────────────────────────────────────────────────────────────────
function ScheduleModal({
  lead, open, onClose, onSave, isSaving,
}: {
  lead: Lead | null; open: boolean
  onClose: () => void; onSave: (p: FollowUpPayload) => void; isSaving: boolean
}) {
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [rec,  setRec]  = useState<'once'|'tomorrow'|'3days'|'weekly'>('once')
  const [wa,   setWa]   = useState(false)
  const [err,  setErr]  = useState('')
  const prevId = useState<string|null>(null)

  if (open && lead && (lead._id ?? lead.id) !== prevId[0]) {
    prevId[1](lead._id ?? lead.id)
    setDate(lead.followup_date ?? '')
    setNote(lead.followup_note ?? '')
    setRec((lead.followUp?.recurrence as any) ?? 'once')
    setWa(lead.followUp?.whatsappOptIn ?? false)
    setErr('')
  }

  if (!open || !lead) return null

  const submit = () => {
    if (rec === 'once' && !date) { setErr('Date select karo'); return }
    onSave({ date: rec === 'once' ? date : undefined, message: note || undefined, recurrence: rec, whatsappOptIn: wa })
  }

  const RECS = [
    { v: 'once', l: 'Once' }, { v: 'tomorrow', l: 'Tomorrow' },
    { v: '3days', l: '3 Days' }, { v: 'weekly', l: 'Weekly' },
  ] as const

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'16px', boxSizing:'border-box' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background:'#2a2d3e', borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 24px 60px rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:'#fff' }}>📅 Schedule Follow-up</p>
            <p style={{ fontSize:12, color:'#9ca3b8', marginTop:2 }}>{lead.name} · {lead.phone ?? lead.email ?? '—'}</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:6, cursor:'pointer', color:'#9ca3b8', display:'flex' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={labelS}>Recurrence</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {RECS.map(r => (
                <button key={r.v} onClick={() => setRec(r.v)} style={{
                  padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer',
                  border:`1.5px solid ${rec === r.v ? '#4c6ef5' : 'rgba(255,255,255,0.12)'}`,
                  background: rec === r.v ? 'rgba(76,111,245,0.2)' : 'transparent',
                  color: rec === r.v ? '#77a8ff' : '#9ca3b8',
                }}>
                  {r.l}
                </button>
              ))}
            </div>
          </div>

          {rec === 'once' && (
            <div>
              <label style={labelS}>Follow-up Date *</label>
              <input
                type="date" value={date}
                onChange={e => { setDate(e.target.value); setErr('') }}
                min={new Date().toISOString().split('T')[0]}
                style={{ width:'100%', height:38, borderRadius:8, border:`1px solid ${err ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, padding:'0 12px', fontSize:13, outline:'none', boxSizing:'border-box', background:'#1e2130', color:'#fff' }}
              />
              {err && <p style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>{err}</p>}
            </div>
          )}

          <div>
            <label style={labelS}>Note</label>
            <input
              type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
              style={{ width:'100%', height:38, borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', padding:'0 12px', fontSize:13, outline:'none', boxSizing:'border-box', background:'#1e2130', color:'#fff' }}
            />
          </div>

          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#9ca3b8', fontWeight:500 }}>
            <input type="checkbox" checked={wa} onChange={e => setWa(e.target.checked)} style={{ width:15, height:15, accentColor:'#25d366' }} />
            💬 WhatsApp reminder
          </label>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', fontSize:13, cursor:'pointer', color:'#9ca3b8' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={isSaving} style={{ padding:'8px 18px', borderRadius:8, border:'none', background: isSaving ? '#6b7280' : '#4c6ef5', color:'#fff', fontSize:13, fontWeight:600, cursor: isSaving ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <CalendarPlus size={13} />
            {isSaving ? 'Saving…' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Lead Card
// (unchanged — the auto-fill grid it sits in already handles column
// count responsively across mobile/tablet/desktop on its own)
// ─────────────────────────────────────────────────────────────────
function LeadCard({
  lead, onEdit, onDone, onSchedule, isDoing,
}: {
  lead: Lead
  onEdit: (l: Lead) => void
  onDone: (id: string) => void
  onSchedule: (l: Lead) => void
  isDoing: boolean
}) {
  const navigate = useNavigate()
  const date     = safeParseDate(lead.followup_date)
  const isOv     = date ? isPast(date) && !isToday(date) : false
  const isTod    = date ? isToday(date) : false
  const leadId   = lead._id ?? lead.id
  const initial  = lead.name.trim()[0]?.toUpperCase() ?? '?'
  const avColor  = avatarColor(lead.name)

  const dateColor = isOv ? '#fdfbfb' : isTod ? '#fbf9f9' : '#f9f5f5'

  return (
    <div style={{
      background: '#3c3c3c', borderRadius: 13, padding: '15px 13px',
      display: 'flex', flexDirection: 'column', gap: 8,
      border: '1px solid #6c6c6c', opacity: lead.followup_done ? 0.6 : 1,
      boxShadow: '0 4px 1px #3c3c3c'
    }}>

      {/* Avatar + Name + Phone */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: avColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: '#070707', flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#ffffff', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {lead.name}
          </p>
          <p style={{ fontSize:11, color:'#fafafc', margin:'1px 0 0' }}>
            {lead.phone ?? lead.email ?? '—'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:8, display:'flex', flexDirection:'column', gap:3 }}>
        {date && (
          <p style={{ fontSize:10.5, color:'#fcfcfd', margin:0 }}>
            <span style={{ color: dateColor, fontWeight:600 }}>DATE:</span>{' '}
            {format(date, 'dd-MM-yyyy')}
            {isOv  && <span style={{ marginLeft:4, fontSize:9.5, background:'rgba(239,68,68,0.15)', color:'#ef4444', padding:'1px 6px', borderRadius:4 }}>Overdue</span>}
            {isTod && <span style={{ marginLeft:4, fontSize:9.5, background:'rgba(251,191,36,0.15)', color:'#fbbf24', padding:'1px 6px', borderRadius:4 }}>Today</span>}
          </p>
        )}

        {lead.source && (
          <p style={{ fontSize:10.5, color:'#ffffff', fontWeight:600, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {lead.source}
          </p>
        )}

        {(lead.followup_note || lead.note) && (
          <>
            <p style={{ fontSize:10.5, color:'#ffffff', margin:0, fontWeight:600 }}>MESSAGE:</p>
            <p style={{
              fontSize:10.5, color:'#ffffff', margin:0,
              overflow:'hidden', display:'-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient:'vertical',
            }}>
              {lead.followup_note ?? lead.note}
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:'auto' }}>
        <button
          onClick={() => navigate('/leads')}
          style={{ flex:1, padding:'6px 0', background:'#4c6ef5', border:'none', color:'#ffffff', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer' }}
        >
          VIEW DETAILS
        </button>
      </div>

      <div style={{ display:'flex', gap:5 }}>
        <button
          onClick={() => onSchedule(lead)}
          style={{ flex:1, padding:'5px 0', background:'transparent', border:'1px solid rgba(76,111,245,0.4)', color:'#77a8ff', borderRadius:7, fontSize:10.5, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}
        >
          <CalendarPlus size={10} /> Reschedule
        </button>
        <button
          onClick={() => onEdit(lead)}
          style={{ flex:1, padding:'5px 0', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#ffffff', borderRadius:7, fontSize:10.5, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}
        >
          <Edit2 size={10} /> Edit
        </button>
        {!lead.followup_done && (
          <button
            onClick={() => onDone(leadId)}
            disabled={isDoing}
            style={{ flex:1, padding:'5px 0', background:'transparent', border:'1px solid rgba(34,197,94,0.4)', color:'#22c55e', borderRadius:7, fontSize:10.5, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}
          >
            <CheckCircle2 size={10} /> Done
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function FollowupsPage() {
  const [searchParams]          = useSearchParams()
  const [tab, setTab]           = useState<Tab>((searchParams.get('tab') as Tab) ?? 'today')
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [sched,   setSched]     = useState<Lead | null>(null)
  const [search,  setSearch]    = useState('')

  // ✅ Responsive flags — drives layout-only tweaks below (tab grid columns,
  //    paddings, search width). No data/logic depends on this.
  const { isMobile, isTablet, isDesktop } = useViewport()

  // ✅ KEY FIX: Sabhi 4 tabs ka data page load pe hi fetch karo simultaneously
  // Tab switch pe reload nahi hoga — data already ready hoga
  const { data: todayLeads    = [], isLoading: loadingToday    } = useFollowups('today')
  const { data: overdueLeads  = [], isLoading: loadingOverdue  } = useFollowups('overdue')
  const { data: upcomingLeads = [], isLoading: loadingUpcoming } = useFollowups('upcoming')
  const { data: allLeads      = [], isLoading: loadingAll      } = useFollowups('all')

  const markDone  = useMarkFollowupDone()
  const updateM   = useUpdateLead()
  const scheduleM = useScheduleFollowUp()

  // ✅ Active tab ke leads select karo
  const activeLeads: Lead[] = {
    today:    todayLeads,
    overdue:  overdueLeads,
    upcoming: upcomingLeads,
    all:      allLeads,
  }[tab]

  const isLoading = {
    today:    loadingToday,
    overdue:  loadingOverdue,
    upcoming: loadingUpcoming,
    all:      loadingAll,
  }[tab]

  // ✅ Search filter active tab ke leads pe
  const leads = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return activeLeads
    return activeLeads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.phone ?? '').includes(q) ||
      (l.email ?? '').toLowerCase().includes(q) ||
      (l.followup_note ?? '').toLowerCase().includes(q)
    )
  }, [activeLeads, search])

  // ✅ Counts — har tab ka apna real count, page load pe hi ready
  const TAB_COUNTS: Record<Tab, number> = {
    today:    todayLeads.length,
    overdue:  overdueLeads.length,
    upcoming: upcomingLeads.length,
    all:      allLeads.length,
  }

  const handleSave = async (data: LeadInsert) => {
    if (!editLead) return
    await updateM.mutateAsync({ id: editLead._id ?? editLead.id, updates: data })
    setEditLead(null)
  }

  const handleSchedule = async (payload: FollowUpPayload) => {
    if (!sched) return
    try {
      await scheduleM.mutateAsync({ id: sched._id ?? sched.id, payload })
      setSched(null)
    } catch (err) {
      console.error(err)
    }
  }

  const now     = new Date()
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${String(now.getFullYear()).slice(2)}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap: isMobile ? 14 : isTablet ? 16 : 20 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'#fff', margin:0 }}>Follow ups</h1>
        <span style={{ fontSize:13, color:'#9ca3b8' }}>
          Date: <strong style={{ color:'#fff' }}>{dateStr}</strong>
        </span>
      </div>

      {/* ── Tab Cards ── */}
      {/* ✅ Collapses to 2 columns on phones so labels/counts don't get
          squeezed; tablet & desktop/mac keep the original 4-column row. */}
      <div style={{
        display:'grid',
        gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
        gap: isMobile ? 10 : isTablet ? 12 : 14,
      }}>
        {(Object.keys(TAB_CONFIG) as Tab[]).map(key => {
          const cfg    = TAB_CONFIG[key]
          const active = tab === key
          const count  = TAB_COUNTS[key]
          return (
            <div
              key={key}
              onClick={() => setTab(key)}
              style={{
                background: active ? cfg.activeBg : '#3C3C3C',
                borderRadius: 13,
                padding: isMobile ? '14px 14px' : isTablet ? '16px 18px' : '18px 20px',
                cursor: 'pointer',
                border: active ? `2px solid ${cfg.activeBorder}` : '1px solid rgba(195,194,194,0.07)',
                transition: 'all 0.18s',
                boxShadow: active ? `0 4px 20px ${cfg.color}40` : '0 4px 16px rgba(68,67,67,0.1)',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:11, color: cfg.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>
                  {cfg.label}
                </span>
                <span style={{ background: cfg.badgeBg, color: cfg.color, fontSize:12, fontWeight:700, padding:'2px 9px', borderRadius:50 }}>
                  {count}
                </span>
              </div>
              <p style={{ fontSize:28, fontWeight:700, color:'#fff', margin:0 }}>{count}</p>
              <p style={{ fontSize:11, color:'#9ca3b8', margin:'4px 0 0' }}>{cfg.subLabel}</p>
            </div>
          )
        })}
      </div>

      {/* Section title + Search */}
      {/* ✅ Wraps to its own line on mobile so the search bar gets full width
          instead of squeezing next to the heading. */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', margin:0 }}>
          {TAB_CONFIG[tab].label}
        </h2>
        <div style={{ position:'relative', maxWidth: isMobile ? '100%' : 260, width: isMobile ? '100%' : 'auto' }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, note…"
            style={{
              height:36, paddingLeft:32, paddingRight: search ? 32 : 14,
              paddingTop:0, paddingBottom:0,
              background:'#3C3C3C', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:50, color:'#9ca3b8', fontSize:13,
              outline:'none', fontFamily:'inherit', width: isMobile ? '100%' : 240,
              boxSizing:'border-box',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Lead Cards Grid */}
      {/* (unchanged — repeat(auto-fill,minmax(175px,1fr)) already reflows
          the column count on its own at any viewport width) */}
      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:12 }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} style={{ background:'#3c3c3c', borderRadius:13, height:200, opacity:0.5 }} />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'#3c3c3c', borderRadius:14 }}>
          <p style={{ fontSize:36, margin:'0 0 12px' }}>
            {tab === 'overdue' ? '✅' : tab === 'today' ? '🎉' : '📅'}
          </p>
          <p style={{ fontSize:14, fontWeight:600, color:'#9ca3b8', margin:'0 0 4px' }}>
            {search
              ? 'No results found'
              : tab === 'overdue' ? 'No overdue follow-ups!'
              : tab === 'today'  ? 'All clear for today!'
              : 'No follow-ups here'}
          </p>
          <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>
            {search ? `"${search}"` : ''}
          </p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:12 }}>
          {leads.map(lead => (
            <LeadCard
              key={lead._id ?? lead.id}
              lead={lead}
              onEdit={setEditLead}
              onDone={id => markDone.mutate(id)}
              onSchedule={setSched}
              isDoing={markDone.isPending}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <LeadModal
        open={!!editLead}
        lead={editLead}
        onClose={() => setEditLead(null)}
        onSave={handleSave}
        isSaving={updateM.isPending}
      />
      <ScheduleModal
        open={!!sched}
        lead={sched}
        onClose={() => setSched(null)}
        onSave={handleSchedule}
        isSaving={scheduleM.isPending}
      />
    </div>
  )
}

const labelS: React.CSSProperties = {
  fontSize:11, fontWeight:600, color:'#9ca3b8',
  textTransform:'uppercase', letterSpacing:'0.04em',
  display:'block', marginBottom:6,
}