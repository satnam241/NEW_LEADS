import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, Clock3, Filter, Loader2, MessageSquare,
  Plus, Search, Send, Users, X,
} from 'lucide-react'
// ⚠️ Adjust this import path to wherever your real api.ts lives
import { fetchCampaigns, fetchCampaignStats, fetchAudienceCounts, createCampaign, fetchTemplates, type Campaign, type CampaignStatus, type SimpleTemplate } from '../lib/api'

const statusTone: Record<CampaignStatus, { bg: string; color: string; dot: string }> = {
  Draft: { bg: 'rgba(148,163,184,.12)', color: '#cbd5e1', dot: '#94a3b8' },
  Running: { bg: 'rgba(139,92,246,.15)', color: '#c4b5fd', dot: '#8b5cf6' },
  Completed: { bg: 'rgba(34,197,94,.13)', color: '#86efac', dot: '#22c55e' },
  Failed: { bg: 'rgba(239,68,68,.13)', color: '#fca5a5', dot: '#ef4444' },
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const s = statusTone[status]
  return <span className="campaign-status" style={{ background: s.bg, color: s.color }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />{status}</span>
}

function DarkSelect({ value, onChange, children, width }: { value?: string; onChange?: (value: string) => void; children: React.ReactNode; width?: number }) {
  return <select className="campaign-control" value={value} onChange={e => onChange?.(e.target.value)} style={width ? { width } : undefined}>{children}</select>
}

export default function CampaignsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | CampaignStatus>('All')
  const [audience, setAudience] = useState('All')

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, sent: 0, failed: 0 })
  const [audienceCounts, setAudienceCounts] = useState<Record<string, number>>({})
  const [templates, setTemplates] = useState<SimpleTemplate[]>([])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const [name, setName] = useState('')
  const [selectedAudience, setSelectedAudience] = useState('')
  const [selectedTemplateName, setSelectedTemplateName] = useState('')
  const [createdMessage, setCreatedMessage] = useState('')

  async function loadAll() {
    setLoading(true)
    setLoadError('')
    try {
      const [campaignList, statsData, audienceData, templateList] = await Promise.all([
        fetchCampaigns({ search: query, status, audience }),
        fetchCampaignStats(),
        fetchAudienceCounts(),
        fetchTemplates(),
      ])
      setCampaigns(campaignList)
      setStats(statsData)
      setAudienceCounts(audienceData)
      setTemplates(templateList)
      setSelectedTemplateName(current => current || templateList[0]?.name || '')
      setSelectedAudience(current => (current && audienceData[current] !== undefined ? current : Object.keys(audienceData)[0] || ''))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, audience])

  const selectedTemplateData = useMemo(() => templates.find(t => t.name === selectedTemplateName), [templates, selectedTemplateName])
  const recipientCount = audienceCounts[selectedAudience] ?? 0

  const resetCreate = () => {
    setCreateOpen(false); setConfirm(false); setSendError(''); setName('')
    setSelectedAudience(Object.keys(audienceCounts)[0] ?? '')
    setSelectedTemplateName(templates[0]?.name ?? '')
  }

  async function submitCampaign(action: 'draft' | 'send') {
    setSending(true)
    setSendError('')
    try {
      await createCampaign({ name: name.trim() || 'Untitled Campaign', audience: selectedAudience, template: selectedTemplateName, action })
      setCreatedMessage(action === 'send' ? 'Campaign sent.' : 'Campaign saved as draft.')
      setConfirm(false); setCreateOpen(false); setName('')
      await loadAll()
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="campaign-page">
      <div className="campaign-page-header">
        <div><h1>Campaigns</h1><p>Send WhatsApp campaigns to your leads via your connected business number</p></div>
        <button className="campaign-primary-btn" onClick={() => setCreateOpen(true)} disabled={!templates.length}><Plus size={15} /> Create Campaign</button>
      </div>

      {!loading && !templates.length && (
        <div className="campaign-success" style={{ background: 'rgba(245,158,11,.12)', color: '#fcd34d' }}>
          <AlertTriangle size={15} />No templates yet — create one from the Templates page first.
        </div>
      )}
      {createdMessage && <div className="campaign-success"><CheckCircle2 size={15} />{createdMessage}<button onClick={() => setCreatedMessage('')}><X size={14} /></button></div>}
      {loadError && <div className="campaign-success" style={{ background: 'rgba(239,68,68,.12)', color: '#fca5a5' }}><AlertTriangle size={15} />{loadError}</div>}

      <div className="campaign-stats-grid">
        <div className="campaign-stat-card"><div className="campaign-stat-top"><span>Total Campaigns</span><span className="campaign-icon-box"><MessageSquare size={15} /></span></div><div className="campaign-stat-value">{stats.total}</div></div>
        <div className="campaign-stat-card"><div className="campaign-stat-top"><span>Active</span><span className="campaign-icon-box"><Clock3 size={15} /></span></div><div className="campaign-stat-value">{stats.active}</div></div>
        <div className="campaign-stat-card"><div className="campaign-stat-top"><span>Messages Sent</span><span className="campaign-icon-box"><Send size={15} /></span></div><div className="campaign-stat-value">{stats.sent.toLocaleString('en-IN')}</div></div>
        <div className="campaign-stat-card"><div className="campaign-stat-top"><span>Failed</span><span className="campaign-icon-box"><AlertTriangle size={15} /></span></div><div className="campaign-stat-value">{stats.failed.toLocaleString('en-IN')}</div></div>
      </div>

      <section className="campaign-table-card">
        <div className="campaign-toolbar">
          <div className="campaign-search"><Search size={14} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search campaigns..." /></div>
          <DarkSelect value={status} onChange={v => setStatus(v as typeof status)} width={145}>
            <option value="All">All statuses</option>
            {(['Draft', 'Running', 'Completed', 'Failed'] as CampaignStatus[]).map(s => <option key={s}>{s}</option>)}
          </DarkSelect>
          <DarkSelect value={audience} onChange={setAudience} width={175}>
            <option value="All">All audiences</option>
            {Object.keys(audienceCounts).map(a => <option key={a}>{a}</option>)}
          </DarkSelect>
          <div className="campaign-count"><Filter size={13} /> {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="campaign-table-scroll">
          {loading ? (
            <div className="campaign-empty"><Loader2 size={16} /> Loading...</div>
          ) : (
            <table className="campaign-table">
              <thead><tr>{['Campaign', 'Audience', 'Template', 'Recipients', 'Sent', 'Failed', 'Status', 'Created'].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c._id}>
                    <td><div className="campaign-name">{c.name}</div></td>
                    <td>{c.audience}</td>
                    <td><span className="campaign-template">{c.template}</span></td>
                    <td>{c.recipients}</td><td>{c.sent}</td><td>{c.failed}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="campaign-date">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && <tr><td colSpan={8} className="campaign-empty">No campaigns match your filters.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {createOpen && (
        <div className="campaign-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) resetCreate() }}>
          <div className="campaign-modal campaign-builder">
            <div className="campaign-modal-header">
              <div><div className="campaign-modal-title">Create Campaign</div><div className="campaign-modal-sub">Choose an audience and a template</div></div>
              <button className="campaign-close" onClick={resetCreate}><X size={15} /></button>
            </div>
            <div className="campaign-modal-body">
              <div className="campaign-form-grid">
                <div><label>Campaign name</label><input className="campaign-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. September Follow-up" /></div>
              </div>
              <div className="campaign-divider" />
              <div className="campaign-form-grid">
                <div>
                  <label>Lead group</label>
                  <DarkSelect value={selectedAudience} onChange={setSelectedAudience}>{Object.keys(audienceCounts).map(a => <option key={a}>{a}</option>)}</DarkSelect>
                  <div className="campaign-eligible"><div><span>Eligible contacts</span><strong>{recipientCount.toLocaleString('en-IN')}</strong></div><Users size={19} /></div>
                </div>
                <div>
                  <label>Template</label>
                  <DarkSelect value={selectedTemplateName} onChange={setSelectedTemplateName}>
                    {templates.map(t => {
                      const isAd = !!(t.imageUrl || t.header || t.type === 'advertise');
                      return (
                        <option key={t.name} value={t.name}>
                          {isAd ? '📢 ' : '💬 '}{t.label} · {t.name}
                        </option>
                      );
                    })}
                  </DarkSelect>
                  {selectedTemplateData && (
                    <div className="campaign-whatsapp-preview" style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div className="campaign-preview-label" style={{ margin: 0 }}>Template Details</div>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: (selectedTemplateData.imageUrl || selectedTemplateData.header || selectedTemplateData.type === 'advertise')
                            ? 'rgba(76, 110, 245, 0.25)'
                            : 'rgba(34, 197, 94, 0.25)',
                          color: (selectedTemplateData.imageUrl || selectedTemplateData.header || selectedTemplateData.type === 'advertise')
                            ? '#93c5fd'
                            : '#86efac'
                        }}>
                          {selectedTemplateData.imageUrl || selectedTemplateData.header || selectedTemplateData.type === 'advertise' ? '📢 Advertise Template' : '💬 Standard Text'}
                        </span>
                      </div>

                      <div className="campaign-bubble">
                        {selectedTemplateData.imageUrl && (
                          <img
                            src={selectedTemplateData.imageUrl}
                            alt="Campaign banner"
                            style={{
                              width: '100%',
                              maxHeight: 140,
                              objectFit: 'cover',
                              borderRadius: 6,
                              marginBottom: 6,
                              display: 'block'
                            }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        {selectedTemplateData.header && (
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#ffffff', marginBottom: 4 }}>
                            {selectedTemplateData.header}
                          </div>
                        )}
                        <div style={{ fontSize: 12.5, whiteSpace: 'pre-wrap', color: '#dcfce7' }}>
                          {selectedTemplateData.bodyText}
                        </div>
                        {selectedTemplateData.options && selectedTemplateData.options.length > 0 && (
                          <div style={{
                            marginTop: 8,
                            background: '#ffffff',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            overflow: 'hidden',
                            color: '#1e293b'
                          }}>
                            {selectedTemplateData.options.map((opt, i) => (
                              <div key={i} style={{
                                padding: '6px 10px',
                                borderTop: i > 0 ? '1px solid #e2e8f0' : 'none',
                                textAlign: 'center',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#2563eb'
                              }}>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedTemplateData.footer && (
                          <div style={{ fontSize: 10.5, color: '#86efac', opacity: 0.8, marginTop: 6, fontStyle: 'italic' }}>
                            {selectedTemplateData.footer}
                          </div>
                        )}
                        <div style={{ textAlign: 'right', fontSize: 9.5, color: '#86efac', opacity: 0.6, marginTop: 4 }}>
                          12:00 PM ✓✓
                        </div>
                      </div>

                      {selectedTemplateData.variables?.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                          <strong>Variables:</strong> {selectedTemplateData.variables.map((v, i) => `{{${i + 1}}} (${v})`).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="campaign-info"><MessageSquare size={15} /><div><strong>{recipientCount.toLocaleString('en-IN')} contacts</strong> will receive this message.</div></div>
              {sendError && <div className="campaign-success" style={{ background: 'rgba(239,68,68,.12)', color: '#fca5a5' }}><AlertTriangle size={15} />{sendError}</div>}
            </div>
            <div className="campaign-modal-footer">
              <button className="campaign-secondary-btn" onClick={resetCreate}>Cancel</button>
              <button className="campaign-secondary-btn" onClick={() => submitCampaign('draft')} disabled={sending}>Save Draft</button>
              <button className="campaign-primary-btn" onClick={() => setConfirm(true)} disabled={!name.trim() || !selectedTemplateName || sending}><Send size={14} /> Send Campaign</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="campaign-backdrop campaign-confirm-backdrop">
          <div className="campaign-modal campaign-confirm">
            <div className="campaign-modal-header"><div className="campaign-modal-title">Send Campaign?</div><button className="campaign-close" onClick={() => setConfirm(false)}><X size={15} /></button></div>
            <div className="campaign-modal-body">
              <div className="campaign-confirm-icon"><Send size={19} /></div>
              <p>You are about to send <strong>{name}</strong> to <strong>{recipientCount.toLocaleString('en-IN')} contacts</strong>.</p>
              <small>Messages are sent with a short delay between each to reduce spam-detection risk.</small>
            </div>
            <div className="campaign-modal-footer">
              <button className="campaign-secondary-btn" onClick={() => setConfirm(false)} disabled={sending}>Cancel</button>
              <button className="campaign-primary-btn" onClick={() => submitCampaign('send')} disabled={sending}>{sending ? <Loader2 size={14} /> : <Send size={14} />} Confirm Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}