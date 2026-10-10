import { useEffect, useState } from 'react'
import {
  Building2, Plus, Edit2, CheckCircle2, AlertTriangle, RefreshCw,
  Search, ShieldAlert, Sparkles, Trash2, X, ExternalLink, HelpCircle,
  Home, MapPin, Tag, Layers, Flame, Bot, Send, MessageSquare, BookOpen, Check,
  Image, Video, Map, FileText, Upload, Eye, RotateCcw
} from 'lucide-react'
import {
  fetchProjects, createProject, updateProject, deleteProject,
  fetchFbForms, syncFbForms, mapFbForm, fetchAiHealth,
  fetchLearnedQuestions, approveLearnedQuestion, rejectLearnedQuestion,
  fetchTrainingData, insertTrainingData, deleteTrainingFaq,
  fetchFirstMessage, saveFirstMessage, deleteFirstMessage,
  uploadProjectMedia, deleteProjectMedia,
  fetchSharesampattiSyncStats, triggerSharesampattiSync,
  type SharesampattiSyncStats
} from '../lib/api'
import type { Project, FbForm, UnitType, ProjectFAQ, AiHealthResponse, LearnedQuestion, FlowOption } from '../types'

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'forms' | 'learning' | 'training'>('projects')

  // Data states
  const [projects, setProjects] = useState<Project[]>([])
  const [forms, setForms] = useState<FbForm[]>([])
  const [aiHealth, setAiHealth] = useState<AiHealthResponse | null>(null)
  const [learnedQuestions, setLearnedQuestions] = useState<LearnedQuestion[]>([])
  const [pendingCount, setPendingCount] = useState<number>(0)

  // Training & First Message Tab states
  const [selectedTrainProject, setSelectedTrainProject] = useState<string>('')
  const [trainQuestion, setTrainQuestion] = useState('')
  const [trainAnswer, setTrainAnswer] = useState('')
  const [trainKeywords, setTrainKeywords] = useState('')
  const [trainingLoading, setTrainingLoading] = useState(false)
  const [trainingFaqSearch, setTrainingFaqSearch] = useState('')

  // Automated Training Sync (llm.sharesampatti.com)
  const [sharesampattiStats, setSharesampattiStats] = useState<SharesampattiSyncStats | null>(null)
  const [syncingSharesampatti, setSyncingSharesampatti] = useState(false)
  const [showDirectDbGuide, setShowDirectDbGuide] = useState(false)

  // First Message Configuration states ("Pehle kya msg krna h")
  const [firstMsgScope, setFirstMsgScope] = useState<'universal' | 'project'>('universal')
  const [firstMsgProject, setFirstMsgProject] = useState<string>('')
  const [welcomeMessageInput, setWelcomeMessageInput] = useState('')
  const [step1QuestionInput, setStep1QuestionInput] = useState('')
  const [savingFirstMsg, setSavingFirstMsg] = useState(false)
  const [step1OptionsPreview, setStep1OptionsPreview] = useState<FlowOption[]>([])

  // Learning filters & draft state
  const [learningStatus, setLearningStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [learningProjectFilter, setLearningProjectFilter] = useState<string>('all')
  const [learningSearch, setLearningSearch] = useState('')
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({})
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Search & Filter
  const [projectSearch, setProjectSearch] = useState('')
  const [formSearch, setFormSearch] = useState('')

  // Modal State for Project Create/Edit
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')

  // Media Modal States
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [selectedMediaProject, setSelectedMediaProject] = useState<Project | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaTab, setMediaTab] = useState<'images' | 'videos' | 'map' | 'brochure'>('images')
  const [mediaUrlInput, setMediaUrlInput] = useState('')

  // Project Form Media Inputs
  const [imagesInput, setImagesInput] = useState('')
  const [videosInput, setVideosInput] = useState('')
  const [mapInput, setMapInput] = useState('')
  const [brochureInput, setBrochureInput] = useState('')

  // Project Form Fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [developer, setDeveloper] = useState('')
  const [location, setLocation] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [possession, setPossession] = useState('')
  const [reraNumber, setReraNumber] = useState('')
  const [paymentPlan, setPaymentPlan] = useState('')
  const [siteVisitInfo, setSiteVisitInfo] = useState('')
  const [currentOffers, setCurrentOffers] = useState('')
  const [summary, setSummary] = useState('')
  const [keywordsInput, setKeywordsInput] = useState('')
  const [amenitiesInput, setAmenitiesInput] = useState('')
  const [doNotSayInput, setDoNotSayInput] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Repeaters
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([
    { type: '2 BHK', sizeSqft: '1050 sq.ft.', priceFrom: '₹45 Lakhs' }
  ])
  const [faqs, setFaqs] = useState<ProjectFAQ[]>([
    { question: 'What is the possession date?', answer: 'Ready to move by end of 2026', keywords: ['possession', 'ready'] }
  ])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [projList, formList, healthData, pendingQ, syncStats] = await Promise.all([
        fetchProjects(),
        fetchFbForms(),
        fetchAiHealth().catch(() => ({ success: false, online: false, queueLength: 0, message: 'LLM not reachable' })),
        fetchLearnedQuestions('pending').catch(() => []),
        fetchSharesampattiSyncStats().catch(() => null),
      ])
      setProjects(projList)
      setForms(formList)
      setAiHealth(healthData)
      setPendingCount(pendingQ.length)
      if (syncStats) setSharesampattiStats(syncStats)

      if (learningStatus === 'pending') {
        setLearnedQuestions(pendingQ)
      } else {
        loadQuestions(learningStatus, learningProjectFilter)
      }

      if (projList && projList.length > 0) {
        const defaultProjId = projList[0]._id
        setSelectedTrainProject(prev => prev || defaultProjId)
        setFirstMsgProject(prev => prev || defaultProjId)
        loadFirstMessageSettings(defaultProjId)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load projects data')
    } finally {
      setLoading(false)
    }
  }

  async function handleTriggerSharesampattiSync() {
    setSyncingSharesampatti(true)
    setError('')
    try {
      const res = await triggerSharesampattiSync()
      setSuccessMsg(res.message || `✓ Synced ${res.syncedCount} conversations to llm.sharesampatti.com!`)
      setTimeout(() => setSuccessMsg(''), 4000)
      const stats = await fetchSharesampattiSyncStats().catch(() => null)
      if (stats) setSharesampattiStats(stats)
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger automated training sync')
    } finally {
      setSyncingSharesampatti(false)
    }
  }

  async function loadFirstMessageSettings(projId?: string) {
    try {
      const res = await fetchFirstMessage(projId)
      if (res.success) {
        setWelcomeMessageInput(res.welcomeMessage || '')
        setStep1QuestionInput(res.step1Question || '')
        setStep1OptionsPreview(res.step1Options || [])
      }
    } catch (err) {
      console.error('Failed to load first message settings:', err)
    }
  }

  function handleScopeChange(scope: 'universal' | 'project') {
    setFirstMsgScope(scope)
    if (scope === 'universal') {
      setFirstMsgProject('')
      loadFirstMessageSettings('')
    } else {
      const defaultProj = projects[0]?._id || ''
      setFirstMsgProject(defaultProj)
      loadFirstMessageSettings(defaultProj)
    }
  }

  async function handleSaveFirstMessage() {
    setSavingFirstMsg(true)
    setError('')
    try {
      const targetProjId = firstMsgScope === 'universal' ? undefined : (firstMsgProject || undefined)
      await saveFirstMessage({
        projectId: targetProjId,
        welcomeMessage: welcomeMessageInput.trim(),
        step1Question: step1QuestionInput.trim() || undefined,
      })
      setSuccessMsg(firstMsgScope === 'universal'
        ? '✓ Universal First Message saved for ALL leads successfully!'
        : '✓ First message updated for project successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchProjects().then(setProjects)
    } catch (err: any) {
      setError(err?.message || 'Failed to save first message')
    } finally {
      setSavingFirstMsg(false)
    }
  }

  async function handleDeleteFirstMessage() {
    if (!confirm('Are you sure you want to delete/clear the first welcome message? Leads will not receive an automated welcome text.')) return
    setSavingFirstMsg(true)
    setError('')
    try {
      const targetProjId = firstMsgScope === 'universal' ? undefined : (firstMsgProject || undefined)
      await deleteFirstMessage(targetProjId)
      setWelcomeMessageInput('')
      setSuccessMsg('✓ First welcome message cleared/deleted successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchProjects().then(setProjects)
    } catch (err: any) {
      setError(err?.message || 'Failed to delete first message')
    } finally {
      setSavingFirstMsg(false)
    }
  }

  function handleResetFirstMessageTemplate() {
    setWelcomeMessageInput(`Hello {{name}}! 👋 Welcome to our property advisory 🏡. Thank you for inquiring! How can I assist you today? Please feel free to ask about pricing, location, plot sizes, or schedule a site visit.`)
    setStep1QuestionInput('Please choose what you would like to explore:')
  }

  // ── Project Media Handlers ─────────────────────────────────────────────────
  function openMediaModal(p: Project) {
    setSelectedMediaProject(p)
    setMediaUrlInput('')
    setMediaModalOpen(true)
  }

  async function handleFileUpload(files: FileList | null, type: 'images' | 'videos' | 'map' | 'brochure') {
    if (!files || files.length === 0 || !selectedMediaProject) return
    setUploadingMedia(true)
    setError('')
    try {
      const formData = new FormData()
      if (type === 'images') {
        for (let i = 0; i < files.length; i++) {
          formData.append('images', files[i])
        }
      } else if (type === 'videos') {
        for (let i = 0; i < files.length; i++) {
          formData.append('videos', files[i])
        }
      } else if (type === 'map') {
        formData.append('map', files[0])
      } else if (type === 'brochure') {
        formData.append('brochure', files[0])
      }

      const res = await uploadProjectMedia(selectedMediaProject._id, formData)
      setSelectedMediaProject(res.project)
      setProjects(prev => prev.map(p => p._id === res.project._id ? res.project : p))
      setSuccessMsg(`✓ ${type.toUpperCase()} uploaded successfully!`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setError(err?.message || 'Failed to upload media')
    } finally {
      setUploadingMedia(false)
    }
  }

  async function handleAddMediaUrl(type: 'image' | 'video' | 'map' | 'brochure') {
    if (!mediaUrlInput.trim() || !selectedMediaProject) return
    setUploadingMedia(true)
    setError('')
    try {
      const formData = new FormData()
      if (type === 'image') formData.append('images', mediaUrlInput.trim())
      else if (type === 'video') formData.append('videos', mediaUrlInput.trim())
      else if (type === 'map') formData.append('map', mediaUrlInput.trim())
      else if (type === 'brochure') formData.append('brochure', mediaUrlInput.trim())

      const res = await uploadProjectMedia(selectedMediaProject._id, formData)
      setSelectedMediaProject(res.project)
      setProjects(prev => prev.map(p => p._id === res.project._id ? res.project : p))
      setMediaUrlInput('')
      setSuccessMsg(`✓ ${type.toUpperCase()} link added successfully!`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setError(err?.message || 'Failed to add media URL')
    } finally {
      setUploadingMedia(false)
    }
  }

  async function handleDeleteMedia(type: 'image' | 'video' | 'map' | 'brochure', url?: string) {
    if (!selectedMediaProject) return
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    setUploadingMedia(true)
    setError('')
    try {
      const res = await deleteProjectMedia(selectedMediaProject._id, { type, url })
      setSelectedMediaProject(res.project)
      setProjects(prev => prev.map(p => p._id === res.project._id ? res.project : p))
      setSuccessMsg(`✓ ${type.toUpperCase()} deleted successfully!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setError(err?.message || 'Failed to delete media')
    } finally {
      setUploadingMedia(false)
    }
  }

  async function handleInsertTraining() {
    if (!trainQuestion.trim()) {
      setError('Question text is required to train the AI model')
      return
    }
    if (!trainAnswer.trim()) {
      setError('Answer text is required to train the AI model')
      return
    }

    setTrainingLoading(true)
    setError('')
    try {
      const kw = trainKeywords.split(',').map(s => s.trim()).filter(Boolean)
      const res = await insertTrainingData({
        projectId: selectedTrainProject || undefined,
        question: trainQuestion.trim(),
        answer: trainAnswer.trim(),
        keywords: kw.length ? kw : undefined,
      })
      setSuccessMsg(`✓ Successfully trained Llama 3.2 model for "${res.project?.name || 'Project'}"!`)
      setTrainQuestion('')
      setTrainAnswer('')
      setTrainKeywords('')
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchProjects().then(setProjects)
    } catch (err: any) {
      setError(err?.message || 'Failed to train AI model')
    } finally {
      setTrainingLoading(false)
    }
  }

  async function handleDeleteFaq(projId: string, idx: number) {
    if (!confirm('Are you sure you want to delete this trained FAQ?')) return
    try {
      await deleteTrainingFaq(projId, idx)
      setSuccessMsg('FAQ deleted from training data')
      setTimeout(() => setSuccessMsg(''), 3000)
      fetchProjects().then(setProjects)
    } catch (err: any) {
      setError(err?.message || 'Failed to delete FAQ')
    }
  }

  async function loadQuestions(status = learningStatus, projId = learningProjectFilter) {
    try {
      const data = await fetchLearnedQuestions(status, projId === 'all' ? undefined : projId)
      setLearnedQuestions(data)
      if (status === 'pending') {
        setPendingCount(data.length)
      }
    } catch (err: any) {
      console.error('Failed to load learned questions:', err)
    }
  }

  const handleStatusFilterChange = (st: 'pending' | 'approved' | 'rejected') => {
    setLearningStatus(st)
    loadQuestions(st, learningProjectFilter)
  }

  const handleProjectFilterChange = (projId: string) => {
    setLearningProjectFilter(projId)
    loadQuestions(learningStatus, projId)
  }

  async function handleApproveLearned(q: LearnedQuestion) {
    const answer = draftAnswers[q._id] !== undefined ? draftAnswers[q._id] : (q.suggestedAnswer || '')
    if (!answer.trim()) {
      setError('Please provide an answer before approving into AI knowledge base')
      return
    }
    setApprovingId(q._id)
    try {
      await approveLearnedQuestion(q._id, answer.trim(), q.question)
      setSuccessMsg(`✓ AI trained successfully! Question added to project FAQs.`)
      setTimeout(() => setSuccessMsg(''), 4000)
      await Promise.all([
        loadQuestions(learningStatus, learningProjectFilter),
        fetchProjects().then(setProjects),
        fetchLearnedQuestions('pending').then(res => setPendingCount(res.length)).catch(() => {})
      ])
    } catch (err: any) {
      setError(err?.message || 'Failed to approve question')
    } finally {
      setApprovingId(null)
    }
  }

  async function handleRejectLearned(id: string) {
    setRejectingId(id)
    try {
      await rejectLearnedQuestion(id)
      setSuccessMsg(`Question dismissed`)
      setTimeout(() => setSuccessMsg(''), 3000)
      await Promise.all([
        loadQuestions(learningStatus, learningProjectFilter),
        fetchLearnedQuestions('pending').then(res => setPendingCount(res.length)).catch(() => {})
      ])
    } catch (err: any) {
      setError(err?.message || 'Failed to dismiss question')
    } finally {
      setRejectingId(null)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreateModal() {
    setEditingProject(null)
    setName('')
    setSlug('')
    setDeveloper('')
    setLocation('')
    setPriceRange('')
    setPossession('')
    setReraNumber('')
    setPaymentPlan('')
    setSiteVisitInfo('')
    setCurrentOffers('')
    setSummary('')
    setKeywordsInput('')
    setAmenitiesInput('')
    setDoNotSayInput('')
    setImagesInput('')
    setVideosInput('')
    setMapInput('')
    setBrochureInput('')
    setWelcomeMessage('')
    setIsActive(true)
    setUnitTypes([{ type: '2 BHK', sizeSqft: '1100 sq.ft.', priceFrom: '₹50 Lakhs' }])
    setFaqs([{ question: 'When is possession?', answer: 'Possession in Dec 2026', keywords: ['possession'] }])
    setModalOpen(true)
  }

  function openEditModal(p: Project) {
    setEditingProject(p)
    setName(p.name || '')
    setSlug(p.slug || '')
    setDeveloper(p.developer || '')
    setLocation(p.location || '')
    setPriceRange(p.priceRange || '')
    setPossession(p.possession || '')
    setReraNumber(p.reraNumber || '')
    setPaymentPlan(p.paymentPlan || '')
    setSiteVisitInfo(p.siteVisitInfo || '')
    setCurrentOffers(p.currentOffers || '')
    setSummary(p.summary || '')
    setKeywordsInput((p.keywords || []).join(', '))
    setAmenitiesInput((p.amenities || []).join(', '))
    setDoNotSayInput((p.doNotSay || []).join(', '))
    setImagesInput((p.images || []).join('\n'))
    setVideosInput((p.videos || []).join('\n'))
    setMapInput(p.map || '')
    setBrochureInput(p.brochure || '')
    setWelcomeMessage(p.welcomeMessage || '')
    setIsActive(p.isActive !== false)
    setUnitTypes(p.unitTypes?.length ? p.unitTypes : [{ type: '2 BHK', sizeSqft: '', priceFrom: '' }])
    setFaqs(p.faqs?.length ? p.faqs : [{ question: '', answer: '', keywords: [] }])
    setModalOpen(true)
  }

  async function handleSaveProject() {
    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload: Partial<Project> = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        developer: developer.trim(),
        location: location.trim(),
        priceRange: priceRange.trim(),
        possession: possession.trim(),
        reraNumber: reraNumber.trim(),
        paymentPlan: paymentPlan.trim(),
        siteVisitInfo: siteVisitInfo.trim(),
        currentOffers: currentOffers.trim(),
        summary: summary.trim(),
        welcomeMessage: welcomeMessage.trim(),
        images: imagesInput.split('\n').map(s => s.trim()).filter(Boolean),
        videos: videosInput.split('\n').map(s => s.trim()).filter(Boolean),
        map: mapInput.trim(),
        brochure: brochureInput.trim(),
        keywords: keywordsInput.split(',').map(s => s.trim()).filter(Boolean),
        amenities: amenitiesInput.split(',').map(s => s.trim()).filter(Boolean),
        doNotSay: doNotSayInput.split(',').map(s => s.trim()).filter(Boolean),
        unitTypes: unitTypes.filter(u => u.type.trim()),
        faqs: faqs.filter(f => f.question.trim() && f.answer.trim()),
        isActive,
      }

      if (editingProject) {
        await updateProject(editingProject._id, payload)
        setSuccessMsg(`Project "${name}" updated successfully!`)
      } else {
        await createProject(payload)
        setSuccessMsg(`Project "${name}" created successfully!`)
      }

      setModalOpen(false)
      loadData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setError(err?.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleProject(id: string) {
    try {
      await deleteProject(id)
      loadData()
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle project status')
    }
  }

  async function handleSyncForms() {
    setSyncing(true)
    setError('')
    try {
      const res = await syncFbForms()
      setSuccessMsg(res.message || 'Synced forms with Facebook successfully!')
      loadData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setError(err?.message || 'Failed to sync forms from Facebook Graph API')
    } finally {
      setSyncing(false)
    }
  }

  async function handleMapForm(formId: string, targetProjectId: string | null) {
    try {
      const updated = await mapFbForm(formId, targetProjectId || null)
      setForms(prev => prev.map(f => (f.formId === formId ? { ...f, projectId: updated.projectId } : f)))
      setSuccessMsg(`Form mapping updated successfully!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setError(err?.message || 'Failed to map form to project')
    }
  }

  // Unit Type Handlers
  const addUnitType = () => setUnitTypes([...unitTypes, { type: '', sizeSqft: '', priceFrom: '' }])
  const removeUnitType = (idx: number) => setUnitTypes(unitTypes.filter((_, i) => i !== idx))
  const updateUnitType = (idx: number, field: keyof UnitType, val: string) => {
    const next = [...unitTypes]
    next[idx] = { ...next[idx], [field]: val }
    setUnitTypes(next)
  }

  // FAQ Handlers
  const addFaq = () => setFaqs([...faqs, { question: '', answer: '', keywords: [] }])
  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx))
  const updateFaq = (idx: number, field: keyof ProjectFAQ, val: any) => {
    const next = [...faqs]
    next[idx] = { ...next[idx], [field]: val }
    setFaqs(next)
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.location?.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.developer?.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const filteredForms = forms.filter(f =>
    f.name.toLowerCase().includes(formSearch.toLowerCase()) ||
    f.formId.toLowerCase().includes(formSearch.toLowerCase()) ||
    (f.suggestedProject && f.suggestedProject.toLowerCase().includes(formSearch.toLowerCase()))
  )

  const filteredLearnedQuestions = learnedQuestions.filter(q =>
    q.question.toLowerCase().includes(learningSearch.toLowerCase()) ||
    (q.suggestedAnswer && q.suggestedAnswer.toLowerCase().includes(learningSearch.toLowerCase())) ||
    (q.approvedAnswer && q.approvedAnswer.toLowerCase().includes(learningSearch.toLowerCase())) ||
    (typeof q.projectId === 'object' && q.projectId?.name?.toLowerCase().includes(learningSearch.toLowerCase()))
  )

  return (
    <div className="campaign-page">
      {/* ── Page Header ── */}
      <div className="campaign-page-header">
        <div>
          <h1>Projects & AI Knowledge Base 🏢</h1>
          <p>Define verified project facts and map Facebook Lead Ads forms to power natural WhatsApp conversations.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* AI LLM Health Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: aiHealth?.online ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: aiHealth?.online ? '#86efac' : '#fca5a5',
              border: `1px solid ${aiHealth?.online ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: aiHealth?.online ? '#22c55e' : '#ef4444',
              }}
            />
            {aiHealth?.online
              ? (aiHealth.provider === 'gemini'
                  ? `Google Gemini (${aiHealth.model || '2.5-flash'})`
                  : aiHealth.provider
                  ? `AI Online (${aiHealth.provider.toUpperCase()})`
                  : `AI Thinker Online (${aiHealth.model || 'Active'})`)
              : 'AI Thinker Offline'}
          </div>

          <button className="campaign-primary-btn" onClick={openCreateModal}>
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* ── Alert Messages ── */}
      {error && (
        <div style={{ padding: '12px 18px', background: 'rgba(239,68,68,.15)', color: '#fca5a5', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px 18px', background: 'rgba(34,197,94,.15)', color: '#86efac', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveTab('projects')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            whiteSpace: 'nowrap',
            background: activeTab === 'projects' ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'rgba(255,255,255,0.06)',
            color: '#fff',
            boxShadow: activeTab === 'projects' ? '0 2px 8px rgba(76,110,245,0.25)' : 'none',
          }}
        >
          <Building2 size={14} /> Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            whiteSpace: 'nowrap',
            background: activeTab === 'forms' ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'rgba(255,255,255,0.06)',
            color: '#fff',
            boxShadow: activeTab === 'forms' ? '0 2px 8px rgba(76,110,245,0.25)' : 'none',
          }}
        >
          <Layers size={14} /> Facebook Forms ({forms.length})
        </button>

        <button
          onClick={() => setActiveTab('training')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            whiteSpace: 'nowrap',
            background: activeTab === 'training' ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(255,255,255,0.06)',
            color: '#fff',
            boxShadow: activeTab === 'training' ? '0 2px 8px rgba(16,185,129,0.25)' : 'none',
          }}
        >
          <MessageSquare size={14} /> Universal First Message & AI 🧠
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            whiteSpace: 'nowrap',
            background: activeTab === 'learning' ? 'linear-gradient(135deg,#9333ea,#4f46e5)' : 'rgba(255,255,255,0.06)',
            color: '#fff',
            boxShadow: activeTab === 'learning' ? '0 2px 8px rgba(147,51,234,0.25)' : 'none',
          }}
        >
          <Sparkles size={14} /> Discovered Questions ({pendingCount})
          {pendingCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: 9,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 8,
                marginLeft: 2,
              }}
            >
              NEW
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: PROJECTS TABLE ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'projects' && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: '#94a3b8' }} />
              <input
                className="input-base"
                style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 5, paddingBottom: 5, fontSize: 12 }}
                placeholder="Search projects..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
              />
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>
              Total Projects: <strong style={{ color: '#fff' }}>{filteredProjects.length}</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 11, letterSpacing: '0.03em' }}>
                  <th style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>PROJECT</th>
                  <th style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>LOCATION & DEV</th>
                  <th style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>PRICE & UNITS</th>
                  <th style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>MEDIA</th>
                  <th style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>FAQS</th>
                  <th style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                      {loading ? 'Loading projects...' : 'No projects configured yet. Click "New Project" to add one.'}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8' }}>slug: {p.slug}</div>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#e2e8f0', fontSize: 12 }}>{p.location || '—'}</div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{p.developer || '—'}</div>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                        <div style={{ color: '#86efac', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{p.priceRange || '—'}</div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(p.unitTypes || []).map(u => u.type).join(', ') || 'No units'}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10.5, padding: '2px 5px', borderRadius: 4, background: (p.images?.length || 0) > 0 ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)', color: (p.images?.length || 0) > 0 ? '#38bdf8' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }} title="Photos count">
                            <Image size={11} /> {p.images?.length || 0}
                          </span>
                          <span style={{ fontSize: 10.5, padding: '2px 5px', borderRadius: 4, background: (p.videos?.length || 0) > 0 ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)', color: (p.videos?.length || 0) > 0 ? '#c084fc' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }} title="Videos count">
                            <Video size={11} /> {p.videos?.length || 0}
                          </span>
                          <span style={{ fontSize: 10.5, padding: '2px 5px', borderRadius: 4, background: p.map ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', color: p.map ? '#86efac' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }} title="Layout map status">
                            <Map size={11} /> {p.map ? 'Map' : '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: '2px 7px', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                          {(p.faqs || []).length} FAQs
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            padding: '2px 7px',
                            borderRadius: 8,
                            fontSize: 10.5,
                            fontWeight: 600,
                            background: p.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            color: p.isActive ? '#86efac' : '#fca5a5',
                          }}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <button
                            style={{
                              padding: '3px 7px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 5,
                              background: 'rgba(56, 189, 248, 0.12)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap',
                              lineHeight: 1.2,
                            }}
                            onClick={() => openMediaModal(p)}
                            title="Manage Project Media"
                          >
                            <Upload size={11} /> Media
                          </button>

                          <button
                            style={{
                              padding: '3px 7px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 5,
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#e2e8f0',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap',
                              lineHeight: 1.2,
                            }}
                            onClick={() => openEditModal(p)}
                            title="Edit Project Details"
                          >
                            <Edit2 size={11} /> Edit
                          </button>

                          <button
                            style={{
                              padding: '3px 7px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 5,
                              background: p.isActive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                              color: p.isActive ? '#fca5a5' : '#86efac',
                              border: `1px solid ${p.isActive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)'}`,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap',
                              lineHeight: 1.2,
                            }}
                            onClick={() => handleToggleProject(p._id)}
                            title={p.isActive ? 'Deactivate Project' : 'Activate Project'}
                          >
                            {p.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: FACEBOOK FORMS MAPPING ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'forms' && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                className="input-base"
                style={{ paddingLeft: 34 }}
                placeholder="Search forms by name or ID..."
                value={formSearch}
                onChange={e => setFormSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="campaign-primary-btn"
                style={{ background: 'linear-gradient(135deg,#0284c7,#0369a1)' }}
                onClick={handleSyncForms}
                disabled={syncing}
              >
                <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync from Facebook'}
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 14px' }}>FORM NAME & ID</th>
                  <th style={{ padding: '12px 14px' }}>SUGGESTED HINT</th>
                  <th style={{ padding: '12px 14px' }}>LEADS</th>
                  <th style={{ padding: '12px 14px', width: 260 }}>MAPPED PROJECT</th>
                  <th style={{ padding: '12px 14px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                      {loading ? 'Loading forms...' : 'No Facebook forms found.'}
                    </td>
                  </tr>
                ) : (
                  filteredForms.map(f => {
                    const currentProjectId = typeof f.projectId === 'object' && f.projectId !== null
                      ? (f.projectId as any)._id
                      : f.projectId || ''

                    const isMapped = Boolean(currentProjectId)

                    return (
                      <tr key={f._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: 13.5 }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }}>
                            ID: {f.formId}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {f.suggestedProject ? (
                            <span style={{ fontSize: 12, color: '#c4b5fd', background: 'rgba(139,92,246,0.15)', padding: '3px 8px', borderRadius: 8 }}>
                              💡 Hint: {f.suggestedProject}
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ fontWeight: 700, color: '#60a5fa' }}>{f.leadCount || 0}</span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <select
                            className="input-base"
                            style={{ padding: '6px 10px', fontSize: 12.5 }}
                            value={currentProjectId}
                            onChange={e => handleMapForm(f.formId, e.target.value || null)}
                          >
                            <option value="">-- Needs Mapping / None --</option>
                            {projects.map(p => (
                              <option key={p._id} value={p._id}>
                                {p.name} {p.location ? `(${p.location})` : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {isMapped ? (
                            <span style={{ padding: '3px 10px', background: 'rgba(34,197,94,0.15)', color: '#86efac', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                              ✓ Mapped
                            </span>
                          ) : (
                            <span style={{ padding: '3px 10px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                              ⚠️ Needs Mapping
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: AI CONTINUOUS LEARNING & DISCOVERED QUESTIONS ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'learning' && (
        <div className="card" style={{ padding: 20 }}>
          {/* Explanation Banner */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12), rgba(79, 70, 229, 0.08))',
              border: '1px solid rgba(147, 51, 234, 0.25)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(147, 51, 234, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#f3e8ff', fontSize: 14 }}>
                  Self-Learning AI Pipeline (Continuous Auto-Training)
                </div>
                <div style={{ color: '#c4b5fd', fontSize: 12, marginTop: 2 }}>
                  When leads ask new questions on WhatsApp or when agents reply manually, they are automatically captured here. Review and click <strong>Approve & Train AI</strong> to permanently teach the bot.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadQuestions(learningStatus, learningProjectFilter)}
              className="campaign-secondary-btn"
              style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* Controls Bar: Filters & Search */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            {/* Status Pills */}
            <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.25)', padding: 4, borderRadius: 10 }}>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('pending')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: learningStatus === 'pending' ? '#9333ea' : 'transparent',
                  color: learningStatus === 'pending' ? '#fff' : '#94a3b8',
                }}
              >
                Pending Review {pendingCount > 0 ? `(${pendingCount})` : ''}
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('approved')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: learningStatus === 'approved' ? '#22c55e' : 'transparent',
                  color: learningStatus === 'approved' ? '#fff' : '#94a3b8',
                }}
              >
                Trained & Approved
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('rejected')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: learningStatus === 'rejected' ? '#64748b' : 'transparent',
                  color: learningStatus === 'rejected' ? '#fff' : '#94a3b8',
                }}
              >
                Dismissed
              </button>
            </div>

            {/* Project Filter & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <select
                className="input-base"
                style={{ padding: '7px 12px', fontSize: 12.5, minWidth: 180 }}
                value={learningProjectFilter}
                onChange={e => handleProjectFilterChange(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>

              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                <input
                  className="input-base"
                  style={{ paddingLeft: 30, paddingRight: 10, fontSize: 12.5 }}
                  placeholder="Search questions..."
                  value={learningSearch}
                  onChange={e => setLearningSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* List of Learned Question Cards */}
          {filteredLearnedQuestions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: 14,
                border: '1px dashed rgba(255,255,255,0.1)',
              }}
            >
              <HelpCircle size={40} style={{ color: '#94a3b8', opacity: 0.5, marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                {learningStatus === 'pending'
                  ? 'No pending questions needing training right now!'
                  : `No ${learningStatus} questions found.`}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 460, margin: '0 auto' }}>
                When customers chat on WhatsApp and ask something new, or when your sales agents answer custom queries, the bot captures them here so you can approve them into the knowledge base in 1 click.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredLearnedQuestions.map(q => {
                const projName = typeof q.projectId === 'object' && q.projectId ? q.projectId.name : 'Unknown Project'
                const isApproving = approvingId === q._id
                const isRejecting = rejectingId === q._id
                const currentAnswer = draftAnswers[q._id] !== undefined ? draftAnswers[q._id] : (q.suggestedAnswer || '')

                return (
                  <div
                    key={q._id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Top Row: Question Title, Project Badge, Occurrences, Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              background: 'rgba(59,130,246,0.15)',
                              color: '#60a5fa',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Building2 size={12} /> {projName}
                          </span>

                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              background: q.occurrences > 1 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                              color: q.occurrences > 1 ? '#f87171' : '#c084fc',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Flame size={12} /> Asked by {q.occurrences} {q.occurrences === 1 ? 'lead' : 'leads'}
                          </span>

                          {q.status === 'approved' && (
                            <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#86efac' }}>
                              ✓ Trained & Live
                            </span>
                          )}
                          {q.status === 'rejected' && (
                            <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(100,116,139,0.15)', color: '#94a3b8' }}>
                              ✕ Dismissed
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
                          {q.question}
                        </div>
                      </div>

                      {q.updatedAt && (
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Updated {new Date(q.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Example lead queries */}
                    {q.exampleUserQueries && q.exampleUserQueries.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Lead variations:</span>
                        {q.exampleUserQueries.slice(0, 4).map((ex, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: 10,
                              color: '#cbd5e1',
                              fontStyle: 'italic',
                            }}
                          >
                            "{ex}"
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Answer Box */}
                    {q.status === 'pending' ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Sparkles size={13} style={{ color: '#c084fc' }} />
                            Knowledge Base Answer (What the AI should reply to leads)
                          </label>
                          {q.suggestedAnswer && (
                            <span style={{ fontSize: 11, color: '#a78bfa' }}>
                              ⚡ Pre-filled from human agent response
                            </span>
                          )}
                        </div>
                        <textarea
                          className="input-base"
                          rows={2}
                          style={{
                            width: '100%',
                            resize: 'vertical',
                            fontSize: 13,
                            lineHeight: 1.4,
                            padding: '10px 12px',
                          }}
                          placeholder="Type factual answer (in Hindi, Hinglish, or English)..."
                          value={currentAnswer}
                          onChange={e => setDraftAnswers({ ...draftAnswers, [q._id]: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '10px 14px',
                          borderRadius: 8,
                          borderLeft: q.status === 'approved' ? '3px solid #22c55e' : '3px solid #64748b',
                        }}
                      >
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>
                          {q.status === 'approved' ? 'Knowledge Answer' : 'Dismissed / Inactive'}
                        </div>
                        <div style={{ fontSize: 13, color: '#e2e8f0' }}>
                          {q.approvedAnswer || q.suggestedAnswer || '—'}
                        </div>
                      </div>
                    )}

                    {/* Action Bar for Pending Questions */}
                    {q.status === 'pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleRejectLearned(q._id)}
                          disabled={isRejecting || isApproving}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#94a3b8',
                          }}
                        >
                          {isRejecting ? 'Dismissing...' : 'Dismiss'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApproveLearned(q)}
                          disabled={isApproving || isRejecting}
                          style={{
                            padding: '7px 18px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            background: 'linear-gradient(135deg, #9333ea, #4f46e5)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 2px 10px rgba(147,51,234,0.3)',
                          }}
                        >
                          <Sparkles size={14} />
                          {isApproving ? 'Training AI...' : '✓ Approve & Train AI'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: AI MODEL TRAINING & FIRST MESSAGE CONFIGURATION ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'training' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Llamafile Engine Status Header */}
          <div
            className="card-raised"
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 78, 59, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <Bot size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#fff' }}>
                    Local Llamafile Engine: Llama-3.2-3B-Instruct
                  </h3>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      background: aiHealth?.online ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: aiHealth?.online ? '#86efac' : '#fca5a5',
                      border: `1px solid ${aiHealth?.online ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    }}
                  >
                    {aiHealth?.online ? '● Online & Ready' : '○ Offline'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  Model: <code style={{ color: '#a7f3d0' }}>Llama-3.2-3B-Instruct-Q4_K_M.gguf</code> | Server: <code style={{ color: '#a7f3d0' }}>http://127.0.0.1:8080/v1</code>
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Ping Engine
            </button>
          </div>

          {/* Automated Training & Direct DB Sync with llm.sharesampatti.com */}
          <div
            className="card-raised"
            style={{
              padding: '18px 22px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.15))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(168, 85, 247, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#fff' }}>
                      Automated Model Training & DB Sync (llm.sharesampatti.com)
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        background: sharesampattiStats?.isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: sharesampattiStats?.isOnline ? '#86efac' : '#fca5a5',
                        border: `1px solid ${sharesampattiStats?.isOnline ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      }}
                    >
                      {sharesampattiStats?.isOnline ? '● Server Online' : '○ Checking Connection'}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                      }}
                    >
                      🔄 Auto-Sync: Every 30 Mins
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                    Directly connected to MongoDB database. Real user-AI conversations and verified project Q&A automatically feed into the training pipeline.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleTriggerSharesampattiSync}
                  disabled={syncingSharesampatti}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none',
                    color: '#fff',
                    cursor: syncingSharesampatti ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  <RefreshCw size={14} className={syncingSharesampatti ? 'spin' : ''} />
                  {syncingSharesampatti ? 'Syncing...' : 'Sync & Auto-Train Now'}
                </button>
              </div>
            </div>

            {/* Sync Metric Tiles */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Active Model</div>
                <div style={{ fontSize: 13, color: '#c084fc', fontWeight: 700, marginTop: 4, wordBreak: 'break-all' }}>
                  {sharesampattiStats?.activeModel?.split('/').pop() || 'Llama-3.2-3B-Instruct'}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Conversations in DB</div>
                <div style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginTop: 2 }}>
                  {sharesampattiStats?.totalInDb ?? 0}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Synced to Dataset</div>
                <div style={{ fontSize: 18, color: '#86efac', fontWeight: 700, marginTop: 2 }}>
                  {sharesampattiStats?.syncedToSharesampatti ?? 0}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Pending Sync</div>
                <div style={{ fontSize: 18, color: (sharesampattiStats?.pendingSync ?? 0) > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 700, marginTop: 2 }}>
                  {sharesampattiStats?.pendingSync ?? 0}
                </div>
              </div>
            </div>

            {/* Direct DB Connect / Autonomous Daemon Helper */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
              <button
                type="button"
                onClick={() => setShowDirectDbGuide(!showDirectDbGuide)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a78bfa',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                }}
              >
                {showDirectDbGuide ? '▾ Hide Direct Database Daemon Details' : '▸ Show Direct Database Daemon Details (for llm.sharesampatti.com VPS)'}
              </button>

              {showDirectDbGuide && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 12,
                    color: '#cbd5e1',
                    lineHeight: 1.6,
                  }}
                >
                  <p style={{ margin: '0 0 6px' }}>
                    💡 <strong>Direct MongoDB Connection:</strong> On your <code>llm.sharesampatti.com</code> VPS server, you can run the automated training daemon script directly:
                  </p>
                  <pre
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#a7f3d0',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      overflowX: 'auto',
                      margin: '6px 0',
                    }}
                  >
                    {`# On llm.sharesampatti.com server:
python3 scripts/auto_train_sharesampatti.py --daemon`}
                  </pre>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 11 }}>
                    This script directly connects to MongoDB, extracts all verified conversations and project facts into <code>/opt/llm/sharesampatti_training_dataset.jsonl</code>, and continuously fine-tunes your local open-source model!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Two-Column Grid: First Message & Quick Knowledge Training */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* ── CARD 1: PEHLE KYA MESSAGE BHEJNA HAI ── */}
            <div
              className="card-raised"
              style={{
                padding: 20,
                borderRadius: 16,
                background: '#242424',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MessageSquare size={18} style={{ color: '#38bdf8' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                      1. First Message (All Incoming Leads)
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                      Har nayi aane wali lead ko automatically first yahi message send hoga
                    </p>
                  </div>
                </div>

                {/* Scope Switcher: Universal vs Project Override */}
                <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 8, gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleScopeChange('universal')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: firstMsgScope === 'universal' ? '#2563eb' : 'transparent',
                      color: firstMsgScope === 'universal' ? '#fff' : '#94a3b8',
                    }}
                  >
                    🌐 All Leads (Universal)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScopeChange('project')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: firstMsgScope === 'project' ? '#2563eb' : 'transparent',
                      color: firstMsgScope === 'project' ? '#fff' : '#94a3b8',
                    }}
                  >
                    🏢 Project Override
                  </button>
                </div>
              </div>

              {/* Mode Banner / Project Picker */}
              {firstMsgScope === 'universal' ? (
                <div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Select Specific Project to Override:
                  </label>
                  <select
                    className="input-base"
                    value={firstMsgProject}
                    onChange={e => {
                      const id = e.target.value
                      setFirstMsgProject(id)
                      loadFirstMessageSettings(id)
                    }}
                  >
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.location ? `(${p.location})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Welcome Message Textarea */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
                    {firstMsgScope === 'universal' ? 'Universal Welcome Greeting (All Leads)' : 'Project Welcome Greeting'}
                  </label>
                  <span style={{ fontSize: 11, color: '#60a5fa' }}>Supports &#123;&#123;name&#125;&#125;</span>
                </div>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="Type your first message here... (e.g. Hello {{name}}! Welcome to our advisory. How can we assist you today?)"
                  value={welcomeMessageInput}
                  onChange={e => setWelcomeMessageInput(e.target.value)}
                />
              </div>
              {/* WhatsApp Card Preview (Simple Text Chat - No Buttons) */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  📱 WhatsApp Live Message Preview (Simple Text Chat):
                </label>
                <div
                  style={{
                    background: '#111b21',
                    borderRadius: 12,
                    padding: 14,
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  <div
                    style={{
                      background: '#202c33',
                      borderRadius: '8px 8px 8px 2px',
                      padding: 12,
                      maxWidth: '92%',
                      fontSize: 12.5,
                      color: '#e9edef',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#25d366', marginBottom: 4 }}>
                      🏡 {firstMsgScope === 'universal' ? 'Bhole Baba Investments' : (projects.find(p => p._id === firstMsgProject)?.name || 'Property Assistant')}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', color: welcomeMessageInput ? '#e9edef' : '#94a3b8', fontStyle: welcomeMessageInput ? 'normal' : 'italic' }}>
                      {welcomeMessageInput
                        ? welcomeMessageInput.replace('{{name}}', 'Rahul')
                        : '(No custom welcome message set — write your custom message above)'}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 10, color: '#8696a0', marginTop: 8 }}>
                      11:05 AM <span style={{ color: '#53bdeb' }}>✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSaveFirstMessage}
                  disabled={savingFirstMsg}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Check size={16} /> {savingFirstMsg ? 'Saving...' : (firstMsgScope === 'universal' ? 'Save Universal Message (For ALL Leads)' : 'Save Project First Message')}
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleResetFirstMessageTemplate}
                    disabled={savingFirstMsg}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.06)',
                      color: '#cbd5e1',
                      border: '1px solid rgba(255,255,255,0.12)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={14} /> Reset Template
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteFirstMessage}
                    disabled={savingFirstMsg}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Trash2 size={14} /> Clear / Delete
                  </button>
                </div>
              </div>
            </div>

            {/* ── CARD 2: DIRECT DATA INSERT & AI TRAINING ── */}
            <div
              className="card-raised"
              style={{
                padding: 20,
                borderRadius: 16,
                background: '#242424',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
                <BookOpen size={18} style={{ color: '#10b981' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    2. Data Insert & AI Model Training
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                    Type customer questions & factual answers to instantly train Llama 3.2
                  </p>
                </div>
              </div>

              {/* Target Project */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                  Target Project *
                </label>
                <select
                  className="input-base"
                  value={selectedTrainProject}
                  onChange={e => setSelectedTrainProject(e.target.value)}
                >
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.location ? `(${p.location})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Input */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                  Customer Question / Query *
                </label>
                <input
                  className="input-base"
                  placeholder=""
                  value={trainQuestion}
                  onChange={e => setTrainQuestion(e.target.value)}
                />
              </div>

              {/* Answer Input */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                  Verified Factual Answer *
                </label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder=""
                  value={trainAnswer}
                  onChange={e => setTrainAnswer(e.target.value)}
                />
              </div>

              {/* Keywords Input */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                  Trigger Keywords (Optional, comma-separated)
                </label>
                <input
                  className="input-base"
                  placeholder="e.g. discount, modular kitchen, parking, offer, 2bhk"
                  value={trainKeywords}
                  onChange={e => setTrainKeywords(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleInsertTraining}
                disabled={trainingLoading}
                style={{
                  marginTop: 'auto',
                  padding: '11px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                }}
              >
                <Sparkles size={16} /> {trainingLoading ? 'Training Llama 3.2...' : 'Train Llama 3.2 Model Now'}
              </button>
            </div>
          </div>

          {/* ── CARD 3: ALL TRAINED FAQS & KNOWLEDGE TABLE ── */}
          <div
            className="card-raised"
            style={{
              padding: 20,
              borderRadius: 16,
              background: '#242424',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  Trained Project FAQs & Knowledge Base
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  All verified answers currently loaded into Llama 3.2 memory for WhatsApp replies
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                  <input
                    className="input-base"
                    style={{ paddingLeft: 30, fontSize: 12, width: 220 }}
                    placeholder="Search trained FAQs..."
                    value={trainingFaqSearch}
                    onChange={e => setTrainingFaqSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* List of FAQs grouped by project */}
            {projects.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No projects created yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {projects.map(proj => {
                  const projFaqs = (proj.faqs || []).filter(
                    f =>
                      !trainingFaqSearch.trim() ||
                      f.question.toLowerCase().includes(trainingFaqSearch.toLowerCase()) ||
                      f.answer.toLowerCase().includes(trainingFaqSearch.toLowerCase()) ||
                      (f.keywords || []).some(k => k.toLowerCase().includes(trainingFaqSearch.toLowerCase()))
                  )

                  if (trainingFaqSearch.trim() && projFaqs.length === 0) return null

                  return (
                    <div
                      key={proj._id}
                      style={{
                        background: 'rgba(0,0,0,0.25)',
                        borderRadius: 12,
                        padding: 16,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8' }}>
                            {proj.name}
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            ({projFaqs.length} trained FAQs)
                          </span>
                        </div>
                        {proj.welcomeMessage && (
                          <span style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', padding: '2px 8px', borderRadius: 8 }}>
                            Custom First Message Active
                          </span>
                        )}
                      </div>

                      {projFaqs.length === 0 ? (
                        <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', padding: '6px 0' }}>
                          No FAQs trained yet for this project. Use the form above to train one!
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
                          {projFaqs.map((faq, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 10,
                                padding: 12,
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                                  Q: {faq.question}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFaq(proj._id, idx)}
                                  title="Delete FAQ"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#f87171',
                                    cursor: 'pointer',
                                    padding: 2,
                                    marginLeft: 6,
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                                A: {faq.answer}
                              </div>
                              {faq.keywords && faq.keywords.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                  {faq.keywords.map((kw, ki) => (
                                    <span
                                      key={ki}
                                      style={{
                                        fontSize: 10,
                                        padding: '1px 6px',
                                        borderRadius: 6,
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#6ee7b7',
                                      }}
                                    >
                                      #{kw}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── CREATE / EDIT PROJECT MODAL ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="card-raised"
            style={{
              width: '100%',
              maxWidth: 850,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              borderRadius: 16,
              background: '#2A2A2A',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={20} style={{ color: '#60a5fa' }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
                  {editingProject ? `Edit Project: ${editingProject.name}` : 'Create New Project Knowledge Base'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Fact Sheet Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Row 1: Name & Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Project Name *
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. Prisma Residences"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Slug (Auto-generated if blank)
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. prisma-residences"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Developer & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Developer / Builder
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. KLV Builders & Developers"
                    value={developer}
                    onChange={e => setDeveloper(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Location / Sector
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. Sector 12, Zirakpur Highway"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Price Range & Possession */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Price Range
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. ₹55 Lakhs - ₹1.10 Crore"
                    value={priceRange}
                    onChange={e => setPriceRange(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Possession Date / Status
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. December 2026 / Ready to Move"
                    value={possession}
                    onChange={e => setPossession(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: RERA & Payment Plan */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    RERA Number
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. PBRERA-SAS81-PR0123"
                    value={reraNumber}
                    onChange={e => setReraNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Payment Plan
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. 10:80:10 CLP or Subvention Plan"
                    value={paymentPlan}
                    onChange={e => setPaymentPlan(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 5: Site Visit & Current Offers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Site Visit Timings & Instructions
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. Open daily 10 AM to 6 PM, cab pickup available"
                    value={siteVisitInfo}
                    onChange={e => setSiteVisitInfo(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Current Offers / Incentives
                  </label>
                  <input
                    className="input-base"
                    placeholder="e.g. Modular kitchen free for bookings this month"
                    value={currentOffers}
                    onChange={e => setCurrentOffers(e.target.value)}
                  />
                </div>
              </div>

              {/* Welcome Message / First Message */}
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: 14, borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={16} /> First Message (Optional Project Override)
                  </label>
                  <span style={{ fontSize: 11, color: '#86efac' }}>Khali chhodenge toh Universal First Message use hoga</span>
                </div>
                <textarea
                  className="input-base"
                  rows={2}
                  placeholder="Optional: Agar is project ke liye koi alag first message chahiye toh yahan likhein, warna khali chhod dein..."
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}
                />
               
              </div>

              {/* Summary */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                  Project Summary (Overview for AI)
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  placeholder="Short 2-3 sentence summary of the project highlight, architectural style, and neighborhood."
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                />
              </div>

              {/* Keywords & Amenities */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Keywords (comma separated)
                  </label>
                  <input
                    className="input-base"
                    placeholder="prisma, luxury flat, zirakpur flat, 3bhk"
                    value={keywordsInput}
                    onChange={e => setKeywordsInput(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, display: 'block' }}>
                    Amenities (comma separated)
                  </label>
                  <input
                    className="input-base"
                    placeholder="Clubhouse, Swimming Pool, Gym, 24/7 Security"
                    value={amenitiesInput}
                    onChange={e => setAmenitiesInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Do Not Say Restrictions */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#fca5a5', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={14} /> Strict Rules: DO NOT SAY (Things AI must never claim)
                </label>
                <input
                  className="input-base"
                  style={{ borderColor: 'rgba(239,68,68,0.3)' }}
                  placeholder="Do not commit to unverified handover dates, do not offer discounts without approval"
                  value={doNotSayInput}
                  onChange={e => setDoNotSayInput(e.target.value)}
                />
              </div>

              {/* Project Media Links */}
              <div style={{ background: 'rgba(56, 189, 248, 0.06)', padding: 14, borderRadius: 12, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Image size={16} /> Project Media Links (Auto-sent to leads on WhatsApp)
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                      Master Layout Map URL
                    </label>
                    <input
                      className="input-base"
                      placeholder="e.g. https://.../layout-map.jpg"
                      value={mapInput}
                      onChange={e => setMapInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                      PDF Brochure URL
                    </label>
                    <input
                      className="input-base"
                      placeholder="e.g. https://.../brochure.pdf"
                      value={brochureInput}
                      onChange={e => setBrochureInput(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                      Image URLs (one per line)
                    </label>
                    <textarea
                      className="input-base"
                      rows={2}
                      placeholder="https://.../photo1.jpg&#10;https://.../photo2.jpg"
                      value={imagesInput}
                      onChange={e => setImagesInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                      Video URLs (one per line)
                    </label>
                    <textarea
                      className="input-base"
                      rows={2}
                      placeholder="https://.../walkthrough.mp4"
                      value={videosInput}
                      onChange={e => setVideosInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ── UNIT TYPES REPEATER ── */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>Unit Configurations & Pricing</span>
                  <button type="button" className="btn-secondary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={addUnitType}>
                    <Plus size={12} /> Add Unit
                  </button>
                </div>
                {unitTypes.map((u, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <input
                      className="input-base"
                      placeholder="Type (e.g. 2 BHK)"
                      value={u.type}
                      onChange={e => updateUnitType(i, 'type', e.target.value)}
                    />
                    <input
                      className="input-base"
                      placeholder="Size (e.g. 1150 sq.ft.)"
                      value={u.sizeSqft}
                      onChange={e => updateUnitType(i, 'sizeSqft', e.target.value)}
                    />
                    <input
                      className="input-base"
                      placeholder="Price From (e.g. ₹55L)"
                      value={u.priceFrom}
                      onChange={e => updateUnitType(i, 'priceFrom', e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-danger"
                      style={{ padding: '6px 8px' }}
                      onClick={() => removeUnitType(i)}
                      disabled={unitTypes.length === 1}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* ── FAQS REPEATER ── */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd' }}>Project FAQs (Q&A for AI matching)</span>
                  <button type="button" className="btn-secondary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={addFaq}>
                    <Plus size={12} /> Add FAQ
                  </button>
                </div>
                {faqs.map((f, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input
                        className="input-base"
                        placeholder="Question (e.g. Can I visit the site this Sunday?)"
                        value={f.question}
                        onChange={e => updateFaq(i, 'question', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ padding: '6px 8px' }}
                        onClick={() => removeFaq(i)}
                        disabled={faqs.length === 1}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <textarea
                      className="input-base"
                      rows={2}
                      placeholder="Verified Answer for AI to use"
                      value={f.answer}
                      onChange={e => updateFaq(i, 'answer', e.target.value)}
                      style={{ marginBottom: 6 }}
                    />
                    <input
                      className="input-base"
                      placeholder="Keywords (comma separated, e.g. visit, sunday, timing)"
                      value={(f.keywords || []).join(', ')}
                      onChange={e => updateFaq(i, 'keywords', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                      style={{ fontSize: 11 }}
                    />
                  </div>
                ))}
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="projectActiveToggle"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="projectActiveToggle" style={{ fontSize: 13, color: '#cbd5e1', cursor: 'pointer' }}>
                  Project is Active (AI will answer inquiries for this project)
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveProject} disabled={saving}>
                {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── PROJECT MEDIA ASSETS MODAL ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {mediaModalOpen && selectedMediaProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 780,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              borderRadius: 16,
              background: '#242424',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Image size={20} style={{ color: '#38bdf8' }} /> Media Assets: {selectedMediaProject.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  Auto-dispatched via WhatsApp when leads ask for photos, walkthrough video, or layout map.
                </p>
              </div>
              <button
                onClick={() => setMediaModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
              <button
                type="button"
                onClick={() => setMediaTab('images')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: mediaTab === 'images' ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                }}
              >
                📷 Photos ({selectedMediaProject.images?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('videos')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: mediaTab === 'videos' ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                }}
              >
                🎥 Walkthrough Videos ({selectedMediaProject.videos?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('map')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: mediaTab === 'map' ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                }}
              >
                🗺️ Layout Map ({selectedMediaProject.map ? '1' : '0'})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('brochure')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: mediaTab === 'brochure' ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                }}
              >
                📄 PDF Brochure ({selectedMediaProject.brochure ? '1' : '0'})
              </button>
            </div>

            {/* Upload Area */}
            <div style={{ background: '#18181b', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, padding: 18, textAlign: 'center', marginBottom: 20 }}>
              <Upload size={28} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                {mediaTab === 'images' && 'Upload Photos / Property Images (JPG, PNG, WebP)'}
                {mediaTab === 'videos' && 'Upload Walkthrough Video (MP4, WebM - up to 100MB)'}
                {mediaTab === 'map' && 'Upload Master Layout Plan / Naksha Image'}
                {mediaTab === 'brochure' && 'Upload Project Brochure (PDF Document)'}
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 12px' }}>
                Files will be saved directly on the server and sent over WhatsApp when requested.
              </p>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                  color: '#fff',
                  cursor: uploadingMedia ? 'not-allowed' : 'pointer',
                  opacity: uploadingMedia ? 0.6 : 1,
                }}
              >
                <Plus size={14} /> {uploadingMedia ? 'Uploading...' : 'Choose File(s) to Upload'}
                <input
                  type="file"
                  multiple={mediaTab === 'images' || mediaTab === 'videos'}
                  accept={
                    mediaTab === 'images'
                      ? 'image/*'
                      : mediaTab === 'videos'
                      ? 'video/*'
                      : mediaTab === 'map'
                      ? 'image/*'
                      : 'application/pdf'
                  }
                  style={{ display: 'none' }}
                  disabled={uploadingMedia}
                  onChange={e => handleFileUpload(e.target.files, mediaTab)}
                />
              </label>

              {/* Direct URL Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, maxWidth: 520, margin: '14px auto 0' }}>
                <input
                  className="input-base"
                  style={{ fontSize: 12, padding: '7px 12px' }}
                  placeholder={`Or paste direct ${mediaTab} URL (https://...)`}
                  value={mediaUrlInput}
                  onChange={e => setMediaUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '7px 14px', whiteSpace: 'nowrap' }}
                  disabled={uploadingMedia || !mediaUrlInput.trim()}
                  onClick={() => handleAddMediaUrl(mediaTab === 'images' ? 'image' : mediaTab === 'videos' ? 'video' : mediaTab)}
                >
                  Add Link
                </button>
              </div>
            </div>

            {/* Current Media List */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>
                Current {mediaTab.toUpperCase()}
              </h4>

              {/* IMAGES TAB */}
              {mediaTab === 'images' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {(selectedMediaProject.images || []).length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                      No photos uploaded for this project yet. Upload photos to auto-send when customers ask.
                    </div>
                  ) : (
                    selectedMediaProject.images!.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          borderRadius: 10,
                          overflow: 'hidden',
                          background: '#18181b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          aspectRatio: '16/10',
                        }}
                      >
                        <img
                          src={imgUrl.startsWith('http') ? imgUrl : `${(import.meta.env.VITE_API_URL1 || '').replace(/\/+$/, '')}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`}
                          alt={`Project ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e: any) => { e.target.src = 'https://placehold.co/300x200?text=Image+Unavailable'; }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia('image', imgUrl)}
                          disabled={uploadingMedia}
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            background: 'rgba(239, 68, 68, 0.85)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: 26,
                            height: 26,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Delete photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* VIDEOS TAB */}
              {mediaTab === 'videos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(selectedMediaProject.videos || []).length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                      No walkthrough videos uploaded yet. Upload MP4 video to auto-send when customers ask.
                    </div>
                  ) : (
                    selectedMediaProject.videos!.map((vidUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#18181b',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                          <Video size={18} style={{ color: '#a855f7', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: '#e2e8f0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {vidUrl}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <a
                            href={vidUrl.startsWith('http') ? vidUrl : `${(import.meta.env.VITE_API_URL1 || '').replace(/\/+$/, '')}${vidUrl.startsWith('/') ? '' : '/'}${vidUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              background: 'rgba(255,255,255,0.08)',
                              color: '#38bdf8',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Eye size={12} /> View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia('video', vidUrl)}
                            disabled={uploadingMedia}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#fca5a5',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* MAP TAB */}
              {mediaTab === 'map' && (
                <div>
                  {!selectedMediaProject.map ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                      No layout map uploaded yet. Upload master layout / naksha image.
                    </div>
                  ) : (
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#18181b', padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: '#86efac', fontWeight: 600 }}>✓ Master Layout Map Active</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia('map')}
                          disabled={uploadingMedia}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 11,
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Trash2 size={12} /> Remove Map
                        </button>
                      </div>
                      <img
                        src={selectedMediaProject.map.startsWith('http') ? selectedMediaProject.map : `${(import.meta.env.VITE_API_URL1 || '').replace(/\/+$/, '')}${selectedMediaProject.map.startsWith('/') ? '' : '/'}${selectedMediaProject.map}`}
                        alt="Master Layout Map"
                        style={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: 8 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* BROCHURE TAB */}
              {mediaTab === 'brochure' && (
                <div>
                  {!selectedMediaProject.brochure ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                      No PDF brochure uploaded yet. Upload official brochure PDF.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#18181b', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={24} style={{ color: '#f59e0b' }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Official PDF Brochure</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{selectedMediaProject.brochure}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a
                          href={selectedMediaProject.brochure.startsWith('http') ? selectedMediaProject.brochure : `${(import.meta.env.VITE_API_URL1 || '').replace(/\/+$/, '')}${selectedMediaProject.brochure.startsWith('/') ? '' : '/'}${selectedMediaProject.brochure}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            background: 'rgba(255,255,255,0.08)',
                            color: '#38bdf8',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Eye size={13} /> View PDF
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia('brochure')}
                          disabled={uploadingMedia}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
              <button className="btn-secondary" onClick={() => setMediaModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
