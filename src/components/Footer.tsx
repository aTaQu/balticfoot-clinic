import Link from 'next/link'
import styles from './Footer.module.css';

const DAY_SHORT_LT: Record<string, string> = {
  monday: 'Pr', tuesday: 'An', wednesday: 'Tr',
  thursday: 'Kt', friday: 'Pn', saturday: 'Št',
}

interface FooterProps {
  phone: string
  email: string
  address: string
  workingHoursStart: string
  workingHoursEnd: string
  openDays: string[]
}

export default function Footer({ phone, email, address, workingHoursStart, workingHoursEnd, openDays }: FooterProps) {
  const firstDay = DAY_SHORT_LT[openDays[0]] ?? openDays[0] ?? ''
  const lastDay = DAY_SHORT_LT[openDays[openDays.length - 1]] ?? openDays[openDays.length - 1] ?? ''
  const daysLabel = openDays.length > 1 ? `${firstDay}–${lastDay}` : firstDay

  return (
    <footer id="kontaktai" className={styles.footer} aria-label="Puslapio apačia">
      <div className="container">
        <div className={styles.footerGrid}>

          {/* Col 1 — Brand */}
          <div className={styles.footerCol}>
            <div className={styles.footerLogo}>
              <span className={styles.footerLogoMain}>Baltic Foot</span>
              <span className={styles.footerLogoSub}>Podologijos kabinetai</span>
            </div>
            <p className={styles.footerTagline}>
              Profesionali pėdų priežiūra su šiluma ir rūpesčiu. Venetos
              Liaudanskienės kabinetas — jūsų pėdų sveikatai.
            </p>
            {/* Social links — URLs to be provided by client before enabling
            <div className={styles.footerSocial}>
              <a
                href="https://facebook.com/balticfoot"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerSocialLink}
                aria-label="Baltic Foot Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/balticfoot"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerSocialLink}
                aria-label="Baltic Foot Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
            */}
          </div>

          {/* Col 2 — Navigation */}
          <div className={styles.footerCol}>
            <h4>Navigacija</h4>
            <ul>
              <li><Link href="/">Pradžia</Link></li>
              <li><Link href="/#paslaugos">Paslaugos</Link></li>
              <li><Link href="/#apie">Apie mus</Link></li>
              <li><Link href="/#kontaktai">Susisiekite</Link></li>
              <li><Link href="/rezervacija/">Registracija</Link></li>
              <li><Link href="/blog/">Blogas</Link></li>
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div className={styles.footerCol}>
            <h4>Kontaktai</h4>
            <div className={styles.footerContactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <a href={`tel:${phone}`}>{phone}</a>
            </div>
            <div className={styles.footerContactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
            <div className={styles.footerContactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{address}</span>
            </div>
            <div className={styles.footerContactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{daysLabel} {workingHoursStart}–{workingHoursEnd}</span>
            </div>
          </div>

        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Baltic Foot. Visos teisės saugomos.</span>
          <Link href="/privatumo-politika" className={styles.footerPrivacy}>Privatumo politika</Link>
          <span>Sukurta su rūpestingumu</span>
        </div>
      </div>
    </footer>
  );
}
