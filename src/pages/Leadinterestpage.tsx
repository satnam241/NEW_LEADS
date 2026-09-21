import { useEffect, useState } from 'react'
import {
  Flame,
  ThermometerSun,
  Snowflake,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  X,
  Phone,
  Bot,
} from 'lucide-react'
import {
  fetchLeadInterestList,
  fetchLeadInterestDetail,
  fetchBotFlow,
  createBotFlowStep,
  updateBotFlowStep,
  deleteBotFlowStep,
  type LeadInterestRow,
  type LeadInterestDetail,
  type InterestLevel,
  type BotFlowStep,
  type FlowOption,
} from '../lib/api'

const interestTone: Record<
  InterestLevel,
  { bg: string; color: string; icon: typeof Flame; label: string }
> = {
  hot: { bg: 'rgba(239,68,68,.13)', color: '#fca5a5', icon: Flame, label: 'Hot' },
  warm: { bg: 'rgba(245,158,11,.13)', color: '#fcd34d', icon: ThermometerSun, label: 'Warm' },
  cold: { bg: 'rgba(96,165,250,.13)', color: '#93c5fd', icon: Snowflake, label: 'Cold' },
}

function InterestBadge({ level }: { level: InterestLevel }) {
  const t = interestTone[level]
  const Icon = t.icon
  return (
    <span className="campaign-status" style={{ background: t.bg, color: t.color }}>
      <Icon size={12} />
      {t.label}
    </span>
  )
}

function DeliveryBadge({ status, lastMsg }: { status?: string; lastMsg?: string | null }) {
  if (status === 'replied') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#86efac',
            background: 'rgba(34,197,94,0.15)',
            padding: '2px 8px',
            borderRadius: 99,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            width: 'fit-content',
          }}
        >
          💬 Replied
        </span>
        {lastMsg && (
          <span
            style={{
              fontSize: 11,
              color: '#94a3b8',
              fontStyle: 'italic',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            "{lastMsg}"
          </span>
        )}
      </div>
    )
  }
  if (status === 'read') {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#60a5fa',
          background: 'rgba(59,130,246,0.15)',
          padding: '2px 8px',
          borderRadius: 99,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        👁️ Read
      </span>
    )
  }
  if (status === 'delivered') {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#cbd5e1',
          background: 'rgba(148,163,184,0.15)',
          padding: '2px 8px',
          borderRadius: 99,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        📬 Delivered
      </span>
    )
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
      📤 Sent
    </span>
  )
}

function leadName(row: LeadInterestRow): string {
  if (typeof row.leadId === 'object' && row.leadId?.fullName) return row.leadId.fullName
  return row.phone
}

function leadIdStr(row: LeadInterestRow): string {
  return typeof row.leadId === 'object' ? row.leadId._id : row.leadId
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function ExpandedTimeline({ leadId }: { leadId: string }) {
  const [detail, setDetail] = useState<LeadInterestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchLeadInterestDetail(leadId)
      .then(d => {
        if (!cancelled) setDetail(d)
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [leadId])

  if (loading)
    return (
      <div className="campaign-empty">
        <Loader2 size={14} className="animate-spin" /> Loading conversation...
      </div>
    )
  if (error) return <div className="campaign-empty">{error}</div>
  if (!detail) return null

  return (
    <div className="campaign-recipient-box">
      <div className="campaign-recipient-head">
        Conversation timeline — {detail.answers.length}/{detail.totalSteps} steps answered
      </div>
      {detail.answers.length === 0 && <div className="campaign-empty">No answers yet.</div>}
      {detail.answers.map((a, i) => (
        <div
          key={i}
          className="campaign-recipient-row"
          style={{
            borderBottom:
              i < detail.answers.length - 1 ? '1px solid rgba(255,255,255,.06)' : undefined,
          }}
        >
          <div>
            <strong>{a.step.replace('step_', 'Step ').replace('_', ' ')}</strong>
            <span>{new Date(a.answeredAt).toLocaleString('en-IN')}</span>
          </div>
          <span style={{ color: '#86efac', fontWeight: 600 }}>{a.optionTitle}</span>
        </div>
      ))}
      {detail.currentStep === 'completed' && detail.completedAt && (
        <div className="campaign-recipient-row">
          <div>
            <strong>Completed Flow</strong>
            <span>{new Date(detail.completedAt).toLocaleString('en-IN')}</span>
          </div>
          <span style={{ color: '#86efac', fontWeight: 600 }}>All questions answered 🔥</span>
        </div>
      )}
    </div>
  )
}

// ── Modal for Adding / Editing Question Step ─────────────────────────
interface StepModalProps {
  open: boolean
  step: BotFlowStep | null
  stepNumber: number
  onClose: () => void
  onSave: (stepData: { question: string; options: FlowOption[]; isActive: boolean }) => Promise<void>
}

function StepModal({ open, step, stepNumber, onClose, onSave }: StepModalProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<FlowOption[]>([])
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (step) {
      setQuestion(step.question)
      setOptions(
        step.options && step.options.length > 0
          ? step.options.map(o => ({ ...o }))
          : [
              { id: 'opt_1', title: 'Option 1', detailText: '' },
              { id: 'opt_2', title: 'Option 2', detailText: '' },
            ]
      )
      setIsActive(step.isActive !== false)
    } else {
      setQuestion('')
      setOptions([
        { id: 'opt_1', title: '', detailText: '' },
        { id: 'opt_2', title: '', detailText: '' },
        { id: 'opt_3', title: '', detailText: '' },
      ])
      setIsActive(true)
    }
    setErr('')
  }, [step, open])

  if (!open) return null

  const handleAddOption = () => {
    setOptions(prev => [
      ...prev,
      { id: `opt_${Date.now()}_${prev.length + 1}`, title: '', detailText: '' },
    ])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) {
      setErr('At least 1 option is required.')
      return
    }
    setOptions(prev => prev.filter((_, i) => i !== index))
  }

  const handleOptionChange = (index: number, field: 'title' | 'detailText', val: string) => {
    setOptions(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: val }
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) {
      setErr('Please enter the question text.')
      return
    }
    const validOptions = options.filter(o => o.title.trim().length > 0)
    if (validOptions.length === 0) {
      setErr('Please provide at least 1 valid option title.')
      return
    }

    setSaving(true)
    setErr('')
    try {
      await onSave({
        question: question.trim(),
        options: validOptions,
        isActive,
      })
      onClose()
    } catch (e: any) {
      setErr(e.message || 'Failed to save question step')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#3C3C3C',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
            {step ? `Edit Step ${step.stepOrder}` : `Add New Question (Step ${stepNumber})`}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {err && (
          <div
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={15} />
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Question Text <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="campaign-control"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="e.g. Which property type interests you?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Options (Choose 3-4 options) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                style={{
                  background: 'rgba(59,130,246,0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={13} /> Add Option
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt, idx) => (
                <div
                  key={opt.id || idx}
                  style={{
                    background: '#2A2A2A',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        background: '#334155',
                        color: '#f1f5f9',
                        fontSize: 12,
                        fontWeight: 700,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      className="campaign-control"
                      style={{ flex: 1 }}
                      placeholder={`Option ${idx + 1} title (e.g. 2BHK Apartment)`}
                      value={opt.title}
                      onChange={e => handleOptionChange(idx, 'title', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={options.length <= 1}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: options.length <= 1 ? '#475569' : '#ef4444',
                        cursor: options.length <= 1 ? 'not-allowed' : 'pointer',
                        padding: 6,
                      }}
                      title="Remove Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <input
                    type="text"
                    className="campaign-control"
                    style={{ fontSize: 12, opacity: 0.9 }}
                    placeholder="Optional instant reply message (e.g. Starting from ₹45L in Sector 62...)"
                    value={opt.detailText || ''}
                    onChange={e => handleOptionChange(idx, 'detailText', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#e2e8f0' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Active question step (included in live bot flow)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'Saving...' : step ? 'Update Step' : 'Create Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main LeadInterestPage Component ──────────────────────────────────
export default function LeadInterestPage() {
  const [activeTab, setActiveTab] = useState<'classification' | 'flow'>('classification')

  // Classification Tab State
  const [rows, setRows] = useState<LeadInterestRow[]>([])
  const [sortBy, setSortBy] = useState<'interest' | 'recent'>('interest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Bot Flow Builder State
  const [flowSteps, setFlowSteps] = useState<BotFlowStep[]>([])
  const [loadingFlow, setLoadingFlow] = useState(false)
  const [flowError, setFlowError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<BotFlowStep | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [previewStepIdx, setPreviewStepIdx] = useState<number>(0)
  const [previewSelectedOpt, setPreviewSelectedOpt] = useState<string>('')

  async function loadClassification() {
    setLoading(true)
    setError('')
    try {
      setRows(await fetchLeadInterestList(sortBy))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead interest data')
    } finally {
      setLoading(false)
    }
  }

  async function loadFlow() {
    setLoadingFlow(true)
    setFlowError('')
    try {
      const steps = await fetchBotFlow()
      setFlowSteps(steps)
      if (steps.length > 0 && steps[0].options && steps[0].options.length > 0) {
        setPreviewSelectedOpt(steps[0].options[0].title)
      }
    } catch (err) {
      setFlowError(err instanceof Error ? err.message : 'Failed to load bot flow')
    } finally {
      setLoadingFlow(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'classification') {
      loadClassification()
    } else {
      loadFlow()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sortBy])

  const hotCount = rows.filter(r => r.interest === 'hot').length
  const warmCount = rows.filter(r => r.interest === 'warm').length
  const coldCount = rows.filter(r => r.interest === 'cold').length

  const handleSaveStep = async (stepData: { question: string; options: FlowOption[]; isActive: boolean }) => {
    if (editingStep) {
      await updateBotFlowStep(editingStep._id, stepData)
    } else {
      await createBotFlowStep({
        ...stepData,
        stepOrder: flowSteps.length + 1,
      })
    }
    await loadFlow()
  }

  const handleDeleteStep = async (id: string) => {
    try {
      await deleteBotFlowStep(id)
      setDeleteConfirmId(null)
      await loadFlow()
    } catch (e: any) {
      setFlowError(e.message || 'Failed to delete step')
    }
  }

  const handleToggleActive = async (step: BotFlowStep) => {
    try {
      await updateBotFlowStep(step._id, { isActive: !step.isActive })
      await loadFlow()
    } catch (e: any) {
      setFlowError(e.message || 'Failed to update step status')
    }
  }

  const activeStep = flowSteps[previewStepIdx] || flowSteps[0]
  const selectedOptionTitle = previewSelectedOpt || (activeStep?.options && activeStep.options[0]?.title) || ''
  const selectedOptionObj = activeStep?.options?.find(o => o.title === selectedOptionTitle)

  return (
    <div className="campaign-page">
      {/* Page Header */}
      <div className="campaign-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1>Lead Interest & Bot Flow</h1>
          <p>Automate WhatsApp questions on campaign read & score leads into Hot, Warm, and Cold</p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', background: '#2A2A2A', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('classification')}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === 'classification' ? '#3b82f6' : 'transparent',
              color: activeTab === 'classification' ? '#fff' : '#94a3b8',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <Flame size={15} /> Lead Classification
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === 'flow' ? '#3b82f6' : 'transparent',
              color: activeTab === 'flow' ? '#fff' : '#94a3b8',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <Sliders size={15} /> WhatsApp Bot Flow Builder
          </button>
        </div>
      </div>

      {/* ── TAB 1: Lead Classification ── */}
      {activeTab === 'classification' && (
        <>
          {error && (
            <div className="campaign-success" style={{ background: 'rgba(239,68,68,.12)', color: '#fca5a5' }}>
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          <div className="campaign-stats-grid">
            <div className="campaign-stat-card">
              <div className="campaign-stat-top">
                <span>Hot Leads</span>
                <span className="campaign-icon-box" style={{ color: '#ef4444' }}>
                  <Flame size={16} />
                </span>
              </div>
              <div className="campaign-stat-value">{hotCount}</div>
              <div className="campaign-stat-note">2+ replies / completed questionnaire 🔥</div>
            </div>
            <div className="campaign-stat-card">
              <div className="campaign-stat-top">
                <span>Warm Leads</span>
                <span className="campaign-icon-box" style={{ color: '#f59e0b' }}>
                  <ThermometerSun size={16} />
                </span>
              </div>
              <div className="campaign-stat-value">{warmCount}</div>
              <div className="campaign-stat-note">Replied to 1 question 🌤️</div>
            </div>
            <div className="campaign-stat-card">
              <div className="campaign-stat-top">
                <span>Cold Leads</span>
                <span className="campaign-icon-box" style={{ color: '#60a5fa' }}>
                  <Snowflake size={16} />
                </span>
              </div>
              <div className="campaign-stat-value">{coldCount}</div>
              <div className="campaign-stat-note">Read message, 0 replies / ignored ❄️</div>
            </div>
          </div>

          <section className="campaign-table-card">
            <div className="campaign-toolbar">
              <select
                className="campaign-control"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                style={{ width: 220 }}
              >
                <option value="interest">Sort by interest (Hot leads first)</option>
                <option value="recent">Sort by most recent activity</option>
              </select>
            </div>

            <div className="campaign-table-scroll">
              {loading ? (
                <div className="campaign-empty">
                  <Loader2 size={16} className="animate-spin" /> Loading lead engagement...
                </div>
              ) : (
                <table className="campaign-table">
                  <thead>
                    <tr>
                      {['Lead', 'Status', 'Interest', 'Progress', 'Replies', 'Engaged For', 'Last Active', ''].map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => {
                      const id = leadIdStr(row)
                      const isExpanded = expandedId === id
                      return (
                        <>
                          <tr key={id} onClick={() => setExpandedId(isExpanded ? null : id)} style={{ cursor: 'pointer' }}>
                            <td>
                              <div className="campaign-name">{leadName(row)}</div>
                              <div className="campaign-meta">{row.phone}</div>
                            </td>
                            <td>
                              <DeliveryBadge status={row.deliveryStatus} lastMsg={row.lastMessageFromUser} />
                            </td>
                            <td>
                              <InterestBadge level={row.interest} />
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  marginTop: 4,
                                  color:
                                    row.interest === 'hot'
                                      ? '#fca5a5'
                                      : row.interest === 'warm'
                                      ? '#fcd34d'
                                      : '#93c5fd',
                                }}
                              >
                                {row.interest === 'hot'
                                  ? '🔥 Hot • Most Activity'
                                  : row.interest === 'warm'
                                  ? '🌤️ Warm • Interested'
                                  : '❄️ Cold • No Response'}
                              </div>
                            </td>
                            <td>
                              {row.stepsCompleted}/{row.totalSteps} steps
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{row.attemptCount}</span> replies
                            </td>
                            <td>{formatDuration(row.conversationDurationSec)}</td>
                            <td className="campaign-date">{new Date(row.lastActiveAt).toLocaleString('en-IN')}</td>
                            <td>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${id}-detail`}>
                              <td colSpan={8} style={{ padding: '0 0 16px 0' }}>
                                <ExpandedTimeline leadId={id} />
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="campaign-empty">
                          No conversation activity yet. Send a campaign to start gathering responses!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── TAB 2: WhatsApp Bot Flow Builder ── */}
      {activeTab === 'flow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {flowError && (
            <div className="campaign-success" style={{ background: 'rgba(239,68,68,.12)', color: '#fca5a5' }}>
              <AlertTriangle size={15} />
              {flowError}
            </div>
          )}

          {/* Flow Management Top Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#3C3C3C',
              padding: '16px 20px',
              borderRadius: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.08)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                Question Sequence ({flowSteps.length} Steps Configured)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#94a3b8' }}>
                When leads read your campaign template, the bot automatically sends these questions one by one.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingStep(null)
                setModalOpen(true)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8 }}
            >
              <Plus size={16} /> Add Question Step
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
            {/* Left: Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {loadingFlow ? (
                <div className="campaign-empty">
                  <Loader2 size={16} className="animate-spin" /> Loading question flow...
                </div>
              ) : flowSteps.length === 0 ? (
                <div className="campaign-empty">No question steps created yet. Click "Add Question Step" above.</div>
              ) : (
                flowSteps.map((step, idx) => (
                  <div
                    key={step._id}
                    style={{
                      background: '#3C3C3C',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            background: step.isActive ? '#3b82f6' : '#475569',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                          }}
                        >
                          Step {idx + 1}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
                          {step.question}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleToggleActive(step)}
                          style={{
                            background: step.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                            color: step.isActive ? '#86efac' : '#94a3b8',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {step.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingStep(step)
                            setModalOpen(true)
                          }}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          title="Edit Question"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(step._id)}
                          style={{
                            background: 'rgba(239,68,68,0.12)',
                            color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                          title="Delete Question"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 2 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                        Options Presented to User ({step.options.length}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {step.options.map((opt, oIdx) => (
                          <div
                            key={opt.id || oIdx}
                            style={{
                              background: '#2A2A2A',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: 12.5,
                              color: '#cbd5e1',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: '#60a5fa', fontWeight: 700 }}>{oIdx + 1}.</span>
                              <strong>{opt.title}</strong>
                            </div>
                            {opt.detailText && (
                              <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                                💬 Auto-reply: "{opt.detailText}"
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right: WhatsApp Live Preview & Lead Scoring Guide */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Interactive Bot Flow Simulator (Mockup UI matching media_1789805060993) */}
              <div
                style={{
                  background: '#3C3C3C',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                }}
              >
                {/* Simulator Card Header */}
                <div
                  style={{
                    background: '#343434',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: '#25D366',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>Bot Flow Live Simulator</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Interactive WhatsApp Preview</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#60a5fa', background: 'rgba(96,165,250,0.12)', padding: '2px 8px', borderRadius: 99 }}>
                      Interactive
                    </span>
                  </div>

                  {/* Multi-step selector tabs if more than 1 step */}
                  {flowSteps.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 2 }}>
                      {flowSteps.map((s, idx) => (
                        <button
                          key={s._id || idx}
                          type="button"
                          onClick={() => {
                            setPreviewStepIdx(idx)
                            setPreviewSelectedOpt(s.options?.[0]?.title || '')
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: 'none',
                            background: (previewStepIdx === idx || (!previewStepIdx && idx === 0)) ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                            color: (previewStepIdx === idx || (!previewStepIdx && idx === 0)) ? '#ffffff' : '#94a3b8',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Step {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulator Chat Screen */}
                <div
                  style={{
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    background: '#f8fafc',
                    minHeight: 340,
                    color: '#0f172a',
                  }}
                >
                  {activeStep ? (
                    <>
                      {/* Bot Header Identity */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#334155',
                          }}
                        >
                          <Bot size={15} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                          Real Estate Bot
                        </span>
                      </div>

                      {/* Bot Greeting Speech Bubble */}
                      <div
                        style={{
                          background: '#ffffff',
                          color: '#1e293b',
                          padding: '10px 14px',
                          borderRadius: '14px 14px 14px 2px',
                          fontSize: 12.5,
                          lineHeight: 1.45,
                          maxWidth: '85%',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        Hello, I'm your ChatBot Real Estate Agent! 🏡👋
                      </div>

                      {/* Bot Question & Clickable Options Card */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: 12,
                          border: '1.5px solid #cbd5e1',
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}
                      >
                        {/* Dynamic Question Title */}
                        <div
                          style={{
                            padding: '12px 14px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#1e293b',
                            lineHeight: 1.45,
                          }}
                        >
                          {activeStep.question || 'Choose what are you interested in:'}
                        </div>

                        {/* Dynamic Clickable Options from User Configuration */}
                        {activeStep.options && activeStep.options.length > 0 ? (
                          <div>
                            {activeStep.options.map((opt, i) => {
                              const isSelected = selectedOptionTitle === opt.title
                              return (
                                <div
                                  key={opt.id || i}
                                  onClick={() => setPreviewSelectedOpt(opt.title)}
                                  style={{
                                    borderTop: '1px solid #e2e8f0',
                                    padding: '10px 14px',
                                    textAlign: 'center',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                    background: isSelected ? '#eff6ff' : '#ffffff',
                                    transition: 'background 0.15s ease',
                                  }}
                                  title="Click to test user reply"
                                >
                                  {opt.title}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div
                            style={{
                              borderTop: '1px solid #e2e8f0',
                              padding: '10px 14px',
                              textAlign: 'center',
                              color: '#94a3b8',
                              fontSize: 12,
                            }}
                          >
                            No options added for this step yet.
                          </div>
                        )}
                      </div>

                      {/* User Selected Response (Yellow Pill from Mockup) */}
                      {selectedOptionTitle && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 4 }}>
                          <div style={{ fontSize: 10.5, color: '#64748b', marginBottom: 2 }}>User</div>
                          <div
                            style={{
                              background: '#facc15',
                              color: '#000000',
                              padding: '7px 16px',
                              borderRadius: 18,
                              fontSize: 12.5,
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              display: 'inline-block',
                            }}
                          >
                            {selectedOptionTitle}
                          </div>
                        </div>
                      )}

                      {/* Optional Bot Reply Bubble if option has auto-reply detailText */}
                      {selectedOptionObj?.detailText && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 4 }}>
                          <div style={{ fontSize: 10.5, color: '#64748b', marginBottom: 2 }}>Bot Auto-Reply</div>
                          <div
                            style={{
                              background: '#ffffff',
                              color: '#1e293b',
                              padding: '10px 14px',
                              borderRadius: '14px 14px 14px 2px',
                              fontSize: 12.5,
                              lineHeight: 1.45,
                              maxWidth: '88%',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {selectedOptionObj.detailText}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: 12.5, textAlign: 'center', marginTop: 50 }}>
                      Add question steps to see live preview
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Scoring Rules Info Card */}
              <div
                style={{
                  background: '#3C3C3C',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
                  <HelpCircle size={15} style={{ color: '#3b82f6' }} /> How Lead Scoring Works
                </div>
                <div style={{ fontSize: 12, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <strong style={{ color: '#fca5a5' }}>🔥 Hot Lead:</strong> Answered 2+ questions or completed the entire flow. Marked with high buying intent.
                  </div>
                  <div>
                    <strong style={{ color: '#fcd34d' }}>🌤️ Warm Lead:</strong> Answered 1 question. Started interacting with the bot.
                  </div>
                  <div>
                    <strong style={{ color: '#93c5fd' }}>❄️ Cold Lead:</strong> Campaign message was delivered/read but user sent 0 replies / ignored.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {deleteConfirmId && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  background: '#3C3C3C',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                  padding: 24,
                  maxWidth: 400,
                  width: '100%',
                }}
              >
                <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: 16 }}>Delete this question step?</h3>
                <p style={{ margin: '0 0 18px', color: '#94a3b8', fontSize: 13 }}>
                  This will remove the question from the automated WhatsApp bot flow.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    style={{ background: '#ef4444', borderColor: '#ef4444' }}
                    onClick={() => handleDeleteStep(deleteConfirmId)}
                  >
                    Delete Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step Add/Edit Modal */}
          <StepModal
            open={modalOpen}
            step={editingStep}
            stepNumber={flowSteps.length + 1}
            onClose={() => {
              setModalOpen(false)
              setEditingStep(null)
            }}
            onSave={handleSaveStep}
          />
        </div>
      )}
    </div>
  )
}