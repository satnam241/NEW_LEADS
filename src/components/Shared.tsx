import { Phone, MessageCircle, Mail } from 'lucide-react'
import type { LeadStatus, Lead } from '@/types'

// ─── StatusBadge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

// ─── SourceBadge ─────────────────────────────────────────────────────────────
const SOURCE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  'facebook':  { bg: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa', label: '📘 Facebook' },
  'whatsapp':  { bg: 'rgba(34, 197, 94, 0.16)',  color: '#4ade80', label: '💬 WhatsApp' },
  'Meta Ads':  { bg: 'rgba(139, 92, 246, 0.16)', color: '#a78bfa', label: 'Meta Ads'   },
  'Manual':    { bg: 'rgba(148, 163, 184, 0.16)', color: '#cbd5e1', label: 'Manual'     },
  'Imported':  { bg: 'rgba(6, 182, 212, 0.16)',  color: '#22d3ee', label: 'Imported'   },
}

export function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source] ?? { bg: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', label: source }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99,
      background: style.bg, color: style.color,
      border: `1px solid ${style.bg}`,
      display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
    }}>
      {style.label}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: 'rgba(76, 110, 245, 0.22)', color: '#77a8ff' },
  { bg: 'rgba(139, 92, 246, 0.22)', color: '#c4b5fd' },
  { bg: 'rgba(245, 158, 11, 0.22)', color: '#fcd34d' },
  { bg: 'rgba(34, 197, 94, 0.22)',  color: '#86efac' },
  { bg: 'rgba(239, 68, 68, 0.22)',  color: '#fca5a5' },
  { bg: 'rgba(14, 165, 233, 0.22)', color: '#7dd3fc' },
]

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const safeName = name || '?'
  const code     = (safeName.charCodeAt(0) ?? 65) + (safeName.charCodeAt(1) ?? 65)
  const palette  = AVATAR_COLORS[code % AVATAR_COLORS.length]
  const initials = safeName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const pxSize   = size < 16 ? size * 4 : size

  return (
    <div style={{
      width: pxSize,
      height: pxSize,
      borderRadius: '50%',
      background: palette.bg,
      color: palette.color,
      border: `1px solid ${palette.color}33`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: pxSize < 28 ? 10.5 : 12.5,
      fontWeight: 700,
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials || '?'}
    </div>
  )
}

// ─── ContactButtons ───────────────────────────────────────────────────────────
export function ContactButtons({ lead }: { lead: Lead }) {
  const wa    = lead.whatsapp ?? lead.phone
  const waNum = wa?.replace(/\D/g, '')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {waNum && (
        <a
          href={`https://wa.me/${waNum}`}
          target="_blank"
          rel="noreferrer"
          className="btn-wa"
          style={{ padding: '4px 9px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
          title="WhatsApp"
          onClick={e => e.stopPropagation()}
        >
          <MessageCircle size={11} /> WA
        </a>
      )}
      {lead.phone && (
        <a
          href={`tel:${lead.phone}`}
          className="btn-green"
          style={{ padding: '4px 9px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
          title="Call"
          onClick={e => e.stopPropagation()}
        >
          <Phone size={11} /> Call
        </a>
      )}
      {lead.email && (
        <a
          href={`mailto:${lead.email}`}
          className="btn-secondary"
          style={{ padding: '4px 9px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
          title="Email"
          onClick={e => e.stopPropagation()}
        >
          <Mail size={11} /> Email
        </a>
      )}
    </div>
  )
}