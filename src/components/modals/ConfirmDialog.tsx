import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  open: boolean; title: string; message: string
  confirmLabel?: string; onConfirm: () => void
  onCancel: () => void; isLoading?: boolean
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, isLoading }: Props) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 p-6" style={{ animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both' }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary text-xs py-1.5 px-3" onClick={onCancel}>Cancel</button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50" onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 size={12} className="animate-spin" />}{confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}