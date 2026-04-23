
import { useState, useMemo } from 'react'
import { format, isToday, isPast, parseISO, isValid } from 'date-fns'
import { CheckCircle2, CalendarClock, AlertCircle, Calendar, Edit2, Search, X, CalendarPlus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useFollowups, useMarkFollowupDone, useUpdateLead, useScheduleFollowUp } from '@/hooks/useLeads'
import { ContactButtons, Avatar, StatusBadge } from '@/components/Shared'
import LeadModal from '@/components/modals/LeadModal'
import type { Lead, LeadInsert, FollowUpPayload } from '@/types'

type Tab = 'today' | 'overdue' | 'upcoming' | 'all'

const TABS: {
  key: Tab
  label: string
  icon: React.ReactNode
  activeBg: string
  activeText: string
}[] = [
  { key: 'today',    label: 'Due Today',  icon: <CalendarClock size={14} />, activeBg: '#fffbeb', activeText: '#d97706' },
  { key: 'overdue',  label: 'Overdue',    icon: <AlertCircle size={14} />,   activeBg: '#fef2f2', activeText: '#dc2626' },
  { key: 'upcoming', label: 'Upcoming',   icon: <Calendar size={14} />,      activeBg: '#eff4ff', activeText: '#4c6ef5' },
  { key: 'all',      label: 'All Active', icon: <CalendarClock size={14} />, activeBg: '#f8fafc', activeText: '#475569' },
]

function safeParseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

// ─── Schedule Follow-up Modal ─────────────────────────────────────────────────
// Ye modal seedha /followup/leads/:id/follow-up hit karta hai
function ScheduleModal({
  lead,
  open,
  onClose,
  onSave,
  isSaving,
}: {
  lead: Lead | null
  open: boolean
  onClose: () => void
  onSave: (payload: FollowUpPayload) => void
  isSaving: boolean
}) {
  const [date, setDate]         = useState('')
  const [note, setNote]         = useState('')
  const [recurrence, setRec]    = useState<'once' | 'tomorrow' | '3days' | 'weekly'>('once')
  const [whatsapp, setWhatsapp] = useState(false)
  const [error, setError]       = useState('')

  // Prefill when lead changes
  const prevLeadId = useState<string | null>(null)
  if (open && lead && (lead._id ?? lead.id) !== prevLeadId[0]) {
    prevLeadId[1](lead._id ?? lead.id)
    setDate(lead.followup_date ?? '')
    setNote(lead.followup_note ?? '')
    setRec((lead.followUp?.recurrence as any) ?? 'once')
    setWhatsapp(lead.followUp?.whatsappOptIn ?? false)
    setError('')
  }

  if (!open || !lead) return null

  const handleSubmit = () => {
    if (recurrence === 'once' && !date) {
      setError('Date select karo')
      return
    }
    onSave({
      date:          recurrence === 'once' ? date : undefined,
      message:       note || undefined,
      recurrence,
      whatsappOptIn: whatsapp,
    })
  }

  const RECS = [
    { value: 'once',     label: 'Once' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: '3days',    label: '3 Days' },
    { value: 'weekly',   label: 'Weekly' },
  ] as const

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>📅 Schedule Follow-up</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{lead.name} · {lead.phone ?? lead.email ?? '—'}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#64748b', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Recurrence pills */}
          <div>
            <label style={labelStyle}>Recurrence</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {RECS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRec(r.value)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    border: `1.5px solid ${recurrence === r.value ? '#4c6ef5' : '#e2e8f0'}`,
                    background: recurrence === r.value ? '#eff4ff' : '#fff',
                    color: recurrence === r.value ? '#4c6ef5' : '#64748b',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date — only for 'once' */}
          {recurrence === 'once' && (
            <div>
              <label style={labelStyle}>Follow-up Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setError('') }}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%', height: 38, borderRadius: 8,
                  border: `1px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                  padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
              {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</p>}
            </div>
          )}

          {/* Note */}
          <div>
            <label style={labelStyle}>Note</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder=""
              style={{
                width: '100%', height: 38, borderRadius: 8, border: '1px solid #e2e8f0',
                padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* WhatsApp opt-in */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={whatsapp}
              onChange={e => setWhatsapp(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: '#25d366' }}
            />
            💬 WhatsApp reminder
          </label>

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#64748b' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: isSaving ? '#a5b4fc' : '#4c6ef5',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <CalendarPlus size={13} />
            {isSaving ? 'Saving…' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── FollowupCard ─────────────────────────────────────────────────────────────
function FollowupCard({
  lead,
  onEdit,
  onDone,
  onSchedule,
  isDoing,
}: {
  lead: Lead
  onEdit: (l: Lead) => void
  onDone: (id: string) => void
  onSchedule: (l: Lead) => void
  isDoing: boolean
}) {
  const date       = safeParseDate(lead.followup_date)
  const isOverdue  = date ? isPast(date) && !isToday(date) : false
  const isDueToday = date ? isToday(date) : false

  let borderStyle = '1px solid #e8edf3'
  let bgStyle     = '#fff'
  if (isOverdue)  { borderStyle = '1px solid #fecaca'; bgStyle = 'rgba(254,242,242,0.5)' }
  if (isDueToday) { borderStyle = '1px solid #fde68a'; bgStyle = 'rgba(255,251,235,0.5)' }

  const leadId = lead._id ?? lead.id

  return (
    <div style={{ background: bgStyle, border: borderStyle, borderRadius: 14, padding: '14px 16px', opacity: lead.followup_done ? 0.55 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
          <Avatar name={lead.name} size={9} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{lead.name}</p>
              <StatusBadge status={lead.status} />
              {isOverdue && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 99, border: '1px solid #fecaca' }}>
                  ⚠️ Overdue
                </span>
              )}
              {lead.followup_done && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 99, border: '1px solid #bbf7d0' }}>
                  ✓ Done
                </span>
              )}
            </div>

            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              {lead.email ?? lead.phone ?? '—'}
            </p>

            {lead.followup_note && (
              <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', borderRadius: 8, padding: '6px 10px', border: '1px solid #f1f5f9', marginBottom: 4 }}>
                📌 {lead.followup_note}
              </div>
            )}

            {lead.note && (
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Note: {lead.note}</p>
            )}

            {lead.followUp?.recurrence && lead.followUp.recurrence !== 'once' && (
              <span style={{ fontSize: 11, background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: 99, marginTop: 4, display: 'inline-block' }}>
                🔄 {lead.followUp.recurrence}
              </span>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          {date && (
            <p style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? '#dc2626' : isDueToday ? '#d97706' : '#4c6ef5' }}>
              {isDueToday ? '📅 Today' : format(date, 'MMM d, yyyy')}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()}>
              <ContactButtons lead={lead} />
            </div>

            {/* ── Alag Follow-up button — seedha /followup/leads/:id/follow-up ── */}
            <button
              onClick={() => onSchedule(lead)}
              style={{
                padding: '4px 10px', fontSize: 12, borderRadius: 8, cursor: 'pointer',
                border: '1px solid #a5b4fc', background: '#eff4ff', color: '#4c6ef5',
                display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500,
              }}
            >
              <CalendarPlus size={11} /> Follow-up
            </button>

            <button
              onClick={() => onEdit(lead)}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Edit2 size={11} /> Edit
            </button>

            {!lead.followup_done && (
              <button
                onClick={() => onDone(leadId)}
                disabled={isDoing}
                className="btn-green"
                style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <CheckCircle2 size={11} /> Mark Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FollowupsPage() {
  const [searchParams]                      = useSearchParams()
  const [tab, setTab]                       = useState<Tab>((searchParams.get('tab') as Tab) ?? 'today')
  const [editLead, setEditLead]             = useState<Lead | null>(null)
  const [scheduleLead, setScheduleLead]     = useState<Lead | null>(null)
  const [search, setSearch]                 = useState('')

  const { data: rawLeads = [], isLoading, isError } = useFollowups(tab)

  const markDone  = useMarkFollowupDone()
  const updateM   = useUpdateLead()
  const scheduleM = useScheduleFollowUp()

  const leads = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rawLeads
    return rawLeads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.phone ?? '').includes(q) ||
      (l.email ?? '').toLowerCase().includes(q) ||
      (l.followup_note ?? '').toLowerCase().includes(q)
    )
  }, [rawLeads, search])

  const todayCount   = rawLeads.filter(l => { const d = safeParseDate(l.followup_date); return d && isToday(d) }).length
  const overdueCount = rawLeads.filter(l => { const d = safeParseDate(l.followup_date); return d && isPast(d) && !isToday(d) }).length

  // Edit — sirf basic fields (name, status, note etc.)
  const handleSave = async (data: LeadInsert) => {
    if (!editLead) return
    await updateM.mutateAsync({ id: editLead._id ?? editLead.id, updates: data })
    setEditLead(null)
  }

  // Schedule — seedha /followup/leads/:id/follow-up endpoint
  const handleSchedule = async (payload: FollowUpPayload) => {
    if (!scheduleLead) return
    await scheduleM.mutateAsync({ id: scheduleLead._id ?? scheduleLead.id, payload })
    setScheduleLead(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <h1 className="page-title">Follow-ups</h1>
        <p className="page-sub">Track and manage your lead follow-up schedule</p>
      </div>

      {!search && (todayCount > 0 || overdueCount > 0) && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {todayCount > 0 && (
            <div onClick={() => setTab('today')} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <CalendarClock size={15} style={{ color: '#d97706' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{todayCount} due today</span>
            </div>
          )}
          {overdueCount > 0 && (
            <div onClick={() => setTab('overdue')} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <AlertCircle size={15} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>{overdueCount} overdue — act now!</span>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
          {TABS.map(t => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                  border: 'none', cursor: 'pointer', transition: 'all 120ms ease',
                  background: active ? t.activeBg : 'transparent',
                  color: active ? t.activeText : '#64748b',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t.icon}{t.label}
              </button>
            )
          })}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            className="input-base"
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
            placeholder="Search name, phone, note…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={13} />
            </button>
          )}
        </div>

        <span style={{ fontSize: 12, color: '#94a3b8', background: '#f8fafc', padding: '3px 10px', borderRadius: 99, border: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
          {leads.length} result{leads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} style={{ color: '#ef4444' }} />
          <p style={{ fontSize: 13, color: '#dc2626' }}>Server error</p>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ padding: 16, display: 'flex', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: 140, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: 200 }} />
              </div>
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {tab === 'overdue' ? '✅' : tab === 'today' ? '🎉' : '📅'}
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
            {search ? 'No results found' : tab === 'overdue' ? 'No overdue follow-ups!' : tab === 'today' ? 'All Clear for Today!' : 'No follow-ups here'}
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            {search ? `"${search}" Nofollow-up matched ` : 'No follow-up in this category.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leads.map(lead => (
            <FollowupCard
              key={lead._id ?? lead.id}
              lead={lead}
              onEdit={setEditLead}
              onDone={id => markDone.mutate(id)}
              onSchedule={setScheduleLead}
              isDoing={markDone.isPending}
            />
          ))}
        </div>
      )}

      {/* Edit Modal — sirf basic lead fields update karta hai */}
      <LeadModal
        open={!!editLead}
        lead={editLead}
        onClose={() => setEditLead(null)}
        onSave={handleSave}
        isSaving={updateM.isPending}
      />

      {/* Schedule Modal — seedha /followup/leads/:id/follow-up endpoint */}
      <ScheduleModal
        open={!!scheduleLead}
        lead={scheduleLead}
        onClose={() => setScheduleLead(null)}
        onSave={handleSchedule}
        isSaving={scheduleM.isPending}
      />

    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  display: 'block', marginBottom: 6,
}