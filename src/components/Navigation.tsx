'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
        id="nav"
        aria-label="Pagrindinis meniu"
      >
        <div className="container">
          <div className={styles.navInner}>
            <a href="#virsus" className={styles.navLogo} aria-label="Baltic Foot pradžia">
              <Image
                src="/images/balticfoot-logo-1608546074.jpg"
                alt="Baltic Foot"
                width={120}
                height={48}
                className={styles.navLogoImg}
                priority
              />
            </a>

            <ul className={styles.navLinks} role="list">
              <li><a href="#paslaugos">Paslaugos</a></li>
              <li><a href="#apie">Apie mus</a></li>
              <li><a href="#kontaktai">Kontaktai</a></li>
            </ul>

            <a href="#registracija" className={`btn btn-primary ${styles.navCta}`}>
              Registruotis
            </a>

            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Atidaryti meniu"
              aria-expanded={mobileOpen}
              aria-controls="nav-mobile"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div
        id="nav-mobile"
        className={`${styles.navMobile} ${mobileOpen ? styles.open : ''}`}
        role="dialog"
        aria-label="Mobilusis meniu"
        aria-modal="true"
      >
        <a href="#paslaugos" onClick={closeMenu}>Paslaugos</a>
        <a href="#apie" onClick={closeMenu}>Apie mus</a>
        <a href="#kontaktai" onClick={closeMenu}>Kontaktai</a>
        <a href="#registracija" className={`btn btn-primary ${styles.navMobileCta}`} onClick={closeMenu}>
          Registruotis vizitui
        </a>
      </div>
    </>
  );
}
