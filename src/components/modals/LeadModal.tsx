
import { useEffect, useState, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Lead, LeadInsert, LeadStatus, LeadSource } from '@/types'

interface Props {
  lead?: Lead | null
  open: boolean
  onClose: () => void
  onSave: (data: LeadInsert) => void
  isSaving: boolean
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']
const SOURCES: LeadSource[]  = ['facebook', 'whatsapp', 'Meta Ads', 'Manual', 'Imported']

interface Form {
  name: string
  email: string
  phone: string
  whatsapp: string
  source: LeadSource
  status: LeadStatus
  note: string
  assigned_to: string
}

const EMPTY: Form = {
  name: '', email: '', phone: '', whatsapp: '',
  source: 'Manual', status: 'New',
  note: '', assigned_to: '',
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (!f.name.trim()) e.name = 'Name required hai'
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email'
  return e
}

export default function LeadModal({ lead, open, onClose, onSave, isSaving }: Props) {
  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (lead) {
      setForm({
        name:        lead.fullName ?? lead.name ?? '',
        email:       lead.email       ?? '',
        phone:       lead.phone       ?? '',
        whatsapp:    lead.whatsapp    ?? '',
        source:      (lead.source as LeadSource) ?? 'Manual',
        status:      lead.status,
        note:        lead.note        ?? '',
        assigned_to: lead.assigned_to ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
    setTimeout(() => firstRef.current?.focus(), 80)
  }, [open, lead])

  const set = (key: keyof Form) => (e: any) => {
    const val = e.target.value
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(err => ({ ...err, [key]: undefined }))
  }

  // Auto-fill phone → whatsapp
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm(f => ({ ...f, phone: val, whatsapp: f.whatsapp || val }))
  }

  const handleSubmit = () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name:        form.name,
      email:       form.email       || null,
      phone:       form.phone       || null,
      whatsapp:    form.whatsapp    || null,
      source:      form.source,
      status:      form.status,
      note:        form.note        || null,
      assigned_to: form.assigned_to || null,
    })
  }

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 540,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
        animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {lead ? '✏️ Edit Lead' : '➕ Add New Lead'}
            </h2>
            {lead && (
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {lead.source} · Added {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer', color: '#64748b', display: 'flex' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                ref={firstRef}
                className={`input-base ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={set('name')}
                style={{ height: 38 }}
              />
              {errors.name && <p style={errStyle}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input className="input-base" value={form.phone} onChange={handlePhoneChange} style={{ height: 38 }} />
            </div>
          </div>

          {/* Email + WhatsApp */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                className={`input-base ${errors.email ? 'border-red-400' : ''}`}
                type="email"
                value={form.email}
                onChange={set('email')}
                style={{ height: 38 }}
              />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input className="input-base" value={form.whatsapp} onChange={set('whatsapp')} style={{ height: 38 }} />
            </div>
          </div>

          {/* Source + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Source</label>
              <select className="input-base" value={form.source} onChange={set('source')} style={{ height: 38 }}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                className="input-base"
                value={form.status}
                onChange={set('status')}
                style={{
                  height: 38,
                  background:
                    form.status === 'Interested' ? '#f5f3ff' :
                    form.status === 'Contacted'  ? '#fffbeb' :
                    form.status === 'Closed'     ? '#f0fdf4' :
                    form.status === 'Lost'       ? '#fef2f2' : '#fff',
                  color:
                    form.status === 'Interested' ? '#7c3aed' :
                    form.status === 'Contacted'  ? '#d97706' :
                    form.status === 'Closed'     ? '#15803d' :
                    form.status === 'Lost'       ? '#dc2626' : '#374151',
                  fontWeight: 600,
                }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={labelStyle}>Note</label>
            <input
              className="input-base"
              placeholder="Write note..."
              value={form.note}
              onChange={set('note')}
              style={{ height: 38 }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 20px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <button className="btn-secondary" onClick={onClose} style={{ height: 38 }}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSaving}
            style={{ height: 38, minWidth: 90, justifyContent: 'center' }}
          >
            {isSaving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : lead ? 'Update' : 'Add Lead'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  display: 'block', marginBottom: 5,
}
const errStyle: React.CSSProperties = {
  fontSize: 11, color: '#ef4444', marginTop: 4,
}