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
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-400">{total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}</p>
      <div className="flex items-center gap-1">
        <button className="btn-secondary px-2 py-1.5 h-8 text-xs" onClick={() => onPageChange(page - 1)} disabled={page <= 1}><ChevronLeft size={13} /></button>
        {range.map((item, idx) => item === '…'
          ? <span key={`e${idx}`} className="w-8 text-center text-xs text-slate-300">…</span>
          : <button key={item} onClick={() => onPageChange(item as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${item === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{item}</button>
        )}
        <button className="btn-secondary px-2 py-1.5 h-8 text-xs" onClick={() => onPageChange(page + 1)} disabled={page >= pages}><ChevronRight size={13} /></button>
      </div>
    </div>
  )
}
