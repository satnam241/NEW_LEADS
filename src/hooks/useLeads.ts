
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

const LEADS      = 'leads'
const STATS      = 'stats'
const FOLLOWUPS  = 'followups'
const PIPELINE   = 'pipeline'
const ACTIVITIES = 'activities'
const REMINDERS  = 'reminders'

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

export function useRealtime() {
  const invalidate = useInvalidateAll()
  useEffect(() => {
    const interval = setInterval(invalidate, 30_000)
    return () => clearInterval(interval)
  }, [])
}


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


export function useUpdateLead() {
  const qc  = useQueryClient()
  const inv = useInvalidateAll()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) =>
      api.updateLead(id, updates),

    onMutate: async ({ id, updates }) => {
  await qc.cancelQueries({ queryKey: [LEADS] })
  await qc.cancelQueries({ queryKey: [PIPELINE] })
  await qc.cancelQueries({ queryKey: [STATS] }) // ← ADD THIS

  const previousLeadsData = qc.getQueriesData<{ data: Lead[]; count: number }>({ queryKey: [LEADS] })
  const previousPipeline  = qc.getQueryData<Lead[]>([PIPELINE])
  const previousStats     = qc.getQueryData<LeadStats>([STATS]) // ← ADD THIS

  
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


export function useStats() {
  return useQuery({
    queryKey:  [STATS],
    queryFn:   api.fetchStats,
    staleTime: 0, // ← was 60_000 — changed so cards update right after mutation
  })
}


export function useFollowups(filter: 'today' | 'overdue' | 'upcoming' | 'all') {
  return useQuery({
    queryKey:  [FOLLOWUPS, filter],
    queryFn:   () => api.fetchFollowups(filter),
    staleTime: 0, // ← was 30_000 — changed so follow-up tabs stay in sync
  })
}


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

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: SendMessagePayload }) =>
      api.sendMessage(leadId, payload),
    onSuccess: () => toast.success('Message sent!'),
    onError:   (e: Error) => toast.error(e.message),
  })
}


export function usePipeline() {
  return useQuery({
    queryKey:  [PIPELINE],
    queryFn:   api.fetchPipeline,
    staleTime: 0,
  })
}


export function useDailyReport(date: string) {
  return useQuery({
    queryKey:  ['report', date],
    queryFn:   () => api.fetchDailyReport(date),
    staleTime: 60_000,
    enabled:   !!date,
  })
}


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