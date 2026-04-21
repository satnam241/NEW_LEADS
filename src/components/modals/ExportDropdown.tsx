
import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { EXPORT_OPTIONS, exportLeads, fetchLeadsForExport, type ExportFilter, type ExportFormat } from '@/lib/importExport'
import toast from 'react-hot-toast'

export default function ExportDropdown() {
  const [open,    setOpen]    = useState(false)
  const [fmt,     setFmt]     = useState<ExportFormat>('xlsx')
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // ✅ FIX: downloadLeads → fetchLeadsForExport + exportLeads
  const handleExport = async (filter: ExportFilter) => {
    setLoading(true)
    try {
      const leads = await fetchLeadsForExport(filter)  // backend se fetch
      exportLeads(leads, fmt)                           // file download
      toast.success(`${leads.length} leads download ho gaye (${fmt.toUpperCase()})`)
      setOpen(false)
    } catch (err: any) {
      toast.error('Export fail: ' + (err.message || 'Error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="btn-secondary"
        style={{ height: 36, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}
        onClick={() => setOpen(o => !o)}
        disabled={loading}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        Export
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }} />
      </button>

      {open && (
        <div className="dropdown" style={{ minWidth: 220, right: 0, left: 'auto' }}>

          {/* Format picker */}
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Format
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['xlsx', 'csv'] as ExportFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFmt(f)}
                  style={{
                    flex: 1, padding: '6px 0', fontSize: 12, borderRadius: 7,
                    border: `1.5px solid ${fmt === f ? '#4c6ef5' : '#e2e8f0'}`,
                    background: fmt === f ? '#eff4ff' : '#fff',
                    color: fmt === f ? '#4c6ef5' : '#64748b',
                    fontWeight: fmt === f ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  {f === 'xlsx' ? <FileSpreadsheet size={12} /> : <FileText size={12} />}
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Export options */}
          <div style={{ padding: '4px 0' }}>
            {EXPORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className="dropdown-item"
                onClick={() => handleExport(opt.key as ExportFilter)}
                disabled={loading}
              >
                {loading ? <Loader2 size={11} className="animate-spin" /> : null}
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}