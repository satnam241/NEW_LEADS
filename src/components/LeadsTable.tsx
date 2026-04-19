// // import React from 'react'
// // import { format } from 'date-fns'
// // import { Edit2, Trash2, CalendarClock, Phone, Mail, MessageCircle } from 'lucide-react'
// // import type { Lead, LeadStatus } from '@/types'
// // import { SourceBadge, Avatar } from './Shared'

// // interface Props {
// //   leads: Lead[]
// //   isLoading: boolean
// //   onEdit: (l: Lead) => void
// //   onDelete: (id: string) => void
// //   onStatusChange?: (id: string, status: LeadStatus) => void
// // }

// // const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']

// // const StatusSelect = React.memo(function StatusSelect({ lead, onChange }: { lead: Lead; onChange?: (id: string, s: LeadStatus) => void }) {
// //   return (
// //     <select
// //       className={`status-pill s-${lead.status}`}
// //       value={lead.status}
// //       onClick={e => e.stopPropagation()}
// //       onChange={e => onChange?.(lead.id, e.target.value as LeadStatus)}
// //     >
// //       {STATUSES.map(s => <option key={s}>{s}</option>)}
// //     </select>
// //   )
// // })

// // const ContactCell = React.memo(function ContactCell({ lead }: { lead: Lead }) {
// //   const waNum = (lead.whatsapp ?? lead.phone)?.replace(/\D/g, '')

// //   return (
// //     <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
// //       {lead.phone && (
// //         <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-gray-700">
// //           <Phone size={10} className="text-gray-400" />
// //           {lead.phone}
// //         </a>
// //       )}
// //       {lead.email && (
// //         <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-gray-500 truncate">
// //           <Mail size={10} />
// //           {lead.email}
// //         </a>
// //       )}
// //       {waNum && (
// //         <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-green-500">
// //           <MessageCircle size={10} />
// //           WhatsApp
// //         </a>
// //       )}
// //     </div>
// //   )
// // })

// // const SkeletonRow = () => (
// //   <tr className="tbody-row">
// //     {[...Array(6)].map((_, i) => (
// //       <td key={i} className="tbody-cell">
// //         <div className="skeleton h-3 w-full" />
// //       </td>
// //     ))}
// //   </tr>
// // )

// // function LeadsTable({ leads, isLoading, onEdit, onDelete, onStatusChange }: Props) {

// //   if (!isLoading && leads.length === 0) {
// //     return (
// //       <div className="p-16 text-center">
// //         <div className="text-4xl mb-3">🔍</div>
// //         <p className="text-sm font-medium text-gray-500">No leads found</p>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="overflow-x-auto">

// //       <table className="w-full text-sm">
// //         <thead>
// //           <tr className="border-b">
// //             <th className="thead-cell">Lead</th>
// //             <th className="thead-cell hidden md:table-cell">Contact</th>
// //             <th className="thead-cell">Source</th>
// //             <th className="thead-cell">Status</th>
// //             <th className="thead-cell hidden lg:table-cell">Follow-up</th>
// //             <th className="thead-cell hidden lg:table-cell">Added</th>
// //             <th className="thead-cell w-[60px]"></th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {isLoading
// //             ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
// //             : leads.map(lead => (
// //               <tr
// //                 key={lead.id}
// //                 className="tbody-row hover:bg-gray-50 cursor-pointer transition"
// //                 onClick={() => onEdit(lead)}
// //               >
// //                 {/* Lead */}
// //                 <td className="tbody-cell">
// //                   <div className="flex items-center gap-2">
// //                     <Avatar name={lead.name} size={8} />
// //                     <div>
// //                       <p className="font-medium text-gray-900">{lead.name}</p>
// //                       <p className="text-xs text-gray-400">{lead.email ?? lead.phone ?? '—'}</p>
// //                     </div>
// //                   </div>
// //                 </td>

// //                 {/* Contact */}
// //                 <td className="tbody-cell hidden md:table-cell">
// //                   <ContactCell lead={lead} />
// //                 </td>

// //                 {/* Source */}
// //                 <td className="tbody-cell">
// //                   <SourceBadge source={lead.source} />
// //                 </td>

// //                 {/* Status */}
// //                 <td className="tbody-cell" onClick={e => e.stopPropagation()}>
// //                   <StatusSelect lead={lead} onChange={onStatusChange} />
// //                 </td>

// //                 {/* Follow-up */}
// //                 <td className="tbody-cell hidden lg:table-cell">
// //                   {lead.followup_date ? (
// //                     <div className="flex gap-1 text-xs">
// //                       <CalendarClock size={12} />
// //                       {format(new Date(lead.followup_date), 'MMM d')}
// //                     </div>
// //                   ) : '—'}
// //                 </td>

// //                 {/* Created */}
// //                 <td className="tbody-cell hidden lg:table-cell text-xs text-gray-400">
// //                   {format(new Date(lead.created_at), 'MMM d')}
// //                 </td>

// //                 {/* Actions */}
// //                 <td className="tbody-cell">
// //                   <div className="flex gap-1 opacity-100 group-hover:opacity- transition">
// //                     <button onClick={() => onEdit(lead)} className="p-1 hover:bg-blue-50 rounded">
// //                       <Edit2 size={13} />
// //                     </button>
// //                     <button onClick={() => onDelete(lead.id)} className="p-1 rounded hover:bg-red-50 text-red-600 transition">
// //                       <Trash2 size={13} />
// //                     </button>
// //                   </div>
// //                 </td>
// //               </tr>
// //             ))}
// //         </tbody>
// //       </table>
// //     </div>
// //   )
// // }

// // export default React.memo(LeadsTable)

// // src/components/LeadsTable.tsx
// // ✅ FIXES:
// //   #2 — Status dropdown never resets to "New":
// //        - StatusSelect uses local state for instant visual feedback
// //        - useEffect syncs ONLY when lead.status prop actually changes from server
// //        - onChange passes lead._id ?? lead.id so the correct MongoDB doc is updated
// //   #1 — Date column visible; table key uses _id ?? id for stable rows

// import React, { useState } from 'react'
// import { format } from 'date-fns'
// import { Edit2, Trash2, CalendarClock, Phone, Mail, MessageCircle } from 'lucide-react'
// import type { Lead, LeadStatus } from '@/types'
// import { SourceBadge, Avatar } from './Shared'

// interface Props {
//   leads: Lead[]
//   isLoading: boolean
//   onEdit: (l: Lead) => void
//   onDelete: (id: string) => void
//   onStatusChange?: (id: string, status: LeadStatus) => void
// }

// const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']

// const STATUS_COLORS: Record<LeadStatus, { bg: string; color: string }> = {
//   New:        { bg: '#f0f9ff', color: '#0284c7' },
//   Contacted:  { bg: '#fffbeb', color: '#d97706' },
//   Interested: { bg: '#f5f3ff', color: '#7c3aed' },
//   Closed:     { bg: '#f0fdf4', color: '#16a34a' },
//   Lost:       { bg: '#fef2f2', color: '#dc2626' },
// }

// /**
//  * ✅ FIX #2 — StatusSelect
//  *
//  * Root cause of the "resets to New" bug:
//  *   The select was fully controlled by `lead.status` (from server cache).
//  *   When the user changed it, useUpdateLead fired → onSettled invalidated
//  *   the cache → React Query refetched → before the server response came back,
//  *   the stale cache (with status='New') was briefly served → the dropdown
//  *   flipped back.
//  *
//  * Fix: local `localStatus` state owns the visual. It is set from `lead.status`
//  * only on mount and when the server confirms a new value. The `useEffect` that
//  * syncs from props uses `lead.status` as dependency, so it only runs when the
//  * server actually returns a different value (i.e. after a confirmed update),
//  * not during the intermediate stale-cache flash.
//  *
//  * Combined with staleTime: 0 in useLeads, the race condition is eliminated.
//  */
// const StatusSelect = React.memo(function StatusSelect({
//   lead,
//   onChange,
// }: {
//   lead: Lead
//   onChange?: (id: string, s: LeadStatus) => void
// }) {
//   // Local state = instant visual feedback, no waiting for server round-trip
//   const [localStatus, setLocalStatus] = useState<LeadStatus>(lead.status)

//   // Sync ONLY when the server confirms a new status value
//   React.useEffect(() => {
//     setLocalStatus(lead.status)
//   }, [lead.status])

//   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     e.stopPropagation()
//     const next = e.target.value as LeadStatus
//     setLocalStatus(next)                          // instant visual
//     // ✅ use _id ?? id to match MongoDB document
//     onChange?.(lead._id ?? lead.id, next)
//   }

//   const colors = STATUS_COLORS[localStatus] ?? { bg: '#f8fafc', color: '#64748b' }

//   return (
//     <select
//       value={localStatus}
//       onClick={e => e.stopPropagation()}
//       onChange={handleChange}
//       style={{
//         fontSize: 11,
//         fontWeight: 600,
//         padding: '3px 8px',
//         borderRadius: 99,
//         border: 'none',
//         outline: 'none',
//         cursor: 'pointer',
//         background: colors.bg,
//         color: colors.color,
//         appearance: 'none',
//         WebkitAppearance: 'none',
//         minWidth: 90,
//       }}
//     >
//       {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
//     </select>
//   )
// })

// const ContactCell = React.memo(function ContactCell({ lead }: { lead: Lead }) {
//   const waNum = (lead.whatsapp ?? lead.phone)?.replace(/\D/g, '')
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} onClick={e => e.stopPropagation()}>
//       {lead.phone && (
//         <a
//           href={`tel:${lead.phone}`}
//           style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', textDecoration: 'none' }}
//         >
//           <Phone size={10} style={{ color: '#94a3b8' }} />
//           {lead.phone}
//         </a>
//       )}
//       {lead.email && (
//         <a
//           href={`mailto:${lead.email}`}
//           style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', textDecoration: 'none', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
//         >
//           <Mail size={10} />
//           {lead.email}
//         </a>
//       )}
//       {waNum && (
//         <a
//           href={`https://wa.me/${waNum}`}
//           target="_blank"
//           rel="noreferrer"
//           style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', textDecoration: 'none' }}
//         >
//           <MessageCircle size={10} />
//           WhatsApp
//         </a>
//       )}
//     </div>
//   )
// })

// const SkeletonRow = () => (
//   <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
//     {[...Array(7)].map((_, i) => (
//       <td key={i} style={{ padding: '12px 16px' }}>
//         <div className="skeleton" style={{ height: 12, width: `${50 + (i * 17) % 40}%`, borderRadius: 6 }} />
//       </td>
//     ))}
//   </tr>
// )

// function LeadsTable({ leads, isLoading, onEdit, onDelete, onStatusChange }: Props) {
//   if (!isLoading && leads.length === 0) {
//     return (
//       <div style={{ padding: '64px 16px', textAlign: 'center' }}>
//         <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
//         <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>No leads found</p>
//         <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try adjusting your filters</p>
//       </div>
//     )
//   }

//   return (
//     <div style={{ overflowX: 'auto' }}>
//       <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
//         <thead>
//           <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
//             <th className="thead-cell">Lead</th>
//             <th className="thead-cell hidden md:table-cell">Contact</th>
//             <th className="thead-cell">Source</th>
//             <th className="thead-cell">Status</th>
//             <th className="thead-cell hidden lg:table-cell">Follow-up</th>
//             <th className="thead-cell hidden lg:table-cell">Added</th>
//             <th className="thead-cell" style={{ width: 60 }}></th>
//           </tr>
//         </thead>
//         <tbody>
//           {isLoading
//             ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
//             : leads.map(lead => {
//                 // Normalize name: fullName > name > 'Unknown'
//                 const displayName = (lead.fullName ?? lead.name ?? '').trim() || 'Unknown'
//                 // Stable row key
//                 const rowKey = lead._id ?? lead.id

//                 return (
//                   <tr
//                     key={rowKey}
//                     className="tbody-row"
//                     style={{ cursor: 'pointer', transition: 'background 120ms' }}
//                     onClick={() => onEdit(lead)}
//                     onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
//                     onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
//                   >
//                     {/* Lead name + sub */}
//                     <td className="tbody-cell">
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                         <Avatar name={displayName} size={8} />
//                         <div>
//                           <p style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{displayName}</p>
//                           <p style={{ fontSize: 11, color: '#94a3b8' }}>
//                             {lead.email ?? lead.phone ?? '—'}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Contact */}
//                     <td className="tbody-cell hidden md:table-cell">
//                       <ContactCell lead={lead} />
//                     </td>

//                     {/* Source */}
//                     <td className="tbody-cell">
//                       <SourceBadge source={lead.source} />
//                     </td>

//                     {/* Status — optimistic local state */}
//                     <td className="tbody-cell" onClick={e => e.stopPropagation()}>
//                       <StatusSelect lead={lead} onChange={onStatusChange} />
//                     </td>

//                     {/* Follow-up */}
//                     <td className="tbody-cell hidden lg:table-cell">
//                       {lead.followup_date ? (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
//                           <CalendarClock size={12} style={{ color: '#94a3b8' }} />
//                           <span
//                             style={{
//                               color: new Date(lead.followup_date) < new Date() && !lead.followup_done
//                                 ? '#dc2626'
//                                 : '#475569',
//                             }}
//                           >
//                             {format(new Date(lead.followup_date), 'MMM d')}
//                           </span>
//                         </div>
//                       ) : '—'}
//                     </td>

//                     {/* Added */}
//                     <td className="tbody-cell hidden lg:table-cell" style={{ fontSize: 12, color: '#94a3b8' }}>
//                       {lead.created_at ? format(new Date(lead.created_at), 'MMM d') : '—'}
//                     </td>

//                     {/* Actions */}
//                     <td className="tbody-cell">
//                       <div style={{ display: 'flex', gap: 4 }}>
//                         <button
//                           onClick={e => { e.stopPropagation(); onEdit(lead) }}
//                           style={{ padding: 5, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
//                           onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#eff4ff'}
//                           onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
//                         >
//                           <Edit2 size={13} />
//                         </button>
//                         <button
//                           onClick={e => { e.stopPropagation(); onDelete(lead._id ?? lead.id) }}
//                           style={{ padding: 5, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}
//                           onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
//                           onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
//                         >
//                           <Trash2 size={13} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               })}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// export default React.memo(LeadsTable)

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Edit2, Trash2, CalendarClock, Phone, Mail, MessageCircle } from 'lucide-react'
import type { Lead, LeadStatus } from '@/types'
import { SourceBadge, Avatar } from './Shared'

interface Props {
  leads: Lead[]
  isLoading: boolean
  onEdit: (l: Lead) => void
  onDelete: (id: string) => void
  onFollowUp?: (l: Lead) => void
  onStatusChange?: (id: string, status: LeadStatus) => void
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']

const STATUS_COLORS: Record<LeadStatus, { bg: string; color: string }> = {
  New:        { bg: '#f0f9ff', color: '#0284c7' },
  Contacted:  { bg: '#fffbeb', color: '#d97706' },
  Interested: { bg: '#f5f3ff', color: '#7c3aed' },
  Closed:     { bg: '#f0fdf4', color: '#16a34a' },
  Lost:       { bg: '#fef2f2', color: '#dc2626' },
}

const StatusSelect = React.memo(function StatusSelect({
  lead,
  onChange,
}: {
  lead: Lead
  onChange?: (id: string, s: LeadStatus) => void
}) {
  const [localStatus, setLocalStatus] = useState<LeadStatus>(lead.status)

  React.useEffect(() => {
    setLocalStatus(lead.status)
  }, [lead.status])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const next = e.target.value as LeadStatus
    setLocalStatus(next)
    onChange?.(lead._id ?? lead.id, next)
  }

  const colors = STATUS_COLORS[localStatus] ?? { bg: '#f8fafc', color: '#64748b' }

  return (
    <select
      value={localStatus}
      onClick={e => e.stopPropagation()}
      onChange={handleChange}
      style={{
        fontSize: 11, fontWeight: 600,
        padding: '3px 8px', borderRadius: 99,
        border: 'none', outline: 'none', cursor: 'pointer',
        background: colors.bg, color: colors.color,
        appearance: 'none', WebkitAppearance: 'none',
        minWidth: 90,
      }}
    >
      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  )
})

const ContactCell = React.memo(function ContactCell({ lead }: { lead: Lead }) {
  const waNum = (lead.whatsapp ?? lead.phone)?.replace(/\D/g, '')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lead.phone && (
        <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', textDecoration: 'none' }}>
          <Phone size={10} style={{ color: '#94a3b8' }} />
          {lead.phone}
        </a>
      )}
      {lead.email && (
        <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', textDecoration: 'none', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Mail size={10} />
          {lead.email}
        </a>
      )}
      {waNum && (
        <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', textDecoration: 'none' }}>
          <MessageCircle size={10} />
          WhatsApp
        </a>
      )}
    </div>
  )
})

const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
    {[...Array(7)].map((_, i) => (
      <td key={i} style={{ padding: '12px 16px' }}>
        <div className="skeleton" style={{ height: 12, width: `${50 + (i * 17) % 40}%`, borderRadius: 6 }} />
      </td>
    ))}
  </tr>
)

function LeadsTable({ leads, isLoading, onEdit, onDelete, onFollowUp, onStatusChange }: Props) {
  if (!isLoading && leads.length === 0) {
    return (
      <div style={{ padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>No leads found</p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <th className="thead-cell">Lead</th>
            <th className="thead-cell hidden md:table-cell">Contact</th>
            <th className="thead-cell">Source</th>
            <th className="thead-cell">Status</th>
            <th className="thead-cell hidden lg:table-cell">Follow-up</th>
            <th className="thead-cell hidden lg:table-cell">Added</th>
            <th className="thead-cell" style={{ width: 110 }}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            : leads.map(lead => {
                const displayName = (lead.fullName ?? lead.name ?? '').trim() || 'Unknown'
                const rowKey = lead._id ?? lead.id

                return (
                  <tr
                    key={rowKey}
                    className="tbody-row"
                    style={{ transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >
                    {/* Lead name — click se edit */}
                    <td className="tbody-cell" style={{ cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={displayName} size={8} />
                        <div>
                          <p style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{displayName}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{lead.email ?? lead.phone ?? '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="tbody-cell hidden md:table-cell">
                      <ContactCell lead={lead} />
                    </td>

                    {/* Source */}
                    <td className="tbody-cell" style={{ cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      <SourceBadge source={lead.source} />
                    </td>

                    {/* Status */}
                    <td className="tbody-cell">
                      <StatusSelect lead={lead} onChange={onStatusChange} />
                    </td>

                    {/* Follow-up date */}
                    <td className="tbody-cell hidden lg:table-cell" style={{ cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      {lead.followup_date ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <CalendarClock size={12} style={{ color: '#94a3b8' }} />
                          <span style={{ color: new Date(lead.followup_date) < new Date() && !lead.followup_done ? '#dc2626' : '#475569' }}>
                            {format(new Date(lead.followup_date), 'MMM d')}
                          </span>
                          {lead.followUp?.recurrence && lead.followUp.recurrence !== 'once' && (
                            <span style={{ fontSize: 10, color: '#7c3aed', background: '#f5f3ff', padding: '1px 5px', borderRadius: 99 }}>🔄</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>
                      )}
                    </td>

                    {/* Added */}
                    <td className="tbody-cell hidden lg:table-cell" style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer' }} onClick={() => onEdit(lead)}>
                      {lead.created_at ? format(new Date(lead.created_at), 'MMM d') : '—'}
                    </td>

                    {/* Actions — ISOLATED td, no event bubbling issue */}
                    <td className="tbody-cell" style={{ pointerEvents: 'all' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>

                        {/* Follow-up button */}
                        {onFollowUp && (
                          <button
                            type="button"
                            title="Schedule Follow-up"
                            style={{
                              padding: 5, borderRadius: 6, border: 'none',
                              background: lead.followUp?.active ? '#f5f3ff' : 'transparent',
                              cursor: 'pointer',
                              color: lead.followUp?.active ? '#7c3aed' : '#94a3b8',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f5f3ff'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = lead.followUp?.active ? '#f5f3ff' : 'transparent'}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onFollowUp(lead)
                            }}
                          >
                            <CalendarClock size={13} />
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          type="button"
                          title="Edit Lead"
                          style={{
                            padding: 5, borderRadius: 6, border: 'none',
                            background: 'transparent', cursor: 'pointer', color: '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#eff4ff'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onEdit(lead)
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          title="Delete Lead"
                          style={{
                            padding: 5, borderRadius: 6, border: 'none',
                            background: 'transparent', cursor: 'pointer', color: '#dc2626',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDelete(lead._id ?? lead.id)
                          }}
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>
                    </td>

                  </tr>
                )
              })}
        </tbody>
      </table>
    </div>
  )
}

export default React.memo(LeadsTable)