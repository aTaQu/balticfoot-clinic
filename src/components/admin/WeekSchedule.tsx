'use client'

import { useEffect, useState } from 'react'
import type { ScheduleDay, ScheduleResult } from '@/lib/schedule'

const DAY_NAMES_LT = ['Sek', 'Pir', 'Ant', 'Tre', 'Ket', 'Pen', 'Šeš']

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDayHeader(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  const weekday = DAY_NAMES_LT[d.getUTCDay()]
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${weekday} ${day}.${month}`
}

export function WeekScheduleAfterDashboard() {
  const [data, setData] = useState<ScheduleResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const from = todayISO()
    fetch(`/api/admin/schedule?from=${from}&days=7`, { credentials: 'include', signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ScheduleResult>
      })
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Klaida')
      })
    return () => controller.abort()
  }, [])

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
        Savaitės grafikas
      </h2>

      {error && (
        <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>
      )}

      {!data && !error && (
        <p style={{ color: 'var(--theme-elevation-500)' }}>Kraunama…</p>
      )}

      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.75rem',
            overflowX: 'auto',
          }}
        >
          {data.days.map((day) => (
            <DayColumn key={day.date} day={day} />
          ))}
        </div>
      )}
    </div>
  )
}

function DayColumn({ day }: { day: ScheduleDay }) {
  const hasItems = day.bookings.length > 0 || day.blocks.length > 0
  return (
    <div
      style={{
        minWidth: '120px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: 'var(--theme-elevation-100)',
          padding: '0.4rem 0.6rem',
          fontWeight: 600,
          fontSize: '0.8rem',
          borderBottom: '1px solid var(--theme-elevation-150)',
        }}
      >
        {formatDayHeader(day.date)}
      </div>

      <div style={{ padding: '0.5rem 0.6rem', fontSize: '0.75rem' }}>
        {!hasItems && (
          <span style={{ color: 'var(--theme-elevation-400)' }}>—</span>
        )}

        {day.bookings.map((b) => (
          <div
            key={`b-${b.id}`}
            style={{
              marginBottom: '0.4rem',
              padding: '0.3rem 0.4rem',
              background: 'var(--theme-success-100, #d1fae5)',
              borderRadius: '3px',
              borderLeft: '3px solid var(--theme-success-500)',
            }}
          >
            <div style={{ fontWeight: 600 }}>{b.timeSlot}{b.endTime ? `–${b.endTime}` : ''}</div>
            <div style={{ opacity: 0.85 }}>{b.patientName}</div>
            <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>{b.serviceName}</div>
          </div>
        ))}

        {day.blocks.map((block) => (
          <div
            key={`bl-${block.id}`}
            style={{
              marginBottom: '0.4rem',
              padding: '0.3rem 0.4rem',
              background: 'var(--theme-error-100, #fee2e2)',
              borderRadius: '3px',
              borderLeft: '3px solid var(--theme-error-500)',
            }}
          >
            <div style={{ fontWeight: 600 }}>{block.startTime}–{block.endTime}</div>
            {block.reason && (
              <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>{block.reason}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
