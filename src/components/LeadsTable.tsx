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
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Negotiation', 'Visitor', 'Closed', 'Lost']

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  New:         { bg: 'rgba(2,132,199,.16)', color: '#38bdf8' },
  Contacted:   { bg: 'rgba(2,132,199,.16)', color: '#f59e0b' },
  Interested:  { bg: 'rgba(2,132,199,.16)', color: '#a78bfa' },
  Negotiation: { bg: 'rgba(2,132,199,.16)', color: '#c084fc' }, 
  Visitor:     { bg: 'rgba(2,132,199,.16)', color: '#22d3ee' }, 
  Closed:      { bg: 'rgba(2,132,199,.16)', color: '#4ade80' },
  Lost:        { bg: 'rgba(2,132,199,.16)', color: '#f87171' },
}

const StatusSelect = React.memo(function StatusSelect({
  lead,
  onChange,
}: {
  lead: Lead
  onChange?: (id: string, s: LeadStatus) => void
}) {
  const [localStatus, setLocalStatus] = useState<LeadStatus>(lead.status)

  React.useEffect(() => {
    setLocalStatus(lead.status)
  }, [lead.status])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const next = e.target.value as LeadStatus
    setLocalStatus(next)
    onChange?.(lead._id ?? lead.id, next)
  }

  const colors = STATUS_COLORS[localStatus] ?? { bg: '#3C3C3C', color: '#ffffff' }

  return (
    <select
      value={localStatus}
      onClick={e => e.stopPropagation()}
      onChange={handleChange}
      style={{
        fontSize: 11, fontWeight: 600,
        padding: '3px 8px', borderRadius: 99,
        border: 'none', outline: 'none', cursor: 'pointer',
        background: colors.bg, color: colors.color,
        appearance: 'none', WebkitAppearance: 'none',
        minWidth: 100,
      }}
    >
      {STATUSES.map(s => (
        <option key={s} value={s} style={{
          background: STATUS_COLORS[s]?.bg    ?? '#fff',
          color:      STATUS_COLORS[s]?.color ?? '#374151',
        }}>
          {s}
        </option>
      ))}
    </select>
  )
})

const ContactCell = React.memo(function ContactCell({ lead }: { lead: Lead }) {
  const waNum = (lead.whatsapp ?? lead.phone)?.replace(/\D/g, '')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lead.phone && (
        <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#e2e8f0', textDecoration: 'none',background:'rgba(255,255,255,.04)',padding:'8px 10px',borderRadius:10,transition:'all .2s' }}>
          <Phone size={10} style={{ color: '#94a3b8' }} />
          {lead.phone}
        </a>
      )}
      {lead.email && (
        <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#cbd5e1', textDecoration: 'none', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Mail size={10} />
          {lead.email}
        </a>
      )}
      {waNum && (
        <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', textDecoration: 'none' }}>
          <MessageCircle size={10} />
          WhatsApp
        </a>
      )}
    </div>
  )
})

const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
    {[...Array(7)].map((_, i) => (
      <td key={i} style={{ padding: '12px 16px' }}>
        <div className="skeleton" style={{ height: 12, width: `${50 + (i * 17) % 40}%`, borderRadius: 6 }} />
      </td>
    ))}
  </tr>
)

function LeadsTable({ leads, isLoading, onEdit, onDelete, onFollowUp, onStatusChange }: Props) {
  if (!isLoading && leads.length === 0) {
    return (
      <div style={{ padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>No leads found</p>
        <p style={{ fontSize: 12, color: '#ffffff', marginTop: 4 }}>Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto',background:'#3C3C3C' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead style={{background:'#3C3C3C'}} >
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <th className="thead-cell">Lead</th>
            <th className="thead-cell hidden md:table-cell">Contact</th>
            <th className="thead-cell">Source</th>
            <th className="thead-cell">Status</th>
            <th className="thead-cell hidden lg:table-cell">Follow-up</th>
            <th className="thead-cell hidden lg:table-cell">Added</th>
            <th className="thead-cell" style={{ width: 110 }}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            : leads.map(lead => {
                const displayName = (lead.fullName ?? lead.name ?? '').trim() || 'Unknown'
                const rowKey = lead._id ?? lead.id

                return (
                  <tr
                    key={rowKey}
                    className="tbody-row"
                    style={{ transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td className="tbody-cell" style={{ cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={displayName} size={22} />
                        <div>
                          <p style={{ fontWeight: 600, color: '#94a3b8', fontSize: 13 }}>{displayName}</p>
                          <p style={{ fontSize: 11, color: '#ffffff' }}>{lead.email ?? lead.phone ?? '—'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="tbody-cell hidden md:table-cell">
                      <ContactCell lead={lead} />
                    </td>

                    <td className="tbody-cell" style={{ cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      <SourceBadge source={lead.source} />
                    </td>

                    <td className="tbody-cell">
                      <StatusSelect lead={lead} onChange={onStatusChange} />
                    </td>

                    <td className="tbody-cell hidden lg:table-cell" style={{ cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      {lead.followup_date ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <CalendarClock size={12} style={{ color: '#ffffff' }} />
                          <span style={{ color: new Date(lead.followup_date) < new Date() && !lead.followup_done ? '#dc2626' : '#cbd5e1' }}>
                            {format(new Date(lead.followup_date), 'MMM d')}
                          </span>
                          {lead.followUp?.recurrence && lead.followUp.recurrence !== 'once' && (
                            <span style={{ fontSize: 10, color: '#ffffff', background: '#f5f3ff', padding: '1px 5px', borderRadius: 99 }}>🔄</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#010c1b' }}>—</span>
                      )}
                    </td>

                    <td className="tbody-cell hidden lg:table-cell" style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      {lead.created_at ? format(new Date(lead.created_at), 'MMM d') : '—'}
                    </td>

                    <td className="tbody-cell" style={{ pointerEvents: 'all' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {onFollowUp && (
                          <button
                            type="button"
                            title="Schedule Follow-up"
                            style={{
                              padding: 5, borderRadius: 6, border: 'none',
                              background: lead.followUp?.active ? '#f5f3ff' : 'transparent',
                              cursor: 'pointer',
                              color: lead.followUp?.active ? '#7c3aed' : '#94a3b8',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f5f3ff'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = lead.followUp?.active ? '#f5f3ff' : 'transparent'}
                            onClick={e => { e.preventDefault(); e.stopPropagation(); onFollowUp(lead) }}
                          >
                            <CalendarClock size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          title="Edit Lead"
                          style={{ padding: 5, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                          onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(lead) }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          title="Delete Lead"
                          style={{ padding: 5, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.12)'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                          onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(lead._id ?? lead.id) }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
        </tbody>
      </table>
    </div>
  )
}

export default React.memo(LeadsTable)