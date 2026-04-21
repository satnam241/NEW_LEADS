
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

function mapStatus(s: string): Lead['status'] {
  const map: Record<string, Lead['status']> = {
    new:        'New',
    contacted:  'Contacted',
    interested: 'Interested',
    converted:  'Closed',
    closed:     'Closed',
    lost:       'Lost',
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
    Interested: 'contacted',
    Closed:     'closed',
    Lost:       'lost',  
  }
  return map[s] ?? 'new'
}

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

export async function adminLogin(creds: AuthCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(creds),
  })
  const data = await handleResponse<any>(res)
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


const PAGE_SIZE = 20

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
 
  return mapLead(data.data ?? data.lead ?? data)
}


export async function updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
  const body: any = {}
  if (updates.name   !== undefined) body.fullName = updates.name
  if (updates.email  !== undefined) body.email    = updates.email
  if (updates.phone  !== undefined) body.phone    = updates.phone
  if (updates.source !== undefined) body.source   = updates.source
  if (updates.status !== undefined) body.status   = unmapStatus(updates.status as Lead['status'])
  if (updates.note   !== undefined) body.message  = updates.note
 
 
  const res = await fetch(`${API_BASE}/leads/leads/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update lead')
  const data = await res.json()
  return mapLead(data.lead ?? data.data ?? data)
}


export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
    method:  'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete lead')
}

export async function restoreLead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/leads/leads/${id}/restore`, {
    method:  'PATCH',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to restore lead')
}

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
export async function fetchStats(): Promise<LeadStats> {
  try {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; throw new Error('No auth token') }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const res = await fetch(`${API_BASE}/admin/leads?page=1&limit=10`, { headers })
    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    if (!res.ok) throw new Error('Failed to fetch stats')

    const raw = await res.json()

    const totalLeads     = raw.totalLeads     ?? 0
    const newLeadsCount  = raw.newLeadsCount  ?? 0
    const contactedCount = raw.contactedCount ?? 0
    const convertedCount = raw.convertedCount ?? 0
    const lostCount      = raw.lostCount      ?? 0
    const byStatus: Record<string, number> = {
      New:       newLeadsCount,
      Contacted: contactedCount,
      Closed:    convertedCount,
      Lost:      lostCount,
    }

    const bySource: Record<string, number> = {}
    try {
      const srcRes = await fetch(`${API_BASE}/admin/leads?page=1&limit=5000`, { headers })
      if (srcRes.ok) {
        const srcData = await srcRes.json()
        const allLeads: any[] = srcData.leads ?? []
        for (const lead of allLeads) {
          const src = lead.source ?? 'Manual'
          bySource[src] = (bySource[src] ?? 0) + 1
        }
      }
    } catch {
      
    }

    let todayFollowups   = 0
    let overdueFollowups = 0

    try {
      const [dueRes, overdueRes] = await Promise.all([
        fetch(`${API_BASE}/followup/due`,     { headers }),
        fetch(`${API_BASE}/followup/overdue`, { headers }),
      ])
      if (dueRes.ok)     todayFollowups   = ((await dueRes.json()).data    ?? []).length
      if (overdueRes.ok) overdueFollowups = ((await overdueRes.json()).data ?? []).length
    } catch { }

    return {
      total: totalLeads,
      byStatus,
      bySource,  // ✅ ab source counts aayenge
      thisMonth: totalLeads,
      todayFollowups,
      overdueFollowups,
    }
  } catch (error) {
    console.error('fetchStats error:', error)
    return { total: 0, byStatus: {}, bySource: {}, thisMonth: 0, todayFollowups: 0, overdueFollowups: 0 }
  }
}

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

export async function markFollowupDone(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/followup/leads/${id}/follow-up`, {
    method:  'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to cancel follow-up')
}


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
export async function fetchReminderLeads(): Promise<ReminderLead[]> {
  const res = await fetch(`${API_BASE}/admin/reminders`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch reminders')
  const data = await res.json()
  return data.leads ?? data ?? []
}

export async function fetchReminderCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/admin/reminders/count`, {
    headers: authHeaders(),
  })
  if (!res.ok) return 0
  const data = await res.json()
  
  return data.pendingReminders ?? data.count ?? 0
}

export async function markAsContacted(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/reminders/contacted/${id}`, {
    method:  'PUT',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to mark as contacted')
}


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