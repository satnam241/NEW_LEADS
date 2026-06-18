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

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Negotiation', 'Visitor', 'Closed', 'Lost']
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

const STATUS_STYLES: Record<LeadStatus, { bg: string; color: string }> = {
  New:         { bg: '#3C3C3C', color: '#ffffff' },
  Contacted:   { bg: '#3C3C3C', color: '#f59e0b' },
  Interested:  { bg: '#3C3C3C', color: '#a855f7' },
  Negotiation: { bg: '#3C3C3C', color: '#9333ea' },
  Visitor:     { bg: '#3C3C3C', color: '#06b6d4' },
  Closed:      { bg: '#3C3C3C', color: '#22c55e' },
  Lost:        { bg: '#3C3C3C', color: '#ef4444' },
}

export default function LeadModal({ lead, open, onClose, onSave, isSaving }: Props) {
  const [form, setForm]     = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const firstRef            = useRef<HTMLInputElement>(null)

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
    <>
      <div
        className="modal-backdrop"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div style={{
          background: '#3C3C3C',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 20,
          width: 'calc(100% - 24px)',   /* mobile side gap */
          maxWidth: 540,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'clamp(14px, 4vw, 18px) clamp(14px, 4vw, 20px)',
            borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0,
          }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {lead ? '✏️ Edit Lead' : '➕ Add New Lead'}
              </h2>
              {lead && (
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, margin: '2px 0 0' }}>
                  {lead.source} · Added {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 6, borderRadius: 8,
                background: '#2a2d3e',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', color: '#94a3b8',
                display: 'flex', flexShrink: 0, marginLeft: 8,
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{
            padding: 'clamp(14px, 4vw, 20px)',
            overflowY: 'auto', flex: 1,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>

            {/* Name + Phone — stack on mobile */}
            <div className="lead-grid-2">
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  ref={firstRef}
                  className={`input-base ${errors.name ? 'border-red-400' : ''}`}
                  value={form.name}
                  onChange={set('name')}
                  style={inputStyle}
                />
                {errors.name && <p style={errStyle}>{errors.name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input className="input-base" value={form.phone} onChange={handlePhoneChange} style={inputStyle} />
              </div>
            </div>

            {/* Email + WhatsApp */}
            <div className="lead-grid-2">
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  className={`input-base ${errors.email ? 'border-red-400' : ''}`}
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  style={inputStyle}
                />
                {errors.email && <p style={errStyle}>{errors.email}</p>}
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <input className="input-base" value={form.whatsapp} onChange={set('whatsapp')} style={inputStyle} />
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
                  style={{ ...inputStyle, fontWeight: 600 }}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s} style={{
                      background: STATUS_STYLES[s]?.bg    ?? '#3C3C3C',
                      color:      STATUS_STYLES[s]?.color ?? '#fff',
                    }}>
                      {s}
                    </option>
                  ))}
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
                style={inputStyle}
              />
            </div>

          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap',
            padding: 'clamp(12px, 3vw, 14px) clamp(14px, 4vw, 20px)',
            borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0,
          }}>
            <button
              className="btn-secondary"
              onClick={onClose}
              style={{ height: 38, background: '#2a2d3e', color: '#fff', flex: '1 1 auto', maxWidth: 120 }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSaving}
              style={{
                height: 38, minWidth: 110, justifyContent: 'center',
                background: '#4c6ef5', flex: '1 1 auto', maxWidth: 160,
              }}
            >
              {isSaving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : lead ? 'Update' : 'Add Lead'
              }
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        /* Mobile pe single column, 480px+ pe 2 column */
        .lead-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 480px) {
          .lead-grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  height: 38,
  background: '#2a2d3e',
  color: '#fff',
  border: '1px solid rgba(255,255,255,.12)',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  display: 'block', marginBottom: 5,
}

const errStyle: React.CSSProperties = {
  fontSize: 11, color: '#ef4444', marginTop: 4,
}