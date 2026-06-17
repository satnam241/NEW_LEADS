
import { useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import FilterBar from '@/components/FilterBar'
import LeadsTable from '@/components/LeadsTable'
import Pagination from '@/components/Pagination'
import LeadModal from '@/components/modals/LeadModal'
import FollowUpModal from '@/components/modals/FollowUpModal'
import ConfirmDialog from '@/components/modals/ConfirmDialog'
import ImportModal from '@/components/modals/ImportModal'
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useScheduleFollowUp } from '@/hooks/useLeads'
import type { Lead, LeadFilters, LeadInsert, LeadStatus, FollowUpRecurrence } from '@/types'

const DEFAULT_FILTERS: LeadFilters = { search: '', status: '', source: '', dateFrom: '', dateTo: '' }

export default function LeadsPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters]           = useState<LeadFilters>({ ...DEFAULT_FILTERS, status: (searchParams.get('status') as LeadStatus) ?? '' })
  const [page, setPage]                 = useState(1)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editLead, setEditLead]         = useState<Lead | null>(null)
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null)
  const [deleteId, setDeleteId]         = useState<string | null>(null)
  const [importOpen, setImportOpen]     = useState(false)

  const { data, isLoading } = useLeads(filters, page)
  const leads = data?.data ?? []
  const total = data?.count ?? 0

  const createM   = useCreateLead()
  const updateM   = useUpdateLead()
  const deleteM   = useDeleteLead()
  const scheduleM = useScheduleFollowUp()

  const handleFilters = (f: LeadFilters) => { setFilters(f); setPage(1) }

  const handleSave = async (d: LeadInsert) => {
    if (editLead) await updateM.mutateAsync({ id: editLead._id ?? editLead.id, updates: d })
    else          await createM.mutateAsync(d)
    setModalOpen(false)
    setEditLead(null)
  }

  const handleFollowUpSave = async (payload: {
    date?: string
    message?: string
    recurrence: FollowUpRecurrence
    whatsappOptIn: boolean
    done?: boolean
  }) => {
    if (!followUpLead) return
    const id = followUpLead._id ?? followUpLead.id
    await scheduleM.mutateAsync({
      id,
      payload: {
        date:          payload.date,
        message:       payload.message,
        recurrence:    payload.recurrence,
        whatsappOptIn: payload.whatsappOptIn,
      },
    })
    if (payload.done) {
      await updateM.mutateAsync({ id, updates: { followup_done: true } })
    }
    setFollowUpLead(null)
  }

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateM.mutate({ id, updates: { status } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div className="page-header" style={{background:"#3C3C3C",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 10px 30px rgba(0,0,0,.18)"}}>
        <div>
          <h1 className="page-title" style={{color:"#ffffff",fontSize:28,fontWeight:800,margin:0}}>All Leads</h1>
          <p className="page-sub" style={{color:"#94a3b8",marginTop:6}}>{total.toLocaleString()} leads · filtered view</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ height: 36, fontSize: 13, gap: 5,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",color:"#ffffff",display:"flex",
}} onClick={() => setImportOpen(true)}>
            <Upload size={13} /> Import
          </button>
          <button className="btn-primary" style={{ height: 36,padding:"0 18px",borderRadius:10,background:"linear-gradient(135deg,#2563eb,#4f46e5)", border:"none",color:"#fff",display:"flex",alignItems:"center"}} onClick={() => { setEditLead(null); setModalOpen(true) }}>
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{background:"#3C3C3C",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,overflow:"hidden",boxShadow:"0 10px 30px rgba(0,0,0,.18)"}}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 0',borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#ffffff' }}>Leads</p>
          <span style={{ fontSize: 12, color: '#cbd5e1', background: 'rgba(255,255,255,.06)', padding: '2px 9px', borderRadius: 99, border: '1px solid  rgba(255,255,255,.08)' }}>
            {total.toLocaleString()}
          </span>
        </div>
        <FilterBar filters={filters} onChange={handleFilters} />
        <LeadsTable
          leads={leads}
          isLoading={isLoading}
          onEdit={l => { setEditLead(l); setModalOpen(true) }}
          onDelete={id => setDeleteId(id)}
          onFollowUp={l => setFollowUpLead(l)}
          onStatusChange={handleStatusChange}
        />
          <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(255,255,255,.02)"}}>
           <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
             </div>
          </div>
      {/* Lead Modal */}
      <LeadModal
        open={modalOpen}
        lead={editLead}
        onClose={() => { setModalOpen(false); setEditLead(null) }}
        onSave={handleSave}
        isSaving={createM.isPending || updateM.isPending}
      />

      {/* Follow-up Modal */}
      <FollowUpModal
        open={!!followUpLead}
        lead={followUpLead}
        onClose={() => setFollowUpLead(null)}
        onSave={handleFollowUpSave}
        isSaving={scheduleM.isPending || updateM.isPending}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete lead?"
        message="This is permanent and cannot be undone."
        onConfirm={async () => { await deleteM.mutateAsync(deleteId!); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteM.isPending}
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}