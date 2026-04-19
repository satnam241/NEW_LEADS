import { useEffect, useState, useRef } from 'react'
import { X, Loader2, CalendarClock, RefreshCw, MessageCircle } from 'lucide-react'
import type { Lead, FollowUpRecurrence } from '@/types'

interface Props {
  lead: Lead | null
  open: boolean
  onClose: () => void
  onSave: (payload: {
    date?: string
    message?: string
    recurrence: FollowUpRecurrence
    whatsappOptIn: boolean
    done?: boolean
  }) => void
  isSaving: boolean
}

const RECURRENCE_OPTIONS: { value: FollowUpRecurrence; label: string }[] = [
  { value: 'once',     label: 'Once' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: '3days',    label: '3 Days' },
  { value: 'weekly',   label: 'Weekly' },
]

interface Form {
  followup_date: string
  followup_note: string
  followup_recurrence: FollowUpRecurrence
  followup_whatsappOptIn: boolean
  followup_done: boolean
}

const EMPTY: Form = {
  followup_date: '',
  followup_note: '',
  followup_recurrence: 'once',
  followup_whatsappOptIn: false,
  followup_done: false,
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (f.followup_recurrence === 'once' && !f.followup_date) {
    e.followup_date = 'Date select karein ya recurrence choose karein'
  }
  return e
}

export default function FollowUpModal({ lead, open, onClose, onSave, isSaving }: Props) {
  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !lead) return
    setForm({
      followup_date:          lead.followup_date ?? lead.followUp?.date ?? '',
      followup_note:          lead.followup_note ?? lead.followUp?.message ?? '',
      followup_recurrence:    (lead.followUp?.recurrence as FollowUpRecurrence) ?? 'once',
      followup_whatsappOptIn: lead.followUp?.whatsappOptIn ?? false,
      followup_done:          lead.followup_done ?? false,
    })
    setErrors({})
    setTimeout(() => firstRef.current?.focus(), 80)
  }, [open, lead])

  const set = (key: keyof Form) => (e: any) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(err => ({ ...err, [key]: undefined }))
  }

  const handleSubmit = () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      date:          form.followup_date       || undefined,
      message:       form.followup_note       || undefined,
      recurrence:    form.followup_recurrence,
      whatsappOptIn: form.followup_whatsappOptIn,
      done:          form.followup_done,
    })
  }

  if (!open || !lead) return null

  const isEditing = !!lead.followUp?.active

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 460,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarClock size={16} style={{ color: '#7c3aed' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                {isEditing ? 'Update Follow-up' : 'Schedule Follow-up'}
              </h2>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
              {lead.fullName ?? lead.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer', color: '#64748b', display: 'flex' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Recurrence buttons */}
          <div>
            <label style={labelStyle}>Recurrence</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RECURRENCE_OPTIONS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setForm(f => ({ ...f, followup_recurrence: r.value }))
                    if (errors.followup_date) setErrors(e => ({ ...e, followup_date: undefined }))
                  }}
                  style={{
                    padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    border: `1.5px solid ${form.followup_recurrence === r.value ? '#7c3aed' : '#e2e8f0'}`,
                    background: form.followup_recurrence === r.value ? '#f5f3ff' : '#fff',
                    color: form.followup_recurrence === r.value ? '#7c3aed' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'all 120ms',
                  }}
                >
                  {r.value !== 'once' && <RefreshCw size={11} />}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date — only for 'once' */}
          {form.followup_recurrence === 'once' && (
            <div>
              <label style={labelStyle}>Follow-up Date *</label>
              <input
                ref={firstRef}
                type="date"
                className={`input-base ${errors.followup_date ? 'border-red-400' : ''}`}
                value={form.followup_date}
                onChange={set('followup_date')}
                min={new Date().toISOString().split('T')[0]}
                style={{ height: 40 }}
              />
              {errors.followup_date && <p style={errStyle}>{errors.followup_date}</p>}
            </div>
          )}

          {/* Note */}
          <div>
            <label style={labelStyle}>Note / Reminder</label>
            <input
              ref={form.followup_recurrence !== 'once' ? firstRef : undefined}
              className="input-base"
              placeholder="e.g. Call about property visit..."
              value={form.followup_note}
              onChange={set('followup_note')}
              style={{ height: 40 }}
            />
          </div>

          {/* WhatsApp opt-in */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={form.followup_whatsappOptIn}
              onChange={set('followup_whatsappOptIn')}
              style={{ width: 15, height: 15, accentColor: '#25d366' }}
            />
            <MessageCircle size={14} style={{ color: '#25d366' }} />
            WhatsApp reminder bhejo
          </label>

          {/* Mark done (only when editing existing follow-up) */}
          {isEditing && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              fontSize: 13, color: '#475569', fontWeight: 500,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <input
                type="checkbox"
                checked={form.followup_done}
                onChange={set('followup_done')}
                style={{ width: 15, height: 15, accentColor: '#16a34a' }}
              />
              ✅ Follow-up done mark karo
            </label>
          )}

          {/* Current follow-up info */}
          {lead.followUp?.date && (
            <div style={{
              background: '#f8fafc', border: '1px solid #f1f5f9',
              borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#64748b',
            }}>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>Current Schedule</p>
              <p>📅 {new Date(lead.followUp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              {lead.followUp.recurrence !== 'once' && (
                <p>🔄 Repeats: {lead.followUp.recurrence}</p>
              )}
              {lead.followUp.message && <p>📌 {lead.followUp.message}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 20px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <button className="btn-secondary" onClick={onClose} style={{ height: 38 }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSaving}
            style={{ height: 38, minWidth: 120, justifyContent: 'center', background: '#7c3aed', borderColor: '#7c3aed' }}
          >
            {isSaving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : isEditing ? '✅ Update Follow-up' : '📅 Schedule'
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
  display: 'block', marginBottom: 6,
}
const errStyle: React.CSSProperties = {
  fontSize: 11, color: '#ef4444', marginTop: 4,
}