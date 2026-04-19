// import { Search, X } from 'lucide-react'
// import type { LeadFilters, LeadStatus, LeadSource } from '@/types'

// const STATUSES: LeadStatus[] = ['New','Contacted','Interested','Closed','Lost']
// const SOURCES:  LeadSource[]  = ['Meta Ads','Manual','Imported']

// export default function FilterBar({ filters, onChange }: { filters: LeadFilters; onChange: (f: LeadFilters) => void }) {
//   const set = (key: keyof LeadFilters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
//     onChange({ ...filters, [key]: e.target.value })
//   const hasActive = filters.search || filters.status || filters.source || filters.dateFrom || filters.dateTo

//   return (
//     <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
//       <div className="relative flex-1 min-w-[180px] max-w-xs">
//         <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//         <input className="input-base pl-8 h-9" placeholder="Search name, phone, email…" value={filters.search} onChange={set('search')} />
//       </div>
//       <select className="input-base h-9 w-auto min-w-[130px]" value={filters.status} onChange={set('status')}>
//         <option value="">All Statuses</option>
//         {STATUSES.map(s => <option key={s}>{s}</option>)}
//       </select>
//       <select className="input-base h-9 w-auto min-w-[120px]" value={filters.source} onChange={set('source')}>
//         <option value="">All Sources</option>
//         {SOURCES.map(s => <option key={s}>{s}</option>)}
//       </select>
//       <input type="date" className="input-base h-9 w-auto text-xs" value={filters.dateFrom} onChange={set('dateFrom')} title="From date" />
//       <span className="text-slate-300 text-sm">→</span>
//       <input type="date" className="input-base h-9 w-auto text-xs" value={filters.dateTo} onChange={set('dateTo')} title="To date" />
//       {hasActive && (
//         <button className="btn-secondary h-9 text-xs" onClick={() => onChange({ search:'', status:'', source:'', dateFrom:'', dateTo:'' })}>
//           <X size={12} /> Clear
//         </button>
//       )}
//     </div>
//   )
// }

// src/components/FilterBar.tsx
import { Search, X, Calendar } from 'lucide-react'
import type { LeadFilters, LeadStatus, LeadSource } from '@/types'

// ✅ Interested removed
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Closed', 'Lost']

const SOURCES: { value: string; label: string }[] = [
  { value: 'facebook', label: 'Facebook'  },
  { value: 'whatsapp', label: 'WhatsApp'  },
  { value: 'Meta Ads', label: 'Meta Ads'  },
  { value: 'Manual',   label: 'Manual'    },
  { value: 'Imported', label: 'Imported'  },
]

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: LeadFilters
  onChange: (f: LeadFilters) => void
}) {
  const set = (key: keyof LeadFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...filters, [key]: e.target.value })

  const hasActive =
    filters.search || filters.status || filters.source ||
    filters.dateFrom || filters.dateTo

  const clearAll = () =>
    onChange({ search: '', status: '', source: '', dateFrom: '', dateTo: '' })

  const dateLabel = filters.dateFrom && filters.dateTo
    ? `${filters.dateFrom} → ${filters.dateTo}`
    : filters.dateFrom ? `From ${filters.dateFrom}`
    : filters.dateTo   ? `Until ${filters.dateTo}`
    : null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <Search size={13} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
          }} />
          <input
            className="input-base"
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
            placeholder="Search naam, phone, email…"
            value={filters.search}
            onChange={set('search')}
          />
          {filters.search && (
            <button onClick={() => onChange({ ...filters, search: '' })}
              style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', color: '#94a3b8',
                display: 'flex', alignItems: 'center',
              }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status */}
        <select className="input-base"
          style={{ height: 36, width: 'auto', minWidth: 140, fontSize: 13 }}
          value={filters.status} onChange={set('status')}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Source */}
        <select className="input-base"
          style={{ height: 36, width: 'auto', minWidth: 130, fontSize: 13 }}
          value={filters.source} onChange={set('source')}>
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input type="date" className="input-base"
            style={{ height: 36, fontSize: 12 }}
            value={filters.dateFrom} onChange={set('dateFrom')} />
          <span style={{ color: '#cbd5e1', fontSize: 14 }}>→</span>
          <input type="date" className="input-base"
            style={{ height: 36, fontSize: 12 }}
            value={filters.dateTo} onChange={set('dateTo')} />
        </div>

        {hasActive && (
          <button className="btn-secondary"
            style={{ height: 36, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={clearAll}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActive && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {filters.search && (
            <Chip label={`"${filters.search}"`}
              onRemove={() => onChange({ ...filters, search: '' })} />
          )}
          {filters.status && (
            <Chip label={filters.status}
              onRemove={() => onChange({ ...filters, status: '' })} />
          )}
          {filters.source && (
            <Chip label={filters.source}
              onRemove={() => onChange({ ...filters, source: '' })} />
          )}
          {dateLabel && (
            <Chip label={dateLabel}
              onRemove={() => onChange({ ...filters, dateFrom: '', dateTo: '' })} />
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
      background: '#eff6ff', color: '#3b82f6',
      fontSize: 11, fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#93c5fd', display: 'flex', padding: 0,
        }}>
        <X size={10} />
      </button>
    </span>
  )
}