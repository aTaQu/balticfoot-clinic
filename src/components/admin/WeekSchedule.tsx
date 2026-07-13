'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ScheduleDay, ScheduleResult, ScheduledBooking } from '@/lib/schedule'

const DAY_NAMES_LT = ['Sek', 'Pir', 'Ant', 'Tre', 'Ket', 'Pen', 'Šeš']

// Rolling horizon: fetch a full month once, slice to 7 for the weekly view.
const MONTH_DAYS = 35
const WEEK_DAYS = 7

type View = 'week' | 'month'

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
  const [view, setView] = useState<View>('month')

  useEffect(() => {
    const controller = new AbortController()
    const from = todayISO()
    // Fetch the full month up front; the weekly view is just a slice of it, so
    // toggling never re-fetches.
    fetch(`/api/admin/schedule?from=${from}&days=${MONTH_DAYS}`, {
      credentials: 'include',
      signal: controller.signal,
    })
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

  const visibleDays = data
    ? view === 'week'
      ? data.days.slice(0, WEEK_DAYS)
      : data.days
    : []

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
          {view === 'month' ? 'Mėnesio grafikas' : 'Savaitės grafikas'}
        </h2>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-600)',
          flexWrap: 'wrap',
        }}
      >
        <LegendItem color="#2563eb" label="Darbo laikas" />
        <LegendItem color="var(--theme-success-500)" label="Patvirtinta" />
        <LegendItem color="#d97706" label="Laukiama" />
      </div>

      {error && <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>}

      {!data && !error && <p style={{ color: 'var(--theme-elevation-500)' }}>Kraunama…</p>}

      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.75rem',
            overflowX: 'auto',
          }}
        >
          {visibleDays.map((day) => (
            <DayColumn key={day.date} day={day} />
          ))}
        </div>
      )}
    </div>
  )
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const buttons: { value: View; label: string }[] = [
    { value: 'week', label: 'Savaitė' },
    { value: 'month', label: 'Mėnuo' },
  ]
  return (
    <div style={{ display: 'inline-flex', border: '1px solid var(--theme-elevation-150)', borderRadius: '4px', overflow: 'hidden' }}>
      {buttons.map((b) => {
        const active = view === b.value
        return (
          <button
            key={b.value}
            type="button"
            onClick={() => onChange(b.value)}
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              border: 'none',
              background: active ? 'var(--theme-elevation-150)' : 'transparent',
              color: active ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-600)',
            }}
          >
            {b.label}
          </button>
        )
      })}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

/** Amber for pending, green for confirmed — pending slots are already blocked. */
function bookingCardStyle(status: ScheduledBooking['status']): CSSProperties {
  if (status === 'pending') {
    return {
      background: 'var(--theme-warning-100, #fef3c7)',
      borderLeft: '3px solid #d97706',
    }
  }
  return {
    background: 'var(--theme-success-100, #d1fae5)',
    borderLeft: '3px solid var(--theme-success-500)',
  }
}

function DayColumn({ day }: { day: ScheduleDay }) {
  const isClosed = day.windows.length === 0
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
        {isClosed && day.bookings.length === 0 && (
          <span style={{ color: 'var(--theme-elevation-400)' }}>Uždaryta</span>
        )}

        {day.windows.map((w) => (
          <div
            key={`w-${w.id}`}
            style={{
              marginBottom: '0.4rem',
              padding: '0.3rem 0.4rem',
              background: 'var(--theme-elevation-50)',
              borderRadius: '3px',
              borderLeft: '3px solid #2563eb',
            }}
          >
            <div style={{ fontWeight: 600 }}>{w.startTime}–{w.endTime}</div>
            {w.note && <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>{w.note}</div>}
          </div>
        ))}

        {day.bookings.map((b) => (
          <div
            key={`b-${b.id}`}
            style={{
              marginBottom: '0.4rem',
              padding: '0.3rem 0.4rem',
              borderRadius: '3px',
              ...bookingCardStyle(b.status),
            }}
          >
            <div style={{ fontWeight: 600 }}>{b.timeSlot}{b.endTime ? `–${b.endTime}` : ''}</div>
            <div style={{ opacity: 0.85 }}>{b.patientName}</div>
            <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>{b.serviceName}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
