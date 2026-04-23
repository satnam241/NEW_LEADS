import { useState } from 'react'
import { usePipeline, useUpdateLead } from '@/hooks/useLeads'
import { ContactButtons, Avatar } from '@/components/Shared'
import LeadModal from '@/components/modals/LeadModal'
import type { Lead, LeadStatus, LeadInsert } from '@/types'
import { format } from 'date-fns'
import { CalendarClock } from 'lucide-react'

const COLUMNS: { status: LeadStatus; label: string; color: string; bg: string; dot: string }[] = [
  { status: 'New',         label: 'New',         color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  { status: 'Contacted',   label: 'Contacted',   color: 'text-amber-700',  bg: 'bg-amber-50',  dot: 'bg-amber-500'  },
  { status: 'Negotiation', label: 'Negotiation', color: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500' },
  { status: 'Visitor',     label: 'Visitor',     color: 'text-cyan-700',   bg: 'bg-cyan-50',   dot: 'bg-cyan-500'   },
  { status: 'Closed',      label: 'Closed Won',  color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-500'  },
  { status: 'Lost',        label: 'Lost',        color: 'text-red-600',    bg: 'bg-red-50',    dot: 'bg-red-500'    },
]

function LeadCard({ lead, onEdit }: { lead: Lead; onEdit: (l: Lead) => void }) {
  return ( 
  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden" onClick={() => onEdit(lead)}>
      <div className="flex items-start gap-2 mb-2">
        <Avatar name={lead.name} size={7} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-xs leading-tight truncate">{lead.name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{lead.phone ?? lead.email ?? '—'}</p>
        </div>
      </div>
      <div className="text-[10px] text-slate-400 mb-2">
        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{lead.source}</span>
      </div>
      {lead.followup_date && !lead.followup_done && (
        <div className={`flex items-center gap-1 text-[10px] mb-2 ${new Date(lead.followup_date) < new Date() ? 'text-red-600' : 'text-amber-600'}`}>
          <CalendarClock size={9} />
          {format(new Date(lead.followup_date), 'MMM d')} — {lead.followup_note || 'Follow-up'}
        </div>
      )}
      {lead.note && <p className="text-[10px] text-slate-400 truncate mb-2">{lead.note}</p>}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
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
    if (editLead) await updateM.mutateAsync({ id: editLead.id, updates: data })
    setEditLead(null)
  }

  const byStatus = (status: LeadStatus) => allLeads.filter(l => l.status === status)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Pipeline</h1>
        <p className="page-sub">{allLeads.length} total leads across all stages</p>
      </div>

      {/* Summary bar */}
      <div className="flex gap-2 flex-wrap">
        {COLUMNS.map(col => {
          const count = byStatus(col.status).length
          const pct = allLeads.length > 0 ? Math.round((count / allLeads.length) * 100) : 0
          return (
            <div key={col.status} className={`${col.bg} border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
              <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
              <span className="text-xs text-slate-500">{count} · {pct}%</span>
            </div>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {COLUMNS.map(col => (
            <div key={col.status} className="space-y-2">
              <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
          {COLUMNS.map(col => {
            const colLeads = byStatus(col.status)
            return (
              <div key={col.status} className="min-w-0">
                {/* Column header */}
                <div className={`flex items-center justify-between mb-3 px-3 py-2 ${col.bg} rounded-xl border border-slate-200`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${col.color} bg-white px-1.5 py-0.5 rounded-full border border-slate-200`}>{colLeads.length}</span>
                </div>
                {/* Cards */}
                <div className="space-y-2">
                  {colLeads.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-300">No leads</p>
                    </div>
                  ) : (
                    colLeads.map(lead => <LeadCard key={lead.id} lead={lead} onEdit={setEditLead} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <LeadModal open={!!editLead} lead={editLead} onClose={() => setEditLead(null)} onSave={handleSave} isSaving={updateM.isPending} />
    </div>
  )
}