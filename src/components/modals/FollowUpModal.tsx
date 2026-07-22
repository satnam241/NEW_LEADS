import { useEffect, useState, useRef } from 'react'
import { X, Loader2, CalendarClock, RefreshCw, ExternalLink } from 'lucide-react'
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
    e.followup_date = 'Date select karo ya recurrence choose karo'
  }
  return e
}

// datetime-local input needs "yyyy-MM-ddTHH:mm" — safely convert any date source
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
    setForm({
      // ✅ FIX — pehle ye line syntactically broken thi. Ab lead.followUp?.date
      // (raw ISO datetime, jisme time hota hai) ko priority di jaati hai,
      // aur datetime-local input ke liye sahi format mein convert kiya jaata hai.
      followup_date:       toDateTimeLocal(lead.followUp?.date ?? lead.followup_date),
      followup_note:       lead.followup_note ?? lead.followUp?.message ?? '',
      followup_recurrence: (lead.followUp?.recurrence as FollowUpRecurrence) ?? 'once',
      followup_done:       lead.followup_done ?? false,
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
      date:          form.followup_date || undefined,
      message:       form.followup_note || undefined,
      recurrence:    form.followup_recurrence,
      whatsappOptIn: false, // ✅ WhatsApp reminder UI se hataya gaya
      done:          form.followup_done,
    })
  }

  if (!open || !lead) return null

  const isEditing = !!lead.followUp?.active

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          padding: '12px',
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div style={{
          background: '#3C3C3C',
          borderRadius: 16,
          width: '100%',
          maxWidth: 460,
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.06)',
          animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'clamp(14px, 4vw, 16px) clamp(14px, 4vw, 20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarClock size={16} style={{ color: '#77a8ff', flexShrink: 0 }} />
                <h2 style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {isEditing ? 'Update Follow-up' : 'Schedule Follow-up'}
                </h2>
              </div>
              <p style={{
                fontSize: 12, color: '#cbd5e1', margin: '3px 0 0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {lead.fullName ?? lead.name}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 6, borderRadius: 8,
                background: '#2a2a2a',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', display: 'flex', color: '#cbd5e1',
                flexShrink: 0, marginLeft: 8,
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{
            padding: 'clamp(14px, 4vw, 20px)',
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
                      padding: '7px 14px', borderRadius: 10,
                      fontSize: 'clamp(11px, 3vw, 12px)',
                      fontWeight: 500, cursor: 'pointer',
                      border: `1.5px solid ${form.followup_recurrence === r.value ? '#4c6ef5' : 'rgba(255,255,255,0.12)'}`,
                      background: form.followup_recurrence === r.value ? 'rgba(76,111,245,.18)' : '#2f2f2f',
                      color: form.followup_recurrence === r.value ? '#8bb4ff' : '#d1d5db',
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'all 120ms',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: 70,
                    }}
                  >
                    {r.value !== 'once' && <RefreshCw size={11} />}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Time */}
            {form.followup_recurrence === 'once' && (
              <div>
                <label style={labelStyle}>Follow-up Date &amp; Time *</label>
                <input
                  ref={firstRef}
                  type="datetime-local"
                  value={form.followup_date}
                  onChange={set('followup_date')}
                  min={toDateTimeLocal(new Date().toISOString())}
                  style={{
                    width: '100%', height: 40, borderRadius: 8,
                    border: `1px solid ${errors.followup_date ? '#ef4444' : 'rgba(255,255,255,.08)'}`,
                    padding: '0 12px', fontSize: 13, outline: 'none',
                    boxSizing: 'border-box',
                    background: '#2a2a2a', color: '#fff',
                    colorScheme: 'dark',
                  }}
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
                style={{
                  width: '100%', height: 40, borderRadius: 8,
                  border: '1px solid rgba(255,255,255,.08)',
                  padding: '0 12px', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                  background: '#2a2a2a', color: '#ffffff',
                }}
              />
            </div>

            {/* Mark done */}
            {isEditing && (
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#cbd5e1',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 10, padding: '10px 14px',
              }}>
                <input
                  type="checkbox"
                  checked={form.followup_done}
                  onChange={set('followup_done')}
                  style={{ width: 15, height: 15, accentColor: '#22c55e', flexShrink: 0 }}
                />
                <span style={{ color: '#22c55e' }}>✅ Follow-up done</span>
              </label>
            )}

            {/* Current schedule info */}
            {lead.followUp?.date && (
              <div style={{
                background: '#2a2a2a',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 12, color: '#cbd5e1',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <p style={{ fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>
                  Current Schedule
                </p>
                <p style={{ margin: 0 }}>
                  📅{' '}
                  {new Date(lead.followUp.date).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                {lead.followUp.recurrence && lead.followUp.recurrence !== 'once' && (
                  <p style={{ margin: 0 }}>🔄 Repeats: {lead.followUp.recurrence}</p>
                )}
                {lead.followUp.message && (
                  <p style={{ margin: 0, wordBreak: 'break-word' }}>📌 {lead.followUp.message}</p>
                )}

                {lead.followUp?.googleEventId && (
                  <div style={{
                    marginTop: 10, padding: '10px 12px',
                    background: 'rgba(22,163,74,.08)',
                    border: '1px solid rgba(22,163,74,.18)',
                    borderRadius: 10,
                  }}>
                    <p style={{ fontWeight: 600, color: '#4ade80', margin: '0 0 3px', fontSize: 12 }}>
                      📅 Google Calendar Synced
                    </p>
                    <p style={{ fontSize: 11, margin: '0 0 8px', color: '#86efac' }}>
                      Reminder active hai
                    </p>
                    <button
                      onClick={() => window.open('https://calendar.google.com', '_blank')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px',
                        background: '#2a2a2a',
                        border: '1px solid rgba(22,163,74,0.4)',
                        borderRadius: 8, cursor: 'pointer',
                        color: '#4ade80', fontSize: 11, fontWeight: 600,
                      }}
                    >
                      <ExternalLink size={11} />
                      Open Calendar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap',
            padding: 'clamp(12px, 3vw, 14px) clamp(14px, 4vw, 20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px', borderRadius: 8, height: 38,
                flex: '1 1 auto', maxWidth: 120,
                border: '1px solid rgba(255,255,255,0.12)',
                background: '#2a2a2a', fontSize: 13,
                cursor: 'pointer', color: '#ffffff', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              style={{
                padding: '8px 20px', borderRadius: 8, height: 38,
                flex: '1 1 auto', maxWidth: 180,
                border: 'none',
                background: isSaving ? '#555' : '#4c6ef5',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  Saving…
                </>
              ) : isEditing ? 'Update Follow-up' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#cbd5e1',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  display: 'block', marginBottom: 6,
}

const errStyle: React.CSSProperties = {
  fontSize: 11, color: '#ef4444', marginTop: 4, margin: '4px 0 0',
}