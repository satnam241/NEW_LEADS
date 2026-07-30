import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface Props {
  value: string
  onChange: (val: string) => void
  min?: string
  error?: boolean
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function pad(n: number) { return String(n).padStart(2, '0') }

function parseValue(val: string): Date | null {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function toLocalString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Analog clock face — click ya drag karke hour/minute select karo ─────────
const CLOCK_SIZE = 200
const CENTER     = CLOCK_SIZE / 2
const RADIUS     = CENTER - 24

function ClockFace({
  mode,          // 'hour' | 'minute'
  hour12,        // 1-12 or null
  minute,        // 0-59 or null
  onPick,
}: {
  mode: 'hour' | 'minute'
  hour12: number | null
  minute: number | null
  onPick: (v: number) => void
}) {
  const faceRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const valueFromPoint = (clientX: number, clientY: number): number => {
    const rect = faceRef.current!.getBoundingClientRect()
    const x = clientX - (rect.left + rect.width / 2)
    const y = clientY - (rect.top + rect.height / 2)
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360

    if (mode === 'hour') {
      let h = Math.round(angle / 30) % 12
      if (h === 0) h = 12
      return h
    } else {
      let m = Math.round(angle / 6) % 60
      return m
    }
  }

  const handlePointer = (e: React.PointerEvent) => {
    const v = valueFromPoint(e.clientX, e.clientY)
    onPick(v)
  }

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDragging(true)
    handlePointer(e)
  }
  const onMove = (e: React.PointerEvent) => { if (dragging) handlePointer(e) }
  const onUp   = () => setDragging(false)

  const current  = mode === 'hour' ? hour12 : minute
  const total    = mode === 'hour' ? 12 : 60
  const angleDeg = current === null ? 0 : (current % total) * (360 / total) - 90
  const rad      = (angleDeg * Math.PI) / 180
  const handX    = CENTER + RADIUS * Math.cos(rad)
  const handY    = CENTER + RADIUS * Math.sin(rad)

  // labels: hour -> 1..12 ; minute -> 0,5,10...55
  const labels = mode === 'hour'
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 12 }, (_, i) => i * 5)

  return (
    <div
      ref={faceRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      style={{
        position: 'relative', width: CLOCK_SIZE, height: CLOCK_SIZE,
        borderRadius: '50%', background: '#242424',
        border: '1px solid rgba(255,255,255,.08)',
        touchAction: 'none', cursor: 'pointer', flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Center dot */}
      <div style={{
        position: 'absolute', top: CENTER - 3, left: CENTER - 3,
        width: 6, height: 6, borderRadius: '50%', background: '#4c6ef5', zIndex: 3,
      }} />

      {/* Hand */}
      {current !== null && (
        <svg width={CLOCK_SIZE} height={CLOCK_SIZE} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <line x1={CENTER} y1={CENTER} x2={handX} y2={handY} stroke="#4c6ef5" strokeWidth={2} />
          <circle cx={handX} cy={handY} r={15} fill="rgba(76,111,245,.25)" />
        </svg>
      )}

      {/* Number labels around the clock */}
      {labels.map((label, i) => {
  const a = mode === 'hour'
    ? (label % 12) * 30 - 90   // ✅ 12 -> top, 1 -> 30°, ... 11 -> 330°
    : i * 30 - 90              // minute already correct as-is
  const r = (a * Math.PI) / 180
  const lx = CENTER + RADIUS * Math.cos(r)
  const ly = CENTER + RADIUS * Math.sin(r)
  const isActive = current !== null && current === label
  return (
    <div
      key={label}
      style={{
        position: 'absolute', top: ly - 12, left: lx - 12,
        width: 24, height: 24, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: isActive ? 700 : 500,
        color: isActive ? '#fff' : '#9ca3af',
        zIndex: 2, pointerEvents: 'none',
      }}
    >
      {mode === 'minute' ? pad(label) : label}
    </div>
  )
})}
     
    </div>
  )
}

export default function CustomDateTimePicker({ value, onChange, min, error }: Props) {
  const [open, setOpen]           = useState(false)
  const [step, setStep]           = useState<'calendar' | 'hour' | 'minute'>('calendar')
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseValue(value) ?? new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = parseValue(value)
  const minDate  = parseValue(min ?? '')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setStep('calendar') }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const commit = (d: Date) => onChange(toLocalString(d))

  const pickDay = (day: number) => {
    const base = selected ?? new Date()
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, base.getHours(), base.getMinutes())
    commit(next)
    setStep('hour')   // date choose karte hi seedha hour-picker khul jaye
  }

  const setHour12 = (h12: number) => {
    const base = selected ?? new Date()
    const isPM = base.getHours() >= 12
    const h24  = isPM ? (h12 % 12) + 12 : (h12 % 12)
    commit(new Date(base.getFullYear(), base.getMonth(), base.getDate(), h24, base.getMinutes()))
  }
  const setMinute = (m: number) => {
    const base = selected ?? new Date()
    commit(new Date(base.getFullYear(), base.getMonth(), base.getDate(), base.getHours(), m))
  }
  const setAmPm = (pm: boolean) => {
    const base = selected ?? new Date()
    const h12  = base.getHours() % 12
    commit(new Date(base.getFullYear(), base.getMonth(), base.getDate(), pm ? h12 + 12 : h12, base.getMinutes()))
  }

  const firstDayIdx = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDayIdx).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const isDisabled = (day: number) => {
    if (!minDate) return false
    const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, 23, 59)
    return cellDate < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
  }

  const isSelected = (day: number) =>
    !!selected &&
    selected.getFullYear() === viewMonth.getFullYear() &&
    selected.getMonth()    === viewMonth.getMonth() &&
    selected.getDate()     === day

  const isToday = (day: number) => {
    const t = new Date()
    return t.getFullYear() === viewMonth.getFullYear() && t.getMonth() === viewMonth.getMonth() && t.getDate() === day
  }

  const hour24 = selected ? selected.getHours() : null
  const hour12 = hour24 === null ? null : (hour24 % 12 === 0 ? 12 : hour24 % 12)
  const isPM   = hour24 !== null && hour24 >= 12
  const minute = selected ? selected.getMinutes() : null

  const displayLabel = selected
    ? selected.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setStep('calendar') }}
        style={{
          width: '100%', height: 40, borderRadius: 8,
          border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,.08)'}`,
          padding: '0 12px', fontSize: 13, textAlign: 'left',
          background: '#2a2a2a', color: selected ? '#fff' : '#7a7a7a',
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        }}
      >
        <Calendar size={14} style={{ color: '#77a8ff', flexShrink: 0 }} />
        {displayLabel || 'Select date & time'}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 10000,
          background: '#242424', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,.5)',
          width: 260, maxWidth: '92vw', overflow: 'hidden',
        }}>

          {/* Tabs — Calendar / Time */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <button type="button" onClick={() => setStep('calendar')}
              style={tabStyle(step === 'calendar')}>📅 Date</button>
            <button type="button" onClick={() => setStep('hour')}
              style={tabStyle(step === 'hour' || step === 'minute')} disabled={!selected}>
              🕐 Time
            </button>
          </div>

          {step === 'calendar' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
                <button type="button" onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  style={navBtnStyle}><ChevronLeft size={15} /></button>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </span>
                <button type="button" onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  style={navBtnStyle}><ChevronRight size={15} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 8px' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textAlign: 'center', padding: '4px 0' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '2px 8px 12px', gap: 2 }}>
                {cells.map((day, i) => {
                  if (day === null) return <div key={i} />
                  const disabled = isDisabled(day)
                  const sel      = isSelected(day)
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickDay(day)}
                      style={{
                        height: 28, borderRadius: 8, border: 'none',
                        fontSize: 12, fontWeight: sel ? 700 : 500,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        background: sel ? '#4c6ef5' : 'transparent',
                        color: disabled ? '#4a4a4a' : sel ? '#fff' : isToday(day) ? '#77a8ff' : '#d1d5db',
                        opacity: disabled ? 0.4 : 1,
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {(step === 'hour' || step === 'minute') && selected && (
            <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

              {/* Big time readout — click to switch hour/minute */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setStep('hour')}
                  style={bigTimeStyle(step === 'hour')}
                >
                  {hour12 !== null ? pad(hour12) : '--'}
                </button>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#6b7280' }}>:</span>
                <button
                  type="button"
                  onClick={() => setStep('minute')}
                  style={bigTimeStyle(step === 'minute')}
                >
                  {minute !== null ? pad(minute) : '--'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginLeft: 8 }}>
                  {(['AM', 'PM'] as const).map(ap => (
                    <button
                      key={ap}
                      type="button"
                      onClick={() => setAmPm(ap === 'PM')}
                      style={{
                        padding: '4px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        border: `1px solid ${(ap === 'PM') === isPM ? '#4c6ef5' : 'rgba(255,255,255,.1)'}`,
                        background: (ap === 'PM') === isPM ? 'rgba(76,111,245,.2)' : 'transparent',
                        color: (ap === 'PM') === isPM ? '#8bb4ff' : '#9ca3af',
                        cursor: 'pointer',
                      }}
                    >
                      {ap}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Analog clock face ── */}
              {step === 'hour' ? (
                <ClockFace mode="hour" hour12={hour12} minute={minute} onPick={setHour12} />
              ) : (
                <ClockFace mode="minute" hour12={hour12} minute={minute} onPick={setMinute} />
              )}

              {step === 'hour' && (
                <button
                  type="button"
                  onClick={() => setStep('minute')}
                  style={{ fontSize: 11, fontWeight: 700, color: '#77a8ff', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Next
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => { commit(new Date()); setStep('hour') }}
              style={{ fontSize: 11, fontWeight: 600, color: '#77a8ff', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setStep('calendar') }}
              style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#4c6ef5', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '5px 12px' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 6, border: 'none',
  background: 'rgba(255,255,255,.06)', color: '#d1d5db',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 700,
    border: 'none', background: active ? 'rgba(76,111,245,.15)' : 'transparent',
    color: active ? '#8bb4ff' : '#7a7a7a', cursor: 'pointer',
    borderBottom: active ? '2px solid #4c6ef5' : '2px solid transparent',
  }
}

function bigTimeStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 28, fontWeight: 700, minWidth: 46, textAlign: 'center',
    padding: '4px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? 'rgba(76,111,245,.2)' : 'transparent',
    color: active ? '#fff' : '#9ca3af',
  }
}