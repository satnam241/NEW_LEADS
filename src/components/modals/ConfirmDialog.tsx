import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Delete',
  onConfirm, onCancel, isLoading,
}: Props) {
  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: '#3C3C3C',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 18,
        width: 'calc(100% - 32px)',   /* mobile pe side padding */
        maxWidth: 380,
        padding: 'clamp(16px, 4vw, 24px)',
        boxShadow: '0 20px 60px rgba(0,0,0,.45)',
        animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* Icon + Text */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={17} color="#ef4444" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontSize: 'clamp(13px, 3.5vw, 14px)',
              fontWeight: 700, color: '#ffffff',
              margin: '0 0 6px',
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: 'clamp(11px, 3vw, 12.5px)',
              color: '#94a3b8',
              lineHeight: 1.6, margin: 0,
              wordBreak: 'break-word',
            }}>
              {message}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          flexWrap: 'wrap',   /* very small screens pe wrap ho jao */
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: '1 1 auto', maxWidth: 140,
              padding: '9px 16px', borderRadius: 8, height: 38,
              background: '#2a2d3e',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#cbd5e1',
              fontSize: 'clamp(12px, 3vw, 13px)',
              fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#353849')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#2a2d3e')}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: '1 1 auto', maxWidth: 160,
              padding: '9px 18px', borderRadius: 8, height: 38,
              background: isLoading ? '#7f1d1d' : '#ef4444',
              border: 'none',
              color: '#fff',
              fontSize: 'clamp(12px, 3vw, 13px)',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: 'inherit',
              transition: 'background 0.15s',
              opacity: isLoading ? 0.75 : 1,
            }}
            onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#dc2626' }}
            onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#ef4444' }}
          >
            {isLoading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
            {confirmLabel}
          </button>
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
    </div>
  )
}