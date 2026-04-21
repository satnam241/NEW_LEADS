// import { Phone, MessageCircle, Mail } from 'lucide-react'
// import type { LeadStatus, LeadSource, Lead } from '@/types'

// export function StatusBadge({ status }: { status: LeadStatus }) {
//   return <span className={`badge badge-${status}`}>{status}</span>
// }

// const SOURCE_COLORS: Record<LeadSource, string> = {
//   'Meta Ads': 'bg-blue-50 text-blue-700',
//   'Manual':   'bg-slate-100 text-slate-600',
//   'Imported': 'bg-teal-50 text-teal-700',
// }
// export function SourceBadge({ source }: { source: LeadSource }) {
//   return <span className={`badge ${SOURCE_COLORS[source]}`}>{source}</span>
// }

// const AVATAR_COLORS = [
//   'bg-brand-100 text-brand-700','bg-violet-100 text-violet-700',
//   'bg-amber-100 text-amber-700','bg-green-100 text-green-700',
//   'bg-rose-100 text-rose-700',  'bg-sky-100 text-sky-700',
// ]
// export function Avatar({ name, size = 8 }: { name: string; size?: number }) {
//   const code = name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)
//   const color = AVATAR_COLORS[code % AVATAR_COLORS.length]
//   const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
//   return (
//     <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color}`}>
//       {initials}
//     </div>
//   )
// }

// export function ContactButtons({ lead }: { lead: Lead }) {
//   const wa = lead.whatsapp ?? lead.phone
//   const waNum = wa?.replace(/\D/g, '')

//   return (
//     <div className="flex items-center gap-1">
//       {waNum && (
//         <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer"
//           className="btn-wa py-1 px-2 text-[11px]" title="WhatsApp" onClick={e => e.stopPropagation()}>
//           <MessageCircle size={11} /> WA
//         </a>
//       )}
//       {lead.phone && (
//         <a href={`tel:${lead.phone}`}
//           className="btn-green py-1 px-2 text-[11px]" title="Call" onClick={e => e.stopPropagation()}>
//           <Phone size={11} /> Call
//         </a>
//       )}
//       {lead.email && (
//         <a href={`mailto:${lead.email}`}
//           className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
//           title="Email" onClick={e => e.stopPropagation()}>
//           <Mail size={11} /> Mail
//         </a>
//       )}
//     </div>
//   )
// }

// export function SkeletonRow({ cols = 6 }: { cols?: number }) {
//   return (
//     <tr className="border-b border-slate-100">
//       {[...Array(cols)].map((_, i) => (
//         <td key={i} className="px-4 py-3">
//           <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
//         </td>
//       ))}
//     </tr>
//   )
// }

// src/components/Shared.tsx
import { Phone, MessageCircle, Mail } from 'lucide-react'
import type { LeadStatus, Lead } from '@/types'

// ─── StatusBadge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

// ─── SourceBadge — backend sources included ───────────────────────────────────
const SOURCE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  'facebook':  { bg: '#eff4ff', color: '#4c6ef5', label: '📘 Facebook' },
  'whatsapp':  { bg: '#f0fdf4', color: '#15803d', label: '💬 WhatsApp' },
  'Meta Ads':  { bg: '#eff4ff', color: '#3b5bdb', label: 'Meta Ads'   },
  'Manual':    { bg: '#f8fafc', color: '#475569', label: 'Manual'      },
  'Imported':  { bg: '#f0fdfa', color: '#0f766e', label: 'Imported'    },
}

export function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source] ?? { bg: '#f8fafc', color: '#64748b', label: source }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99,
      background: style.bg, color: style.color,
      display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
    }}>
      {style.label}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#eff4ff', color: '#4c6ef5' },
  { bg: '#f5f3ff', color: '#7c3aed' },
  { bg: '#fffbeb', color: '#d97706' },
  { bg: '#f0fdf4', color: '#16a34a' },
  { bg: '#fef2f2', color: '#dc2626' },
  { bg: '#f0f9ff', color: '#0284c7' },
]

export function Avatar({ name, size = 8 }: { name: string; size?: number }) {
  const code    = (name?.charCodeAt(0) ?? 65) + (name?.charCodeAt(1) ?? 65)
  const palette = AVATAR_COLORS[code % AVATAR_COLORS.length]
  const initials = (name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const px = size * 4   // Tailwind size → px (size=8 → 32px)

 //const size = 32 // 👈 define karo (px ka replacement)

const safePalette = palette || {
  bg: '#e5e7eb',
  color: '#374151'
}

return (
  <div style={{
    width: size,
    height: size,
    borderRadius: '50%',
    background: safePalette.bg,   // ✅ safe
    color: safePalette.color,     // ✅ safe
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size < 28 ? 10 : 12,
    fontWeight: 700,
    flexShrink: 0,
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
          style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
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
          style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
          title="Call"
          onClick={e => e.stopPropagation()}
        >
          <Phone size={11} /> Call
        </a>
      )}
      {lead.email && (
        <a
          href={`mailto:${lead.email}`}
          style={{
            padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4,
            borderRadius: 8, fontWeight: 600,
            background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
            textDecoration: 'none', transition: 'background 120ms',
          }}
          title="Email"
          onClick={e => e.stopPropagation()}
        >
          <Mail size={11} /> Mail
        </a>
      )}
    </div>
  )
}

// ─── SkeletonRow ──────────────────────────────────────────────────────────────
export function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      {[...Array(cols)].map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div
            className="skeleton"
            style={{ height: 13, borderRadius: 6, width: `${50 + (i * 13) % 40}%` }}
          />
        </td>
      ))}
    </tr>
  )
}