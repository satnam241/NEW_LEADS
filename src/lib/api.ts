// // import { supabase } from './supabase'
// // import type { Lead, LeadInsert, LeadUpdate, LeadFilters, Followup, LeadStats } from '@/types'
// // import { format, startOfDay, endOfDay, isToday, isPast, parseISO } from 'date-fns'

// // const PAGE_SIZE = 20

// // // ── LEADS ──────────────────────────────────────────────────

// // export async function fetchLeads(filters: LeadFilters, page: number, pageSize = PAGE_SIZE) {
// //   let q = supabase.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false })
// //   if (filters.search.trim()) {
// //     const s = `%${filters.search.trim()}%`
// //     q = q.or(`name.ilike.${s},email.ilike.${s},phone.ilike.${s}`)
// //   }
// //   if (filters.status)   q = q.eq('status', filters.status)
// //   if (filters.source)   q = q.eq('source', filters.source)
// //   if (filters.dateFrom) q = q.gte('created_at', filters.dateFrom)
// //   if (filters.dateTo)   q = q.lte('created_at', filters.dateTo + 'T23:59:59')
    
// //   q = q.range((page - 1) * pageSize, page * pageSize - 1)
  
// //   const { data, error, count } = await q
// //   if (error) throw new Error(error.message)
// //   return { data: data as Lead[], count: count ?? 0 }
// // }

// // export async function createLead(lead: LeadInsert): Promise<Lead> {
// //   const { data, error } = await supabase.from('leads').insert(lead).select().single()
// //   if (error) throw new Error(error.message)
// //   return data
// // }

// // export async function updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
// //   const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single()
// //   if (error) throw new Error(error.message)
// //   return data
// // }

// // export async function deleteLead(id: string) {
// //   const { error } = await supabase.from('leads').delete().eq('id', id)
// //   if (error) throw new Error(error.message)
// // }

// // // ── STATS ──────────────────────────────────────────────────

// // export async function fetchStats(): Promise<LeadStats> {
// //   const { data, error } = await supabase.from('leads').select('status, source, created_at, followup_date, followup_done')
// //   if (error) throw new Error(error.message)
// //   const rows = data ?? []
// //   const now = new Date()
// //   const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
// //   const byStatus: Record<string, number> = {}
// //   const bySource: Record<string, number> = {}
// //   let thisMonth = 0, todayFollowups = 0, overdueFollowups = 0
// //   for (const r of rows) {
// //     byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
// //     bySource[r.source] = (bySource[r.source] ?? 0) + 1
// //     if (r.created_at >= startMonth) thisMonth++
// //     if (r.followup_date && !r.followup_done) {
// //       const d = parseISO(r.followup_date)
// //       if (isToday(d)) todayFollowups++
// //       else if (isPast(d)) overdueFollowups++
// //     }
// //   }
// //   return { total: rows.length, byStatus, bySource, thisMonth, todayFollowups, overdueFollowups }
// // }

// // // ── FOLLOW-UPS ─────────────────────────────────────────────

// // export async function fetchFollowups(filter: 'today' | 'overdue' | 'upcoming' | 'all') {
// //   const today = format(new Date(), 'yyyy-MM-dd')
// //   let q = supabase.from('leads').select('*').not('followup_date', 'is', null).eq('followup_done', false).order('followup_date', { ascending: true })
// //   if (filter === 'today')    q = q.eq('followup_date', today)
// //   if (filter === 'overdue')  q = q.lt('followup_date', today)
// //   if (filter === 'upcoming') q = q.gt('followup_date', today)
// //   const { data, error } = await q
// //   if (error) throw new Error(error.message)
// //   return data as Lead[]
// // }

// // export async function markFollowupDone(id: string) {
// //   const { error } = await supabase.from('leads').update({ followup_done: true }).eq('id', id)
// //   if (error) throw new Error(error.message)
// // }

// // // ── PIPELINE ───────────────────────────────────────────────

// // export async function fetchPipeline() {
// //   const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
// //   if (error) throw new Error(error.message)
// //   return data as Lead[]
// // }

// // // ── DAILY REPORT ───────────────────────────────────────────

// // export async function fetchDailyReport(date: string) {
// //   const start = date + 'T00:00:00'
// //   const end   = date + 'T23:59:59'
// //   const { data: newLeads, error: e1 } = await supabase.from('leads').select('*').gte('created_at', start).lte('created_at', end)
// //   const { data: updated,  error: e2 } = await supabase.from('leads').select('*').gte('updated_at', start).lte('updated_at', end).neq('status', 'New')
// //   const { data: followups, error: e3 } = await supabase.from('leads').select('*').eq('followup_date', date)
// //   if (e1 || e2 || e3) throw new Error('Failed to load report')
// //   return { newLeads: newLeads as Lead[], updatedLeads: updated as Lead[], followups: followups as Lead[], date }
// // }

// // src/lib/api.ts — Pure REST API (No Supabase)
// // ─── api.ts — REST API Layer (No Supabase, pure fetch) ───────────────────────
// // Mapped to backend routes:
// //   /admin/*         → admin.routes.ts
// //   /leads/*         → leads.route.ts
// //   /followup/*      → followup.routes.ts
// //   /activities/*    → activity.routes.ts
// //   /messages/*      → message.routes.ts

// import type {
//   Lead,
//   LeadInsert,
//   LeadUpdate,
//   LeadFilters,
//   LeadStats,
//   Activity,
//   ActivityInsert,
//   AuthCredentials,
//   AuthResponse,
//   FollowUpPayload,
//   SendMessagePayload,
//   DailyReport,
//   ReminderLead,
// } from '@/types'
// import { isToday, isPast, parseISO, format } from 'date-fns'

// // ─── Base URL (set VITE_API_URL in .env) ─────────────────────────────────────
// export const API_BASE = (import.meta.env.VITE_API_URL1 || '').replace(/\/+$/, '')

// // ─── Auth Helpers ─────────────────────────────────────────────────────────────
// function getToken(): string {
//   return localStorage.getItem('token') ?? ''
// }

// function authHeaders(): Record<string, string> {
//   return {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${getToken()}`,
//   }
// }

// // ─── Response Handler ────────────────────────────────────────────────────────
// async function handleResponse<T>(res: Response): Promise<T> {
//   const data = await res.json().catch(() => null)
//   if (!res.ok) {
//     throw new Error(data?.error || data?.message || `Request failed: ${res.status}`)
//   }
//   return data as T
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── MAPPERS ─────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// // Backend status → Frontend status
// function mapStatus(s: string): Lead['status'] {
//   const map: Record<string, Lead['status']> = {
//     new:       'New',
//     contacted: 'Contacted',
//     converted: 'Closed',
//     interested:'Interested',
//     lost:      'Lost',
//     // pass-through (already capitalised)
//     New:       'New',
//     Contacted: 'Contacted',
//     Interested:'Interested',
//     Closed:    'Closed',
//     Lost:      'Lost',
//   }
//   return map[s] ?? 'New'
// }

// // Frontend status → Backend status
// function unmapStatus(s: Lead['status']): string {
//   const map: Record<string, string> = {
//     New:       'new',
//     Contacted: 'contacted',
//     Interested:'contacted',   // backend enum: new | contacted | closed
//     Closed:    'closed',
//     Lost:      'contacted',
//   }
//   return map[s] ?? 'new'
// }

// // Raw backend lead → typed frontend Lead
// export function mapLead(raw: any): Lead {
//   return {
//     id:        raw._id ?? raw.id ?? '',
//     _id:       raw._id,

//     name:      raw.fullName ?? raw.name ?? 'Unknown',
//     fullName:  raw.fullName,

//     email:     raw.email  ?? null,
//     phone:     raw.phone  ?? null,
//     whatsapp:  raw.phone  ?? null,   // no separate whatsapp field in backend

//     source:    raw.source ?? 'Manual',
//     status:    mapStatus(raw.status),

//     note:      raw.message ?? null,
//     message:   raw.message,

//     assigned_to: null,

//     // Flatten followUp object for UI convenience
//     followup_date: raw.followUp?.date
//       ? format(parseISO(raw.followUp.date), 'yyyy-MM-dd')
//       : null,
//     followup_note: raw.followUp?.message ?? null,
//     followup_done: raw.followUp?.active === false,

//     // Keep raw followUp for schedule modal etc.
//     followUp: raw.followUp
//       ? {
//           date:          raw.followUp.date ?? null,
//           recurrence:    raw.followUp.recurrence ?? null,
//           message:       raw.followUp.message ?? null,
//           whatsappOptIn: raw.followUp.whatsappOptIn ?? false,
//           active:        raw.followUp.active ?? false,
//         }
//       : undefined,

//     extraFields: raw.extraFields,
//     rawData:     raw.rawData,

//     created_at: raw.createdAt ?? new Date().toISOString(),
//     updated_at: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
//     createdAt:  raw.createdAt,
//     updatedAt:  raw.updatedAt,
//   }
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── AUTH ─────────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** POST /admin/login */
// export async function adminLogin(creds: AuthCredentials): Promise<AuthResponse> {
//   const res = await fetch(`${API_BASE}/admin/login`, {
//     method:  'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body:    JSON.stringify(creds),
//   })
//   const data = await handleResponse<any>(res)
//   localStorage.setItem('token', data.token)
//   return data
// }

// /** POST /admin/signup */
// export async function adminSignup(payload: { name: string } & AuthCredentials): Promise<AuthResponse> {
//   const res = await fetch(`${API_BASE}/admin/signup`, {
//     method:  'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body:    JSON.stringify(payload),
//   })
//   const data = await handleResponse<any>(res)
//   localStorage.setItem('token', data.token)
//   return data
// }

// /** POST /admin/forgot-password */
// export async function forgotPassword(email: string): Promise<{ message: string }> {
//   const res = await fetch(`${API_BASE}/admin/forgot-password`, {
//     method:  'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body:    JSON.stringify({ email }),
//   })
//   return handleResponse(res)
// }

// /** POST /admin/reset-password */
// export async function resetPassword(payload: {
//   currentPassword: string
//   newPassword: string
// }): Promise<{ message: string }> {
//   const res = await fetch(`${API_BASE}/admin/reset-password`, {
//     method:  'POST',
//     headers: authHeaders(),
//     body:    JSON.stringify(payload),
//   })
//   return handleResponse(res)
// }

// /** GET /admin/me */
// export async function getAdminProfile(): Promise<{ _id: string; name: string; email: string }> {
//   const res = await fetch(`${API_BASE}/admin/me`, { headers: authHeaders() })
//   return handleResponse(res)
// }

// export function adminLogout() {
//   localStorage.removeItem('token')
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── LEADS  (leads.route.ts → /leads/*) ──────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// const PAGE_SIZE = 20

// /**
//  * GET /leads/leads
//  * Supports: page, limit, search, status, startDate, endDate
//  */
// export async function fetchLeads(
//   filters: LeadFilters,
//   page: number,
//   pageSize = PAGE_SIZE
// ): Promise<{ data: Lead[]; count: number }> {
//   const q = new URLSearchParams()
//   q.set('page',  String(page))
//   q.set('limit', String(pageSize))
//   if (filters.search.trim()) q.set('search',    filters.search.trim())
//   if (filters.status)        q.set('status',    unmapStatus(filters.status as Lead['status']))
//   if (filters.source)        q.set('source',    filters.source)
//   if (filters.dateFrom)      q.set('startDate', filters.dateFrom)
//   if (filters.dateTo)        q.set('endDate',   filters.dateTo)

//   const res = await fetch(`${API_BASE}/leads/leads?${q}`, { headers: authHeaders() })
//   if (!res.ok) throw new Error('Failed to fetch leads')
//   const raw = await res.json()

//   const rawLeads = Array.isArray(raw) ? raw : raw.leads ?? []
//   const count    = raw.totalLeads ?? rawLeads.length

//   return { data: rawLeads.map(mapLead), count }
// }

// /** POST /leads/leads */
// export async function createLead(lead: LeadInsert): Promise<Lead> {
//   const body = {
//     fullName: lead.name,
//     email:    lead.email   ?? null,
//     phone:    lead.phone   ?? null,
//     source:   lead.source,
//     status:   unmapStatus(lead.status),
//     message:  lead.note    ?? null,
//     followUp: lead.followup_date
//       ? {
//           date:          lead.followup_date,
//           message:       lead.followup_note    ?? null,
//           recurrence:    lead.followup_recurrence ?? 'once',
//           whatsappOptIn: lead.followup_whatsappOptIn ?? false,
//           active:        true,
//         }
//       : undefined,
//   }
//   const res = await fetch(`${API_BASE}/leads/leads`, {
//     method:  'POST',
//     headers: authHeaders(),
//     body:    JSON.stringify(body),
//   })
//   if (!res.ok) throw new Error('Failed to create lead')
//   const data = await res.json()
//   return mapLead(data.lead ?? data)
// }

// /** PUT /leads/leads/:id  OR  PUT /admin/leads/:id */
// export async function updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
//   const body: any = {}
//   if (updates.name        !== undefined) body.fullName = updates.name
//   if (updates.email       !== undefined) body.email    = updates.email
//   if (updates.phone       !== undefined) body.phone    = updates.phone
//   if (updates.source      !== undefined) body.source   = updates.source
//   if (updates.status      !== undefined) body.status   = unmapStatus(updates.status as Lead['status'])
//   if (updates.note        !== undefined) body.message  = updates.note

//   if (
//     updates.followup_date !== undefined ||
//     updates.followup_note !== undefined ||
//     updates.followup_done !== undefined
//   ) {
//     body.followUp = {
//       date:          updates.followup_date      ?? null,
//       message:       updates.followup_note      ?? null,
//       recurrence:    updates.followup_recurrence ?? 'once',
//       whatsappOptIn: updates.followup_whatsappOptIn ?? false,
//       active:        !updates.followup_done,
//     }
//   }

//   const res = await fetch(`${API_BASE}/leads/leads/${id}`, {
//     method:  'PUT',
//     headers: authHeaders(),
//     body:    JSON.stringify(body),
//   })
//   if (!res.ok) throw new Error('Failed to update lead')
//   const data = await res.json()
//   return mapLead(data.lead ?? data)
// }

// /** DELETE /admin/leads/:id  (soft-delete via admin route) */
// export async function deleteLead(id: string): Promise<void> {
//   const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
//     method:  'DELETE',
//     headers: authHeaders(),
//   })
//   if (!res.ok) throw new Error('Failed to delete lead')
// }

// /** PATCH /leads/leads/:id/restore */
// export async function restoreLead(id: string): Promise<void> {
//   const res = await fetch(`${API_BASE}/leads/leads/${id}/restore`, {
//     method:  'PATCH',
//     headers: authHeaders(),
//   })
//   if (!res.ok) throw new Error('Failed to restore lead')
// }

// /** PATCH /leads/leads/bulk-delete */
// export async function bulkDeleteLeads(ids: string[]): Promise<void> {
//   const res = await fetch(`${API_BASE}/leads/leads/bulk-delete`, {
//     method:  'PATCH',
//     headers: authHeaders(),
//     body:    JSON.stringify({ ids }),
//   })
//   if (!res.ok) throw new Error('Failed to bulk delete leads')
// }

// /** PATCH /leads/leads/bulk-restore */
// export async function bulkRestoreLeads(ids: string[]): Promise<void> {
//   const res = await fetch(`${API_BASE}/leads/leads/bulk-restore`, {
//     method:  'PATCH',
//     headers: authHeaders(),
//     body:    JSON.stringify({ ids }),
//   })
//   if (!res.ok) throw new Error('Failed to bulk restore leads')
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── STATS  (admin.routes.ts → /admin/stats/daily) ────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// export async function fetchStats(): Promise<LeadStats> {
//   try {
//     const token = localStorage.getItem('token')

//     if (!token) throw new Error("No auth token")

//     const headers = {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     }

//     // ❌ REMOVE stats API (useless for dashboard summary)
//     const res = await fetch(`${API_BASE}/admin/leads?page=1&limit=1000`, { headers })

//     if (res.status === 401) {
//       localStorage.removeItem('token')
//       window.location.href = '/login'
//       throw new Error("Unauthorized")
//     }

//     if (!res.ok) throw new Error("Failed to fetch leads")

//     const raw = await res.json()

//     const leads: Lead[] = (Array.isArray(raw) ? raw : raw.leads ?? []).map(mapLead)

//     // 🔥 Calculations
//     const now = new Date()
//     const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

//     let todayFollowups = 0
//     let overdueFollowups = 0
//     let thisMonth = 0

//     const byStatus: Record<string, number> = {}
//     const bySource: Record<string, number> = {}

//     for (const l of leads) {
//       byStatus[l.status] = (byStatus[l.status] ?? 0) + 1
//       bySource[l.source] = (bySource[l.source] ?? 0) + 1

//       if (l.created_at >= startMonth) thisMonth++

//       if (l.followup_date && !l.followup_done) {
//         const d = parseISO(l.followup_date)
//         if (isToday(d)) todayFollowups++
//         else if (isPast(d)) overdueFollowups++
//       }
//     }

//     return {
//       total: leads.length, // ✅ FIXED
//       byStatus,
//       bySource,
//       thisMonth,
//       todayFollowups,
//       overdueFollowups,
//     }

//   } catch (error) {
//     console.error("fetchStats error:", error)

//     return {
//       total: 0,
//       byStatus: {},
//       bySource: {},
//       thisMonth: 0,
//       todayFollowups: 0,
//       overdueFollowups: 0
//     }
//   }
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── FOLLOW-UPS  (followup.routes.ts → /followup/*) ───────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /**
//  * fetchFollowups — uses dedicated backend endpoints where available,
//  * falls back to client-side filter on full leads list for 'all'.
//  *
//  * Backend endpoints:
//  *   GET /followup/due      → today
//  *   GET /followup/overdue  → overdue
//  *   GET /followup/upcoming → upcoming
//  *   GET /followup/         → all active
//  */
// export async function fetchFollowups(
//   filter: 'today' | 'overdue' | 'upcoming' | 'all'
// ): Promise<Lead[]> {
//   const endpointMap: Record<typeof filter, string> = {
//     today:    '/followup/due',
//     overdue:  '/followup/overdue',
//     upcoming: '/followup/upcoming',
//     all:      '/followup/',
//   }

//   const res = await fetch(`${API_BASE}${endpointMap[filter]}`, { headers: authHeaders() })
//   if (!res.ok) throw new Error('Failed to fetch followups')
//   const raw = await res.json()
//   const list = raw.data ?? raw ?? []
//   return list.map(mapLead)
// }

// /** POST /followup/leads/:id/follow-up */
// export async function scheduleFollowUp(id: string, payload: FollowUpPayload): Promise<void> {
//   const res = await fetch(`${API_BASE}/followup/leads/${id}/follow-up`, {
//     method:  'POST',
//     headers: authHeaders(),
//     body:    JSON.stringify(payload),
//   })
//   if (!res.ok) throw new Error('Failed to schedule follow-up')
// }

// /** DELETE /followup/leads/:id/follow-up  — cancels / marks done */
// export async function markFollowupDone(id: string): Promise<void> {
//   const res = await fetch(`${API_BASE}/followup/leads/${id}/follow-up`, {
//     method:  'DELETE',
//     headers: authHeaders(),
//   })
//   if (!res.ok) throw new Error('Failed to cancel follow-up')
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── ACTIVITIES  (activity.routes.ts → /activities/*) ────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** GET /activities/:userId */
// export async function fetchActivities(
//   userId: string,
//   opts?: { startDate?: string; endDate?: string }
// ): Promise<Activity[]> {
//   const q = new URLSearchParams()
//   if (opts?.startDate) q.set('startDate', opts.startDate)
//   if (opts?.endDate)   q.set('endDate',   opts.endDate)

//   const res = await fetch(
//     `${API_BASE}/activities/${userId}?${q}`,
//     { headers: authHeaders() }
//   )
//   if (!res.ok) throw new Error('Failed to fetch activities')
//   return res.json()
// }

// /** POST /activities */
// export async function addActivity(payload: ActivityInsert): Promise<Activity> {
//   const res = await fetch(`${API_BASE}/activities`, {
//     method:  'POST',
//     headers: authHeaders(),
//     body:    JSON.stringify(payload),
//   })
//   if (!res.ok) throw new Error('Failed to add activity')
//   return res.json()
// }

// /** PUT /activities/:id */
// export async function updateActivity(id: string, text: string): Promise<Activity> {
//   const res = await fetch(`${API_BASE}/activities/${id}`, {
//     method:  'PUT',
//     headers: authHeaders(),
//     body:    JSON.stringify({ text }),
//   })
//   if (!res.ok) throw new Error('Failed to update activity')
//   return res.json()
// }

// /** DELETE /activities/:id */
// export async function deleteActivity(id: string): Promise<void> {
//   const res = await fetch(`${API_BASE}/activities/${id}`, {
//     method:  'DELETE',
//     headers: authHeaders(),
//   })
//   if (!res.ok) throw new Error('Failed to delete activity')
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── MESSAGES  (message.routes.ts → /messages/:leadId/send-message) ───────────
// // ════════════════════════════════════════════════════════════════════════════

// /** POST /messages/:leadId/send-message */
// export async function sendMessage(
//   leadId: string,
//   payload: SendMessagePayload
// ): Promise<{ success: boolean; message?: string }> {
//   const res = await fetch(`${API_BASE}/messages/${leadId}/send-message`, {
//     method:  'POST',
//     headers: authHeaders(),
//     body:    JSON.stringify(payload),
//   })
//   return handleResponse(res)
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── REMINDERS  (admin.routes.ts → /admin/reminders) ─────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** GET /admin/reminders */
// export async function fetchReminderLeads(): Promise<ReminderLead[]> {
//   const res = await fetch(`${API_BASE}/admin/reminders`, { headers: authHeaders() })
//   if (!res.ok) throw new Error('Failed to fetch reminders')
//   const data = await res.json()
//   return data.leads ?? data ?? []
// }

// /** GET /admin/reminders/count */
// export async function fetchReminderCount(): Promise<number> {
//   const res = await fetch(`${API_BASE}/admin/reminders/count`, { headers: authHeaders() })
//   if (!res.ok) return 0
//   const data = await res.json()
//   return data.count ?? 0
// }

// /** PUT /admin/reminders/contacted/:id */
// export async function markAsContacted(id: string): Promise<void> {
//   const res = await fetch(`${API_BASE}/admin/reminders/contacted/${id}`, {
//     method:  'PUT',
//     headers: authHeaders(),
//   })
//   if (!res.ok) throw new Error('Failed to mark as contacted')
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── PIPELINE ─────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** Returns all leads for Kanban/pipeline view */
// export async function fetchPipeline(): Promise<Lead[]> {
//   const res = await fetch(`${API_BASE}/leads/leads?page=1&limit=1000`, {
//     headers: authHeaders(),
//   })
//   if (!res.ok) throw new Error('Failed to fetch pipeline')
//   const raw = await res.json()
//   return (Array.isArray(raw) ? raw : raw.leads ?? []).map(mapLead)
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── DAILY REPORT ─────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// export async function fetchDailyReport(date: string): Promise<DailyReport> {
//   const res = await fetch(
//     `${API_BASE}/leads/leads?page=1&limit=1000&startDate=${date}&endDate=${date}`,
//     { headers: authHeaders() }
//   )
//   if (!res.ok) throw new Error('Failed to load report')
//   const raw  = await res.json()
//   const all: Lead[] = (Array.isArray(raw) ? raw : raw.leads ?? []).map(mapLead)

//   return {
//     date,
//     newLeads:     all.filter(l => l.status === 'New'),
//     updatedLeads: all.filter(l => l.status !== 'New'),
//     followups:    all.filter(l => l.followup_date === date),
//   }
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── IMPORT / EXPORT ───────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** POST /admin/import-leads  (multipart/form-data) */
// export async function importLeadsFile(
//   file: File
// ): Promise<{ success: boolean; message?: string; error?: string }> {
//   const formData = new FormData()
//   formData.append('file', file)

//   const res = await fetch(`${API_BASE}/admin/import-leads`, {
//     method:  'POST',
//     headers: { Authorization: `Bearer ${getToken()}` },
//     body:    formData,
//   })
//   const data = await res.json().catch(() => null)
//   if (res.ok) return { success: true,  message: data?.message ?? 'Imported successfully' }
//   return          { success: false, error: data?.error ?? 'Upload failed' }
// }

// /** GET /admin/leads/export  (downloads CSV/Excel from backend) */
// export async function exportLeads(): Promise<void> {
//   const res = await fetch(`${API_BASE}/admin/leads/export`, { headers: authHeaders() })
//   if (!res.ok) throw new Error('Export failed')
//   const blob = await res.blob()
//   const url  = URL.createObjectURL(blob)
//   const a    = document.createElement('a')
//   a.href     = url
//   a.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
//   a.click()
//   URL.revokeObjectURL(url)
// }


import type {
  Lead,
  LeadInsert,
  LeadUpdate,
  LeadFilters,
  LeadStats,
  Activity,
  ActivityInsert,
  AuthCredentials,
  AuthResponse,
  FollowUpPayload,
  SendMessagePayload,
  DailyReport,
  ReminderLead,
} from '@/types'
import { isToday, isPast, parseISO, format } from 'date-fns'

// ─── Base URL ────────────────────────────────────────────────────────────────
export const API_BASE = (import.meta.env.VITE_API_URL1 || '').replace(/\/+$/, '')

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
function getToken(): string {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

// ─── Response Handler ────────────────────────────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  // 401 → token expired/invalid → logout
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Unauthorized – redirecting to login')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed: ${res.status}`)
  }
  return data as T
}

// ════════════════════════════════════════════════════════════════════════════
// ── MAPPERS ──────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

// Backend status values: "new" | "contacted" | "closed" | "converted"
// Frontend status values: "New" | "Contacted" | "Interested" | "Closed" | "Lost"
function mapStatus(s: string): Lead['status'] {
  const map: Record<string, Lead['status']> = {
    new:        'New',
    contacted:  'Contacted',
    interested: 'Interested',
    converted:  'Closed',
    closed:     'Closed',
    lost:       'Lost',
    // pass-through (already capitalised – should not normally happen)
    New:        'New',
    Contacted:  'Contacted',
    Interested: 'Interested',
    Closed:     'Closed',
    Lost:       'Lost',
  }
  return map[s] ?? 'New'
}

function unmapStatus(s: Lead['status']): string {
  const map: Record<string, string> = {
    New:        'new',
    Contacted:  'contacted',
    Interested: 'contacted',  // backend enum doesn't have "interested"
    Closed:     'closed',
    Lost:       'lost',  // closest backend value
  }
  return map[s] ?? 'new'
}

// Raw backend lead → typed frontend Lead
// NOTE: getLeadsController selects only: name,email,phone,source,followUp,createdAt
//       adminGetLeads returns full document
//       createLeadController returns full document inside { success, data }
// Raw backend lead → typed frontend Lead
export function mapLead(raw: any): Lead {
  const followUpRaw = raw.followUp

  let followup_date: string | null = null
  if (followUpRaw?.date) {
    try {
      const d = new Date(followUpRaw.date)
      if (!isNaN(d.getTime())) {
        followup_date = d.toISOString().split('T')[0]
      }
    } catch {
      followup_date = null
    }
  }

  const followup_done =
    followUpRaw != null &&
    followUpRaw.active !== undefined &&
    followUpRaw.active === false

  return {
    id:       raw._id ?? raw.id ?? '',
    _id:      raw._id,

    name:     raw.fullName ?? raw.name ?? 'Unknown',
    fullName: raw.fullName,

    email:    raw.email  ?? null,
    phone:    raw.phone  ?? null,
    whatsapp: raw.phone  ?? null,

    source: raw.source ?? 'Manual',
    status: mapStatus(raw.status ?? 'new'),

    note:    raw.message ?? null,
    message: raw.message,

    assigned_to: null,

    followup_date,
    followup_note: followUpRaw?.message ?? null,
    followup_done,

    followUp: followUpRaw
      ? {
          date:          followUpRaw.date          ?? null,
          recurrence:    followUpRaw.recurrence    ?? null,
          message:       followUpRaw.message       ?? null,
          whatsappOptIn: followUpRaw.whatsappOptIn ?? false,
          active:        followUpRaw.active        ?? true,
        }
      : undefined,

    extraFields: raw.extraFields,
    rawData:     raw.rawData,

    created_at: raw.createdAt ?? new Date().toISOString(),
    updated_at: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    createdAt:  raw.createdAt,
    updatedAt:  raw.updatedAt,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ── AUTH ─────────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/** POST /admin/login  →  { success, token, admin: { id, email } } */
export async function adminLogin(creds: AuthCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(creds),
  })
  const data = await handleResponse<any>(res)
  // Token expires in 1h (backend). Store it.
  localStorage.setItem('token', data.token)
  return data
}

/** POST /admin/signup  →  { success, message } */
export async function adminSignup(
  payload: { name: string } & AuthCredentials
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/admin/signup`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  const data = await handleResponse<any>(res)
  if (data.token) localStorage.setItem('token', data.token)
  return data
}

/** POST /admin/forgot-password */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/admin/forgot-password`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email }),
  })
  return handleResponse(res)
}

/**
 * POST /admin/reset-password
 * Backend: changePasswordLoggedIn → reads token from Authorization header,
 * expects { currentPassword, newPassword }
 */
export async function resetPassword(payload: {
  currentPassword: string
  newPassword: string
}): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/admin/reset-password`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  })
  return handleResponse(res)
}

/**
 * GET /admin/me
 * Backend: adminGetProfile → returns { _id, name } (no email in response!)
 */
export async function getAdminProfile(): Promise<{
  _id: string
  name: string
  email: string
}> {
  const res = await fetch(`${API_BASE}/admin/me`, { headers: authHeaders() })
  return handleResponse(res)
}

export function adminLogout(): void {
  localStorage.removeItem('token')
}

// ════════════════════════════════════════════════════════════════════════════
// ── LEADS  (leads.route.ts → /leads/*) ───────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 20

/**
 * GET /leads/leads
 *
 * Backend getLeadsController response shape:
 * {
 *   data: Lead[],
 *   pagination: { total, page, limit, totalPages }
 * }
 *
 * NOTE: controller selects only name,email,phone,source,followUp,createdAt
 * NOTE: supports query params: page, limit, email, phone, source, followupFilter
 * NOTE: does NOT support: search, status, startDate, endDate (use admin route for those)
 */
// export async function fetchLeads(
//   filters: LeadFilters,
//   page: number,
//   pageSize = PAGE_SIZE
// ): Promise<{ data: Lead[]; count: number }> {
//   const q = new URLSearchParams()
//   q.set('page',  String(page))
//   q.set('limit', String(pageSize))

//   // Backend supports: email, phone, source, followupFilter
//   if (filters.source) q.set('source', filters.source)

//   // search → try matching by phone if it looks like a number, else email
//   if (filters.search?.trim()) {
//     const s = filters.search.trim()
//     if (/^\+?[\d\s-]{7,}$/.test(s)) {
//       q.set('phone', s)
//     } else if (s.includes('@')) {
//       q.set('email', s)
//     }
//     // partial name search not supported by getLeadsController
//   }

//   const res = await fetch(`${API_BASE}/leads/leads?${q}`, { headers: authHeaders() })
//   if (!res.ok) {
//     if (res.status === 401) {
//       localStorage.removeItem('token')
//       window.location.href = '/login'
//       throw new Error('Unauthorized')
//     }
//     throw new Error('Failed to fetch leads')
//   }

//   const raw = await res.json()
//   // Shape: { data: [...], pagination: { total, ... } }
//   const rawLeads: any[] = Array.isArray(raw) ? raw : raw.data ?? []
//   const count = raw.pagination?.total ?? rawLeads.length

//   return { data: rawLeads.map(mapLead), count }
// }

/**
 * POST /leads/leads
 *
 * Backend response: { success: true, data: Lead }
 */
export async function createLead(lead: LeadInsert): Promise<Lead> {
  const body: any = {
    fullName: lead.name,
    email:    lead.email  ?? null,
    phone:    lead.phone  ?? null,
    source:   lead.source ?? 'Manual',
    status:   unmapStatus(lead.status),
    message:  lead.note   ?? null,
  }

  if (lead.followup_date) {
    body.followUp = {
      date:          lead.followup_date,
      message:       lead.followup_note        ?? null,
      recurrence:    lead.followup_recurrence  ?? 'once',
      whatsappOptIn: lead.followup_whatsappOptIn ?? false,
      active:        true,
    }
  }

  const res = await fetch(`${API_BASE}/leads/leads`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create lead')

  const data = await res.json()
  // Response: { success: true, data: {...} }
  return mapLead(data.data ?? data.lead ?? data)
}

/**
 * PUT /leads/leads/:id
 *
 * Backend updateLeadController – accepts full lead fields
 */
export async function updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
  const body: any = {}
  if (updates.name   !== undefined) body.fullName = updates.name
  if (updates.email  !== undefined) body.email    = updates.email
  if (updates.phone  !== undefined) body.phone    = updates.phone
  if (updates.source !== undefined) body.source   = updates.source
  if (updates.status !== undefined) body.status   = unmapStatus(updates.status as Lead['status'])
  if (updates.note   !== undefined) body.message  = updates.note
 
  // ❌ followUp block HATAO — ye race condition ka cause tha
  // followUp sirf scheduleFollowUp() se update hoga
 
  const res = await fetch(`${API_BASE}/leads/leads/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update lead')
  const data = await res.json()
  return mapLead(data.lead ?? data.data ?? data)
}

/**
 * DELETE /admin/leads/:id  (soft-delete, adminAuth protected)
 */
export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
    method:  'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete lead')
}

/** PATCH /leads/leads/:id/restore */
export async function restoreLead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/leads/leads/${id}/restore`, {
    method:  'PATCH',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to restore lead')
}

/** PATCH /leads/leads/bulk-delete */
export async function bulkDeleteLeads(ids: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/leads/leads/bulk-delete`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Failed to bulk delete leads')
}

/** PATCH /leads/leads/bulk-restore */
export async function bulkRestoreLeads(ids: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/leads/leads/bulk-restore`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Failed to bulk restore leads')
}

// ════════════════════════════════════════════════════════════════════════════
// ── STATS ─────────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * fetchStats – uses /admin/leads which:
 *   • requires adminAuth (token in header) ✅
 *   • returns { success, leads, totalLeads, newLeadsCount, contactedCount, convertedCount }
 *   • NOTE: hardcoded limit=10 in backend, so we paginate to get all leads for accurate stats
 *
 * Strategy: fetch page 1 to get totalLeads count, then derive stats from
 * the backend-provided counts (newLeadsCount, contactedCount, convertedCount)
 * so we don't need to fetch all 1000 leads.
//  */
// export async function fetchStats(): Promise<LeadStats> {
//   try {
//     const token = localStorage.getItem('token')
//     if (!token) {
//       window.location.href = '/login'
//       throw new Error('No auth token')
//     }

//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//       Authorization:  `Bearer ${token}`,
//     }

//     // Fetch page 1 – gives us counts without pulling all docs
//     const res = await fetch(`${API_BASE}/admin/leads?page=1&limit=10`, { headers })

//     if (res.status === 401) {
//       localStorage.removeItem('token')
//       window.location.href = '/login'
//       throw new Error('Unauthorized')
//     }

//     if (!res.ok) throw new Error('Failed to fetch stats')

//     const raw = await res.json()

//     // Backend returns these aggregated counts directly — use them!
//     const totalLeads     = raw.totalLeads      ?? 0
//     const newLeadsCount  = raw.newLeadsCount   ?? 0
//     const contactedCount = raw.contactedCount  ?? 0
//     const convertedCount = raw.convertedCount  ?? 0

//     const byStatus: Record<string, number> = {
//       New:       newLeadsCount,
//       Contacted: contactedCount,
//       Closed:    convertedCount,
//     }
    

//     const bySource: Record<string, number> = {}

//     // For followup stats, use the dedicated followup endpoints (more accurate)
//     let todayFollowups  = 0
//     let overdueFollowups = 0

//     try {
//       const [dueRes, overdueRes] = await Promise.all([
//         fetch(`${API_BASE}/followup/due`,     { headers }),
//         fetch(`${API_BASE}/followup/overdue`, { headers }),
//       ])

//       if (dueRes.ok) {
//         const dueData = await dueRes.json()
//         todayFollowups = (dueData.data ?? []).length
//       }

//       if (overdueRes.ok) {
//         const overdueData = await overdueRes.json()
//         overdueFollowups = (overdueData.data ?? []).length
//       }
//     } catch {
//       // non-critical, leave as 0
//     }

//     // thisMonth: use totalLeads as approximation (backend doesn't return monthly count)
//     // For accurate monthly count we'd need a dedicated endpoint
//     const thisMonth = totalLeads

//     return {
//       total:    totalLeads,
//       byStatus,
//       bySource,
//       thisMonth,
//       todayFollowups,
//       overdueFollowups,
//     }
//   } catch (error) {
//     console.error('fetchStats error:', error)
//     return {
//       total:            0,
//       byStatus:         {},
//       bySource:         {},
//       thisMonth:        0,
//       todayFollowups:   0,
//       overdueFollowups: 0,
//     }
//   }
// }

// api.ts — sirf yahi function badlo
export async function fetchStats(): Promise<LeadStats> {
  try {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; throw new Error('No auth token') }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const res = await fetch(`${API_BASE}/admin/stats/summary`, { headers })

    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!res.ok) throw new Error('Failed to fetch stats')

    const raw = await res.json()

    return {
      total:            raw.total            ?? 0,
      byStatus:         raw.byStatus         ?? {},
      bySource:         {},
      thisMonth:        raw.total            ?? 0,
      todayFollowups:   raw.todayFollowups   ?? 0,
      overdueFollowups: raw.overdueFollowups ?? 0,
    }
  } catch (error) {
    console.error('fetchStats error:', error)
    return { total: 0, byStatus: {}, bySource: {}, thisMonth: 0, todayFollowups: 0, overdueFollowups: 0 }
  }
}
// ════════════════════════════════════════════════════════════════════════════
// ── FOLLOW-UPS  (/followup/*) ─────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * All followup endpoints return: { success: true, data: Lead[] }
 *
 * GET /followup/due      → today's follow-ups      (no adminAuth on this route!)
 * GET /followup/overdue  → overdue follow-ups       (no adminAuth on this route!)
 * GET /followup/         → all active follow-ups    (adminAuth)
 * GET /followup/upcoming → upcoming follow-ups      (adminAuth)
 */
export async function fetchFollowups(
  filter: 'today' | 'overdue' | 'upcoming' | 'all'
): Promise<Lead[]> {
  const endpointMap: Record<typeof filter, string> = {
    today:    '/followup/due',
    overdue:  '/followup/overdue',
    upcoming: '/followup/upcoming',
    all:      '/followup/',
  }

  const res = await fetch(`${API_BASE}${endpointMap[filter]}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch followups')

  const raw = await res.json()
  // Shape: { success: true, data: [...] }
  const list: any[] = raw.data ?? raw ?? []
  return list.map(mapLead)
}

/**
 * POST /followup/leads/:id/follow-up
 * Body: { recurrence?, date?, message?, whatsappOptIn? }
 */
// export async function scheduleFollowUp(
//   id: string,
//   payload: FollowUpPayload
// ): Promise<void> {
//   const res = await fetch(`${API_BASE}/followup/leads/${id}/follow-up`, {
//     method:  'POST',
//     headers: authHeaders(),
//     body:    JSON.stringify(payload),
//   })
//   if (!res.ok) throw new Error('Failed to schedule follow-up')
// }

/**
 * DELETE /followup/leads/:id/follow-up  — sets active:false, clears date
 */

export async function markFollowupDone(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/followup/leads/${id}/follow-up`, {
    method:  'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to cancel follow-up')
}

// ════════════════════════════════════════════════════════════════════════════
// ── ACTIVITIES  (/activities/*) ───────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/** GET /activities/:userId  (optional ?startDate=&endDate=) */
export async function fetchActivities(
  userId: string,
  opts?: { startDate?: string; endDate?: string }
): Promise<Activity[]> {
  const q = new URLSearchParams()
  if (opts?.startDate) q.set('startDate', opts.startDate)
  if (opts?.endDate)   q.set('endDate',   opts.endDate)

  const res = await fetch(`${API_BASE}/activities/${userId}?${q}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch activities')
  return res.json()
}

/** POST /activities  →  { userId, adminId?, text } */
export async function addActivity(payload: ActivityInsert): Promise<Activity> {
  const res = await fetch(`${API_BASE}/activities`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to add activity')
  return res.json()
}

/** PUT /activities/:id  →  { text } */
export async function updateActivity(id: string, text: string): Promise<Activity> {
  const res = await fetch(`${API_BASE}/activities/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('Failed to update activity')
  return res.json()
}

/** DELETE /activities/:id */
export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/activities/${id}`, {
    method:  'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete activity')
}

// ════════════════════════════════════════════════════════════════════════════
// ── MESSAGES  (/messages/:leadId/send-message) ────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /messages/:leadId/send-message
 * Body: { messageType?: "email"|"whatsapp"|"both", message?, adminEmail? }
 */
export async function sendMessage(
  leadId: string,
  payload: SendMessagePayload
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/messages/${leadId}/send-message`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  })
  return handleResponse(res)
}

// ════════════════════════════════════════════════════════════════════════════
// ── REMINDERS  (/admin/reminders/*) ───────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /admin/reminders
 * Returns: { success: true, leads: [...] }
 * Leads with reminderCount > 0 && <= 5 and status !== "closed"
 */
export async function fetchReminderLeads(): Promise<ReminderLead[]> {
  const res = await fetch(`${API_BASE}/admin/reminders`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch reminders')
  const data = await res.json()
  return data.leads ?? data ?? []
}

/**
 * GET /admin/reminders/count
 * Returns: { success: true, pendingReminders: number }
 * NOTE: backend field is `pendingReminders`, not `count`
 */
export async function fetchReminderCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/admin/reminders/count`, {
    headers: authHeaders(),
  })
  if (!res.ok) return 0
  const data = await res.json()
  // Backend returns `pendingReminders`, not `count`
  return data.pendingReminders ?? data.count ?? 0
}

/**
 * PUT /admin/reminders/contacted/:id
 * Sets lead status="contacted", reminderCount=0
 */
export async function markAsContacted(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/reminders/contacted/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to mark as contacted')
}

// ════════════════════════════════════════════════════════════════════════════
// ── PIPELINE ──────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all leads for Kanban/pipeline view.
 * Uses /admin/leads with multiple pages to get all leads (backend limit=10 hardcoded).
 * Falls back to /leads/leads if admin route fails.
 */
export async function fetchPipeline(): Promise<Lead[]> {
  try {
    // Get total count first
    const firstRes = await fetch(`${API_BASE}/admin/leads?page=1&limit=10`, {
      headers: authHeaders(),
    })
    if (!firstRes.ok) throw new Error('admin leads failed')

    const firstData = await firstRes.json()
    const total: number = firstData.totalLeads ?? 0
    const totalPages = Math.ceil(total / 10)

    if (totalPages <= 1) {
      const leads = firstData.leads ?? []
      return leads.map(mapLead)
    }

    // Fetch all remaining pages in parallel
    const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
    const responses = await Promise.all(
      pageNums.map(p =>
        fetch(`${API_BASE}/admin/leads?page=${p}&limit=10`, {
          headers: authHeaders(),
        }).then(r => r.json())
      )
    )

    const allLeads = [
      ...(firstData.leads ?? []),
      ...responses.flatMap(r => r.leads ?? []),
    ]

    return allLeads.map(mapLead)
  } catch {
    // Fallback to /leads/leads
    const res = await fetch(`${API_BASE}/leads/leads?page=1&limit=100`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch pipeline')
    const raw = await res.json()
    const leads: any[] = Array.isArray(raw) ? raw : raw.data ?? []
    return leads.map(mapLead)
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ── DAILY REPORT ──────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * Daily report – fetches all leads via /admin/leads and filters client-side.
 * Backend /admin/stats/daily returns only aggregate counts per day (not full leads).
 */
export async function fetchDailyReport(date: string): Promise<DailyReport> {
  // Collect all leads (paginated)
  const allLeads = await fetchPipeline()

  const dateLeads = allLeads.filter(
    l => l.created_at?.startsWith(date)
  )

  return {
    date,
    newLeads:     dateLeads.filter(l => l.status === 'New'),
    updatedLeads: dateLeads.filter(l => l.status !== 'New'),
    followups:    dateLeads.filter(l => l.followup_date === date),
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ── IMPORT / EXPORT ────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /admin/import-leads  (multipart/form-data, field name: "file")
 * Returns: { message: string, total: number, sample: any }
 */
export async function importLeadsFile(
  file: File
): Promise<{ success: boolean; message?: string; error?: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/admin/import-leads`, {
    method:  'POST',
    // No Content-Type header – browser sets multipart boundary automatically
    headers: { Authorization: `Bearer ${getToken()}` },
    body:    formData,
  })

  const data = await res.json().catch(() => null)

  if (res.ok) {
    return {
      success: true,
      message: data?.message ?? `Imported ${data?.total ?? 0} leads successfully`,
    }
  }
  return {
    success: false,
    error: data?.error ?? 'Upload failed',
  }
}



// api.ts
export async function downloadLeads(filter: ExportFilter, format: ExportFormat) {
  const token = localStorage.getItem('token') ?? ''

  const status = filter !== 'all'
    ? `&status=${filter.toLowerCase()}`
    : ''

  const url = `${API_BASE}/admin/leads/export?format=${format}${status}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Download failed')
  }

  const blob = await res.blob()

  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `leads-${filter}-${Date.now()}.${format}`

  document.body.appendChild(link)
  link.click()
  link.remove()
}

export async function exportLeads(params: {
  format: 'xlsx' | 'csv'
  status: string  // '' | 'new' | 'contacted' | 'closed' | 'lost'
}) {
  const token = localStorage.getItem('token')
  if (!token) { window.location.href = '/login'; return }

  const query = new URLSearchParams({
    format: params.format,
    status: params.status || 'all',
  })

  const res = await fetch(`${API_BASE}/admin/leads/export?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error('Export failed')

  const blob = await res.blob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `leads-${params.status || 'all'}.${params.format}`
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================================
// api.ts — PATCH FILE
// ============================================================
// Drop these two functions into your existing src/lib/api.ts,
// replacing the old fetchLeads and scheduleFollowUp.
//
// ✅ FIX #1  — fetchLeads: search + date filters now sent correctly
// ✅ FIX #5  — scheduleFollowUp: uses POST /admin/leads/:id/follow-up
// ============================================================

import type { LeadFilters, FollowUpPayload } from '@/types'

// ── grab your existing API_BASE & authHeaders from the rest of api.ts ─────────
// (these are already defined in your file, shown here for reference only)
// export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
// function authHeaders() {
//   const token = localStorage.getItem('token') ?? ''
//   return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
// }

// ════════════════════════════════════════════════════════════════════════════
// ✅ FIX #1 — fetchLeads
// ════════════════════════════════════════════════════════════════════════════
//
// Previous bug: filters like `search`, `dateFrom`, `dateTo` were appended
// with incorrect param names OR skipped entirely when empty strings.
// Date ranges were not prioritised; the backend received `status=` (empty)
// which some backends treat as "no filter" while others return 0 results.
//
// Fix:
//   • Only append a param when it has a non-empty value (skip '' values)
//   • Use the exact param names your backend expects:
//       search    → ?search=
//       status    → ?status=      (PascalCase, matches backend normalisation)
//       source    → ?source=
//       dateFrom  → ?dateFrom=    (ISO date string yyyy-MM-dd)
//       dateTo    → ?dateTo=      (ISO date string yyyy-MM-dd)
//   • Date filters are appended first so backend can prioritise them
//
// api.ts mein sirf fetchLeads function replace karo
// /leads/leads → /admin/leads (jo search, status, dateFrom, dateTo support karta hai)

export async function fetchLeads(
  filters: LeadFilters,
  page: number
): Promise<{ data: Lead[]; count: number }> {
  const params = new URLSearchParams()

  params.set('page',  String(page))
  params.set('limit', '20')

  // Backend /admin/leads exactly ye params accept karta hai:
  if (filters.search?.trim())   params.set('search',   filters.search.trim())
  if (filters.status?.trim())   params.set('status',   filters.status.trim().toLowerCase()) // backend lowercase mein store karta hai
  if (filters.source?.trim())   params.set('source',   filters.source.trim())
  if (filters.dateFrom?.trim()) params.set('dateFrom', filters.dateFrom.trim())
  if (filters.dateTo?.trim())   params.set('dateTo',   filters.dateTo.trim())

  const res = await fetch(`${API_BASE}/admin/leads?${params.toString()}`, {
    headers: authHeaders(),
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Failed to fetch leads (${res.status})`)
  }

  const raw = await res.json()

  // Backend response: { success, leads, totalLeads, page, totalPages }
  const list: any[]  = raw.leads ?? []
  const count: number = raw.totalLeads ?? list.length

  return {
    data:  list.map(mapLead),
    count,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ✅ FIX #5 — scheduleFollowUp
// ════════════════════════════════════════════════════════════════════════════
//
// Correct endpoint: POST /admin/leads/:id/follow-up
// Body shape expected by backend:
//   { date, message?, recurrence?, whatsappOptIn? }
//

export async function scheduleFollowUp(
  id: string,
  payload: FollowUpPayload
): Promise<void> {
  const body: Record<string, unknown> = {
    active: true,
  }
  if (payload.date)          body.date          = payload.date
  if (payload.message)       body.message       = payload.message
  if (payload.recurrence)    body.recurrence    = payload.recurrence
  if (payload.whatsappOptIn) body.whatsappOptIn = payload.whatsappOptIn
 
  // ✅ SAHI URL — /followup/leads/:id/follow-up
  const res = await fetch(`${API_BASE}/followup/leads/${id}/follow-up`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(body),
  })
 
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `Follow-up scheduling failed (${res.status})`)
  }
}