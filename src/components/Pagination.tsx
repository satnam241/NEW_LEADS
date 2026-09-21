import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }

export default function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to   = Math.min(page * pageSize, total)
  const range: (number | '…')[] = []
  
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) range.push(i)
    else if (range[range.length - 1] !== '…') range.push('…')
  
  }
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
      flexWrap: 'wrap', gap: 10,
    }}>
      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
        {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          className="btn-secondary"
          style={{ padding: '6px 10px', height: 32, fontSize: 12 }}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={13} />
        </button>
        {range.map((item, idx) => item === '…'
          ? <span key={`e${idx}`} style={{ width: 32, textAlign: 'center', fontSize: 12, color: '#64748b' }}>…</span>
          : (
            <button
              key={item}
              onClick={() => onPageChange(item as number)}
              style={{
                width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: item === page ? '#4c6ef5' : 'transparent',
                color: item === page ? '#ffffff' : '#cbd5e1',
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={e => {
                if (item !== page) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={e => {
                if (item !== page) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {item}
            </button>
          )
        )}
        <button
          className="btn-secondary"
          style={{ padding: '6px 10px', height: 32, fontSize: 12 }}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
