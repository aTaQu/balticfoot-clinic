import styles from './Trust.module.css';

const TRUST_ITEMS = [
  {
    title: 'Sertifikuota specialistė',
    description: 'Veneta Liaudanskienė — sertifikuota podologė su ilgamete patirtimi.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: 'Individualus požiūris',
    description: 'Kiekvienam pacientui — atskiras dėmesys ir tinkamiausias sprendimas.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    title: 'Higieninė aplinka',
    description: 'Sterili įranga, vienkartinės priemonės, medicininiai standartai.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export default function Trust() {
  return (
    <section className={styles.trust} aria-labelledby="trust-heading">
      <div className="container">
        <div className={`${styles.trustIntro} reveal`}>
          <div className={`section-label ${styles.centeredLabel}`}>Kodėl Baltic Foot</div>
          <h2 id="trust-heading">Profesionalumas su šiluma</h2>
          <p>Rūpinamės kiekvienu pacientu kaip unikaliu žmogumi — su dėmesiu, kompetencija ir tikru rūpesčiu.</p>
        </div>

        <div className={styles.trustGrid}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={item.title} className={`${styles.trustItem} reveal reveal-delay-${i + 1}`}>
              <div className={styles.trustIcon} aria-hidden="true">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
