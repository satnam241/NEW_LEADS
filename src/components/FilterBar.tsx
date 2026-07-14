import { useState, useEffect } from 'react'
import { Search, X, Calendar, SlidersHorizontal } from 'lucide-react'
import type { LeadFilters, LeadStatus, LeadSource } from '@/types'

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Negotiation', 'Visitor', 'Closed', 'Lost']

const SOURCES: { value: string; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'Meta Ads', label: 'Meta Ads' },
  { value: 'Manual',   label: 'Manual'   },
  { value: 'Imported', label: 'Imported' },
]

// ── Shared input style ────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  height: 36, fontSize: 13,
  background: '#2A2A2A', color: '#ffffff',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 8, outline: 'none',
  padding: '0 10px',
  width: '100%', boxSizing: 'border-box',
}

// ── Viewport hook ─────────────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: LeadFilters
  onChange: (f: LeadFilters) => void
}) {
  const width    = useWidth()
  const isMobile = width < 640    // phone
  const isTablet = width < 1024   // tablet / small laptop

  // Mobile pe filters toggle
  const [expanded, setExpanded] = useState(false)

  const set = (key: keyof LeadFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...filters, [key]: e.target.value })

  const hasActive =
    filters.search || filters.status || filters.source ||
    filters.dateFrom || filters.dateTo

  const clearAll = () =>
    onChange({ search: '', status: '', source: '', dateFrom: '', dateTo: '' })

  const dateLabel =
    filters.dateFrom && filters.dateTo ? `${filters.dateFrom} → ${filters.dateTo}`
    : filters.dateFrom ? `From ${filters.dateFrom}`
    : filters.dateTo   ? `Until ${filters.dateTo}`
    : null

  // Active filter count (for mobile badge)
  const activeCount = [
    filters.search, filters.status, filters.source,
    filters.dateFrom || filters.dateTo,
  ].filter(Boolean).length

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: isMobile ? '10px 12px' : '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      background: '#3C3C3C',
    }}>

      {/* ── Row 1: Search + mobile toggle ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Search — always visible */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
          }} />
          <input
            style={{ ...inputBase, paddingLeft: 32 }}
            placeholder="Search name, phone, email…"
            value={filters.search}
            onChange={set('search')}
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Mobile: Filter toggle button */}
        {isMobile && (
          <button
            onClick={() => setExpanded(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              height: 36, padding: '0 12px', borderRadius: 8, flexShrink: 0,
              background: expanded ? 'rgba(76,110,245,.2)' : '#2A2A2A',
              border: `1px solid ${expanded ? 'rgba(76,110,245,.4)' : 'rgba(255,255,255,.08)'}`,
              color: expanded ? '#9db8ff' : '#ffffff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              position: 'relative',
            }}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                width: 16, height: 16, borderRadius: '50%',
                background: '#4c6ef5', color: '#fff',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activeCount}
              </span>
            )}
          </button>
        )}

        {/* Desktop / Tablet: Clear button inline */}
        {!isMobile && hasActive && (
          <button
            onClick={clearAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              height: 36, padding: '0 12px', borderRadius: 8, flexShrink: 0,
              background: '#2A2A2A', color: '#ffffff',
              border: '1px solid rgba(255,255,255,.08)',
              fontSize: 12, cursor: 'pointer',
            }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Row 2: Status + Source + Date ──────────────────────────────────── */}
      {/* Mobile: show only when expanded | Tablet/Desktop: always show */}
      {(!isMobile || expanded) && (
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: isTablet ? 'wrap' : 'nowrap',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 8,
        }}>

          {/* Status */}
          <select
            style={{
              ...inputBase,
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? undefined : 140,
              flex: isTablet && !isMobile ? '1 1 130px' : undefined,
            }}
            value={filters.status}
            onChange={set('status')}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Source */}
          <select
            style={{
              ...inputBase,
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? undefined : 130,
              flex: isTablet && !isMobile ? '1 1 120px' : undefined,
            }}
            value={filters.source}
            onChange={set('source')}
          >
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Date range */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            flex: isTablet && !isMobile ? '2 1 220px' : undefined,
            width: isMobile ? '100%' : undefined,
          }}>
            <Calendar size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="date"
              style={{ ...inputBase, flex: 1, minWidth: 0 }}
              value={filters.dateFrom}
              onChange={set('dateFrom')}
            />
            <span style={{ color: '#cbd5e1', fontSize: 14, flexShrink: 0 }}>→</span>
            <input
              type="date"
              style={{ ...inputBase, flex: 1, minWidth: 0 }}
              value={filters.dateTo}
              onChange={set('dateTo')}
            />
          </div>

          {/* Mobile: Clear button at bottom of expanded panel */}
          {isMobile && hasActive && (
            <button
              onClick={() => { clearAll(); setExpanded(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                height: 36, borderRadius: 8,
                background: '#2A2A2A', color: '#ffffff',
                border: '1px solid rgba(255,255,255,.08)',
                fontSize: 12, cursor: 'pointer', width: '100%',
              }}
            >
              <X size={12} /> Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* ── Active filter chips ─────────────────────────────────────────────── */}
      {hasActive && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {filters.search && (
            <Chip label={`"${filters.search}"`} onRemove={() => onChange({ ...filters, search: '' })} />
          )}
          {filters.status && (
            <Chip label={filters.status} onRemove={() => onChange({ ...filters, status: '' })} />
          )}
          {filters.source && (
            <Chip label={filters.source} onRemove={() => onChange({ ...filters, source: '' })} />
          )}
          {dateLabel && (
            <Chip label={dateLabel} onRemove={() => onChange({ ...filters, dateFrom: '', dateTo: '' })} />
          )}
        </div>
      )}

    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99,
      background: 'rgba(76,110,245,.14)', color: '#9db8ff',
      border: '1px solid rgba(76,110,245,.24)',
      fontSize: 11, fontWeight: 500,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9db8ff', display: 'flex', padding: 0 }}
      >
        <X size={10} />
      </button>
    </span>
  )
}