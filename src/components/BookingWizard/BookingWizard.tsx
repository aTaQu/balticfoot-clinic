'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { formatDate, LT_MONTHS } from '@/lib/constants'
import { formatDuration } from '@/lib/format'
import type { Service } from '../../../payload-types'
import styles from './BookingWizard.module.css'

const DAY_NAMES = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
] as const

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  smiley: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  heart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  coffee: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  activity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
}

interface BookingState {
  service: Service | null
  date: Date | null
  time: string | null
  name: string
  phone: string
  email: string
  notes: string
  smsOptIn: boolean
  gdprConsent: boolean
}

const INITIAL_STATE: BookingState = {
  service: null,
  date: null,
  time: null,
  name: '',
  phone: '',
  email: '',
  notes: '',
  smsOptIn: false,
  gdprConsent: false,
}

const STEP_LABELS = ['Paslauga', 'Data ir laikas', 'Jūsų duomenys', 'Patvirtinimas']

type CalDay =
  | { type: 'empty'; key: string }
  | { type: 'day'; key: string; d: number; date: Date; disabled: boolean; isToday: boolean; isSelected: boolean }

function getTodayDate(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface BookingWizardProps {
  services: Service[]
  preselectedSlug?: string | null
  openDays?: string[]
}

export default function BookingWizard({ services, preselectedSlug, openDays = [] }: BookingWizardProps) {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<BookingState>(INITIAL_STATE)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [gdprError, setGdprError] = useState(false)
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const todayDate = useRef<Date>(getTodayDate()).current
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const wizardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (preselectedSlug) {
      const svc = services.find((s) => s.slug === preselectedSlug)
      if (svc) setState((prev) => ({ ...prev, service: svc }))
    }
  }, [preselectedSlug, services])

  useEffect(() => {
    if (!state.date || !state.service) {
      setSlots([])
      return
    }
    const dateStr = toISODate(state.date)
    const slug = state.service.slug
    setSlotsLoading(true)
    setState((prev) => ({ ...prev, time: null }))
    fetch(`/api/availability?date=${dateStr}&service=${slug}`)
      .then((r) => r.json())
      .then((data: { slots?: { time: string; available: boolean }[] }) => {
        setSlots(data.slots ?? [])
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [state.date, state.service])

  const isOpenDay = useCallback(
    (date: Date) => openDays.includes(DAY_NAMES[date.getDay()]),
    [openDays],
  )

  const shake = useCallback(() => {
    const el = wizardRef.current
    if (!el) return
    el.style.animation = 'none'
    void el.offsetHeight
    el.style.animation = 'shake 0.4s ease'
    setTimeout(() => { if (el) el.style.animation = '' }, 450)
  }, [])

  const validate = useCallback(() => {
    if (step === 1 && !state.service) { shake(); return false }
    if (step === 2 && (!state.date || !state.time)) { shake(); return false }
    if (step === 3) {
      const newErrors = new Set<string>()
      if (!state.name.trim()) newErrors.add('name')
      if (!state.phone.trim()) newErrors.add('phone')
      if (!state.email.trim()) newErrors.add('email')
      if (newErrors.size > 0) {
        setErrors(newErrors)
        setTimeout(() => setErrors(new Set()), 2500)
        return false
      }
    }
    return true
  }, [step, state, shake])

  const handleNext = () => {
    if (!validate()) return
    if (step === 4) {
      if (!state.gdprConsent) {
        setGdprError(true)
        setTimeout(() => setGdprError(false), 2200)
        return
      }
      void handleSubmit()
      return
    }
    setStep((s) => s + 1)
    wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const handleBack = () => {
    if (step <= 1) return
    setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    if (!state.service || !state.date || !state.time) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: state.service.slug,
          date: toISODate(state.date),
          timeSlot: state.time,
          patientName: state.name,
          patientPhone: state.phone,
          patientEmail: state.email,
          patientNotes: state.notes,
          smsOptIn: state.smsOptIn,
          gdprConsent: state.gdprConsent,
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setSubmitError(err.error ?? 'Įvyko klaida. Bandykite dar kartą.')
        return
      }
      setSubmitted(true)
    } catch {
      setSubmitError('Įvyko klaida. Bandykite dar kartą.')
    } finally {
      setSubmitting(false)
    }
  }

  const isPrevDisabled = calYear === todayDate.getFullYear() && calMonth === todayDate.getMonth()
  const prevMonth = () => {
    if (isPrevDisabled) return
    setCalMonth((m) => { if (m === 0) { setCalYear((y) => y - 1); return 11 } return m - 1 })
  }
  const nextMonth = () => {
    setCalMonth((m) => { if (m === 11) { setCalYear((y) => y + 1); return 0 } return m + 1 })
  }
  const pickDate = (date: Date) => setState((s) => ({ ...s, date }))
  const pickTime = (slot: string) => setState((s) => ({ ...s, time: slot }))

  const firstDow = new Date(calYear, calMonth, 1).getDay()
  const offset = (firstDow + 6) % 7
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()

  const calDays: CalDay[] = Array.from({ length: offset }, (_, i) => ({ type: 'empty' as const, key: `e-${i}` }))
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d)
    date.setHours(0, 0, 0, 0)
    const isPast = date <= todayDate
    const isToday = date.getTime() === todayDate.getTime()
    const isSelected =
      state.date?.getFullYear() === calYear &&
      state.date?.getMonth() === calMonth &&
      state.date?.getDate() === d
    calDays.push({
      type: 'day' as const,
      key: `d-${d}`,
      d,
      date,
      disabled: isPast || !isOpenDay(date),
      isToday,
      isSelected,
    })
  }

  return (
    <section className={styles.booking} id="registracija" aria-labelledby="booking-heading">
      <div className="container">
        <div className={`${styles.bookingHeader} reveal`}>
          <div className={styles.bookingLabel}>Rezervacija</div>
          <h2 id="booking-heading">Rezervuokite savo vizitą</h2>
          <p>Paprastas 4 žingsnių procesas — pasirinkite paslaugą, datą ir laiką, įveskite duomenis ir patvirtinkite.</p>
        </div>

        <div className={`${styles.wizard} reveal reveal-delay-1`} ref={wizardRef} id="booking-wizard">
          {!submitted && (
            <div className={styles.wizardProgress} aria-label="Rezervacijos eiga">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1
                const isActive = n === step
                const isDone = n < step
                return (
                  <div
                    key={label}
                    className={`${styles.wizardStepIndicator} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
                    data-step={n}
                  >
                    <div className={styles.wizardStepNum}>
                      {isDone ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : n}
                    </div>
                    <div className={styles.wizardStepLabel}>{label}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div className={styles.wizardBody}>
            {submitted ? (
              <div className={styles.wizardSuccess} aria-live="polite" aria-atomic="true">
                <div className={styles.wizardSuccessIcon} aria-hidden="true">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Vizitas rezervuotas!</h3>
                <p>Gavome jūsų užklausą. Susisieksime per 24 val. ir patvirtinsime vizito laiką.</p>
                <div className={styles.wizardSuccessDetail}>
                  <strong>{state.service?.name}</strong><br />
                  {state.date && formatDate(state.date)}, {state.time}<br />
                  {state.name} · {state.phone}
                  {state.smsOptIn && <><br /><small style={{ color: 'var(--sage)' }}>SMS priminimas įjungtas</small></>}
                </div>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className={styles.wizardPanel} role="group" aria-labelledby="step1-title">
                    <div className={styles.wizardPanelTitle} id="step1-title">Pasirinkite paslaugą</div>
                    <div className={styles.wizardPanelSub}>Kurią procedūrą norėtumėte rezervuoti?</div>
                    <div className={styles.svcGrid} role="radiogroup" aria-label="Paslaugų pasirinkimas">
                      {services.map((svc) => {
                        const isSelected = state.service?.id === svc.id
                        return (
                          <div
                            key={svc.id}
                            className={`${styles.svcOption} ${isSelected ? styles.selected : ''}`}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={() => {
                              setState((s) => ({ ...s, service: svc }))
                              setStep(2)
                              wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setState((s) => ({ ...s, service: svc }))
                                setStep(2)
                                wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                              }
                            }}
                          >
                            <div className={styles.svcOptionHeader}>
                              <div className={styles.svcOptionIcon} aria-hidden="true">
                                {SERVICE_ICONS[svc.icon ?? 'shield']}
                              </div>
                              <div className={styles.svcOptionName}>{svc.name}</div>
                            </div>
                            <div className={styles.svcOptionMeta}>
                              <span>{formatDuration(svc.duration)}</span>
                              <span>{svc.price} €</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={styles.wizardPanel} role="group" aria-labelledby="step2-title">
                    <div className={styles.wizardPanelTitle} id="step2-title">Pasirinkite datą ir laiką</div>
                    <div className={styles.wizardPanelSub}>Laisvi laikai rodomi pasirinkus datą.</div>
                    <div className={styles.dtGrid}>
                      <div>
                        <div className={styles.cal} aria-label="Datų kalendorius">
                          <div className={styles.calNav}>
                            <button className={styles.calNavBtn} onClick={prevMonth} disabled={isPrevDisabled} aria-label="Ankstesnis mėnuo">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                            <span className={styles.calMonth}>{LT_MONTHS[calMonth]} {calYear}</span>
                            <button className={styles.calNavBtn} onClick={nextMonth} aria-label="Kitas mėnuo">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                          </div>
                          <div className={styles.calWeekdays}>
                            {['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Šš', 'Sk'].map((d) => (
                              <div key={d} className={styles.calWeekday}>{d}</div>
                            ))}
                          </div>
                          <div className={styles.calDays}>
                            {calDays.map((cell) => {
                              if (cell.type === 'empty') return <div key={cell.key} className={`${styles.calDay} ${styles.empty}`} />
                              const cls = [
                                styles.calDay,
                                cell.disabled ? styles.disabled : '',
                                cell.isToday ? styles.today : '',
                                cell.isSelected ? styles.selected : '',
                              ].filter(Boolean).join(' ')
                              return (
                                <div
                                  key={cell.key}
                                  className={cls}
                                  onClick={() => !cell.disabled && pickDate(cell.date)}
                                  onKeyDown={(e) => {
                                    if (!cell.disabled && (e.key === 'Enter' || e.key === ' ')) {
                                      e.preventDefault()
                                      pickDate(cell.date)
                                    }
                                  }}
                                  tabIndex={cell.disabled ? undefined : 0}
                                  role={cell.disabled ? undefined : 'button'}
                                  aria-label={cell.disabled ? undefined : `${cell.d} ${LT_MONTHS[calMonth]}`}
                                >
                                  {cell.d}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      <div className={styles.timeSection}>
                        <div className={styles.timeSectionLabel}>Laisvi laikai</div>
                        {!state.date ? (
                          <p className={styles.timePlaceholder}>Pirmiausia pasirinkite datą.</p>
                        ) : slotsLoading ? (
                          <p className={styles.timePlaceholder}>Kraunama...</p>
                        ) : slots.length === 0 ? (
                          <p className={styles.timePlaceholder}>Šią dieną laisvų laikų nėra.</p>
                        ) : (
                          <div className={styles.timeGrid} role="radiogroup" aria-label="Laiko pasirinkimas">
                            {slots.map((slot) => {
                              const unavail = !slot.available
                              const isSelected = state.time === slot.time
                              return (
                                <div
                                  key={slot.time}
                                  className={`${styles.timeSlot} ${unavail ? styles.unavailable : ''} ${isSelected ? styles.timeSelected : ''}`}
                                  role="radio"
                                  aria-checked={isSelected}
                                  aria-disabled={unavail}
                                  aria-label={unavail ? `${slot.time} — užimta` : slot.time}
                                  tabIndex={unavail ? undefined : 0}
                                  onClick={() => !unavail && pickTime(slot.time)}
                                  onKeyDown={(e) => {
                                    if (!unavail && (e.key === 'Enter' || e.key === ' ')) {
                                      e.preventDefault()
                                      pickTime(slot.time)
                                    }
                                  }}
                                >
                                  {slot.time}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className={styles.wizardPanel} role="group" aria-labelledby="step3-title">
                    <div className={styles.wizardPanelTitle} id="step3-title">Jūsų kontaktiniai duomenys</div>
                    <div className={styles.wizardPanelSub}>Reikalinga informacija vizitui patvirtinti. Duomenys naudojami tik rezervacijos tikslais.</div>
                    <div className={styles.wizFormRow}>
                      <div className={styles.wizFormGroup}>
                        <label htmlFor="wiz-name">Vardas ir pavardė *</label>
                        <input type="text" id="wiz-name" placeholder="Jūsų vardas" autoComplete="name" value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} className={errors.has('name') ? styles.inputError : ''} />
                      </div>
                      <div className={styles.wizFormGroup}>
                        <label htmlFor="wiz-phone">Telefono numeris *</label>
                        <input type="tel" id="wiz-phone" placeholder="+370 ..." autoComplete="tel" value={state.phone} onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))} className={errors.has('phone') ? styles.inputError : ''} />
                      </div>
                    </div>
                    <div className={styles.wizFormGroup}>
                      <label htmlFor="wiz-email">El. pašto adresas *</label>
                      <input type="email" id="wiz-email" placeholder="jusu@pastas.lt" autoComplete="email" value={state.email} onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))} className={errors.has('email') ? styles.inputError : ''} />
                    </div>
                    <div className={styles.wizFormGroup}>
                      <label htmlFor="wiz-notes">Pastabos <span className={styles.optional}>(neprivaloma)</span></label>
                      <textarea id="wiz-notes" placeholder="Aprašykite savo situaciją arba užduokite klausimą specialistei..." value={state.notes} onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))} />
                    </div>
                    <div
                      className={`${styles.smsToggle} ${state.smsOptIn ? styles.on : ''}`}
                      role="switch"
                      aria-checked={state.smsOptIn}
                      tabIndex={0}
                      aria-label="SMS priminimas"
                      onClick={() => setState((s) => ({ ...s, smsOptIn: !s.smsOptIn }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setState((s) => ({ ...s, smsOptIn: !s.smsOptIn }))
                        }
                      }}
                    >
                      <div className={styles.smsToggleSwitch} aria-hidden="true" />
                      <div className={styles.smsToggleText}>
                        <strong>SMS priminimas</strong>
                        <span>Gausite pranešimą dieną prieš vizitą</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className={styles.wizardPanel} role="group" aria-labelledby="step4-title">
                    <div className={styles.wizardPanelTitle} id="step4-title">Patvirtinkite rezervaciją</div>
                    <div className={styles.wizardPanelSub}>Patikrinkite informaciją ir patvirtinkite vizitą.</div>
                    <div className={styles.confirmSummary}>
                      <div className={styles.confirmSummaryHeader}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <div>
                          <h4>Vizito informacija</h4>
                          <p>Baltic Foot — Podologijos kabinetai</p>
                        </div>
                      </div>
                      <div className={styles.confirmRows}>
                        {([
                          ['Paslauga', state.service?.name],
                          ['Data', state.date ? formatDate(state.date) : '—'],
                          ['Laikas', state.time],
                          ['Vardas', state.name],
                          ['Telefonas', state.phone],
                          ['El. paštas', state.email],
                          ...(state.notes ? [['Pastabos', state.notes]] : []),
                          ['SMS', state.smsOptIn ? '✓ Įjungtas' : 'Išjungtas'],
                        ] as [string, string | undefined][]).map(([label, value]) => (
                          <div key={label} className={styles.confirmRow}>
                            <span className={styles.confirmRowLabel}>{label}</span>
                            <span className={styles.confirmRowValue}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.bdarNotice}>
                      <strong>Duomenų apsaugos informacija (BDAR / GDPR)</strong>
                      {' '}Jūsų pateikti asmens duomenys (vardas, telefono numeris, el. paštas) bus tvarkomi tik vizito
                      rezervacijos tikslais. Duomenys saugomi ne ilgiau kaip vienus metus ir neperduodami trečiosioms
                      šalims. Turite teisę bet kada susipažinti su savo duomenimis, juos ištaisyti arba ištrinti.
                    </div>
                    <label
                      className={`${styles.bdarCheck} ${gdprError ? styles.bdarCheckError : ''}`}
                      htmlFor="bdar-consent"
                    >
                      <input
                        type="checkbox"
                        id="bdar-consent"
                        checked={state.gdprConsent}
                        onChange={(e) => setState((s) => ({ ...s, gdprConsent: e.target.checked }))}
                        aria-required="true"
                      />
                      <span>
                        Sutinku su <strong>asmens duomenų tvarkymo sąlygomis</strong> ir suprantu, kad mano duomenys
                        bus naudojami vizito rezervacijai.
                      </span>
                    </label>
                    {submitError && (
                      <p role="alert" style={{ color: 'var(--terra)', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                        {submitError}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!submitted && (
            <div className={styles.wizardFooter}>
              <button
                className={styles.wizBackBtn}
                onClick={handleBack}
                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                aria-label="Grįžti atgal"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Atgal
              </button>
              <div className={styles.wizardFooterRight}>
                <span className={styles.wizStepCounter}>{step} / 4</span>
                <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                  {submitting ? 'Siunčiama...' : step === 4 ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Siųsti rezervaciją
                    </>
                  ) : (
                    <>
                      Tęsti
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
