import { useState } from 'react'
import { X, Loader2, Megaphone } from 'lucide-react'
import type { LeadFilters } from '@/types'

interface Props {
  open: boolean
  matchedCount: number
  onClose: () => void
  onSend: (payload: { campaignName: string; templateText: string; scheduledAt?: string }) => void
  isSending: boolean
}

export default function CampaignModal({ open, matchedCount, onClose, onSend, isSending }: Props) {
  const [campaignName, setCampaignName] = useState('')
  const [templateText, setTemplateText] = useState('')
  const [sendNow, setSendNow] = useState(true)
  const [scheduledAt, setScheduledAt] = useState('')

  if (!open) return null

  const handleSend = () => {
    if (!templateText.trim()) return
    onSend({
      campaignName: campaignName.trim(),
      templateText: templateText.trim(),
      scheduledAt: sendNow ? undefined : scheduledAt,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 12 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#3C3C3C', borderRadius: 16, width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>📢 Send Campaign</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>{matchedCount} leads match current filter</p>
          </div>
          <button onClick={onClose} style={{ background: '#2a2a2a', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#cbd5e1' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Campaign Name</label>
            <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g. Interested Leads Follow-up"
              style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: '#2a2a2a', color: '#fff', padding: '0 10px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              Message Template (use {'{{name}}'} for personalization)
            </label>
            <textarea value={templateText} onChange={e => setTemplateText(e.target.value)} rows={5}
              placeholder="Hi {{name}}, we have a special offer for you..."
              style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: '#2a2a2a', color: '#fff', padding: 10, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1', cursor: 'pointer' }}>
              <input type="checkbox" checked={sendNow} onChange={e => setSendNow(e.target.checked)} />
              Send immediately
            </label>
            {!sendNow && (
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                style={{ marginTop: 8, width: '100%', height: 38, borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: '#2a2a2a', color: '#fff', padding: '0 10px', boxSizing: 'border-box' }} />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.12)', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSend} disabled={isSending || !templateText.trim() || (!sendNow && !scheduledAt)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: isSending ? '#555' : '#4c6ef5', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {isSending ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : <><Megaphone size={14} /> Send to {matchedCount} leads</>}
          </button>
        </div>
      </div>
    </div>
  )
}