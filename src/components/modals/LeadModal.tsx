import { useEffect, useState, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Lead, LeadInsert, LeadStatus, LeadSource } from '@/types'
import AssigneeSelect from '@/components/AssigneeSelect'

interface Props {
  lead?: Lead | null
  open: boolean
  onClose: () => void
  onSave: (data: LeadInsert) => void
  isSaving: boolean
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Negotiation', 'Visitor', 'Closed', 'Lost']
const SOURCES: LeadSource[]  = ['facebook', 'whatsapp', 'Meta Ads', 'Manual', 'Imported']

interface Form {
  name: string
  email: string
  phone: string
  whatsapp: string
  source: LeadSource
  status: LeadStatus
  interestLevel: 'hot' | 'warm' | 'cold' | ''
  note: string
  assigned_to: string
  assigned_by: string
}

const EMPTY: Form = {
  name: '', email: '', phone: '', whatsapp: '',
  source: 'Manual', status: 'New',
  interestLevel: '',
  note: '', assigned_to: '', assigned_by: '',
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (!f.name.trim()) e.name = 'Name is required'
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email'
  return e
}

const STATUS_STYLES: Record<LeadStatus, { bg: string; color: string }> = {
  New:         { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' },
  Contacted:   { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
  Interested:  { bg: 'rgba(167, 139, 250, 0.15)', color: '#c084fc' },
  Negotiation: { bg: 'rgba(192, 132, 252, 0.15)', color: '#d8b4fe' },
  Visitor:     { bg: 'rgba(6, 182, 212, 0.15)',  color: '#22d3ee' },
  Closed:      { bg: 'rgba(34, 197, 94, 0.15)',  color: '#4ade80' },
  Lost:        { bg: 'rgba(239, 68, 68, 0.15)',  color: '#f87171' },
}

export default function LeadModal({ lead, open, onClose, onSave, isSaving }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const firstRef            = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (lead) {
      setForm({
        name:          lead.fullName ?? lead.name ?? '',
        email:         lead.email       ?? '',
        phone:         lead.phone       ?? '',
        whatsapp:      lead.whatsapp    ?? '',
        source:        (lead.source as LeadSource) ?? 'Manual',
        status:        lead.status,
        interestLevel: ((lead.interestLevel as any) || '').toLowerCase(),
        note:          lead.note        ?? '',
        assigned_to:   lead.assigned_to ?? '',
        assigned_by:   lead.assigned_by ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
    setTimeout(() => firstRef.current?.focus(), 80)
  }, [open, lead])

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(err => ({ ...err, [k]: undefined }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm(f => ({ ...f, phone: val, whatsapp: f.whatsapp || val }))
    if (errors.phone) setErrors(err => ({ ...err, phone: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSave({
      name:          form.name.trim(),
      email:         form.email.trim()    || null,
      phone:         form.phone.trim()    || null,
      whatsapp:      form.whatsapp.trim() || null,
      source:        form.source,
      status:        form.status,
      interestLevel: form.interestLevel ? (form.interestLevel as 'hot' | 'warm' | 'cold') : null,
      note:          form.note.trim()     || null,
      assigned_to:   form.assigned_to     || null,
      assigned_by:   form.assigned_by     || null,
    })
  }

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#3C3C3C',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        width: 'calc(100% - 24px)',
        maxWidth: 540,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#343434',
          flexShrink: 0,
        }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
              {lead ? '✏️ Edit Lead' : '➕ Add New Lead'}
            </h2>
            {lead && (
              <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
                {lead.source} · Added {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: 'none', cursor: 'pointer', color: '#94a3b8',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto', flex: 1,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* Name + Phone */}
          <div className="lead-grid-2">
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                ref={firstRef}
                className="input-base"
                value={form.name}
                onChange={set('name')}
                placeholder="Client Name"
                style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : undefined }}
              />
              {errors.name && <p style={errStyle}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                className="input-base"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email + WhatsApp */}
          <div className="lead-grid-2">
            <div>
              <label style={labelStyle}>Email</label>
              <input
                className="input-base"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="client@example.com"
                style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : undefined }}
              />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input
                className="input-base"
                value={form.whatsapp}
                onChange={set('whatsapp')}
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Source + Status */}
          <div className="lead-grid-2">
            <div>
              <label style={labelStyle}>Source</label>
              <select className="input-base" value={form.source} onChange={set('source')} style={inputStyle}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                className="input-base"
                value={form.status}
                onChange={set('status')}
                style={{ ...inputStyle, fontWeight: 700 }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} style={{
                    background: '#2A2A2A',
                    color: STATUS_STYLES[s]?.color ?? '#fff',
                  }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lead Temperature / Interest (Hot / Warm / Cold) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...labelStyle, margin: 0 }}>Lead Interest</label>
              {form.interestLevel && (
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, interestLevel: '' }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: 11,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { val: '',     label: 'None', icon: '⚪', color: '#94a3b8', bg: 'rgba(255,255,255,0.06)' },
                { val: 'hot',  label: 'Hot',  icon: '🔥', color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.16)' },
                { val: 'warm', label: 'Warm', icon: '🌤️', color: '#fcd34d', bg: 'rgba(245, 158, 11, 0.16)' },
                { val: 'cold', label: 'Cold', icon: '❄️', color: '#93c5fd', bg: 'rgba(96, 165, 250, 0.16)' },
              ].map(opt => {
                const isSelected = form.interestLevel === opt.val
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, interestLevel: opt.val as any }))}
                    style={{
                      padding: '8px 6px',
                      borderRadius: 8,
                      border: isSelected ? `2px solid ${opt.color}` : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? opt.bg : 'rgba(255,255,255,0.03)',
                      color: isSelected ? opt.color : '#94a3b8',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={labelStyle}>Note</label>
            <input
              className="input-base"
              placeholder="Requirement, property type, or note..."
              value={form.note}
              onChange={set('note')}
              style={inputStyle}
            />
          </div>

          {/* Assign to / Assign by */}
          <div className="lead-grid-2">
            <div>
              <label style={labelStyle}>Assigned By</label>
              <AssigneeSelect
                value={form.assigned_by}
                onChange={v => setForm(f => ({ ...f, assigned_by: v }))}
                fieldName="assignedBy"
              />
            </div>
            <div>
              <label style={labelStyle}>Assigned To</label>
              <AssigneeSelect
                value={form.assigned_to}
                onChange={v => setForm(f => ({ ...f, assigned_to: v }))}
                fieldName="assignedTo"
              />
            </div>
          </div>

          {lead?.assigned_to && lead?.assigned_by && (
            <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>
              🕓 <strong style={{ color: '#ffffff' }}>{lead.assigned_by}</strong> assigned to{' '}
              <strong style={{ color: '#77a8ff' }}>{lead.assigned_to}</strong>
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#343434',
          flexShrink: 0,
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ height: 38, padding: '0 16px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSaving}
            style={{ height: 38, padding: '0 20px' }}
          >
            {isSaving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : lead ? 'Update Lead' : 'Add Lead'
            }
          </button>
        </div>
      </div>

      <style>{`
        .lead-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .lead-grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  height: 38,
  background: '#2A2A2A',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'block',
  marginBottom: 5,
}

const errStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#f87171',
  marginTop: 4,
}