import Image from 'next/image';
import styles from './About.module.css';

const VENETA_CREDS = [
  '15+ metų profesinė patirtis',
  'Tarptautinė praktika',
  'Probleminių pėdų specialistė',
  'Individuali priežiūra',
];

const LINA_CREDS = [
  'Profesionali pėdų priežiūra',
  'Kruopštus ir preciziškas darbas',
  'Higieninis ir specializuotas manikiūras',
  'Šiltas ir dėmesingas aptarnavimas',
];

interface AboutProps {
  phone: string
}

export default function About({ phone }: AboutProps) {
  return (
    <section className={styles.about} id="apie" aria-labelledby="about-heading">
      <div className="container">

        <div className={`${styles.aboutSectionHeader} reveal`}>
          <div className="section-label">Mūsų komanda</div>
          <h2 id="about-heading">Patirtis, kuria galima pasitikėti</h2>
          <p className={styles.aboutSectionIntro}>
            Patirtis, kruopštumas ir individualus požiūris — vertybės, kuriomis Baltic
            Foot specialistės vadovaujasi kiekvieną dieną.
          </p>
        </div>

        {/* Veneta */}
        <div className={styles.aboutGrid}>
          <div className="reveal reveal-left">
            <div className={styles.aboutPhotoFrame}>
              <div className={styles.aboutPhotoInner}>
                <Image
                  src="/images/Veneta.jpg"
                  alt="Veneta Liaudanskienė — Baltic Foot podologė"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  sizes="(max-width: 900px) 400px, 480px"
                />
              </div>
              <div className={styles.aboutBadge} aria-hidden="true">
                <span className={styles.aboutBadgeMain}>Baltic Foot</span>
                <span className={styles.aboutBadgeSub}>Įkūrėja</span>
              </div>
            </div>
          </div>

          <div className={`${styles.aboutContent} reveal reveal-right reveal-delay-2`}>
            <h3>Veneta Liaudanskienė</h3>

            <p className={styles.aboutBodyText}>
              Baltic Foot įkūrėja ir podologė, sukaupusi daugiau nei 15 metų patirtį
              profesionalios pėdų priežiūros srityje.
            </p>

            <p className={styles.aboutBodyText}>
              Per daugiau nei penkiolika metų sukaupta praktinė patirtis, nuolatinis
              kvalifikacijos tobulinimas ir tarptautinės stažuotės Vokietijoje,
              Lenkijoje, Ispanijoje bei Ukrainoje leidžia užtikrinti aukšto lygio
              priežiūrą klientams iš visos Lietuvos.
            </p>

            <p className={styles.aboutBodyText}>
              Specializuojasi probleminių pėdų priežiūroje, įaugusių nagų korekcijose
              bei individualiai pritaikytuose pėdų priežiūros sprendimuose.
            </p>

            <ul className={styles.aboutCreds}>
              {VENETA_CREDS.map((cred) => (
                <li key={cred}>{cred}</li>
              ))}
            </ul>

            <p className={styles.aboutPhoneOnlyNote}>
              Registruotis pas Venetą galima tik telefonu.
            </p>

            <div className={styles.aboutContactRow}>
              <a href={`tel:${phone}`} className={styles.aboutPhone}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                {phone}
              </a>
            </div>
          </div>
        </div>

        <div className={styles.aboutDivider} aria-hidden="true" />

        {/* Lina */}
        <div className={`${styles.aboutGrid} ${styles.aboutGridReversed}`}>
          <div className={`${styles.aboutContent} reveal reveal-left`}>
            <h3>Lina Bagarauskienė</h3>

            <p className={styles.aboutBodyText}>
              Baltic Foot podologijos kabineto specialistė Lina Bagarauskienė derina
              higieninę pedikiūrą su podologijos principais, todėl kiekvienas
              apsilankymas tampa ne tik grožio procedūra, bet ir profesionali pėdų
              priežiūra.
            </p>

            <p className={styles.aboutBodyText}>
              Ypatingą dėmesį Lina skiria individualiems klientų poreikiams ir
              sprendimams, padedantiems užtikrinti odos ir nagų sveikatą, tvarkingą
              išvaizdą ir ilgalaikį rezultatą.
            </p>

            <ul className={styles.aboutCreds}>
              {LINA_CREDS.map((cred) => (
                <li key={cred}>{cred}</li>
              ))}
            </ul>

            <div className={styles.aboutContactRow}>
              <a href="tel:+37061608669" className={styles.aboutPhone}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                +370 616 08669
              </a>
              <a href="#registracija" className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Registruotis vizitui
              </a>
            </div>
          </div>

          <div className="reveal reveal-right reveal-delay-2">
            <div className={styles.aboutPhotoFrame}>
              <div className={styles.aboutPhotoInner}>
                <Image
                  src="/images/Lina.jpg"
                  alt="Lina Bagarauskienė — Baltic Foot podologijos specialistė"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  sizes="(max-width: 900px) 400px, 480px"
                />
              </div>
              <div className={styles.aboutBadge} aria-hidden="true">
                <span className={styles.aboutBadgeMain}>Baltic Foot</span>
                <span className={styles.aboutBadgeSub}>Specialistė</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
