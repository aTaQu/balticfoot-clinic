import Image from 'next/image';
import styles from './Hero.module.css';

interface HeroProps {
  phone: string
}

export default function Hero({ phone }: HeroProps) {
  return (
    <section className={styles.hero} id="virsus" aria-labelledby="hero-heading">
      <div className={styles.heroBg} aria-hidden="true" />

      <div className="container">
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={`${styles.heroEyebrow} reveal`}>
              Profesionali podologijos priežiūra
            </div>

            <h1 id="hero-heading" className="reveal reveal-delay-1" style={{ marginBottom: '1.25rem' }}>
              Sveikos pėdos —<br />
              <em className={styles.heroEm}>sveika gyvensena</em>
            </h1>

            <div className={`${styles.heroBody} reveal reveal-delay-2`}>
              <p>
                Venetos Liaudanskienės podologijos kabinetuose rūpinamės jūsų pėdų
                sveikata su šiluma, profesionalumu ir individualia priežiūra — nuo
                higienos iki sudėtingų korekcijų.
              </p>
            </div>

            <div className={`${styles.heroActions} reveal reveal-delay-3`}>
              <a href="#registracija" className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Registruotis vizitui
              </a>
              <a href={`tel:${phone}`} className={styles.heroPhone}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                {phone}
              </a>
            </div>

            <div className={`${styles.heroStats} reveal reveal-delay-4`}>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>10+</div>
                <div className={styles.heroStatLabel}>Metų patirtis</div>
              </div>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>5</div>
                <div className={styles.heroStatLabel}>Procedūros</div>
              </div>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>100%</div>
                <div className={styles.heroStatLabel}>Higiena</div>
              </div>
            </div>
          </div>

          <div className={`${styles.heroImageWrap} reveal reveal-delay-2`} aria-hidden="true">
            <div className={styles.heroImageFrame}>
              <Image
                src="/images/Veneta_Lina.jpg"
                alt="Veneta Liaudanskienė ir Lina Bagarauskienė — Baltic Foot komanda"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                sizes="(max-width: 900px) 0px, 45vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
