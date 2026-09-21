import { useState, useEffect } from 'react'
import { Plus, Upload } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import FilterBar from '@/components/FilterBar'
import LeadsTable from '@/components/LeadsTable'
import Pagination from '@/components/Pagination'
import LeadModal from '@/components/modals/LeadModal'
import FollowUpModal from '@/components/modals/FollowUpModal'
import ConfirmDialog from '@/components/modals/ConfirmDialog'
import ImportModal from '@/components/modals/ImportModal'
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useScheduleFollowUp,
} from '@/hooks/useLeads'
import type { Lead, LeadFilters, LeadInsert, LeadStatus, FollowUpRecurrence } from '@/types'

const DEFAULT_FILTERS: LeadFilters = {
  search: '',
  status: '',
  source: '',
  dateFrom: '',
  dateTo: '',
  interest: '',
}

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
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
  }
}

export default function LeadsPage() {
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState<LeadFilters>(() => ({
    ...DEFAULT_FILTERS,
    status: (searchParams.get('status') as LeadStatus) ?? '',
    interest: (searchParams.get('interest') as 'hot' | 'warm' | 'cold') ?? '',
  }))
  const [page, setPage]                 = useState(1)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editLead, setEditLead]         = useState<Lead | null>(null)
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null)
  const [deleteId, setDeleteId]         = useState<string | null>(null)
  const [importOpen, setImportOpen]     = useState(false)

  const { isMobile, isTablet } = useViewport()

  // Sync state if URL search parameters change (e.g. ?status=HOT or ?interest=hot)
  useEffect(() => {
    const statusParam = searchParams.get('status') as LeadStatus | null
    const interestParam = searchParams.get('interest') as 'hot' | 'warm' | 'cold' | null
    if (statusParam !== null || interestParam !== null) {
      setFilters(prev => ({
        ...prev,
        ...(statusParam !== null ? { status: statusParam || '' } : {}),
        ...(interestParam !== null ? { interest: interestParam || '' } : {}),
      }))
      setPage(1)
    }
  }, [searchParams])

  const { data, isLoading } = useLeads(filters, page)
  const leads = data?.data ?? []
  const total = data?.count ?? 0

  const createM   = useCreateLead()
  const updateM   = useUpdateLead()
  const deleteM   = useDeleteLead()
  const scheduleM = useScheduleFollowUp()

  const handleFilters = (f: LeadFilters) => {
    setFilters(f)
    setPage(1)
  }

  const handleSave = async (d: LeadInsert) => {
    try {
      if (editLead) {
        const id = editLead._id ?? editLead.id
        if (id) {
          await updateM.mutateAsync({ id, updates: d })
        }
      } else {
        await createM.mutateAsync(d)
      }
      setModalOpen(false)
      setEditLead(null)
    } catch (err) {
      console.error('Error saving lead:', err)
    }
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
    if (!id) return

    try {
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
    } catch (err) {
      console.error('Error scheduling followup:', err)
    }
  }

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateM.mutate({ id, updates: { status } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 22 }}>
      {/* Page Header matching NEW_LEADS - Copy (2) */}
      <div className="page-header" style={{
        background: "#3C3C3C",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        padding: isMobile ? "16px 16px" : isTablet ? "17px 20px" : "18px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,.18)",
      }}>
        <div>
          <h1 className="page-title" style={{ color: "#ffffff", fontSize: 28, fontWeight: 800, margin: 0 }}>
            All Leads
          </h1>
          <p className="page-sub" style={{ color: "#94a3b8", marginTop: 6 }}>
            {total.toLocaleString()} leads · filtered view
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            style={{
              height: 36,
              fontSize: 13,
              gap: 5,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => setImportOpen(true)}
          >
            <Upload size={13} /> Import
          </button>
          <button
            className="btn-primary"
            style={{
              height: 36,
              padding: "0 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg,#2563eb,#4f46e5)",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={() => {
              setEditLead(null)
              setModalOpen(true)
            }}
          >
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Main Table Card matching NEW_LEADS - Copy (2) */}
      <div className="card" style={{
        background: "#3C3C3C",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,.18)",
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 14px 10px' : '14px 18px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#ffffff', margin: 0 }}>Leads</p>
            <span
              style={{
                fontSize: 12,
                color: '#cbd5e1',
                background: 'rgba(255,255,255,.06)',
                padding: '2px 9px',
                borderRadius: 99,
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              {total.toLocaleString()}
            </span>
          </div>

          {/* 🎯 Quick Lead Temperature Filters (Hot, Warm, Cold) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleFilters({ ...filters, interest: '' })}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 11px',
                borderRadius: 6,
                border: !filters.interest ? '1px solid #4c6ef5' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                background: !filters.interest ? 'rgba(76,110,245,0.25)' : 'rgba(255,255,255,0.04)',
                color: !filters.interest ? '#77a8ff' : '#94a3b8',
                transition: 'all 0.15s ease',
              }}
            >
              All Leads
            </button>
            <button
              type="button"
              onClick={() => handleFilters({ ...filters, interest: filters.interest === 'hot' ? '' : 'hot' })}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 11px',
                borderRadius: 6,
                border: filters.interest === 'hot' ? '1.5px solid #ef4444' : '1px solid rgba(239,68,68,0.25)',
                cursor: 'pointer',
                background: filters.interest === 'hot' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.08)',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
                boxShadow: filters.interest === 'hot' ? '0 0 10px rgba(239,68,68,0.25)' : 'none',
              }}
              title="Filter by Hot Leads (Answered 2+ bot questions / high intent)"
            >
              🔥 Hot Leads
            </button>
            <button
              type="button"
              onClick={() => handleFilters({ ...filters, interest: filters.interest === 'warm' ? '' : 'warm' })}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 11px',
                borderRadius: 6,
                border: filters.interest === 'warm' ? '1.5px solid #f59e0b' : '1px solid rgba(245,158,11,0.25)',
                cursor: 'pointer',
                background: filters.interest === 'warm' ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.08)',
                color: '#fcd34d',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
                boxShadow: filters.interest === 'warm' ? '0 0 10px rgba(245,158,11,0.25)' : 'none',
              }}
              title="Filter by Warm Leads (Started bot flow / 1 answer)"
            >
              🌤️ Warm Leads
            </button>
            <button
              type="button"
              onClick={() => handleFilters({ ...filters, interest: filters.interest === 'cold' ? '' : 'cold' })}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 11px',
                borderRadius: 6,
                border: filters.interest === 'cold' ? '1.5px solid #3b82f6' : '1px solid rgba(59,130,246,0.25)',
                cursor: 'pointer',
                background: filters.interest === 'cold' ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.08)',
                color: '#93c5fd',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
                boxShadow: filters.interest === 'cold' ? '0 0 10px rgba(59,130,246,0.25)' : 'none',
              }}
              title="Filter by Cold Leads (No reply / bot not completed)"
            >
              ❄️ Cold Leads
            </button>
          </div>
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

        <div style={{
          padding: isMobile ? "12px 14px" : "16px 20px",
          borderTop: "1px solid rgba(255,255,255,.06)",
          background: "rgba(255,255,255,.02)",
        }}>
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete lead?"
        message="This is permanent and cannot be undone."
        onConfirm={async () => { await deleteM.mutateAsync(deleteId!); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteM.isPending}
      />

      {/* Import Modal */}
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}