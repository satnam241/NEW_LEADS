// ============================================================
// src/lib/dashboardApi.ts
//
// ✅ Dashboard ke liye alag API — purani api.ts bilkul touch nahi hui
// ✅ Uses: GET /admin/monthly-report?month=M&year=Y
// ✅ Returns: LeadStats shape with dailyGrowth + growthPercentage
//            taaki DashboardHome.tsx ke saath seedha kaam kare
// ============================================================

import type { LeadStats } from '@/types'

// ─── Base URL (api.ts se same pattern) ───────────────────────
export const API_BASE = (import.meta.env.VITE_API_URL1 || '').replace(/\/+$/, '')

// ─── Auth Helper ──────────────────────────────────────────────
function getToken(): string {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

// ─── Dashboard Stats Response (backend se aata hai) ───────────
export interface DashboardAnalytics {
  totalLeads: number
  byStatus: Record<string, number>
  previousMonthLeads: number
  prevByStatus: Record<string, number>
  growthPercentage: number
  sourceWise: { source: string; count: number }[]
  dailyGrowth: { day: number; count: number }[]
  followupStats: { pending: number; overdue: number; resolved: number }
  followupCompletionRate: string
  leadTemperatureStats: { hot: number; warm: number; cold: number }
}

export interface DashboardReportResponse {
  success: boolean
  filters: { month: number; year: number }
  analytics: DashboardAnalytics
}

// ─── Main Function ────────────────────────────────────────────
/**
 * GET /admin/monthly-report?month=M&year=Y
 *
 * Returns LeadStats shape — compatible with DashboardHome.tsx
 * Extra fields (dailyGrowth, growthPercentage, prevByStatus, bySource)
 * bhi include hain jo dashboard ke liye chahiye.
 */
export async function fetchDashboardStats(
  month: number,
  year: number
): Promise<LeadStats & {
  growthPercentage: number
  dailyGrowth: { day: number; count: number }[]
  prevByStatus: Record<string, number>
  followupStats: DashboardAnalytics['followupStats']
  leadTemperatureStats: DashboardAnalytics['leadTemperatureStats']
}> {
  const token = getToken()
  if (!token) {
    window.location.href = '/login'
    throw new Error('No auth token')
  }

  const params = new URLSearchParams({
    month: String(month),
    year:  String(year),
  })

  const res = await fetch(`${API_BASE}/admin/monthly-report?${params}`, {
    headers: authHeaders(),
  })

  // 401 → logout
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Dashboard stats failed (${res.status})`)
  }

  const data: DashboardReportResponse = await res.json()
  const a = data.analytics

  // ── Follow-up live counts (same as purani fetchStats) ────────
  // Ye overdue/today counts hain jo stat cards mein dikhte hain
  let todayFollowups   = 0
  let overdueFollowups = 0
  try {
    const headers = authHeaders()
    const [dueRes, overdueRes] = await Promise.all([
      fetch(`${API_BASE}/followup/due`,     { headers }),
      fetch(`${API_BASE}/followup/overdue`, { headers }),
    ])
    if (dueRes.ok)     todayFollowups   = ((await dueRes.json()).data    ?? []).length
    if (overdueRes.ok) overdueFollowups = ((await overdueRes.json()).data ?? []).length
  } catch { /* ignore — stat cards fallback to 0 */ }

  // ── bySource — sourceWise array ko Record mein convert ───────
  const bySource: Record<string, number> = {}
  for (const { source, count } of a.sourceWise ?? []) {
    bySource[source ?? 'Unknown'] = count
  }

  return {
    // ── LeadStats shape (DashboardHome expects ye) ────────────
    total:            a.totalLeads,
    byStatus:         a.byStatus,
    bySource,
    thisMonth:        a.totalLeads,
    todayFollowups,
    overdueFollowups,

    // ── Extra fields (DashboardHome bhi use karta hai inhe) ───
    growthPercentage:    a.growthPercentage,
    dailyGrowth:         a.dailyGrowth ?? [],
    prevByStatus:        a.prevByStatus ?? {},
    followupStats:       a.followupStats ?? { pending: 0, overdue: 0, resolved: 0 },
    leadTemperatureStats: a.leadTemperatureStats ?? { hot: 0, warm: 0, cold: 0 },
  }
}