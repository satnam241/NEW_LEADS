import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { forgotPasswordRequest } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Email is required.'); return }
    setLoading(true)
    try {
      await forgotPasswordRequest(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', marginBottom: 12 }}>
          Forgot Password
        </h1>
        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 28 }}>
          Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '9px 12px', marginBottom: 16 }}>
            <AlertCircle size={13} style={{ color: '#ef4444' }} />
            <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {sent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 12px' }}>
            <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
            <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>
              Reset link sent! Check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', height: 38, border: '1px solid #d8d8d8', borderRadius: 6,
                  padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 42, background: loading ? '#555' : '#2e2f33', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#4a90d9', textDecoration: 'none' }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}