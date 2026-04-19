// src/pages/LoginPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { adminLogin } from '@/lib/api'

export default function LoginPage() {
  const nav = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Email aur password dono required hain')
      return
    }
    setLoading(true)
    try {
      await adminLogin({ email: form.email, password: form.password })
      nav('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff4ff 0%, #f5f3ff 50%, #fdf2f8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(76,110,245,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        border: '1px solid #e8edf3',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg,#4c6ef5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(76,110,245,0.35)',
          }}>
            <Zap size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            LeadFlow CRM
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Admin panel mein login karein</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
          }}>
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-base"
              placeholder="admin@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              style={{ height: 42, fontSize: 14 }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-base"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                style={{ height: 42, fontSize: 14, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ height: 44, fontSize: 14, marginTop: 4, justifyContent: 'center' }}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Logging in…</>
              : 'Login'}
          </button>
        </form>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24 }}>
         {' '}
          <a href="/signup" style={{ color: '#4c6ef5', fontWeight: 600, textDecoration: 'none' }}>
            
          </a>
        </p>
      </div>
    </div>
  )
}