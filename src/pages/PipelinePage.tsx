import { useState } from 'react'
import { usePipeline, useUpdateLead } from '@/hooks/useLeads'
import { ContactButtons, Avatar, SourceBadge } from '@/components/Shared'
import LeadModal from '@/components/modals/LeadModal'
import type { Lead, LeadStatus, LeadInsert } from '@/types'
import { format } from 'date-fns'
import { CalendarClock } from 'lucide-react'

const COLUMNS: { status: LeadStatus; label: string; color: string; bg: string; dot: string }[] = [
  { status: 'New',         label: 'New',         color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.14)',  dot: '#38bdf8' },
  { status: 'Contacted',   label: 'Contacted',   color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.14)',  dot: '#fbbf24' },
  { status: 'Negotiation', label: 'Negotiation', color: '#c084fc', bg: 'rgba(167, 139, 250, 0.14)', dot: '#c084fc' },
  { status: 'Visitor',     label: 'Visitor',     color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.14)',   dot: '#22d3ee' },
  { status: 'Closed',      label: 'Closed Won',  color: '#4ade80', bg: 'rgba(34, 197, 94, 0.14)',   dot: '#4ade80' },
  { status: 'Lost',        label: 'Lost',        color: '#f87171', bg: 'rgba(239, 68, 68, 0.14)',   dot: '#f87171' },
]

function LeadCard({ lead, onEdit }: { lead: Lead; onEdit: (l: Lead) => void }) {
  const isOverdue = lead.followup_date && new Date(lead.followup_date) < new Date() && !lead.followup_done

  return (
    <div
      className="card"
      onClick={() => onEdit(lead)}
      style={{
        padding: '12px 14px',
        cursor: 'pointer',
        background: '#2A2A2A',
        borderRadius: 12,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(76, 110, 245, 0.45)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <Avatar name={lead.name} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#ffffff',
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {lead.name}
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
                      ? 'rgba(239,68,68,0.18)'
                      : lead.interestLevel.toLowerCase() === 'warm'
                      ? 'rgba(245,158,11,0.18)'
                      : 'rgba(96,165,250,0.18)',
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
          <p style={{
            fontSize: 11, color: '#94a3b8', margin: '2px 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {lead.phone ?? lead.email ?? '—'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
        <SourceBadge source={lead.source} />
        {lead.assigned_to && (
          <span style={{ fontSize: 10.5, color: '#77a8ff', fontWeight: 600 }}>
            👤 {lead.assigned_to}
          </span>
        )}
      </div>

      {lead.followup_date && !lead.followup_done && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
          color: isOverdue ? '#f87171' : '#fbbf24',
          background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          padding: '3px 7px', borderRadius: 6,
        }}>
          <CalendarClock size={11} />
          <span style={{ fontWeight: 600 }}>
            {format(new Date(lead.followup_date), 'MMM d')}
          </span>
          <span style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            — {lead.followup_note || 'Follow-up'}
          </span>
        </div>
      )}

      {lead.note && (
        <p style={{
          fontSize: 11, color: '#cbd5e1', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          background: '#2A2A2A', padding: '3px 7px', borderRadius: 6,
        }}>
          {lead.note}
        </p>
      )}

      <div style={{ marginTop: 2 }} onClick={e => e.stopPropagation()}>
        <ContactButtons lead={lead} />
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { data: allLeads = [], isLoading } = usePipeline()
  const updateM = useUpdateLead()
  const [editLead, setEditLead] = useState<Lead | null>(null)

  const handleSave = async (data: LeadInsert) => {
    if (editLead) await updateM.mutateAsync({ id: editLead._id ?? editLead.id, updates: data })
    setEditLead(null)
  }

  const byStatus = (status: LeadStatus) => allLeads.filter(l => l.status === status)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Page Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <h1 className="page-title">Sales Pipeline</h1>
          <p className="page-sub">{allLeads.length} total leads moving through the stages</p>
        </div>
      </div>

      {/* Summary Chips Bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COLUMNS.map(col => {
          const count = byStatus(col.status).length
          const pct = allLeads.length > 0 ? Math.round((count / allLeads.length) * 100) : 0

          return (
            <div
              key={col.status}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 12px', borderRadius: 10,
                background: col.bg,
                border: `1px solid ${col.color}33`,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: col.color }}>{col.label}</span>
              <span style={{ fontSize: 11.5, color: '#cbd5e1', fontWeight: 600 }}>
                {count} <span style={{ color: '#94a3b8' }}>({pct}%)</span>
              </span>
            </div>
          )
        })}
      </div>

      {/* Kanban Board Grid */}
      {isLoading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {COLUMNS.map(col => (
            <div key={col.status} style={{ background: '#3C3C3C', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton" style={{ height: 32, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 90, borderRadius: 10 }} />
              <div className="skeleton" style={{ height: 90, borderRadius: 10 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          alignItems: 'flex-start',
        }}>
          {COLUMNS.map(col => {
            const colLeads = byStatus(col.status)

            return (
              <div
                key={col.status}
                style={{
                  background: '#3C3C3C',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Column header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 10,
                  background: col.bg, border: `1px solid ${col.color}22`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.dot }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: col.color }}>{col.label}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: col.color,
                    background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 99,
                  }}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 80 }}>
                  {colLeads.length === 0 ? (
                    <div style={{
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      borderRadius: 12, padding: '24px 12px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: 0 }}>No leads in this stage</p>
                    </div>
                  ) : (
                    colLeads.map(lead => (
                      <LeadCard
                        key={lead._id ?? lead.id}
                        lead={lead}
                        onEdit={setEditLead}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Lead Modal */}
      <LeadModal
        open={!!editLead}
        lead={editLead}
        onClose={() => setEditLead(null)}
        onSave={handleSave}
        isSaving={updateM.isPending}
      />
    </div>
  )
}