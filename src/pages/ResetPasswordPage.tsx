import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { resetPasswordWithToken } from '@/lib/api'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate   = useNavigate()

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!token) { setError('Invalid reset link.'); return }

    setLoading(true)
    try {
      await resetPasswordWithToken(token, password)
      navigate('/login', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', marginBottom: 28 }}>
          Reset Password
        </h1>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '9px 12px', marginBottom: 16 }}>
            <AlertCircle size={13} style={{ color: '#ef4444' }} />
            <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', height: 38, border: '1px solid #d8d8d8', borderRadius: 6, padding: '0 40px 0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}>Confirm Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{ width: '100%', height: 38, border: '1px solid #d8d8d8', borderRadius: 6, padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 42, background: loading ? '#555' : '#2e2f33', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Resetting…</> : 'Reset Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#4a90d9', textDecoration: 'none' }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
