
export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Negotiation' | 'Visitor' | 'Closed' | 'Lost'

export type LeadSource = 'facebook' | 'whatsapp' | 'Manual' | 'Imported' | 'Meta Ads'

export type FollowUpRecurrence = 'once' | 'tomorrow' | '3days' | 'weekly'

export type MessageType = 'email' | 'whatsapp' | 'both'

// ── Follow-up (nested in Lead — mirrors backend followUp sub-document) ────────

export interface FollowUp {
  date: string | null           // ISO string
  recurrence: FollowUpRecurrence | null
  message: string | null
  whatsappOptIn: boolean
  active: boolean
}

// ── Main Lead Interface ───────────────────────────────────────────────────────

export interface Lead {
  id: string            // mapped from _id
  _id?: string          // raw from backend

  name: string          // mapped from fullName
  fullName?: string     // raw from backend

  email: string | null
  phone: string | null
  whatsapp: string | null   // same as phone (backend has no separate field)

  source: LeadSource
  status: LeadStatus

  note: string | null   // mapped from message
  message?: string      // raw from backend

  assigned_to: string | null  // not in backend yet, kept for UI compatibility

  // Follow-up (flattened for UI convenience)
  followup_date: string | null    // mapped from followUp.date
  followup_note: string | null    // mapped from followUp.message
  followup_done: boolean          // true when followUp.active === false

  // Raw follow-up object (for schedule modal etc.)
  followUp?: FollowUp

  extraFields?: Record<string, any>
  rawData?: any

  created_at: string    // mapped from createdAt
  updated_at: string    // mapped from updatedAt
  createdAt?: string    // raw from backend
  updatedAt?: string    // raw from backend
}

// ── Lead Insert / Update ──────────────────────────────────────────────────────

export type LeadInsert = {
  name: string
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  source: LeadSource
  status: LeadStatus
  note?: string | null
  assigned_to?: string | null
  followup_date?: string | null
  followup_note?: string | null
  followup_done?: boolean
  followup_recurrence?: FollowUpRecurrence
  followup_whatsappOptIn?: boolean
}

export type LeadUpdate = Partial<LeadInsert>

// ── Filters ───────────────────────────────────────────────────────────────────

export interface LeadFilters {
  search: string
  status: LeadStatus | ''
  source: LeadSource | ''
  dateFrom: string
  dateTo: string
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface LeadStats {
  total: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
  thisMonth: number
  todayFollowups: number
  overdueFollowups: number
}

// ── Activity Log ──────────────────────────────────────────────────────────────

export interface Activity {
  _id: string
  userId: string
  adminId?: string
  text: string
  createdAt: string
  updatedAt: string
}

export type ActivityInsert = {
  userId: string
  adminId?: string
  text: string
}

// ── Admin / Auth ──────────────────────────────────────────────────────────────

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  admin: {
    _id: string
    name: string
    email: string
  }
}

// ── Follow-up Schedule Payload (for POST /followup/leads/:id/follow-up) ───────

export interface FollowUpPayload {
  recurrence?: FollowUpRecurrence
  date?: string           // ISO string or yyyy-MM-dd
  message?: string
  whatsappOptIn?: boolean
}

// ── Send Message Payload ──────────────────────────────────────────────────────

export interface SendMessagePayload {
  messageType: MessageType
  message?: string
  adminEmail?: string
}

// ── Daily Report ──────────────────────────────────────────────────────────────

export interface DailyReport {
  date: string
  newLeads: Lead[]
  updatedLeads: Lead[]
  followups: Lead[]
}

// ── Reminder (from /admin/reminders) ─────────────────────────────────────────

export interface ReminderLead {
  _id: string
  fullName: string
  email: string | null
  phone: string | null
  status: string
  reminderCount: number
  lastReminderSent: string | null
  createdAt: string
}
export interface OverdueLead {
  _id: string
  fullName?: string
  phone?: string
  email?: string
  status?: string
  overdueLabel: string   // e.g. "2d overdue", "3h overdue"
  overdueMs: number      // milliseconds overdue (sorting ke liye)
  followUp?: {
    date?: string
    message?: string
    whatsappOptIn?: boolean
    overdueStatus?: 'pending' | 'acknowledged' | 'rescheduled' | 'resolved'
    acknowledgedAt?: string
    rescheduledAt?: string
    resolvedAt?: string
  }
}