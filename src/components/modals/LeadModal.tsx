// // import { useEffect, useState, useRef } from 'react'
// // import { X, Loader2, CalendarClock } from 'lucide-react'
// // import type { Lead, LeadInsert, LeadStatus, LeadSource } from '@/types'

// // interface Props {
// //   lead?: Lead | null
// //   open: boolean
// //   onClose: () => void
// //   onSave: (data: LeadInsert) => void
// //   isSaving: boolean
// // }

// // const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']
// // const SOURCES:  LeadSource[]  = ['Meta Ads', 'Manual', 'Imported']

// // interface Form {
// //   name: string; email: string; phone: string; whatsapp: string
// //   source: LeadSource; status: LeadStatus
// //   note: string; assigned_to: string
// //   followup_date: string; followup_note: string; followup_done: boolean
// // }

// // const EMPTY: Form = {
// //   name:'', email:'', phone:'', whatsapp:'',
// //   source:'Meta Ads', status:'New',
// //   note:'', assigned_to:'',
// //   followup_date:'', followup_note:'', followup_done: false
// // }

// // function validate(f: Form) {
// //   const e: Partial<Record<keyof Form, string>> = {}
// //   if (!f.name.trim()) e.name = 'Name is required'
// //   if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email'
// //   if ((f.status === 'Interested' || f.status === 'Contacted') && !f.followup_date)
// //     e.followup_date = 'Follow-up date required'
// //   return e
// // }

// // export default function LeadModal({ lead, open, onClose, onSave, isSaving }: Props) {
// //   const [form, setForm] = useState<Form>(EMPTY)
// //   const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
// //   const firstRef = useRef<HTMLInputElement>(null)

// //   useEffect(() => {
// //     if (!open) return
// //     const f: Form = lead ? {
// //       name: lead.name, email: lead.email ?? '', phone: lead.phone ?? '',
// //       whatsapp: lead.whatsapp ?? '', source: lead.source, status: lead.status,
// //       note: lead.note ?? '', assigned_to: lead.assigned_to ?? '',
// //       followup_date: lead.followup_date ?? '', followup_note: lead.followup_note ?? '',
// //       followup_done: lead.followup_done ?? false
// //     } : EMPTY

// //     setForm(f)
// //     setErrors({})
// //     setTimeout(() => firstRef.current?.focus(), 100)
// //   }, [open, lead])

// //   const set = (key: keyof Form) =>
// //     (e: any) => {
// //       const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
// //       setForm(f => ({ ...f, [key]: val }))
// //     }

// //   const handleSubmit = () => {
// //     const errs = validate(form)
// //     if (Object.keys(errs).length) return setErrors(errs)

// //     onSave({
// //       name: form.name,
// //       email: form.email || null,
// //       phone: form.phone || null,
// //       whatsapp: form.whatsapp || null,
// //       source: form.source,
// //       status: form.status,
// //       note: form.note || null,
// //       assigned_to: form.assigned_to || null,
// //       followup_date: form.followup_date || null,
// //       followup_note: form.followup_note || null,
// //       followup_done: form.followup_done
// //     })
// //   }

// //   if (!open) return null

// //   return (
// //     <div
// //       className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-3"
// //       onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
// //     >
// //       {/* ✅ RESPONSIVE MODAL */}
// //       <div className="bg-white rounded-2xl w-full max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col shadow-xl">

// //         {/* Header */}
// //         <div className="flex justify-between items-center px-5 py-4 border-b">
// //           <h2 className="font-semibold text-sm">{lead ? 'Edit Lead' : 'Add Lead'}</h2>
// //           <button onClick={onClose}><X size={16} /></button>
// //         </div>

// //         {/* Body */}
// //         <div className="p-5 space-y-4 overflow-y-auto">

// //           {/* Name + Phone */}
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //             <input ref={firstRef} className="input-base" placeholder="Full Name" value={form.name} onChange={set('name')} />
// //             <input className="input-base" placeholder="Phone" value={form.phone} onChange={set('phone')} />
// //           </div>

// //           {/* Email + WhatsApp */}
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //             <input className="input-base" placeholder="Email" value={form.email} onChange={set('email')} />
// //             <input className="input-base" placeholder="WhatsApp" value={form.whatsapp} onChange={set('whatsapp')} />
// //           </div>

// //           {/* Source + Status */}
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //             <select className="input-base" value={form.source} onChange={set('source')}>
// //               {SOURCES.map(s => <option key={s}>{s}</option>)}
// //             </select>
// //             <select className="input-base" value={form.status} onChange={set('status')}>
// //               {STATUSES.map(s => <option key={s}>{s}</option>)}
// //             </select>
// //           </div>

// //           {/* Follow-up */}
// //           {(form.status === 'Interested' || form.status === 'Contacted') && (
// //             <div className="bg-yellow-50 p-3 rounded-lg space-y-2">
// //               <div className="flex items-center gap-2 text-sm font-medium">
// //                 <CalendarClock size={14} /> Follow-up
// //               </div>
// //               <input type="date" className="input-base" value={form.followup_date} onChange={set('followup_date')} />
// //               <input className="input-base" placeholder="Follow-up note" value={form.followup_note} onChange={set('followup_note')} />
// //             </div>
// //           )}

// //           {/* Assigned + Note */}
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //             <input className="input-base" placeholder="Assigned To" value={form.assigned_to} onChange={set('assigned_to')} />
// //             <input className="input-base" placeholder="Note" value={form.note} onChange={set('note')} />
// //           </div>

// //         </div>

// //         {/* Footer */}
// //         <div className="flex justify-end gap-2 px-5 py-4 border-t">
// //           <button className="btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn-primary" onClick={handleSubmit} disabled={isSaving}>
// //             {isSaving ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
// //           </button>
// //         </div>

// //       </div>
// //     </div>
// //   )
// // }

// // src/components/modals/LeadModal.tsx

// import { useEffect, useState, useRef } from 'react'
// import { X, Loader2, CalendarClock, RefreshCw, MessageCircle } from 'lucide-react'
// import type { Lead, LeadInsert, LeadStatus, LeadSource, FollowUpRecurrence } from '@/types'

// interface Props {
//   lead?: Lead | null
//   open: boolean
//   onClose: () => void
//   onSave: (data: LeadInsert) => void
//   isSaving: boolean
// }

// const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']
// const SOURCES:  LeadSource[]  = ['facebook', 'whatsapp', 'Meta Ads', 'Manual', 'Imported']

// const RECURRENCE_OPTIONS: { value: FollowUpRecurrence; label: string }[] = [
//   { value: 'once',     label: 'once' },
//   { value: 'tomorrow', label: 'tomorrow'                  },
//   { value: '3days',    label: '3 days'           },
//   { value: 'weekly',   label: 'Weekly'               },
// ]

// // Statuses jo follow-up suggest karte hain
// const FOLLOWUP_STATUSES: LeadStatus[] = ['Contacted', 'Interested']

// interface Form {
//   name: string; email: string; phone: string; whatsapp: string
//   source: LeadSource; status: LeadStatus
//   note: string; assigned_to: string
//   followup_date: string
//   followup_note: string
//   followup_done: boolean
//   followup_recurrence: FollowUpRecurrence
//   followup_whatsappOptIn: boolean
// }

// const EMPTY: Form = {
//   name: '', email: '', phone: '', whatsapp: '',
//   source: 'Manual', status: 'New',
//   note: '', assigned_to: '',
//   followup_date: '', followup_note: '', followup_done: false,
//   followup_recurrence: 'once', followup_whatsappOptIn: false,
// }

// function validate(f: Form) {
//   const e: Partial<Record<keyof Form, string>> = {}
//   if (!f.name.trim()) e.name = 'Name required hai'
//   if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email'
//   if (FOLLOWUP_STATUSES.includes(f.status) && !f.followup_date && f.followup_recurrence === 'once') {
//     e.followup_date = 'Follow-up date ya recurrence select karein'
//   }
//   return e
// }

// export default function LeadModal({ lead, open, onClose, onSave, isSaving }: Props) {
//   const [form, setForm] = useState<Form>(EMPTY)
//   const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
//   const firstRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     if (!open) return
//     if (lead) {
//       setForm({
//         name:      lead.name,
//         email:     lead.email    ?? '',
//         phone:     lead.phone    ?? '',
//         whatsapp:  lead.whatsapp ?? '',
//         source:    (lead.source as LeadSource) ?? 'Manual',
//         status:    lead.status,
//         note:      lead.note     ?? '',
//         assigned_to: lead.assigned_to ?? '',
//         followup_date:         lead.followup_date ?? '',
//         followup_note:         lead.followup_note ?? '',
//         followup_done:         lead.followup_done ?? false,
//         followup_recurrence:   (lead.followUp?.recurrence as FollowUpRecurrence) ?? 'once',
//         followup_whatsappOptIn: lead.followUp?.whatsappOptIn ?? false,
//       })
//     } else {
//       setForm(EMPTY)
//     }
//     setErrors({})
//     setTimeout(() => firstRef.current?.focus(), 80)
//   }, [open, lead])

//   const set = (key: keyof Form) => (e: any) => {
//     const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
//     setForm(f => ({ ...f, [key]: val }))
//     if (errors[key]) setErrors(err => ({ ...err, [key]: undefined }))
//   }

//   // Auto-fill phone → whatsapp
//   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value
//     setForm(f => ({ ...f, phone: val, whatsapp: f.whatsapp || val }))
//   }

//   const handleSubmit = () => {
//     const errs = validate(form)
//     if (Object.keys(errs).length) { setErrors(errs); return }
//     onSave({
//       name:      form.name,
//       email:     form.email    || null,
//       phone:     form.phone    || null,
//       whatsapp:  form.whatsapp || null,
//       source:    form.source,
//       status:    form.status,
//       note:      form.note     || null,
//       assigned_to: form.assigned_to || null,
//       followup_date:          form.followup_date || null,
//       followup_note:          form.followup_note || null,
//       followup_done:          form.followup_done,
//       followup_recurrence:    form.followup_recurrence,
//       followup_whatsappOptIn: form.followup_whatsappOptIn,
//     })
//   }

//   if (!open) return null

//   const showFollowup = FOLLOWUP_STATUSES.includes(form.status)

//   return (
//     <div
//       className="modal-backdrop"
//       onClick={e => { if (e.target === e.currentTarget) onClose() }}
//     >
//       <div style={{
//         background: '#fff',
//         borderRadius: 20,
//         width: '100%',
//         maxWidth: 580,
//         maxHeight: '92vh',
//         display: 'flex',
//         flexDirection: 'column',
//         boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
//         animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
//       }}>
//         {/* Header */}
//         <div style={{
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           padding: '18px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
//         }}>
//           <div>
//             <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
//               {lead ? ' Edit ' : '➕ Add New Lead '}
//             </h2>
//             {lead && (
//               <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
//                 {lead.source} · Added {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : ''}
//               </p>
//             )}
//           </div>
//           <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
//             <X size={15} />
//           </button>
//         </div>

//         {/* Body */}
//         <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

//           {/* Row: Name + Phone */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//             <div>
//               <label style={labelStyle}>Full Name *</label>
//               <input ref={firstRef} className={`input-base ${errors.name ? 'border-red-400' : ''}`} placeholder="" value={form.name} onChange={set('name')} style={{ height: 38 }} />
//               {errors.name && <p style={errStyle}>{errors.name}</p>}
//             </div>
//             <div>
//               <label style={labelStyle}>Phone</label>
//               <input className="input-base" placeholder="" value={form.phone} onChange={handlePhoneChange} style={{ height: 38 }} />
//             </div>
//           </div>

//           {/* Row: Email + WhatsApp */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//             <div>
//               <label style={labelStyle}>Email</label>
//               <input className={`input-base ${errors.email ? 'border-red-400' : ''}`} type="email" placeholder="" value={form.email} onChange={set('email')} style={{ height: 38 }} />
//               {errors.email && <p style={errStyle}>{errors.email}</p>}
//             </div>
//             <div>
//               <label style={labelStyle}>WhatsApp</label>
//               <input className="input-base" placeholder="" value={form.whatsapp} onChange={set('whatsapp')} style={{ height: 38 }} />
//             </div>
//           </div>

//           {/* Row: Source + Status */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//             <div>
//               <label style={labelStyle}>Source</label>
//               <select className="input-base" value={form.source} onChange={set('source')} style={{ height: 38 }}>
//                 {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </div>
//             <div>
//               <label style={labelStyle}>Status</label>
//               <select
//                 className="input-base"
//                 value={form.status}
//                 onChange={set('status')}
//                 style={{
//                   height: 38,
//                   // Highlight based on status
//                   background:
//                     form.status === 'Interested' ? '#f5f3ff' :
//                     form.status === 'Contacted'  ? '#fffbeb' :
//                     form.status === 'Closed'     ? '#f0fdf4' :
//                     form.status === 'Lost'       ? '#fef2f2' : '#fff',
//                   color:
//                     form.status === 'Interested' ? '#7c3aed' :
//                     form.status === 'Contacted'  ? '#d97706' :
//                     form.status === 'Closed'     ? '#15803d' :
//                     form.status === 'Lost'       ? '#dc2626' : '#374151',
//                   fontWeight: 600,
//                 }}
//               >
//                 {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* Row: Note */}
//           <div>
//             <label style={labelStyle}>Note</label>
//             <input className="input-base" placeholder="write note...." value={form.note} onChange={set('note')} style={{ height: 38 }} />
//           </div>

//           {/* ── Follow-up Section (Contacted / Interested pe auto-show) ── */}
//           {showFollowup && (
//             <div style={{
//               background: form.status === 'Interested' ? '#f5f3ff' : '#fffbeb',
//               border: `1.5px solid ${form.status === 'Interested' ? '#ddd6fe' : '#fde68a'}`,
//               borderRadius: 12,
//               padding: '14px 16px',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: 12,
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <CalendarClock size={15} style={{ color: form.status === 'Interested' ? '#7c3aed' : '#d97706' }} />
//                 <p style={{ fontSize: 13, fontWeight: 700, color: form.status === 'Interested' ? '#6d28d9' : '#92400e' }}>
//                   Follow-up Schedule
//                 </p>
//                 <span style={{ fontSize: 11, background: form.status === 'Interested' ? '#ede9fe' : '#fef3c7', color: form.status === 'Interested' ? '#7c3aed' : '#d97706', padding: '2px 8px', borderRadius: 99 }}>
//                   {form.status}
//                 </span>
//               </div>

//               {/* Recurrence */}
//               <div>
//                 <label style={labelStyle}>Recurrence (repeat)</label>
//                 <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//                   {RECURRENCE_OPTIONS.map(r => (
//                     <button
//                       key={r.value}
//                       type="button"
//                       onClick={() => setForm(f => ({ ...f, followup_recurrence: r.value }))}
//                       style={{
//                         padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
//                         border: `1.5px solid ${form.followup_recurrence === r.value ? '#7c3aed' : '#e2e8f0'}`,
//                         background: form.followup_recurrence === r.value ? '#f5f3ff' : '#fff',
//                         color: form.followup_recurrence === r.value ? '#7c3aed' : '#64748b',
//                         cursor: 'pointer',
//                         display: 'flex', alignItems: 'center', gap: 4,
//                       }}
//                     >
//                       {r.value !== 'once' && <RefreshCw size={10} />}
//                       {r.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Date — only for 'once' */}
//               {form.followup_recurrence === 'once' && (
//                 <div>
//                   <label style={labelStyle}>Follow-up Date *</label>
//                   <input
//                     type="date"
//                     className={`input-base ${errors.followup_date ? 'border-red-400' : ''}`}
//                     value={form.followup_date}
//                     onChange={set('followup_date')}
//                     min={new Date().toISOString().split('T')[0]}
//                     style={{ height: 38 }}
//                   />
//                   {errors.followup_date && <p style={errStyle}>{errors.followup_date}</p>}
//                 </div>
//               )}

//               {/* Note */}
//               <div>
//                 <label style={labelStyle}>Follow-up Note</label>
//                 <input
//                   className="input-base"
//                   placeholder="Kya discuss karna hai…"
//                   value={form.followup_note}
//                   onChange={set('followup_note')}
//                   style={{ height: 38 }}
//                 />
//               </div>

//               {/* WhatsApp opt-in */}
//               <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 500 }}>
//                 <input
//                   type="checkbox"
//                   checked={form.followup_whatsappOptIn}
//                   onChange={set('followup_whatsappOptIn')}
//                   style={{ width: 15, height: 15, accentColor: '#25d366' }}
//                 />
//                 <MessageCircle size={14} style={{ color: '#25d366' }} />
//                 WhatsApp reminder 
//               </label>

//               {/* Mark done (edit only) */}
//               {lead && (
//                 <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 500 }}>
//                   <input
//                     type="checkbox"
//                     checked={form.followup_done}
//                     onChange={set('followup_done')}
//                     style={{ width: 15, height: 15, accentColor: '#16a34a' }}
//                   />
//                   ✅ Follow-up done 
//                 </label>
//               )}
//             </div>
//           )}

//         </div>

//         {/* Footer */}
//         <div style={{
//           display: 'flex', justifyContent: 'flex-end', gap: 8,
//           padding: '14px 20px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
//         }}>
//           <button className="btn-secondary" onClick={onClose} style={{ height: 38 }}>Cancel</button>
//           <button className="btn-primary" onClick={handleSubmit} disabled={isSaving} style={{ height: 38, minWidth: 90, justifyContent: 'center' }}>
//             {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (lead ? 'Update' : 'Add Lead')}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// const labelStyle: React.CSSProperties = {
//   fontSize: 11, fontWeight: 600, color: '#64748b',
//   textTransform: 'uppercase', letterSpacing: '0.04em',
//   display: 'block', marginBottom: 5,
// }
// const errStyle: React.CSSProperties = {
//   fontSize: 11, color: '#ef4444', marginTop: 4,
// }

import { useEffect, useState, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Lead, LeadInsert, LeadStatus, LeadSource } from '@/types'

interface Props {
  lead?: Lead | null
  open: boolean
  onClose: () => void
  onSave: (data: LeadInsert) => void
  isSaving: boolean
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']
const SOURCES: LeadSource[]  = ['facebook', 'whatsapp', 'Meta Ads', 'Manual', 'Imported']

interface Form {
  name: string
  email: string
  phone: string
  whatsapp: string
  source: LeadSource
  status: LeadStatus
  note: string
  assigned_to: string
}

const EMPTY: Form = {
  name: '', email: '', phone: '', whatsapp: '',
  source: 'Manual', status: 'New',
  note: '', assigned_to: '',
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (!f.name.trim()) e.name = 'Name required hai'
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email'
  return e
}

export default function LeadModal({ lead, open, onClose, onSave, isSaving }: Props) {
  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (lead) {
      setForm({
        name:        lead.fullName ?? lead.name ?? '',
        email:       lead.email       ?? '',
        phone:       lead.phone       ?? '',
        whatsapp:    lead.whatsapp    ?? '',
        source:      (lead.source as LeadSource) ?? 'Manual',
        status:      lead.status,
        note:        lead.note        ?? '',
        assigned_to: lead.assigned_to ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
    setTimeout(() => firstRef.current?.focus(), 80)
  }, [open, lead])

  const set = (key: keyof Form) => (e: any) => {
    const val = e.target.value
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(err => ({ ...err, [key]: undefined }))
  }

  // Auto-fill phone → whatsapp
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm(f => ({ ...f, phone: val, whatsapp: f.whatsapp || val }))
  }

  const handleSubmit = () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name:        form.name,
      email:       form.email       || null,
      phone:       form.phone       || null,
      whatsapp:    form.whatsapp    || null,
      source:      form.source,
      status:      form.status,
      note:        form.note        || null,
      assigned_to: form.assigned_to || null,
    })
  }

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 540,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
        animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {lead ? '✏️ Edit Lead' : '➕ Add New Lead'}
            </h2>
            {lead && (
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {lead.source} · Added {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer', color: '#64748b', display: 'flex' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                ref={firstRef}
                className={`input-base ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={set('name')}
                style={{ height: 38 }}
              />
              {errors.name && <p style={errStyle}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input className="input-base" value={form.phone} onChange={handlePhoneChange} style={{ height: 38 }} />
            </div>
          </div>

          {/* Email + WhatsApp */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                className={`input-base ${errors.email ? 'border-red-400' : ''}`}
                type="email"
                value={form.email}
                onChange={set('email')}
                style={{ height: 38 }}
              />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input className="input-base" value={form.whatsapp} onChange={set('whatsapp')} style={{ height: 38 }} />
            </div>
          </div>

          {/* Source + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Source</label>
              <select className="input-base" value={form.source} onChange={set('source')} style={{ height: 38 }}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                className="input-base"
                value={form.status}
                onChange={set('status')}
                style={{
                  height: 38,
                  background:
                    form.status === 'Interested' ? '#f5f3ff' :
                    form.status === 'Contacted'  ? '#fffbeb' :
                    form.status === 'Closed'     ? '#f0fdf4' :
                    form.status === 'Lost'       ? '#fef2f2' : '#fff',
                  color:
                    form.status === 'Interested' ? '#7c3aed' :
                    form.status === 'Contacted'  ? '#d97706' :
                    form.status === 'Closed'     ? '#15803d' :
                    form.status === 'Lost'       ? '#dc2626' : '#374151',
                  fontWeight: 600,
                }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={labelStyle}>Note</label>
            <input
              className="input-base"
              placeholder="Write note..."
              value={form.note}
              onChange={set('note')}
              style={{ height: 38 }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 20px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <button className="btn-secondary" onClick={onClose} style={{ height: 38 }}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSaving}
            style={{ height: 38, minWidth: 90, justifyContent: 'center' }}
          >
            {isSaving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : lead ? 'Update' : 'Add Lead'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  display: 'block', marginBottom: 5,
}
const errStyle: React.CSSProperties = {
  fontSize: 11, color: '#ef4444', marginTop: 4,
}