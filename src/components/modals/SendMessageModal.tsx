import { useState, useEffect } from 'react'
import { X, Loader2, Send } from 'lucide-react'
import type { Lead } from '@/types'

interface Props {
  lead: Lead | null
  open: boolean
  onClose: () => void
  onSend: (message: string) => void
  isSending: boolean
}

export default function SendMessageModal({ lead, open, onClose, onSend, isSending }: Props) {
  const [message, setMessage] = useState('')

  useEffect(() => { if (open) setMessage('') }, [open, lead])

  if (!open || !lead) return null

  const handleSend = () => {
    if (!message.trim()) return
    onSend(message.trim())
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '12px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#3C3C3C', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>💬 Send WhatsApp Message</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>{lead.fullName ?? lead.name} · {lead.phone ?? '—'}</p>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#cbd5e1', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <textarea
            autoFocus
            placeholder="Type your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={4096}
            rows={5}
            style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', padding: '10px 12px', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: '#2a2a2a', color: '#fff', fontFamily: 'inherit' }}
          />
          <p style={{ fontSize: 11, color: '#6b7280', margin: '6px 0 0', textAlign: 'right' }}>{message.length}/4096</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: '#2a2a2a', fontSize: 13, cursor: 'pointer', color: '#fff' }}>Cancel</button>
          <button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: isSending || !message.trim() ? '#555' : '#4c6ef5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: isSending || !message.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {isSending ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : <><Send size={14} /> Send</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}