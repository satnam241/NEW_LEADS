
impor {XLSX} from 'xlsx/xlsx.mjs'
import Papa from 'papaparse'
import { format } from 'date-fns'
import type { Lead, LeadInsert, LeadStatus } from '@/types'
import { API_BASE } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ExportFilter = 'all' | 'New' | 'Contacted' | 'Interested' | 'Closed' | 'Lost'
export type ExportFormat = 'csv' | 'xlsx'

export interface ImportResult {
  leads:   LeadInsert[]
  total:   number
  skipped: number
}

// ─── Export options ────────────────────────────────────────────────────────────
export const EXPORT_OPTIONS: { key: ExportFilter; label: string }[] = [
  { key: 'all',        label: '📋 All Leads'        },
  { key: 'New',        label: '🔵 New Leads'         },
  { key: 'Contacted',  label: '🟡 Contacted Leads'   },
  { key: 'Interested', label: '🟣 Interested Leads'  },
  { key: 'Closed',     label: '🟢 Closed Leads'      },
  { key: 'Lost',       label: '🔴 Lost Leads'        },
]

// ─── Column map for import ────────────────────────────────────────────────────
const COL_MAP: Record<string, keyof LeadInsert> = {
  'name':          'name',
  'full name':     'name',
  'fullname':      'name',
  'email':         'email',
  'phone':         'phone',
  'mobile':        'phone',
  'contact':       'phone',
  'whatsapp':      'whatsapp',
  'source':        'source',
  'status':        'status',
  'note':          'note',
  'notes':         'note',
  'remark':        'note',
  'remarks':       'note',
  'assigned to':   'assigned_to',
  'followup date': 'followup_date',
  'followup note': 'followup_note',
  'follow up date':'followup_date',
  'follow up note':'followup_note',
}

const VALID_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Closed', 'Lost']

function normalizeStatus(val: string): LeadStatus {
  const match = VALID_STATUSES.find(s => s.toLowerCase() === val?.toLowerCase().trim())
  return match ?? 'New'
}

// ─── Parse rows from spreadsheet ──────────────────────────────────────────────
export function parseRows(rows: Record<string, any>[]): ImportResult {
  const leads: LeadInsert[] = []
  let skipped = 0

  for (const raw of rows) {
    const lead: any = {}
    for (const [key, val] of Object.entries(raw)) {
      const mapped = COL_MAP[key.trim().toLowerCase()]
      if (mapped && val !== '' && val !== null && val !== undefined) {
        lead[mapped] = String(val).trim()
      }
    }

    if (!lead.name) { skipped++; continue }

    leads.push({
      name:          lead.name,
      email:         lead.email         || null,
      phone:         lead.phone         || null,
      whatsapp:      lead.whatsapp      || lead.phone || null,
      source:        (lead.source as any) || 'Imported',
      status:        normalizeStatus(lead.status),
      note:          lead.note          || null,
      assigned_to:   lead.assigned_to   || null,
      followup_date: lead.followup_date || null,
      followup_note: lead.followup_note || null,
      followup_done: false,
    })
  }

  return { leads, total: rows.length, skipped }
}

// ─── Read spreadsheet file ────────────────────────────────────────────────────
export async function readSpreadsheet(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv' || ext === 'txt') {
      Papa.parse(file, {
        header:        true,
        skipEmptyLines: true,
        transformHeader: h => h.trim().toLowerCase(),
        complete: result => resolve(parseRows(result.data as Record<string, any>[])),
        error:    err    => reject(err),
      })
    } else {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer)
          const wb   = XLSX.read(data, { type: 'array' })
          const ws   = wb.Sheets[wb.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[]
          const normalized = rows.map(row =>
            Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v]))
          )
          resolve(parseRows(normalized))
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('File read failed'))
      reader.readAsArrayBuffer(file)
    }
  })
}

// ─── Fetch leads for export (from REST API) ───────────────────────────────────
export async function fetchLeadsForExport(filter: ExportFilter): Promise<Lead[]> {
  const token = localStorage.getItem('token') ?? ''
  
  const params = new URLSearchParams()
  params.set('page', '1')
  params.set('limit', '5000')
  
  // Status filter — backend lowercase mein store karta hai
  if (filter !== 'all') {
    params.set('status', filter.toLowerCase())
  }

  // ✅ /admin/leads use karo — ye status filter support karta hai
  const res = await fetch(`${API_BASE}/admin/leads?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch leads for export')
  const raw = await res.json()
  
  // /admin/leads response: { leads: [...], totalLeads: N }
  const list = raw.leads ?? []

  return list.map((l: any): Lead => ({
    id:            l._id ?? l.id ?? '',
    _id:           l._id,
    name:          l.fullName ?? l.name ?? 'Unknown',
    fullName:      l.fullName,
    email:         l.email  ?? null,
    phone:         l.phone  ?? null,
    whatsapp:      l.phone  ?? null,
    source:        l.source ?? 'Manual',
    status:        normalizeStatusExport(l.status),
    note:          l.message ?? null,
    message:       l.message,
    assigned_to:   null,
    followup_date: l.followUp?.date ? l.followUp.date.split('T')[0] : null,
    followup_note: l.followUp?.message ?? null,
    followup_done: l.followUp != null && l.followUp.active === false,
    created_at:    l.createdAt ?? '',
    updated_at:    l.updatedAt ?? l.createdAt ?? '',
    createdAt:     l.createdAt,
  }))
}

function normalizeStatusExport(raw: string | undefined): LeadStatus {
  if (!raw) return 'New'
  const map: Record<string, LeadStatus> = {
    new: 'New', contacted: 'Contacted', interested: 'Interested',
    closed: 'Closed', lost: 'Lost',
  }
  return map[raw.toLowerCase()] ?? 'New'
}
// ─── Export leads to file ─────────────────────────────────────────────────────
export function exportLeads(leads: Lead[], fmt: ExportFormat): void {
  const filename = `leadflow-${format(new Date(), 'yyyy-MM-dd')}`

  const headers = [
    'Name', 'Email', 'Phone', 'WhatsApp', 'Source', 'Status',
    'Note', 'Assigned To', 'Follow-up Date', 'Follow-up Note',
    'Done', 'Created', 'Updated',
  ]

  const rows = leads.map(l => [
    l.name,
    l.email        ?? '',
    l.phone        ?? '',
    l.whatsapp     ?? '',
    l.source,
    l.status,
    l.note         ?? '',
    l.assigned_to  ?? '',
    l.followup_date ?? '',
    l.followup_note ?? '',
    l.followup_done ? 'Yes' : 'No',
    l.created_at ? format(new Date(l.created_at), 'yyyy-MM-dd') : '',
    l.updated_at ? format(new Date(l.updated_at), 'yyyy-MM-dd') : '',
  ])

  if (fmt === 'csv') {
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    downloadBlob(blob, filename + '.csv')
  } else {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    XLSX.writeFile(wb, filename + '.xlsx')
  }
}

// ─── Internal download helper ─────────────────────────────────────────────────
function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}