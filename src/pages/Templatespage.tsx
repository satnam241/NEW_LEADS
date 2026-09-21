import { useEffect, useState, useRef } from 'react'
import {
  Plus,
  X,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Eye,
  Megaphone,
  FileText,
  Upload,
  Loader2,
  ListPlus,
  Bot,
  CheckCircle2,
} from 'lucide-react'
import {
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  uploadTemplateImage,
  type SimpleTemplate,
} from '../lib/api'

function extractPlaceholderCount(bodyText: string): number {
  return (bodyText.match(/\{\{\d+\}\}/g) || []).length
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<SimpleTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formError, setFormError] = useState('')

  // Form Fields
  const [templateType, setTemplateType] = useState<'text' | 'advertise'>('advertise')
  const [label, setLabel] = useState('')
  const [name, setName] = useState('')
  const [header, setHeader] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [footer, setFooter] = useState('')
  const [varNames, setVarNames] = useState<string[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [newOptionInput, setNewOptionInput] = useState('')

  // Details & Inspector State
  const [selectedTemplate, setSelectedTemplate] = useState<SimpleTemplate | null>(null)
  const [dropdownSelectedId, setDropdownSelectedId] = useState<string>('')
  const [previewSelectedOption, setPreviewSelectedOption] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholderCount = extractPlaceholderCount(bodyText)

  async function loadTemplates() {
    setLoading(true)
    setLoadError('')
    try {
      const data = await fetchTemplates()
      setTemplates(data)
      if (data.length > 0) {
        setDropdownSelectedId(data[0]._id)
        setSelectedTemplate(data[0])
        if (data[0].options && data[0].options.length > 0) {
          setPreviewSelectedOption(data[0].options[0])
        }
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  function resetForm() {
    setCreateOpen(false)
    setFormError('')
    setTemplateType('advertise')
    setLabel('')
    setName('')
    setHeader('')
    setImageUrl('')
    setBodyText('')
    setFooter('')
    setVarNames([])
    setOptions([])
    setNewOptionInput('')
  }

  function openCreateModal() {
    resetForm()
    setOptions([])
    setPreviewSelectedOption('')
    setCreateOpen(true)
  }

  function autoSlugify(value: string) {
    setLabel(value)
    setName(value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
  }

  // Handle local file selection and upload
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setFormError('')
    try {
      const result = await uploadTemplateImage(file)
      setImageUrl(result.url)
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed. Only JPG, PNG, WEBP allowed (max 5MB).')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function addOption() {
    const trimmed = newOptionInput.trim()
    if (!trimmed) return
    if (!options.includes(trimmed)) {
      const updated = [...options, trimmed]
      setOptions(updated)
      setPreviewSelectedOption(trimmed)
    }
    setNewOptionInput('')
  }

  function removeOption(idx: number) {
    const updated = options.filter((_, i) => i !== idx)
    setOptions(updated)
    if (updated.length > 0) {
      setPreviewSelectedOption(updated[0])
    }
  }

  async function handleCreate() {
    setFormError('')
    if (!label.trim() || !name.trim() || !bodyText.trim()) {
      setFormError('Display label, template name, and body text are required')
      return
    }
    const detectedCount = extractPlaceholderCount(bodyText)
    if (detectedCount !== varNames.filter(Boolean).length) {
      setFormError(`Body uses ${detectedCount} placeholder(s) — please name all of them below`)
      return
    }

    setSaving(true)
    try {
      await createTemplate({
        name,
        label,
        bodyText,
        variables: varNames.filter(Boolean),
        header: header.trim() || null,
        imageUrl: imageUrl.trim() || null,
        footer: footer.trim() || null,
        type: templateType,
        options: options.filter(Boolean),
      })
      await loadTemplates()
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create template')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return
    try {
      await deleteTemplate(id)
      if (selectedTemplate?._id === id) {
        setSelectedTemplate(null)
      }
      await loadTemplates()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete template')
    }
  }

  const handleDropdownChange = (id: string) => {
    setDropdownSelectedId(id)
    const found = templates.find(t => t._id === id)
    if (found) {
      setSelectedTemplate(found)
      if (found.options && found.options.length > 0) {
        setPreviewSelectedOption(found.options[0])
      } else {
        setPreviewSelectedOption('')
      }
    }
  }

  return (
    <div className="campaign-page">
      <div className="campaign-page-header">
        <div>
          <h1>Message Templates</h1>
          <p>Create media & interactive bot templates for campaigns with buttons, headers, and images</p>
        </div>
        <button className="campaign-primary-btn" onClick={openCreateModal}>
          <Plus size={15} /> New Template
        </button>
      </div>

      {loadError && (
        <div className="campaign-success" style={{ background: 'rgba(239,68,68,.12)', color: '#fca5a5' }}>
          <AlertTriangle size={15} />{loadError}
        </div>
      )}

      {/* Interactive Quick Dropdown & Details Card */}
      {templates.length > 0 && (
        <div
          style={{
            background: '#3C3C3C',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            padding: '16px 20px',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
        </div>
      )}

      {/* Main Table */}
      <section className="campaign-table-card">
        <div className="campaign-table-scroll">
          {loading ? (
            <div className="campaign-empty">Loading templates...</div>
          ) : (
            <table className="campaign-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Display Label</th>
                  <th>Image / Options</th>
                  <th>Preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => {
                  const isAdvertise = !!(t.imageUrl || t.header || t.options?.length || t.type === 'advertise')
                  const isSelected = selectedTemplate?._id === t._id
                  return (
                    <tr
                      key={t._id}
                      onClick={() => {
                        setSelectedTemplate(t)
                        setDropdownSelectedId(t._id)
                        if (t.options?.length) setPreviewSelectedOption(t.options[0])
                      }}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(76, 110, 245, 0.08)' : undefined,
                      }}
                      title="Click to view template details"
                    >
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: isAdvertise ? 'rgba(76, 110, 245, 0.15)' : 'rgba(255,255,255,0.06)',
                            color: isAdvertise ? '#93c5fd' : '#cbd5e1',
                          }}
                        >
                          {isAdvertise ? <Megaphone size={12} /> : <FileText size={12} />}
                          {isAdvertise ? 'Advertise' : 'Text'}
                        </span>
                      </td>
                      <td>
                        <span className="campaign-template">{t.name}</span>
                      </td>
                      <td>
                        <strong>{t.label}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {t.imageUrl ? (
                            <span style={{ fontSize: 11, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ImageIcon size={11} /> Image attached
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#64748b' }}>No image</span>
                          )}
                          {t.options && t.options.length > 0 && (
                            <span style={{ fontSize: 11, color: '#facc15' }}>
                              {t.options.length} options
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1' }}>
                        {t.bodyText}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                          <button
                            className="campaign-more"
                            title="Inspect Details"
                            onClick={() => {
                              setSelectedTemplate(t)
                              setDropdownSelectedId(t._id)
                              if (t.options?.length) setPreviewSelectedOption(t.options[0])
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button className="campaign-more" title="Delete Template" onClick={() => handleDelete(t._id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="campaign-empty">
                      No templates yet — click "New Template" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* CREATE TEMPLATE MODAL */}
      {createOpen && (
        <div className="campaign-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) resetForm() }}>
          <div className="campaign-modal campaign-builder" style={{ maxWidth: 740 }}>
            <div className="campaign-modal-header">
              <div>
                <div className="campaign-modal-title">New Campaign Template</div>
                <div className="campaign-modal-sub">Create a media advertise template with interactive button options</div>
              </div>
              <button className="campaign-close" onClick={resetForm}><X size={15} /></button>
            </div>

            <div className="campaign-modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
              {/* Type Switcher */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  marginBottom: 16,
                  padding: 4,
                  background: '#2A2A2A',
                  borderRadius: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setTemplateType('advertise')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: templateType === 'advertise' ? '#4c6ef5' : 'transparent',
                    color: templateType === 'advertise' ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <Megaphone size={14} /> 📢 Advertise / Bot Template (Image + Buttons)
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateType('text')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: templateType === 'text' ? '#4c6ef5' : 'transparent',
                    color: templateType === 'text' ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <FileText size={14} /> 💬 Standard Plain Text
                </button>
              </div>

              {/* Labels & Identifier */}
              <div className="campaign-form-grid">
                <div>
                  <label>Display Label *</label>
                  <input
                    className="campaign-control"
                    value={label}
                    onChange={e => autoSlugify(e.target.value)}
                    placeholder="e.g. Real Estate Bot Flow"
                  />
                </div>
                <div>
                  <label>Template Identifier <span>(lowercase letters, numbers, underscores)</span></label>
                  <input
                    className="campaign-control"
                    value={name}
                    onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="real_estate_bot"
                  />
                </div>
              </div>

              <div className="campaign-divider" />

              {/* Header & Local Image Upload Section */}
              <div className="campaign-form-grid">
                <div>
                  <label>
                    Bot Greeting / Header <span>(Optional — e.g. "Hello, I'm your ChatBot!")</span>
                  </label>
                  <input
                    className="campaign-control"
                    value={header}
                    onChange={e => setHeader(e.target.value)}
                    placeholder="e.g. Hello, I'm your ChatBot Real Estate Agent! 🏡👋"
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Image Banner <span>(Optional)</span></span>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11, cursor: 'pointer' }}
                      >
                        Remove Image
                      </button>
                    )}
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={handleFileSelected}
                  />

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="campaign-secondary-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                        padding: '8px 12px',
                        fontSize: 12.5,
                      }}
                    >
                      {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploadingImage ? 'Uploading...' : '📁 Upload from PC'}
                    </button>
                    <input
                      className="campaign-control"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="or enter image URL..."
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview Thumbnail if uploaded */}
              {imageUrl.trim() && (
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <img
                    src={imageUrl.trim()}
                    alt="Uploaded Banner Preview"
                    style={{
                      maxHeight: 120,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'inline-block',
                    }}
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Question / Card Body */}
              <div style={{ marginTop: 12 }}>
                <label>
                  Card Question / Body Text * <span>— use {'{{1}}'}, {'{{2}}'} for variable placeholders</span>
                </label>
                <textarea
                  className="campaign-control"
                  rows={3}
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  placeholder="Choose what are you interested in:"
                />
              </div>

              {/* Interactive Options Builder */}
              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ListPlus size={14} color="#38bdf8" />
                  <span>Interactive Buttons / Options <span>(Shown as clickable list items in chat)</span></span>
                </label>

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <input
                    className="campaign-control"
                    value={newOptionInput}
                    onChange={e => setNewOptionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                    placeholder="e.g. Option title..."
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="campaign-secondary-btn"
                    style={{ flexShrink: 0, padding: '8px 14px' }}
                  >
                    + Add
                  </button>
                </div>

                {options.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {options.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(76, 110, 245, 0.15)',
                          border: '1px solid rgba(76, 110, 245, 0.3)',
                          borderRadius: 6,
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          color: '#e2e8f0',
                        }}
                      >
                        <span>{opt}</span>
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: 0,
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ marginTop: 12 }}>
                <label>
                  Footer <span>(Optional disclaimer or small text)</span>
                </label>
                <input
                  className="campaign-control"
                  value={footer}
                  onChange={e => setFooter(e.target.value)}
                  placeholder="e.g. Reply with option name or number · T&C apply"
                />
              </div>

              {/* Variables */}
              {placeholderCount > 0 && (
                <div style={{ marginTop: 12 }}>
                  <label>Name each placeholder</label>
                  <div className="campaign-filter-grid">
                    {Array.from({ length: placeholderCount }).map((_, i) => (
                      <input
                        key={i}
                        className="campaign-control"
                        placeholder={`{{${i + 1}}} e.g. name`}
                        value={varNames[i] || ''}
                        onChange={e => setVarNames(prev => {
                          const next = [...prev]
                          next[i] = e.target.value
                          return next
                        })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Live Mockup matching User's Uploaded UI */}
              <div style={{ marginTop: 16 }}>
                <label style={{ color: '#94a3b8' }}>Live Chatbot Simulator Preview</label>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 14,
                    padding: 16,
                    border: '1px solid #cbd5e1',
                    maxWidth: 360,
                    margin: '8px auto 0',
                    color: '#0f172a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Bot size={15} color="#334155" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Real Estate Bot</span>
                  </div>

                  {imageUrl.trim() && (
                    <img
                      src={imageUrl.trim()}
                      alt="Banner Preview"
                      style={{
                        width: '100%',
                        maxHeight: 140,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 10,
                        display: 'block',
                      }}
                      onError={e => { (e.target as HTMLElement).style.display = 'none' }}
                    />
                  )}

                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px 12px 12px 2px',
                      padding: '10px 14px',
                      fontSize: 13,
                      color: '#1e293b',
                      border: '1px solid #e2e8f0',
                      marginBottom: 12,
                    }}
                  >
                    {header || "Hello, I'm your ChatBot Real Estate Agent! 🏡👋"}
                  </div>

                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 12,
                      border: '1.5px solid #cbd5e1',
                      overflow: 'hidden',
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                      {bodyText || 'Choose what are you interested in:'}
                    </div>

                    {options.length > 0 && (
                      <div>
                        {options.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => setPreviewSelectedOption(opt)}
                            style={{
                              borderTop: '1px solid #e2e8f0',
                              padding: '10px 14px',
                              textAlign: 'center',
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#2563eb',
                              cursor: 'pointer',
                              background: (previewSelectedOption === opt || (!previewSelectedOption && i === 0)) ? '#eff6ff' : '#ffffff',
                            }}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {options.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: 10.5, color: '#64748b', marginBottom: 2 }}>User</div>
                      <div
                        style={{
                          background: '#facc15',
                          color: '#000000',
                          padding: '7px 14px',
                          borderRadius: 16,
                          fontSize: 12.5,
                          fontWeight: 700,
                        }}
                      >
                        {previewSelectedOption || options[0]}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div className="campaign-success" style={{ background: 'rgba(239,68,68,.12)', color: '#fca5a5', marginTop: 14 }}>
                  <AlertTriangle size={15} />{formError}
                </div>
              )}
            </div>

            <div className="campaign-modal-footer">
              <button className="campaign-secondary-btn" onClick={resetForm}>Cancel</button>
              <button className="campaign-primary-btn" onClick={handleCreate} disabled={saving || uploadingImage}>
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}