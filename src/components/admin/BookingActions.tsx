'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export function BookingActionsAfterFields() {
  const { id, data } = useDocumentInfo()
  const router = useRouter()
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = typeof data?.status === 'string' ? data.status : undefined

  if (!id || !status) return null
  // Only show on pending or confirmed bookings
  if (status !== 'pending' && status !== 'confirmed') return null

  async function callAction(action: 'confirm' | 'reject' | 'cancel') {
    setLoading(true)
    setError(null)
    try {
      const body = action === 'reject' ? JSON.stringify({ rejectionReason }) : undefined
      const res = await fetch(`/api/admin/bookings/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Klaida')
      } else {
        router.refresh()
      }
    } catch {
      setError('Serverio klaida')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem 0', borderTop: '1px solid var(--theme-elevation-150)', marginTop: '1rem' }}>
      <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Veiksmai</h4>

      {error && (
        <p style={{ color: 'var(--theme-error-500)', marginBottom: '1rem' }}>{error}</p>
      )}

      {status === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => callAction('confirm')}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--theme-success-500)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
              alignSelf: 'flex-start',
            }}
          >
            {loading ? 'Apdorojama…' : 'Patvirtinti'}
          </button>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Atmetimo priežastis
            </label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nurodykite priežastį…"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.4rem 0.75rem',
                border: '1px solid var(--theme-elevation-300)',
                borderRadius: '4px',
                marginBottom: '0.5rem',
              }}
            />
            <button
              type="button"
              disabled={loading || !rejectionReason.trim()}
              onClick={() => callAction('reject')}
              style={{
                display: 'block',
                padding: '0.5rem 1.25rem',
                background: 'var(--theme-error-500)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 500,
                opacity: rejectionReason.trim() ? 1 : 0.5,
              }}
            >
              {loading ? 'Apdorojama…' : 'Atmesti'}
            </button>
          </div>
        </div>
      )}

      {status === 'confirmed' && (
        <button
          type="button"
          disabled={loading}
          onClick={() => callAction('cancel')}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'var(--theme-elevation-400)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {loading ? 'Apdorojama…' : 'Atšaukti vizitą'}
        </button>
      )}
    </div>
  )
}
