'use client';

import { useState } from 'react';
import styles from './Contact.module.css';

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
}

const INITIAL: FormState = { name: '', phone: '', email: '', message: '' };

interface ContactProps {
  phone: string
  email: string
  address: string
  hoursDisplay: string
}

export default function Contact({ phone, email, address, hoursDisplay }: ContactProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = new Set<string>();
    if (!form.name.trim()) newErrors.add('name');
    if (!form.message.trim()) newErrors.add('message');
    if (!form.phone.trim() && !form.email.trim()) {
      newErrors.add('phone');
      newErrors.add('email');
    }
    if (newErrors.size > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors(new Set()), 2500);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setApiError(data.error ?? 'Klaida siunčiant žinutę. Bandykite dar kartą.');
      }
    } catch {
      setApiError('Klaida siunčiant žinutę. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.contact} id="susisiekite" aria-labelledby="contact-heading">
      <div className="container">
        <div className={styles.contactGrid}>

          <div className={`${styles.contactInfo} reveal`}>
            <div className="section-label">Susisiekite</div>
            <h2 id="contact-heading">Turite klausimų?</h2>
            <p className={styles.contactIntro}>
              Parašykite mums — atsakysime kuo greičiau. Taip pat galite
              skambinti arba registruotis vizitui tiesiogiai.
            </p>

            <div className={styles.contactDetails}>
              <a href={`tel:${phone}`} className={styles.contactDetailItem}>
                <div className={styles.contactDetailIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.contactDetailLabel}>Telefonas</div>
                  <div className={styles.contactDetailValue}>{phone}</div>
                </div>
              </a>

              <a href={`mailto:${email}`} className={styles.contactDetailItem}>
                <div className={styles.contactDetailIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className={styles.contactDetailLabel}>El. paštas</div>
                  <div className={styles.contactDetailValue}>{email}</div>
                </div>
              </a>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactDetailIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className={styles.contactDetailLabel}>Adresas</div>
                  <div className={styles.contactDetailValue}>{address}</div>
                </div>
              </div>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactDetailIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div className={styles.contactDetailLabel}>Darbo laikas</div>
                  <div className={styles.contactDetailValue} style={{ whiteSpace: 'pre-line' }}>{hoursDisplay}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.contactFormWrap} reveal reveal-delay-2`}>
            {submitted ? (
              <div className={styles.contactSuccess} aria-live="polite">
                <div className={styles.contactSuccessIcon} aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Žinutė išsiųsta!</h3>
                <p>Susisieksime su jumis artimiausiu metu. Ačiū!</p>
              </div>
            ) : (
              <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
                <div className={styles.contactFormRow}>
                  <div className={styles.contactFormGroup}>
                    <label htmlFor="c-name">Vardas *</label>
                    <input
                      id="c-name"
                      type="text"
                      placeholder="Jūsų vardas"
                      autoComplete="name"
                      value={form.name}
                      onChange={set('name')}
                      className={errors.has('name') ? styles.inputError : ''}
                    />
                  </div>
                  <div className={styles.contactFormGroup}>
                    <label htmlFor="c-phone">Telefonas</label>
                    <input
                      id="c-phone"
                      type="tel"
                      placeholder="+370 ..."
                      autoComplete="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      className={errors.has('phone') ? styles.inputError : ''}
                    />
                  </div>
                </div>
                <p className={styles.contactFieldHint}>(bent vienas privalomas: telefonas arba el. paštas)</p>

                <div className={styles.contactFormGroup}>
                  <label htmlFor="c-email">El. paštas</label>
                  <input
                    id="c-email"
                    type="email"
                    placeholder="jusu@pastas.lt"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    className={errors.has('email') ? styles.inputError : ''}
                  />
                </div>

                <div className={styles.contactFormGroup}>
                  <label htmlFor="c-message">Žinutė *</label>
                  <textarea
                    id="c-message"
                    placeholder="Jūsų klausimas ar žinutė..."
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    className={errors.has('message') ? styles.inputError : ''}
                  />
                </div>

                <button type="submit" className={`btn btn-primary ${styles.contactSubmit}`} disabled={submitting}>
                  {submitting ? 'Siunčiama...' : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Siųsti
                    </>
                  )}
                </button>
                {apiError && <p className={styles.contactApiError}>{apiError}</p>}
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
