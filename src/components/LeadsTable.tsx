import React, { useState } from 'react'
import { format } from 'date-fns'
import { Edit2, Trash2, CalendarClock, Phone, Mail, MessageCircle } from 'lucide-react'
import type { Lead, LeadStatus } from '@/types'
import { SourceBadge, Avatar } from './Shared'

interface Props {
  leads: Lead[]
  isLoading: boolean
  onEdit: (l: Lead) => void
  onDelete: (id: string) => void
  onFollowUp?: (l: Lead) => void
  onStatusChange?: (id: string, status: LeadStatus) => void
  onInterestChange?: (id: string, interest: 'hot' | 'warm' | 'cold' | null) => void
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Negotiation', 'Visitor', 'Closed', 'Lost']

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  New:         { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' },
  Contacted:   { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
  Interested:  { bg: 'rgba(167, 139, 250, 0.15)', color: '#c084fc' },
  Negotiation: { bg: 'rgba(192, 132, 252, 0.15)', color: '#d8b4fe' },
  Visitor:     { bg: 'rgba(6, 182, 212, 0.15)',  color: '#22d3ee' },
  Closed:      { bg: 'rgba(34, 197, 94, 0.15)',  color: '#4ade80' },
  Lost:        { bg: 'rgba(239, 68, 68, 0.15)',  color: '#f87171' },
}

// ── Status dropdown ──────────────────────────────────────────────────────────
const StatusSelect = React.memo(function StatusSelect({
  lead, onChange,
}: { lead: Lead; onChange?: (id: string, s: LeadStatus) => void }) {
  const [localStatus, setLocalStatus] = useState<LeadStatus>(lead.status)

  React.useEffect(() => { setLocalStatus(lead.status) }, [lead.status])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const next = e.target.value as LeadStatus
    setLocalStatus(next)
    onChange?.(lead._id ?? lead.id, next)
  }

  const colors = STATUS_COLORS[localStatus] ?? { bg: 'rgba(255,255,255,0.08)', color: '#fff' }

  return (
    <select
      value={localStatus}
      onClick={e => e.stopPropagation()}
      onChange={handleChange}
      style={{
        fontSize: 11, fontWeight: 700,
        padding: '4px 10px', borderRadius: 99,
        border: `1px solid ${colors.color}33`, outline: 'none', cursor: 'pointer',
        background: colors.bg, color: colors.color,
        appearance: 'none', WebkitAppearance: 'none',
        minWidth: 104,
      }}
    >
      {STATUSES.map(s => (
        <option key={s} value={s} style={{
          background: '#2A2A2A',
          color: STATUS_COLORS[s]?.color ?? '#fff',
        }}>
          {s}
        </option>
      ))}
    </select>
  )
})

// ── Lead Temperature / Interest dropdown ─────────────────────────────────────
const INTEREST_OPTIONS: { value: 'hot' | 'warm' | 'cold' | ''; label: string; bg: string; color: string }[] = [
  { value: '',     label: '🌡️ Interest: None', bg: 'rgba(255,255,255,0.06)', color: '#94a3b8' },
  { value: 'hot',  label: '🔥 Hot',             bg: 'rgba(239, 68, 68, 0.16)', color: '#fca5a5' },
  { value: 'warm', label: '🌤️ Warm',            bg: 'rgba(245, 158, 11, 0.16)', color: '#fcd34d' },
  { value: 'cold', label: '❄️ Cold',            bg: 'rgba(96, 165, 250, 0.16)', color: '#93c5fd' },
]

const InterestSelect = React.memo(function InterestSelect({
  lead, onChange,
}: { lead: Lead; onChange?: (id: string, interest: 'hot' | 'warm' | 'cold' | null) => void }) {
  const current = (lead.interestLevel || '').toLowerCase() as 'hot' | 'warm' | 'cold' | ''
  const [localInterest, setLocalInterest] = useState<string>(current)

  React.useEffect(() => {
    setLocalInterest((lead.interestLevel || '').toLowerCase())
  }, [lead.interestLevel])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const next = e.target.value as 'hot' | 'warm' | 'cold' | ''
    setLocalInterest(next)
    onChange?.(lead._id ?? lead.id, next ? next : null)
  }

  const opt = INTEREST_OPTIONS.find(o => o.value === localInterest) || INTEREST_OPTIONS[0]

  return (
    <select
      value={localInterest}
      onClick={e => e.stopPropagation()}
      onChange={handleChange}
      title="Manually update Lead Temperature (Hot / Warm / Cold)"
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 99,
        border: `1px solid ${opt.color}44`,
        outline: 'none',
        cursor: 'pointer',
        background: opt.bg,
        color: opt.color,
        appearance: 'none',
        WebkitAppearance: 'none',
        minWidth: 104,
      }}
    >
      {INTEREST_OPTIONS.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#2A2A2A', color: o.color }}>
          {o.label}
        </option>
      ))}
    </select>
  )
})

// ── Contact cell ─────────────────────────────────────────────────────────────
const ContactCell = React.memo(function ContactCell({ lead }: { lead: Lead }) {
  const waNum = (lead.whatsapp ?? lead.phone)?.replace(/\D/g, '')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lead.phone && (
        <a
          href={`tel:${lead.phone}`}
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: '#e2e8f0', textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: 6,
          }}
        >
          <Phone size={11} style={{ color: '#94a3b8' }} /> {lead.phone}
        </a>
      )}
      {lead.email && (
        <a
          href={`mailto:${lead.email}`}
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11.5, color: '#94a3b8', textDecoration: 'none',
            maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          <Mail size={11} /> {lead.email}
        </a>
      )}
      {waNum && (
        <a
          href={`https://wa.me/${waNum}`}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, color: '#4ade80', textDecoration: 'none', fontWeight: 600,
          }}
        >
          <MessageCircle size={11} /> WhatsApp
        </a>
      )}
    </div>
  )
})

// ── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    {[...Array(7)].map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <div className="skeleton" style={{ height: 14, width: `${50 + (i * 17) % 40}%`, borderRadius: 6 }} />
      </td>
    ))}
  </tr>
)

// ── Main component ────────────────────────────────────────────────────────────
function LeadsTable({ leads, isLoading, onEdit, onDelete, onFollowUp, onStatusChange, onInterestChange }: Props) {
  if (!isLoading && leads.length === 0) {
    return (
      <div style={{ padding: '60px 16px', textAlign: 'center', background: '#3C3C3C' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>No leads found</p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', background: '#3C3C3C' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            <th className="thead-cell">Lead</th>
            <th className="thead-cell hidden md:table-cell">Contact</th>
            <th className="thead-cell">Source</th>
            <th className="thead-cell">Status</th>
            <th className="thead-cell hidden lg:table-cell">Follow-up</th>
            <th className="thead-cell hidden lg:table-cell">Added</th>
            <th className="thead-cell" style={{ width: 110, textAlign: 'right', paddingRight: 20 }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            : leads.map(lead => {
                const displayName = (lead.fullName ?? lead.name ?? '').trim() || 'Unknown'
                const rowKey      = lead._id ?? lead.id
                const followDate  = lead.followup_date ?? lead.followUp?.date
                  ? new Date(lead.followup_date ?? lead.followUp!.date!)
                  : null
                const isOverdue   = followDate && followDate < new Date() && !lead.followup_done
                const note        = lead.followup_note ?? lead.followUp?.message
                const isRecurring = lead.followUp?.recurrence && lead.followUp.recurrence !== 'once'

                return (
                  <React.Fragment key={rowKey}>
                    {/* Main lead row */}
                    <tr
                      className="tbody-row"
                      onClick={() => onEdit(lead)}
                    >
                      {/* Lead name */}
                      <td className="tbody-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={displayName} size={32} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <p style={{ fontWeight: 600, color: '#ffffff', fontSize: 13.5, margin: 0 }}>
                                {displayName}
                              </p>
                              {lead.interestLevel && (
                                <span
                                  style={{
                                    fontSize: 9.5,
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                    background:
                                      lead.interestLevel.toLowerCase() === 'hot'
                                        ? 'rgba(239,68,68,0.15)'
                                        : lead.interestLevel.toLowerCase() === 'warm'
                                        ? 'rgba(245,158,11,0.15)'
                                        : 'rgba(96,165,250,0.15)',
                                    color:
                                      lead.interestLevel.toLowerCase() === 'hot'
                                        ? '#fca5a5'
                                        : lead.interestLevel.toLowerCase() === 'warm'
                                        ? '#fcd34d'
                                        : '#93c5fd',
                                  }}
                                >
                                  {lead.interestLevel.toLowerCase() === 'hot'
                                    ? '🔥 Hot'
                                    : lead.interestLevel.toLowerCase() === 'warm'
                                    ? '🌤️ Warm'
                                    : '❄️ Cold'}
                                </span>
                              )}
                            </div>
                            {lead.interestLevel && (
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  marginTop: 2,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  color:
                                    lead.interestLevel.toLowerCase() === 'hot'
                                      ? '#fca5a5'
                                      : lead.interestLevel.toLowerCase() === 'warm'
                                      ? '#fcd34d'
                                      : '#93c5fd',
                                }}
                              >
                                {lead.interestLevel.toLowerCase() === 'hot'
                                  ? '🔥 Hot • Most Activity'
                                  : lead.interestLevel.toLowerCase() === 'warm'
                                  ? '🌤️ Warm • Interested'
                                  : '❄️ Cold • No Response'}
                              </div>
                            )}
                            <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                              {lead.email ?? lead.phone ?? '—'}
                            </p>
                            {lead.assigned_to && (
                              <p style={{ fontSize: 11, color: '#77a8ff', margin: '2px 0 0', fontWeight: 600 }}>
                                {lead.assigned_by ? `${lead.assigned_by} → ` : ''}{lead.assigned_to}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="tbody-cell hidden md:table-cell">
                        <ContactCell lead={lead} />
                      </td>

                      {/* Source */}
                      <td className="tbody-cell">
                        <SourceBadge source={lead.source} />
                      </td>

                      {/* Status & Lead Temperature */}
                      <td className="tbody-cell">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <StatusSelect lead={lead} onChange={onStatusChange} />
                          <InterestSelect lead={lead} onChange={onInterestChange} />
                        </div>
                      </td>

                      {/* Follow-up date */}
                      <td className="tbody-cell hidden lg:table-cell">
                        {followDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CalendarClock size={12} style={{ color: isOverdue ? '#f87171' : '#94a3b8', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? '#f87171' : '#cbd5e1' }}>
                              {format(followDate, 'MMM d, h:mm a')}
                            </span>
                            {isRecurring && (
                              <span style={{ fontSize: 9.5, color: '#c084fc', background: 'rgba(167,139,250,.15)', padding: '1px 5px', borderRadius: 99, fontWeight: 700 }}>
                                🔄
                              </span>
                            )}
                            {isOverdue && (
                              <span style={{ fontSize: 9.5, color: '#f87171', background: 'rgba(239,68,68,.15)', padding: '1px 5px', borderRadius: 99, fontWeight: 700 }}>
                                Overdue
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#64748b' }}>—</span>
                        )}
                      </td>

                      {/* Added */}
                      <td className="tbody-cell hidden lg:table-cell" style={{ fontSize: 12, color: '#94a3b8' }}>
                        {lead.created_at ? format(new Date(lead.created_at), 'MMM d, yyyy') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="tbody-cell" style={{ textAlign: 'right', paddingRight: 20 }}>
                        <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                          {onFollowUp && (
                            <button
                              type="button"
                              title="Schedule Follow-up"
                              style={{
                                padding: 6, borderRadius: 8, border: 'none',
                                background: lead.followUp?.active ? 'rgba(76,110,245,.2)' : 'rgba(255,255,255,0.05)',
                                cursor: 'pointer', color: lead.followUp?.active ? '#77a8ff' : '#94a3b8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              onClick={e => { e.stopPropagation(); onFollowUp(lead) }}
                            >
                              <CalendarClock size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Edit Lead"
                            style={{
                              padding: 6, borderRadius: 8, border: 'none',
                              background: 'rgba(255,255,255,0.05)',
                              cursor: 'pointer', color: '#cbd5e1',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onClick={e => { e.stopPropagation(); onEdit(lead) }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            title="Delete Lead"
                            style={{
                              padding: 6, borderRadius: 8, border: 'none',
                              background: 'rgba(239,68,68,0.1)',
                              cursor: 'pointer', color: '#f87171',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onClick={e => { e.stopPropagation(); onDelete(lead._id ?? lead.id) }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Note sub-row */}
                    {note && (
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ paddingTop: 0, paddingBottom: 8, paddingLeft: 20 }}>
                          <div style={{ marginLeft: 15, width: 1, height: 12, background: 'rgba(76,110,245,0.3)' }} />
                        </td>
                        <td colSpan={6} style={{ paddingTop: 0, paddingBottom: 8, paddingLeft: 0, paddingRight: 20 }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#2A2A2A',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8, padding: '4px 10px', maxWidth: '100%',
                          }}>
                            <span style={{ fontSize: 11 }}>📝</span>
                            <span style={{ fontSize: 11.5, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {note}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
        </tbody>
      </table>
    </div>
  )
}

export default React.memo(LeadsTable)