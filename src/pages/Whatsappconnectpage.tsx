import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, QrCode, AlertTriangle, RefreshCw } from 'lucide-react'
import { fetchBaileysStatus, resetBaileysSession, type BaileysStatus } from '../lib/api'

export default function WhatsAppConnectPage() {
  const [status, setStatus] = useState<BaileysStatus | null>(null)
  const [error, setError] = useState('')
  const [resetting, setResetting] = useState(false)

  async function checkStatus() {
    try {
      const s = await fetchBaileysStatus()
      setStatus(s)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check connection status')
    }
  }

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const s = await fetchBaileysStatus()
        if (!cancelled) {
          setStatus(s)
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to check connection status')
      }
    }

    poll()
    const interval = setInterval(poll, 3000) // QR codes expire every ~20-60s, so poll often
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  async function handleReset() {
    if (!confirm('Generate a fresh WhatsApp QR code?')) return
    setResetting(true)
    try {
      await resetBaileysSession()
      await checkStatus()
    } catch (err: any) {
      setError(err.message || 'Failed to reset WhatsApp session')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="campaign-page">
      <div className="campaign-page-header">
        <div>
          <h1>WhatsApp Connection</h1>
          <p>Link your business number once — it stays connected until you log out or the session expires</p>
        </div>
      </div>

      {error && (
        <div className="campaign-success" style={{ background: 'rgba(239,68,68,.12)', color: '#fca5a5' }}>
          <AlertTriangle size={15} />{error}
        </div>
      )}

      {/* Perfectly Centered QR Card */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '20px 0' }}>
        <section
          className="campaign-table-card"
          style={{
            padding: '36px 28px',
            textAlign: 'center',
            maxWidth: 480,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          {!status && (
            <div className="campaign-empty" style={{ margin: '30px auto' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: 12 }}>Checking WhatsApp connection...</div>
            </div>
          )}

          {status?.status === 'open' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <CheckCircle2 size={36} color="#4ade80" />
              </div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
                WhatsApp Connected
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13.5, maxWidth: 340, lineHeight: 1.5, margin: '0 0 24px' }}>
                Your business WhatsApp number is connected and ready to broadcast campaigns & bot messages.
              </p>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="campaign-secondary-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
              >
                <RefreshCw size={13} style={{ animation: resetting ? 'spin 1s linear infinite' : 'none' }} />
                {resetting ? 'Resetting...' : 'Disconnect / Scan New Number'}
              </button>
            </div>
          )}

          {status?.status === 'connecting' && status.qr && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                background: 'rgba(76, 110, 245, 0.12)',
                color: '#93c5fd',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12
              }}>
                <QrCode size={14} /> Scan with WhatsApp
              </div>
              
              <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>
                Scan this QR code
              </h2>

              {/* White background frame for QR to maximize phone scan accuracy */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 16px',
                background: '#ffffff',
                padding: 12,
                borderRadius: 16,
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                width: 260,
                height: 260,
              }}>
                <img
                  src={status.qr}
                  alt="WhatsApp QR code"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    borderRadius: 8
                  }}
                />
              </div>

              <p style={{
                color: '#94a3b8',
                fontSize: 12.5,
                lineHeight: 1.5,
                maxWidth: 340,
                margin: '0 auto 16px'
              }}>
                Open <strong>WhatsApp</strong> on your business phone → <strong>Settings</strong> → <strong>Linked Devices</strong> → <strong>Link a Device</strong>, then point your camera at this code.
              </p>

              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="campaign-secondary-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                <RefreshCw size={13} style={{ animation: resetting ? 'spin 1s linear infinite' : 'none' }} />
                {resetting ? 'Generating...' : 'Refresh QR Code'}
              </button>
            </div>
          )}

          {status?.status === 'connecting' && !status.qr && (
            <div className="campaign-empty" style={{ margin: '30px auto' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: 12, color: '#94a3b8' }}>Generating fresh QR code...</div>
            </div>
          )}

          {status?.status === 'close' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <AlertTriangle size={32} color="#f87171" />
              </div>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                Disconnected
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 320, lineHeight: 1.5, margin: '0 0 20px' }}>
                The WhatsApp session was logged out or disconnected. Click below to generate a new QR code.
              </p>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="campaign-primary-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={14} style={{ animation: resetting ? 'spin 1s linear infinite' : 'none' }} />
                {resetting ? 'Generating QR...' : 'Generate New QR Code'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}