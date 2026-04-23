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

// 🆕 Negotiation + Visitor added
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Negotiation', 'Visitor', 'Closed', 'Lost']

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  New:         { bg: '#f0f9ff', color: '#0284c7' },
  Contacted:   { bg: '#fffbeb', color: '#d97706' },
  Interested:  { bg: '#f5f3ff', color: '#7c3aed' },
  Negotiation: { bg: '#fdf4ff', color: '#9333ea' }, // 🆕
  Visitor:     { bg: '#ecfeff', color: '#0891b2' }, // 🆕
  Closed:      { bg: '#f0fdf4', color: '#16a34a' },
  Lost:        { bg: '#fef2f2', color: '#dc2626' },
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

  const colors = STATUS_COLORS[localStatus] ?? { bg: '#f8fafc', color: '#64748b' }

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
        <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', textDecoration: 'none' }}>
          <Phone size={10} style={{ color: '#94a3b8' }} />
          {lead.phone}
        </a>
      )}
      {lead.email && (
        <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', textDecoration: 'none', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
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
        <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>No leads found</p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
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
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >
                    <td className="tbody-cell" style={{ cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={displayName} size={8} />
                        <div>
                          <p style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{displayName}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{lead.email ?? lead.phone ?? '—'}</p>
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
                          <CalendarClock size={12} style={{ color: '#94a3b8' }} />
                          <span style={{ color: new Date(lead.followup_date) < new Date() && !lead.followup_done ? '#dc2626' : '#475569' }}>
                            {format(new Date(lead.followup_date), 'MMM d')}
                          </span>
                          {lead.followUp?.recurrence && lead.followUp.recurrence !== 'once' && (
                            <span style={{ fontSize: 10, color: '#7c3aed', background: '#f5f3ff', padding: '1px 5px', borderRadius: 99 }}>🔄</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>
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
                          style={{ padding: 5, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#eff4ff'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                          onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(lead) }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          title="Delete Lead"
                          style={{ padding: 5, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
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