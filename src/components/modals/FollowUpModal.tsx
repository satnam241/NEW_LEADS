import { useEffect, useState, useRef } from 'react'
import { X, Loader2, CalendarClock, RefreshCw, ExternalLink } from 'lucide-react'
import type { Lead, FollowUpRecurrence } from '@/types'
import CustomDateTimePicker from '@/components/CustomDateTimePicker'

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
  { value: 'once',     label: 'Once'     },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: '3days',    label: '3 Days'   },
  { value: 'weekly',   label: 'Weekly'   },
]

interface Form {
  followup_date:       string
  followup_note:       string
  followup_recurrence: FollowUpRecurrence
  followup_done:       boolean
}

const EMPTY: Form = {
  followup_date:       '',
  followup_note:       '',
  followup_recurrence: 'once',
  followup_done:       false,
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (f.followup_recurrence === 'once' && !f.followup_date) {
    e.followup_date = 'Please select a date or recurrence'
  }
  return e
}

function toDateTimeLocal(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function FollowUpModal({ lead, open, onClose, onSave, isSaving }: Props) {
  const [form,   setForm]   = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !lead) return

    const rawDate = lead.followup_date ?? lead.followUp?.date ?? ''
    const rawNote = lead.followup_note ?? lead.followUp?.message ?? ''
    const rawRec  = lead.followUp?.recurrence ?? 'once'
    const rawDone = lead.followup_done ?? false

    setForm({
      followup_date:       toDateTimeLocal(rawDate),
      followup_note:       rawNote,
      followup_recurrence: rawRec,
      followup_done:       rawDone,
    })
    setErrors({})
  }, [open, lead])

  if (!open || !lead) return null

  const isEditing = !!(lead.followup_date || lead.followUp?.date)

  const set = (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value
      setForm(f => ({ ...f, [k]: val }))
      if (errors[k as keyof Form]) setErrors(err => ({ ...err, [k]: undefined }))
    }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSave({
      date:          form.followup_date ? new Date(form.followup_date).toISOString() : undefined,
      message:       form.followup_note.trim() || undefined,
      recurrence:    form.followup_recurrence,
      whatsappOptIn: false,
      done:          form.followup_done,
    })
  }

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#3C3C3C',
        borderRadius: 16,
        width: 'calc(100% - 24px)',
        maxWidth: 480,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarClock size={16} style={{ color: '#77a8ff', flexShrink: 0 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
                {isEditing ? 'Update Follow-up' : 'Schedule Follow-up'}
              </h2>
            </div>
            <p style={{
              fontSize: 12, color: '#94a3b8', margin: '3px 0 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {lead.fullName ?? lead.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: 'none', cursor: 'pointer', display: 'flex', color: '#94a3b8',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto', flex: 1,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
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
                    padding: '7px 14px', borderRadius: 9,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${form.followup_recurrence === r.value ? '#4c6ef5' : 'rgba(255,255,255,0.1)'}`,
                    background: form.followup_recurrence === r.value ? 'rgba(76,110,245,0.2)' : '#2A2A2A',
                    color: form.followup_recurrence === r.value ? '#77a8ff' : '#cbd5e1',
                    display: 'flex', alignItems: 'center', gap: 6,
                    flex: '1 1 auto', justifyContent: 'center',
                  }}
                >
                  {r.value !== 'once' && <RefreshCw size={11} />}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Time Picker */}
          {form.followup_recurrence === 'once' && (
            <div>
              <label style={labelStyle}>Follow-up Date &amp; Time *</label>
              <CustomDateTimePicker
                value={form.followup_date}
                onChange={val => {
                  setForm(f => ({ ...f, followup_date: val }))
                  if (errors.followup_date) setErrors(e => ({ ...e, followup_date: undefined }))
                }}
                min={toDateTimeLocal(new Date().toISOString())}
                error={!!errors.followup_date}
              />
              {errors.followup_date && <p style={errStyle}>{errors.followup_date}</p>}
            </div>
          )}

          {/* Note */}
          <div>
            <label style={labelStyle}>Note / Reminder</label>
            <input
              ref={form.followup_recurrence !== 'once' ? firstRef : undefined}
              placeholder="e.g. Call about property visit..."
              value={form.followup_note}
              onChange={set('followup_note')}
              className="input-base"
              style={{ height: 40, background: '#2A2A2A' }}
            />
          </div>

          {/* Mark done checkbox */}
          {isEditing && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#4ade80',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <input
                type="checkbox"
                checked={form.followup_done}
                onChange={set('followup_done')}
                style={{ width: 16, height: 16, accentColor: '#22c55e', flexShrink: 0 }}
              />
              <span>Mark as completed</span>
            </label>
          )}

          {/* Current schedule info */}
          {lead.followUp?.date && (
            <div style={{
              background: '#2A2A2A',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '12px 14px',
              fontSize: 12, color: '#cbd5e1',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                Current Schedule
              </p>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                📅 {new Date(lead.followUp.date).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              {lead.followUp.recurrence && lead.followUp.recurrence !== 'once' && (
                <p style={{ margin: 0, color: '#c084fc' }}>🔄 Repeats: {lead.followUp.recurrence}</p>
              )}
              {lead.followUp.message && (
                <p style={{ margin: 0, wordBreak: 'break-word', color: '#e2e8f0' }}>📌 {lead.followUp.message}</p>
              )}

              {lead.followUp?.googleEventId && (
                <div style={{
                  marginTop: 8, padding: '8px 12px',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <p style={{ fontWeight: 600, color: '#4ade80', margin: 0, fontSize: 11.5 }}>
                    ✓ Google Calendar Synced
                  </p>
                  <button
                    onClick={() => window.open('https://calendar.google.com', '_blank')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 8px', background: 'transparent',
                      border: '1px solid rgba(34,197,94,0.4)',
                      borderRadius: 6, cursor: 'pointer', color: '#4ade80', fontSize: 11, fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={11} /> Open
                  </button>
                </div>
              )}
            </div>
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
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : isEditing ? 'Update Follow-up' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'block',
  marginBottom: 6,
}

const errStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#f87171',
  marginTop: 4,
}