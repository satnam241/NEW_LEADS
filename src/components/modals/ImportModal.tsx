
import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { readSpreadsheet, type ImportResult } from '@/lib/importExport'
import { createLead } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { LeadInsert } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 'upload' | 'preview' | 'importing' | 'done'

const ACCEPTED       = '.csv,.xlsx,.xls,.ods,.txt'
const ACCEPTED_LABEL = 'CSV, Excel (.xlsx/.xls), ODS'

export default function ImportModal({ open, onClose }: Props) {
  const [step,     setStep]     = useState<Step>('upload')
  const [dragover, setDragover] = useState(false)
  const [result,   setResult]   = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [imported, setImported] = useState(0)
  const [failed,   setFailed]   = useState(0)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const qc       = useQueryClient()

  const reset = () => {
    setStep('upload'); setResult(null); setProgress(0)
    setImported(0); setFailed(0); setFileName(''); setDragover(false)
  }

  const handleClose = () => { reset(); onClose() }

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name)
    try {
      const res = await readSpreadsheet(file)
      if (res.leads.length === 0) {
        toast.error(' invalid file! Choose correct file ')
        return
      }
      setResult(res)
      setStep('preview')
    } catch (err: any) {
      toast.error('File cannot read: ' + (err.message || 'Unknown error'))
    }
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const startImport = async () => {
    if (!result || result.leads.length === 0) return
    setStep('importing')
    let ok = 0, fail = 0
    const total = result.leads.length

    for (let i = 0; i < total; i++) {
      const lead: LeadInsert = result.leads[i]
      try {
        await createLead(lead)
        ok++
      } catch {
        fail++
      }
      setProgress(Math.round(((i + 1) / total) * 100))
      setImported(ok)
      setFailed(fail)
    }

    // Invalidate all relevant caches
    qc.invalidateQueries({ queryKey: ['leads'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
    qc.invalidateQueries({ queryKey: ['pipeline'] })
    setStep('done')

    if (ok > 0)   toast.success(`${ok} lead${ok > 1 ? 's' : ''} import Done !`)
    if (fail > 0) toast.error(`${fail} lead${fail > 1 ? 's' : ''} failed`)
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className="modal-box" style={{ maxWidth: 540,
        background:"#3C3C3C",
border:"1px solid rgba(255,255,255,.08)",
borderRadius:18,
boxShadow:"0 20px 60px rgba(0,0,0,.35)"
      }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">📂 Import </div>
            <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
              {step === 'upload'    && ''}
              {step === 'preview'   && `${result?.leads.length ?? 0} leads ready · ${result?.skipped ?? 0} rows skip `}
              {step === 'importing' && `Importing...: ${imported} / ${result?.leads.length ?? 0}`}
              {step === 'done'      && `Done! ${imported} import · ${failed} fail`}
            </p>
          </div>
          <button onClick={handleClose} style={{ padding: 6, borderRadius: 8, background: '#2a2a2a',border:'1px solid rgba(255,255,255,.08)'
            , cursor: 'pointer', color: '#cbd5e1' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">

          {/* ── UPLOAD ── */}
          {step === 'upload' && (
            <div>
              <div
              style={{
background:dragover
?'rgba(76,110,245,.12)'
:'#2a2a2a',

border:
dragover
?'1.5px solid #4c6ef5'
:'1px dashed rgba(255,255,255,.12)',

borderRadius:14
}}
                className={`dropzone ${dragover ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragover(true) }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleFileInput} style={{ display: 'none' }} />
                <div style={{ fontSize: 38, marginBottom: 10 }}>📂</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1',
                   marginBottom: 6 }}>
                Drop the file here or click                </p>
                <p style={{ fontSize: 12, color: '#cbd5e1' }}>{ACCEPTED_LABEL}</p>
              </div>

              {/* Column guide */}
              <div style={{ marginTop: 18, background: '#2a2a2a', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,.06)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1',
                   marginBottom: 10 }}>
                  📋 Supported columns
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px' }}>
                  {[
                    ['Name / Full Name', 'Required'],
                    ['Phone / Mobile',   'Optional'],
                    ['Email',            'Optional'],
                    ['WhatsApp',         'Optional'],
                    ['Status',           'New / Contacted / etc'],
                    ['Source',           'facebook / Manual / Imported'],
                    ['Note / Remarks',   'Optional'],
                    ['Followup Date',    'Optional'],
                  ].map(([col, hint]) => (
                    <div key={col} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#4c6ef5', background: ' rgba(76,110,245,.14)',padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap' }}>{col}</span>
                      <span style={{ fontSize: 11, color: '#cbd5e1' }}>{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PREVIEW ── */}
          {step === 'preview' && result && (
            <div>
              {/* File info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#rgba(34,197,94,.08)',
                 borderRadius: 10, border: '1.5px solid rgba(34,197,94,.2)',
                  marginBottom: 14 }}>
                <FileSpreadsheet size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>{fileName}</p>
                  <p style={{ fontSize: 11, color: '#4ade80' }}>
                    {result.total} rows · {result.leads.length} valid · {result.skipped} skip
                  </p>
                </div>
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              </div>

              {/* Preview table */}
              <div style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ overflowX: 'auto', maxHeight: 260, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#2a2a2a', position: 'sticky', top: 0 }}>
                        {['Name', 'Phone', 'Email', 'Source', 'Status'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#cbd5e1', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.leads.slice(0, 50).map((l, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #2a2d3e' }}>
                          <td style={{ padding: '7px 12px', color: '#cbd5e1', fontWeight: 500 }}>{l.name}</td>
                          <td style={{ padding: '7px 12px', color: '#cbd5e1', fontFamily: 'monospace', fontSize: 11 }}>{l.phone ?? '—'}</td>
                          <td style={{ padding: '7px 12px', color: '#cbd5e1', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.email ?? '—'}</td>
                          <td style={{ padding: '7px 12px' }}>
                            <span style={{ fontSize: 10, fontWeight: 600, background: '#f0fdf4', color: '#4ade80', padding: '2px 7px', borderRadius: 99 }}>{l.source}</span>
                          </td>
                          <td style={{ padding: '7px 12px' }}>
                            <span className={`badge badge-${l.status}`}>{l.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.leads.length > 50 && (
                  <p style={{ padding: '8px 14px', fontSize: 11, color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'center' }}>
                  Showing first 50 of {result.leads.length} leads
                  </p>
                )}
              </div>

              {result.skipped > 0 && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', marginBottom: 12 }}>
                  <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: '#92400e' }}>
                    {result.skipped} row{result.skipped > 1 ? 's' : ''} skipped
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── IMPORTING ── */}
          {step === 'importing' && (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <Loader2 size={34} style={{ color: '#4c6ef5', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1',
                 marginBottom: 4 }}>Leads import....</p>
              <p style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 20 }}>{imported} of {result?.leads.length} complete</p>
              <div style={{ background: '#2a2a2a', borderRadius: 99, height: 8, maxWidth: 320, margin: '0 auto', overflow: 'hidden' }}>
                <div style={{ height: '100%',background:'linear-gradient(90deg,#4c6ef5,#6d8cff)',
                  borderRadius: 99, width: `${progress}%`, transition: 'width 200ms ease' }} />
              </div>
              <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 8 }}>{progress}%</p>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>{imported} leads import Done!</p>
              {failed > 0 && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 4 }}>{failed} failed (duplicates/errors)</p>}
              <p style={{ fontSize: 12, color: '#cbd5e1' }}>Dashboard update .</p>
            </div>  
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer"style={{
borderTop:'1px solid rgba(255,255,255,.06)',
background:'#3C3C3C'
}}>
          {step === 'upload' && (
            <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          )}
          {step === 'preview' && (
            <>
              <button className="btn-secondary" onClick={reset}>← Back</button>
              <button
                className="btn-primary"
                onClick={startImport}
                disabled={!result || result.leads.length === 0}
              >
                <Upload size={14} /> Import {result?.leads.length ?? 0} Leads
              </button>
            </>
          )}
          {step === 'done' && (
            <button className="btn-primary" onClick={handleClose}>Done ✓</button>
          )}
        </div>
      </div>
    </div>
  )
}