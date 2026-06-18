// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { adminLogin } from '@/lib/api'
import '../styles/globals.css'

// ─────────────────────────────────────────────────────────────────
// Responsive helper — breakpoints for mobile / tablet / desktop(mac)
// (mobile <640px, tablet 640–1023px, desktop/mac ≥1024px)
// ✅ Same lightweight pattern used across the dashboard/leads pages.
// ─────────────────────────────────────────────────────────────────
function useViewport() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return {
    width,
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
  }
}

export default function LoginPage() {
  const nav = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // ✅ Responsive flag — the split-screen brand panel (heading +
  //    illustration) has no room on a phone, so it's hidden below
  //    640px and the form simply takes the full screen. Tablet and
  //    desktop/mac keep the original 50/50 split exactly as-is.
  const { isMobile } = useViewport()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Email and password are required.'); return }
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
      display: 'flex',
      fontFamily: "'Nunito Sans', sans-serif",
    }}>

        {/* ── LEFT DARK PANEL ── */}
        {/* ✅ Hidden on mobile (<640px) — at that width a 50/50 split
            leaves no usable room for either the heading or the form.
            Unchanged on tablet/desktop. */}
        {!isMobile && (
<div style={{
  flex: '0 0 50%',
  background: '#3a3b3f',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '44px 36px 36px 36px',
}}>
  {/* Heading */}
  <h2 style={{
    fontSize: '40px',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.4,
    margin: '0 0 60px -15%',
    letterSpacing: '-0.2px',
    
  }}>
    Your place to work<br />
    Plan. Create. Control.
  </h2>

  {/* Illustration */}
  <img
    src="/pic1.png"
    alt="Kanban board illustration"
    style={{
      width: '70%',
      borderRadius: 10,
      objectFit: 'contain',
    }}
  />
</div>
        )}
        {/* ── RIGHT WHITE PANEL ── */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '32px 20px' : '44px 40px',
        }}>
          <div style={{ width: '100%', maxWidth: 320 ,}}>

            {/* Title */}
            <h1 style={{
              fontSize: 30,
              fontWeight: 600,
              color: '#1a1a1a',
              textAlign: 'center',
              margin: '0 0 48px 0',
              letterSpacing: '-0.1px',
            }}>
              Sign In to  CRM
            </h1>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 6, padding: '9px 12px', marginBottom: 18,
              }}>
                <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 15,
                  fontWeight: 400,
                  color: '#555555',
                  marginBottom: 6,
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder=""
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 15,
                  fontWeight: 400,
                  color: '#555555',
                  marginBottom: 6,
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder=""
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: 11, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#aaaaaa', display: 'flex', alignItems: 'center', padding: 0,
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot Password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: '#555555', cursor: 'pointer',
                  fontWeight: 400,
                }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    style={{
                      width: 14, height: 14,
                      accentColor: '#3a3b3f',
                      cursor: 'pointer',
                    }}
                  />
                  Remember me
                </label>
                <a
                  href="/forgot-password"
                  style={{
                    fontSize: 12,
                    color: '#555555',
                    textDecoration: 'none',
                    fontWeight: 400,
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 44,
                  background: loading ? '#555' : '#2e2f33',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 32,
                  letterSpacing: '0.1px',
                }}
              >
                {loading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Logging in…</>
                  : <><span>Sign In</span><ArrowRight size={15} /></>
                }
              </button>
            </form>

            {/* Footer */}
            <p style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#888888',
              marginTop: 22,
              marginBottom: 0,
            }}>
              Don't have an account?{' '}
              <a
                href="/signup"
                style={{
                  color: '#4a90d9',
                  fontWeight: 400,
                  textDecoration: 'none',
                }}
              >
                Sign Up
              </a>
            </p>

          </div>
        </div>
    </div>
  )
}

/* ── Input base style — matches image exactly ── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 38,
  border: '1px solid #d8d8d8',
  borderRadius: 6,
  padding: '0 12px',
  fontSize: 13,
  color: '#333333',
  background: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Zap, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
// import { adminLogin } from '@/lib/api'

// export default function LoginPage() {
//   const nav = useNavigate()
//   const [form, setForm]       = useState({ email: '', password: '' })
//   const [showPass, setShowPass] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError]     = useState('')

//   const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
//     setForm(f => ({ ...f, [k]: e.target.value }))

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     if (!form.email || !form.password) {
//       setError('Email and password required ')
//       return
//     }
//     setLoading(true)
//     try {
//       await adminLogin({ email: form.email, password: form.password })
//       nav('/dashboard', { replace: true })
//     } catch (err: any) {
//       setError(err.message || 'Login failed. Please check credentials.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #eff4ff 0%, #f5f3ff 50%, #fdf2f8 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '24px 16px',
//     }}>
//       {/* Card */}
//       <div style={{
//         background: '#fff',
//         borderRadius: 20,
//         boxShadow: '0 20px 60px rgba(76,110,245,0.12), 0 4px 16px rgba(0,0,0,0.06)',
//         padding: '40px 36px',
//         width: '100%',
//         maxWidth: 420,
//         border: '1px solid #e8edf3',
//       }}>
//         {/* Logo */}
//         <div style={{ textAlign: 'center', marginBottom: 32 }}>
//           <div style={{
//             width: 52, height: 52, borderRadius: 14,
//             background: 'linear-gradient(135deg,#4c6ef5,#7c3aed)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             margin: '0 auto 14px',
//             boxShadow: '0 8px 24px rgba(76,110,245,0.35)',
//           }}>
//             <Zap size={24} color="#fff" />
//           </div>
//           <h1 style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
//             LeadFlow CRM
//           </h1>
//           <p style={{ fontSize: 13, color: '#94a3b8' }}></p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div style={{
//             display: 'flex', alignItems: 'center', gap: 8,
//             background: '#fef2f2', border: '1px solid #fecaca',
//             borderRadius: 10, padding: '10px 14px', marginBottom: 20,
//           }}>
//             <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
//             <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           {/* Email */}
//           <div>
//             <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
//               Email Address
//             </label>
//             <input
//               type="email"
//               className="input-base"
              
//               value={form.email}
//               onChange={set('email')}
//               autoComplete="email"
//               style={{ height: 42, fontSize: 14 }}
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
//               Password
//             </label>
//             <div style={{ position: 'relative' }}>
//               <input
//                 type={showPass ? 'text' : 'password'}
//                 className="input-base"
                
//                 value={form.password}
//                 onChange={set('password')}
//                 autoComplete="current-password"
//                 style={{ height: 42, fontSize: 14, paddingRight: 42 }}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass(s => !s)}
//                 style={{
//                   position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
//                   background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
//                   display: 'flex', alignItems: 'center',
//                 }}
//               >
//                 {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
//               </button>
//             </div>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="btn-primary"
//             style={{ height: 44, fontSize: 14, marginTop: 4, justifyContent: 'center' }}
//           >
//             {loading
//               ? <><Loader2 size={16} className="animate-spin" /> Logging in…</>
//               : 'Login'}
//           </button>
//         </form>

//         {/* Footer hint */}
//         <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24 }}>
//          {' '}
//           <a href="/signup" style={{ color: '#4c6ef5', fontWeight: 600, textDecoration: 'none' }}>
            
//           </a>
//         </p>
//       </div>
//     </div>
//   )
// }