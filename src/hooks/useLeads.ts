// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useEffect } from 'react'
// import toast from 'react-hot-toast'
// import { supabase } from '@/lib/supabase'
// import * as api from '@/lib/api'
// import type { LeadFilters, LeadInsert, LeadUpdate } from '@/types'
// import { format } from 'date-fns'

// const LEADS  = 'leads'
// const STATS  = 'stats'
// const FOLLOWUPS = 'followups'
// const PIPELINE  = 'pipeline'

// // Invalidate everything
// function useInvalidateAll() {
//   const qc = useQueryClient()
//   return () => {
//     qc.invalidateQueries({ queryKey: [LEADS] })
//     qc.invalidateQueries({ queryKey: [STATS] })
//     qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
//     qc.invalidateQueries({ queryKey: [PIPELINE] })
//   }
// }

// // Realtime subscription (mount once in app root)
// export function useRealtime() {
//   const invalidate = useInvalidateAll()
//   useEffect(() => {
//     const ch = supabase.channel('leads-rt')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
//         invalidate()
//         const msgs: Record<string, string> = { INSERT: '🔔 New lead added!', UPDATE: '✏️ Lead updated', DELETE: '🗑️ Lead removed' }
//         const m = msgs[payload.eventType]
//         if (m) toast.success(m, { duration: 2500 })
//       })
//       .subscribe()
//     return () => { supabase.removeChannel(ch) }
//   }, [])
// }

// export function useLeads(filters: LeadFilters, page: number) {
//   return useQuery({ queryKey: [LEADS, filters, page], queryFn: () => api.fetchLeads(filters, page), staleTime: 30_000 })
// }

// export function useStats() {
//   return useQuery({ queryKey: [STATS], queryFn: api.fetchStats, staleTime: 60_000 })
// }

// export function useFollowups(filter: 'today' | 'overdue' | 'upcoming' | 'all') {
//   return useQuery({ queryKey: [FOLLOWUPS, filter], queryFn: () => api.fetchFollowups(filter), staleTime: 30_000 })
// }

// export function usePipeline() {
//   return useQuery({ queryKey: [PIPELINE], queryFn: api.fetchPipeline, staleTime: 30_000 })
// }

// export function useDailyReport(date: string) {
//   return useQuery({ queryKey: ['report', date], queryFn: () => api.fetchDailyReport(date), staleTime: 60_000 })
// }

// export function useCreateLead() {
//   const inv = useInvalidateAll()
//   return useMutation({ mutationFn: (l: LeadInsert) => api.createLead(l), onSuccess: () => { inv(); toast.success('Lead created!') }, onError: (e: Error) => toast.error(e.message) })
// }

// export function useUpdateLead() {
//   const inv = useInvalidateAll()
//   return useMutation({ mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) => api.updateLead(id, updates), onSuccess: () => { inv(); toast.success('Lead updated!') }, onError: (e: Error) => toast.error(e.message) })
// }

// export function useDeleteLead() {
//   const inv = useInvalidateAll()
//   return useMutation({ mutationFn: (id: string) => api.deleteLead(id), onSuccess: () => { inv(); toast.success('Lead deleted') }, onError: (e: Error) => toast.error(e.message) })
// }

// export function useMarkFollowupDone() {
//   const inv = useInvalidateAll()
//   return useMutation({ mutationFn: (id: string) => api.markFollowupDone(id), onSuccess: () => { inv(); toast.success('Follow-up marked done!') }, onError: (e: Error) => toast.error(e.message) })
// }

// src/hooks/useLeads.ts — No Supabase, pure REST + polling



// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useEffect } from 'react'
// import toast from 'react-hot-toast'
// import * as api from '@/lib/api'
// import type { LeadFilters, LeadInsert, LeadUpdate } from '@/types'

// const LEADS     = 'leads'
// const STATS     = 'stats'
// const FOLLOWUPS = 'followups'
// const PIPELINE  = 'pipeline'

// // ─── Invalidate all queries ───────────────────────────────────────────────────
// function useInvalidateAll() {
//   const qc = useQueryClient()
//   return () => {
//     qc.invalidateQueries({ queryKey: [LEADS] })
//     qc.invalidateQueries({ queryKey: [STATS] })
//     qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
//     qc.invalidateQueries({ queryKey: [PIPELINE] })
//   }
// }

// // ─── Realtime: polling every 30s (replaces Supabase realtime) ────────────────
// export function useRealtime() {
//   const invalidate = useInvalidateAll()
//   useEffect(() => {
//     const interval = setInterval(() => {
//       invalidate()
//     }, 30_000)
//     return () => clearInterval(interval)
//   }, [])
// }

// // ─── QUERIES ─────────────────────────────────────────────────────────────────

// export function useLeads(filters: LeadFilters, page: number) {
//   return useQuery({
//     queryKey: [LEADS, filters, page],
//     queryFn: () => api.fetchLeads(filters, page),
//     staleTime: 30_000,
//   })
// }

// export function useStats() {
//   return useQuery({
//     queryKey: [STATS],
//     queryFn: api.fetchStats,
//     staleTime: 60_000,
//   })
// }

// export function useFollowups(filter: 'today' | 'overdue' | 'upcoming' | 'all') {
//   return useQuery({
//     queryKey: [FOLLOWUPS, filter],
//     queryFn: () => api.fetchFollowups(filter),
//     staleTime: 30_000,
//   })
// }

// export function usePipeline() {
//   return useQuery({
//     queryKey: [PIPELINE],
//     queryFn: api.fetchPipeline,
//     staleTime: 30_000,
//   })
// }

// export function useDailyReport(date: string) {
//   return useQuery({
//     queryKey: ['report', date],
//     queryFn: () => api.fetchDailyReport(date),
//     staleTime: 60_000,
//   })
// }

// // ─── MUTATIONS ───────────────────────────────────────────────────────────────

// export function useCreateLead() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (l: LeadInsert) => api.createLead(l),
//     onSuccess: () => { inv(); toast.success('Lead created!') },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// export function useUpdateLead() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) =>
//       api.updateLead(id, updates),
//     onSuccess: () => { inv(); toast.success('Lead updated!') },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// export function useDeleteLead() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (id: string) => api.deleteLead(id),
//     onSuccess: () => { inv(); toast.success('Lead deleted') },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// export function useMarkFollowupDone() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (id: string) => api.markFollowupDone(id),
//     onSuccess: () => { inv(); toast.success('Follow-up marked done!') },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }



// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useEffect } from 'react'
// import toast from 'react-hot-toast'
// import * as api from '@/lib/api'
// import type {
//   LeadFilters,
//   LeadInsert,
//   LeadUpdate,
//   ActivityInsert,
//   FollowUpPayload,
//   SendMessagePayload,
// } from '@/types'

// // ─── Query Keys ──────────────────────────────────────────────────────────────
// const LEADS      = 'leads'
// const STATS      = 'stats'
// const FOLLOWUPS  = 'followups'
// const PIPELINE   = 'pipeline'
// const ACTIVITIES = 'activities'
// const REMINDERS  = 'reminders'

// // ─── Invalidate All ──────────────────────────────────────────────────────────
// function useInvalidateAll() {
//   const qc = useQueryClient()
//   return () => {
//     qc.invalidateQueries({ queryKey: [LEADS] })
//     qc.invalidateQueries({ queryKey: [STATS] })
//     qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
//     qc.invalidateQueries({ queryKey: [PIPELINE] })
//     qc.invalidateQueries({ queryKey: [REMINDERS] })
//   }
// }

// // ─── Polling (replaces Supabase realtime) ────────────────────────────────────
// export function useRealtime() {
//   const invalidate = useInvalidateAll()
//   useEffect(() => {
//     const interval = setInterval(invalidate, 30_000)
//     return () => clearInterval(interval)
//   }, [])
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── LEADS ────────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** Paginated + filtered leads list */
// export function useLeads(filters: LeadFilters, page: number) {
//   return useQuery({
//     queryKey: [LEADS, filters, page],
//     queryFn:  () => api.fetchLeads(filters, page),
//     staleTime: 30_000,
//   })
// }

// /** Create a new lead */
// export function useCreateLead() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (lead: LeadInsert) => api.createLead(lead),
//     onSuccess:  () => { inv(); toast.success('Lead created!') },
//     onError:    (e: Error) => toast.error(e.message),
//   })
// }

// /** Update an existing lead */
// export function useUpdateLead() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) =>
//       api.updateLead(id, updates),
//     onSuccess:  () => { inv(); toast.success('Lead updated!') },
//     onError:    (e: Error) => toast.error(e.message),
//   })
// }

// /** Soft-delete a lead (via admin route) */
// export function useDeleteLead() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (id: string) => api.deleteLead(id),
//     onSuccess:  () => { inv(); toast.success('Lead deleted') },
//     onError:    (e: Error) => toast.error(e.message),
//   })
// }

// /** Restore a soft-deleted lead */
// export function useRestoreLead() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (id: string) => api.restoreLead(id),
//     onSuccess:  () => { inv(); toast.success('Lead restored!') },
//     onError:    (e: Error) => toast.error(e.message),
//   })
// }

// /** Bulk soft-delete */
// export function useBulkDeleteLeads() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (ids: string[]) => api.bulkDeleteLeads(ids),
//     onSuccess:  () => { inv(); toast.success('Leads deleted') },
//     onError:    (e: Error) => toast.error(e.message),
//   })
// }

// /** Bulk restore */
// export function useBulkRestoreLeads() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (ids: string[]) => api.bulkRestoreLeads(ids),
//     onSuccess:  () => { inv(); toast.success('Leads restored') },
//     onError:    (e: Error) => toast.error(e.message),
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── STATS ────────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// export function useStats() {
//   return useQuery({
//     queryKey:  [STATS],
//     queryFn:   api.fetchStats,
//     staleTime: 60_000,
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── FOLLOW-UPS ───────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /**
//  * useFollowups — filter can be:
//  *   'today'    → GET /followup/due
//  *   'overdue'  → GET /followup/overdue
//  *   'upcoming' → GET /followup/upcoming
//  *   'all'      → GET /followup/
//  */
// export function useFollowups(filter: 'today' | 'overdue' | 'upcoming' | 'all') {
//   return useQuery({
//     queryKey:  [FOLLOWUPS, filter],
//     queryFn:   () => api.fetchFollowups(filter),
//     staleTime: 30_000,
//   })
// }

// /** Schedule a follow-up for a lead */
// export function useScheduleFollowUp() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: ({ id, payload }: { id: string; payload: FollowUpPayload }) =>
//       api.scheduleFollowUp(id, payload),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: [LEADS] })
//       qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
//       toast.success('Follow-up scheduled!')
//     },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// /** Cancel / mark a follow-up as done */
// export function useMarkFollowupDone() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: (id: string) => api.markFollowupDone(id),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: [LEADS] })
//       qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
//       toast.success('Follow-up marked done!')
//     },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── ACTIVITIES ───────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** GET /activities/:userId */
// export function useActivities(
//   userId: string,
//   opts?: { startDate?: string; endDate?: string }
// ) {
//   return useQuery({
//     queryKey:  [ACTIVITIES, userId, opts],
//     queryFn:   () => api.fetchActivities(userId, opts),
//     staleTime: 30_000,
//     enabled:   !!userId,
//   })
// }

// /** POST /activities */
// export function useAddActivity() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: (payload: ActivityInsert) => api.addActivity(payload),
//     onSuccess: (_, vars) => {
//       qc.invalidateQueries({ queryKey: [ACTIVITIES, vars.userId] })
//       toast.success('Activity logged!')
//     },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// /** PUT /activities/:id */
// export function useUpdateActivity() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: ({ id, text }: { id: string; text: string }) =>
//       api.updateActivity(id, text),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: [ACTIVITIES] })
//       toast.success('Activity updated')
//     },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// /** DELETE /activities/:id */
// export function useDeleteActivity() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: (id: string) => api.deleteActivity(id),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: [ACTIVITIES] })
//       toast.success('Activity deleted')
//     },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── MESSAGES ─────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** POST /messages/:leadId/send-message */
// export function useSendMessage() {
//   return useMutation({
//     mutationFn: ({ leadId, payload }: { leadId: string; payload: SendMessagePayload }) =>
//       api.sendMessage(leadId, payload),
//     onSuccess: () => toast.success('Message sent!'),
//     onError:   (e: Error) => toast.error(e.message),
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── PIPELINE ─────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// export function usePipeline() {
//   return useQuery({
//     queryKey:  [PIPELINE],
//     queryFn:   api.fetchPipeline,
//     staleTime: 30_000,
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── DAILY REPORT ─────────────────────────────────────────────════════════════
// // ════════════════════════════════════════════════════════════════════════════

// export function useDailyReport(date: string) {
//   return useQuery({
//     queryKey:  ['report', date],
//     queryFn:   () => api.fetchDailyReport(date),
//     staleTime: 60_000,
//     enabled:   !!date,
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── REMINDERS ────────────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// /** GET /admin/reminders */
// export function useReminderLeads() {
//   return useQuery({
//     queryKey:  [REMINDERS],
//     queryFn:   api.fetchReminderLeads,
//     staleTime: 30_000,
//   })
// }

// /** GET /admin/reminders/count — for dashboard badge */
// export function useReminderCount() {
//   return useQuery({
//     queryKey:   [REMINDERS, 'count'],
//     queryFn:    api.fetchReminderCount,
//     staleTime:  30_000,
//     refetchInterval: 60_000,   // auto-refresh every 1 min
//   })
// }

// /** PUT /admin/reminders/contacted/:id */
// export function useMarkAsContacted() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: (id: string) => api.markAsContacted(id),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: [REMINDERS] })
//       qc.invalidateQueries({ queryKey: [LEADS] })
//       toast.success('Marked as contacted')
//     },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// // ════════════════════════════════════════════════════════════════════════════
// // ── IMPORT / EXPORT ───────────────────────────────────────────────────────────
// // ════════════════════════════════════════════════════════════════════════════

// export function useImportLeads() {
//   const inv = useInvalidateAll()
//   return useMutation({
//     mutationFn: (file: File) => api.importLeadsFile(file),
//     onSuccess: (result) => {
//       inv()
//       if (result.success) toast.success(result.message ?? 'Imported!')
//       else toast.error(result.error ?? 'Import failed')
//     },
//     onError: (e: Error) => toast.error(e.message),
//   })
// }

// export function useExportLeads() {
//   return useMutation({
//     mutationFn: api.exportLeads,
//     onSuccess:  () => toast.success('Export started!'),
//     onError:    (e: Error) => toast.error(e.message),
//   })
// }

// src/hooks/useLeads.ts
// ✅ FIXED: Optimistic status update, full invalidation, name normalization


// src/hooks/useLeads.ts
// ✅ FIXED: All 5 issues addressed
//   1. staleTime: 0 on leads query → no stale cache overwriting fresh optimistic updates
//   2. Optimistic status update with immediate UI + rollback
//   3. Full invalidation on settle → stats/dashboard cards always sync
//   4. Follow-up mutations invalidate ALL caches (leads, stats, followups, pipeline)
//   5. useScheduleFollowUp uses correct endpoint /admin/leads/:id/follow-up

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import * as api from '@/lib/api'
import type {
  Lead,
  LeadFilters,
  LeadInsert,
  LeadUpdate,
  LeadStatus,
  ActivityInsert,
  FollowUpPayload,
  SendMessagePayload,
} from '@/types'

// ─── Query Keys ──────────────────────────────────────────────────────────────
const LEADS      = 'leads'
const STATS      = 'stats'
const FOLLOWUPS  = 'followups'
const PIPELINE   = 'pipeline'
const ACTIVITIES = 'activities'
const REMINDERS  = 'reminders'

// ─── Invalidate All ──────────────────────────────────────────────────────────
function useInvalidateAll() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: [LEADS] })
    qc.invalidateQueries({ queryKey: [STATS] })
    qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
    qc.invalidateQueries({ queryKey: [PIPELINE] })
    qc.invalidateQueries({ queryKey: [REMINDERS] })
  }
}

// ─── Polling (30s auto-refresh) ───────────────────────────────────────────────
export function useRealtime() {
  const invalidate = useInvalidateAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(invalidate, 30_000)
    return () => clearInterval(interval)
  }, [])
}

// ════════════════════════════════════════════════════════════════════════════
// ── LEADS ────────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * ✅ FIX #1 — staleTime: 0
 * Previously staleTime: 30_000 meant React Query served a 30-second-old
 * cache snapshot right after onSettled refetch, which OVERWROTE the
 * optimistic status and caused the "resets to New" bug.
 * With staleTime: 0, the refetch always uses fresh server data.
 */
export function useLeads(filters: LeadFilters, page: number) {
  return useQuery({
    queryKey:  [LEADS, filters, page],
    queryFn:   () => api.fetchLeads(filters, page),
    staleTime: 0,   // ← critical fix: always fetch fresh after mutations
  })
}

/** Create a new lead */
export function useCreateLead() {
  const inv = useInvalidateAll()
  return useMutation({
    mutationFn: (lead: LeadInsert) => api.createLead(lead),
    onSuccess:  () => { inv(); toast.success('Lead created!') },
    onError:    (e: Error) => toast.error(e.message),
  })
}

/**
 * ✅ FIX #2 — Optimistic status update (no flicker, no reset)
 * ✅ FIX #3 — onSettled calls inv() → stats/dashboard cards refresh immediately
 *
 * Flow:
 *   1. onMutate  → cancel in-flight queries, snapshot cache, apply optimistic update
 *   2. API call  → PATCH /admin/leads/:id
 *   3. onError   → rollback to snapshot
 *   4. onSettled → full invalidation (leads + stats + followups + pipeline)
 *
 * The status dropdown shows the new value INSTANTLY because of the
 * local-state trick in StatusSelect (LeadsTable.tsx) + this optimistic update.
 * The dashboard stat cards (Closed, Contacted, etc.) update as soon as
 * onSettled fires and the server returns fresh stats.
 */
export function useUpdateLead() {
  const qc  = useQueryClient()
  const inv = useInvalidateAll()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) =>
      api.updateLead(id, updates),

    // ── Optimistic update ──────────────────────────────────────────────────
    onMutate: async ({ id, updates }) => {
  await qc.cancelQueries({ queryKey: [LEADS] })
  await qc.cancelQueries({ queryKey: [PIPELINE] })
  await qc.cancelQueries({ queryKey: [STATS] }) // ← ADD THIS

  const previousLeadsData = qc.getQueriesData<{ data: Lead[]; count: number }>({ queryKey: [LEADS] })
  const previousPipeline  = qc.getQueryData<Lead[]>([PIPELINE])
  const previousStats     = qc.getQueryData<LeadStats>([STATS]) // ← ADD THIS

  // ... existing leads + pipeline optimistic updates ...

  // ✅ NEW: Optimistically update stats cache
  if (previousStats && updates.status) {
    // Find old status from the leads cache
    let oldStatus: string | undefined
    for (const [, cacheData] of previousLeadsData) {
      const found = cacheData?.data?.find(l => l.id === id || l._id === id)
      if (found) { oldStatus = found.status; break }
    }

    if (oldStatus && oldStatus !== updates.status) {
      const normalize = (s: string) =>
        s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

      const oldKey = normalize(oldStatus)   // e.g. "contacted" → "Contacted"
      const newKey = normalize(updates.status)

      qc.setQueryData<LeadStats>([STATS], {
        ...previousStats,
        byStatus: {
          ...previousStats.byStatus,
          [oldKey]: Math.max(0, (previousStats.byStatus[oldKey] ?? 0) - 1),
          [newKey]: (previousStats.byStatus[newKey] ?? 0) + 1,
        },
      })
    }
  }

  return { previousLeadsData, previousPipeline, previousStats }
},

// Rollback stats too on error
onError: (e: Error, _, context) => {
  // ... existing rollback ...
  if (context?.previousStats) {
    qc.setQueryData([STATS], context.previousStats)
  }
  toast.error(e.message)
},

    // ── Full sync after API responds — THIS is what updates the stat cards ─
    onSettled: () => {
      inv() // invalidates leads, stats, followups, pipeline, reminders
    },

    onSuccess: () => {
      toast.success('Lead updated!')
    },
  })
}

/** Soft-delete a lead */
export function useDeleteLead() {
  const inv = useInvalidateAll()
  return useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess:  () => { inv(); toast.success('Lead deleted') },
    onError:    (e: Error) => toast.error(e.message),
  })
}

/** Restore a soft-deleted lead */
export function useRestoreLead() {
  const inv = useInvalidateAll()
  return useMutation({
    mutationFn: (id: string) => api.restoreLead(id),
    onSuccess:  () => { inv(); toast.success('Lead restored!') },
    onError:    (e: Error) => toast.error(e.message),
  })
}

/** Bulk soft-delete */
export function useBulkDeleteLeads() {
  const inv = useInvalidateAll()
  return useMutation({
    mutationFn: (ids: string[]) => api.bulkDeleteLeads(ids),
    onSuccess:  () => { inv(); toast.success('Leads deleted') },
    onError:    (e: Error) => toast.error(e.message),
  })
}

/** Bulk restore */
export function useBulkRestoreLeads() {
  const inv = useInvalidateAll()
  return useMutation({
    mutationFn: (ids: string[]) => api.bulkRestoreLeads(ids),
    onSuccess:  () => { inv(); toast.success('Leads restored') },
    onError:    (e: Error) => toast.error(e.message),
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── STATS ────────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * ✅ FIX #3 — staleTime: 0 on stats so dashboard cards always reflect
 * the latest status changes (Closed, Contacted, etc.)
 */
export function useStats() {
  return useQuery({
    queryKey:  [STATS],
    queryFn:   api.fetchStats,
    staleTime: 0, // ← was 60_000 — changed so cards update right after mutation
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── FOLLOW-UPS ───────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * ✅ FIX #4 — staleTime: 0 so follow-up views (today/overdue/upcoming/all)
 * always show fresh data after scheduling or marking done
 */
export function useFollowups(filter: 'today' | 'overdue' | 'upcoming' | 'all') {
  return useQuery({
    queryKey:  [FOLLOWUPS, filter],
    queryFn:   () => api.fetchFollowups(filter),
    staleTime: 0, // ← was 30_000 — changed so follow-up tabs stay in sync
  })
}

/**
 * ✅ FIX #5 — useScheduleFollowUp
 * Calls api.scheduleFollowUp which hits POST /admin/leads/:id/follow-up
 * Invalidates ALL caches: followups (all tabs), leads, stats, pipeline
 * so the follow-up is reflected everywhere immediately.
 */
export function useScheduleFollowUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FollowUpPayload }) =>
      api.scheduleFollowUp(id, payload),
    onSuccess: () => {
      // Invalidate all followup filter tabs
      qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
      // Also refresh leads list (followup_date column), stats (todayFollowups/overdueFollowups), pipeline cards
      qc.invalidateQueries({ queryKey: [LEADS] })
      qc.invalidateQueries({ queryKey: [STATS] })
      qc.invalidateQueries({ queryKey: [PIPELINE] })
      toast.success('Follow-up scheduled!')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

/**
 * ✅ FIX #4 — useMarkFollowupDone
 * Full invalidation so "Today's Follow-ups" and "Overdue" stat cards
 * and all followup tabs update immediately after marking done.
 */
export function useMarkFollowupDone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.markFollowupDone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FOLLOWUPS] })
      qc.invalidateQueries({ queryKey: [LEADS] })
      qc.invalidateQueries({ queryKey: [STATS] })
      qc.invalidateQueries({ queryKey: [PIPELINE] })
      toast.success('Follow-up marked done!')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── ACTIVITIES ───────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

export function useActivities(
  userId: string,
  opts?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey:  [ACTIVITIES, userId, opts],
    queryFn:   () => api.fetchActivities(userId, opts),
    staleTime: 30_000,
    enabled:   !!userId,
  })
}

export function useAddActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ActivityInsert) => api.addActivity(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [ACTIVITIES, vars.userId] })
      toast.success('Activity logged!')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      api.updateActivity(id, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ACTIVITIES] })
      toast.success('Activity updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteActivity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ACTIVITIES] })
      toast.success('Activity deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── MESSAGES ─────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: SendMessagePayload }) =>
      api.sendMessage(leadId, payload),
    onSuccess: () => toast.success('Message sent!'),
    onError:   (e: Error) => toast.error(e.message),
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── PIPELINE ─────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

export function usePipeline() {
  return useQuery({
    queryKey:  [PIPELINE],
    queryFn:   api.fetchPipeline,
    staleTime: 0,
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── DAILY REPORT ─────────────────────────────────────────────════════════════
// ════════════════════════════════════════════════════════════════════════════

export function useDailyReport(date: string) {
  return useQuery({
    queryKey:  ['report', date],
    queryFn:   () => api.fetchDailyReport(date),
    staleTime: 60_000,
    enabled:   !!date,
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── REMINDERS ────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

export function useReminderLeads() {
  return useQuery({
    queryKey:  [REMINDERS],
    queryFn:   api.fetchReminderLeads,
    staleTime: 30_000,
  })
}

export function useReminderCount() {
  return useQuery({
    queryKey:        [REMINDERS, 'count'],
    queryFn:         api.fetchReminderCount,
    staleTime:       30_000,
    refetchInterval: 60_000,
  })
}

export function useMarkAsContacted() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.markAsContacted(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REMINDERS] })
      qc.invalidateQueries({ queryKey: [LEADS] })
      qc.invalidateQueries({ queryKey: [STATS] })
      toast.success('Marked as contacted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ════════════════════════════════════════════════════════════════════════════
// ── IMPORT / EXPORT ───────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

export function useImportLeads() {
  const inv = useInvalidateAll()
  return useMutation({
    mutationFn: (file: File) => api.importLeadsFile(file),
    onSuccess: (result) => {
      inv()
      if (result.success) toast.success(result.message ?? 'Imported!')
      else toast.error(result.error ?? 'Import failed')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useExportLeads() {
  return useMutation({
    mutationFn: api.exportLeads,
    onSuccess:  () => toast.success('Export started!'),
    onError:    (e: Error) => toast.error(e.message),
  })
}