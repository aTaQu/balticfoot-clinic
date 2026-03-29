'use client';

import type { Service } from '../../payload-types'
import { formatDuration } from '@/lib/format'
import styles from './Services.module.css';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  smiley: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  heart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  coffee: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1" />
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  shield: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  activity: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
};


interface ServicesProps {
  services: Service[]
  onServiceSelect?: (name: string) => void;
}

export default function Services({ services, onServiceSelect }: ServicesProps) {
  const handleCardClick = (name: string) => {
    if (onServiceSelect) onServiceSelect(name);
    const section = document.getElementById('registracija');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.services} id="paslaugos" aria-labelledby="services-heading">
      <div className="container">
        <div className={`${styles.servicesHeader} reveal`}>
          <div className={styles.servicesHeaderLeft}>
            <div className="section-label">Mūsų paslaugos</div>
            <h2 id="services-heading">Profesionali pėdų priežiūra</h2>
            <p>Visos procedūros atliekamos steriliai, specializuotais aparatais, individualiai kiekvienam pacientui.</p>
          </div>
          <a href="#registracija" className="btn btn-ghost">Registruotis →</a>
        </div>

        <div className={styles.servicesGrid}>
          {services.map((service, i) => (
            <article
              key={service.id}
              className={`${styles.serviceCard} reveal reveal-delay-${i + 1}`}
              onClick={() => handleCardClick(service.name)}
              title="Spustelėkite norėdami rezervuoti"
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.serviceIcon} aria-hidden="true">
                {service.icon ? SERVICE_ICONS[service.icon] : null}
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className={styles.serviceCardMeta}>
                <span className={styles.serviceCardDuration}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatDuration(service.duration)}
                </span>
                <span className={styles.serviceCardPrice}>{service.price} €</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
