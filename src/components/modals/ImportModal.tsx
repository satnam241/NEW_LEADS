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
        toast.error('Invalid file! Choose correct file')
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

    qc.invalidateQueries({ queryKey: ['leads'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
    qc.invalidateQueries({ queryKey: ['pipeline'] })
    setStep('done')

    if (ok > 0)   toast.success(`${ok} lead${ok > 1 ? 's' : ''} import Done!`)
    if (fail > 0) toast.error(`${fail} lead${fail > 1 ? 's' : ''} failed`)
  }

  if (!open) return null

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      >
        <div style={{
          maxWidth: 540,
          width: 'calc(100% - 24px)',   /* mobile side gap */
          background: '#3C3C3C',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* Header */}
          <div className="modal-header" style={{ flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div className="modal-title" style={{ fontSize: 'clamp(13px, 3.5vw, 15px)' }}>
                📂 Import
              </div>
              <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>
                {step === 'upload'    && ''}
                {step === 'preview'   && `${result?.leads.length ?? 0} leads ready · ${result?.skipped ?? 0} rows skip`}
                {step === 'importing' && `Importing: ${imported} / ${result?.leads.length ?? 0}`}
                {step === 'done'      && `Done! ${imported} import · ${failed} fail`}
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                padding: 6, borderRadius: 8,
                background: '#2a2a2a',
                border: '1px solid rgba(255,255,255,.08)',
                cursor: 'pointer', color: '#cbd5e1',
                display: 'flex', flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>

            {/* ── UPLOAD ── */}
            {step === 'upload' && (
              <div>
                <div
                  style={{
                    background: dragover ? 'rgba(76,110,245,.12)' : '#2a2a2a',
                    border: dragover ? '1.5px solid #4c6ef5' : '1px dashed rgba(255,255,255,.12)',
                    borderRadius: 14,
                    padding: 'clamp(20px, 5vw, 32px) 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onDragOver={e => { e.preventDefault(); setDragover(true) }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleFileInput} style={{ display: 'none' }} />
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
                  <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                    Drop the file here or click
                  </p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{ACCEPTED_LABEL}</p>
                </div>

                {/* Column guide */}
                <div style={{
                  marginTop: 16, background: '#2a2a2a',
                  borderRadius: 10, padding: '14px 16px',
                  border: '1px solid rgba(255,255,255,.06)',
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 10 }}>
                    📋 Supported columns
                  </p>
                  <div className="import-col-grid">
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
                      <div key={col} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: '#4c6ef5',
                          background: 'rgba(76,110,245,.14)',
                          padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap',
                        }}>
                          {col}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{hint}</span>
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
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'rgba(34,197,94,.08)',
                  borderRadius: 10, border: '1.5px solid rgba(34,197,94,.2)',
                  marginBottom: 14,
                }}>
                  <FileSpreadsheet size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: '#4ade80',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {fileName}
                    </p>
                    <p style={{ fontSize: 11, color: '#4ade80' }}>
                      {result.total} rows · {result.leads.length} valid · {result.skipped} skip
                    </p>
                  </div>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                </div>

                {/* Preview table */}
                <div style={{
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 10, overflow: 'hidden', marginBottom: 14,
                }}>
                  <div style={{ overflowX: 'auto', maxHeight: 240, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 380 }}>
                      <thead>
                        <tr style={{ background: '#2a2a2a', position: 'sticky', top: 0 }}>
                          {['Name', 'Phone', 'Email', 'Source', 'Status'].map(h => (
                            <th key={h} style={{
                              padding: '8px 10px', textAlign: 'left',
                              fontWeight: 600, color: '#cbd5e1',
                              fontSize: 10.5, textTransform: 'uppercase',
                              letterSpacing: '0.05em', whiteSpace: 'nowrap',
                              borderBottom: '1px solid rgba(255,255,255,.08)',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.leads.slice(0, 50).map((l, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                            <td style={{ padding: '7px 10px', color: '#cbd5e1', fontWeight: 500, whiteSpace: 'nowrap' }}>{l.name}</td>
                            <td style={{ padding: '7px 10px', color: '#cbd5e1', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'nowrap' }}>{l.phone ?? '—'}</td>
                            <td style={{ padding: '7px 10px', color: '#94a3b8', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.email ?? '—'}</td>
                            <td style={{ padding: '7px 10px' }}>
                              <span style={{
                                fontSize: 10, fontWeight: 600,
                                background: 'rgba(34,197,94,.12)',
                                color: '#4ade80', padding: '2px 7px', borderRadius: 99,
                                whiteSpace: 'nowrap',
                              }}>
                                {l.source}
                              </span>
                            </td>
                            <td style={{ padding: '7px 10px' }}>
                              <span className={`badge badge-${l.status}`}>{l.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.leads.length > 50 && (
                    <p style={{
                      padding: '8px 14px', fontSize: 11, color: '#94a3b8',
                      borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'center',
                    }}>
                      Showing first 50 of {result.leads.length} leads
                    </p>
                  )}
                </div>

                {result.skipped > 0 && (
                  <div style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    padding: '10px 12px',
                    background: 'rgba(251,191,36,.08)',
                    borderRadius: 8, border: '1px solid rgba(251,191,36,.25)',
                    marginBottom: 12,
                  }}>
                    <AlertCircle size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: '#fcd34d', margin: 0 }}>
                      {result.skipped} row{result.skipped > 1 ? 's' : ''} skipped
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── IMPORTING ── */}
            {step === 'importing' && (
              <div style={{ textAlign: 'center', padding: 'clamp(20px, 5vw, 28px) 16px' }}>
                <Loader2 size={34} style={{
                  color: '#4c6ef5', margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite',
                  display: 'block',
                }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                  Leads import....
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
                  {imported} of {result?.leads.length} complete
                </p>
                <div style={{
                  background: '#2a2a2a', borderRadius: 99, height: 8,
                  maxWidth: 300, margin: '0 auto', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg,#4c6ef5,#6d8cff)',
                    borderRadius: 99, width: `${progress}%`,
                    transition: 'width 200ms ease',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>{progress}%</p>
              </div>
            )}

            {/* ── DONE ── */}
            {step === 'done' && (
              <div style={{ textAlign: 'center', padding: 'clamp(20px, 5vw, 28px) 16px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <p style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>
                  {imported} leads import Done!
                </p>
                {failed > 0 && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>
                    {failed} failed (duplicates/errors)
                  </p>
                )}
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Dashboard update ho gaya.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="modal-footer"
            style={{
              borderTop: '1px solid rgba(255,255,255,.06)',
              background: '#3C3C3C',
              flexShrink: 0,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {step === 'upload' && (
              <button
                className="btn-secondary"
                onClick={handleClose}
                style={{ flex: '1 1 auto', maxWidth: 120 }}
              >
                Cancel
              </button>
            )}
            {step === 'preview' && (
              <>
                <button
                  className="btn-secondary"
                  onClick={reset}
                  style={{ flex: '1 1 auto', maxWidth: 120 }}
                >
                  ← Back
                </button>
                <button
                  className="btn-primary"
                  onClick={startImport}
                  disabled={!result || result.leads.length === 0}
                  style={{ flex: '1 1 auto', maxWidth: 200, justifyContent: 'center' }}
                >
                  <Upload size={14} /> Import {result?.leads.length ?? 0} Leads
                </button>
              </>
            )}
            {step === 'done' && (
              <button
                className="btn-primary"
                onClick={handleClose}
                style={{ flex: '1 1 auto', maxWidth: 160, justifyContent: 'center' }}
              >
                Done ✓
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Column guide — 1 col on mobile, 2 col on 400px+ */
        .import-col-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px 14px;
        }
        @media (min-width: 400px) {
          .import-col-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </>
  )
}