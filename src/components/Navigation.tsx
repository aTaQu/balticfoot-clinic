'use client';

import Image from 'next/image';
import Link from 'next/link';
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
            <Link href="/" className={styles.navLogo} aria-label="Baltic Foot pradžia">
              <Image
                src="/images/balticfoot-logo-1608546074.jpg"
                alt="Baltic Foot"
                width={120}
                height={48}
                className={styles.navLogoImg}
                priority
              />
            </Link>

            <ul className={styles.navLinks} role="list">
              <li><Link href="/#paslaugos">Paslaugos</Link></li>
              <li><Link href="/#apie">Apie mus</Link></li>
              <li><Link href="/#kontaktai">Kontaktai</Link></li>
            </ul>

            <Link href="/rezervacija/" className={`btn btn-primary ${styles.navCta}`}>
              Registruotis
            </Link>

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
        <Link href="/#paslaugos" onClick={closeMenu}>Paslaugos</Link>
        <Link href="/#apie" onClick={closeMenu}>Apie mus</Link>
        <Link href="/#kontaktai" onClick={closeMenu}>Kontaktai</Link>
        <Link href="/rezervacija/" className={`btn btn-primary ${styles.navMobileCta}`} onClick={closeMenu}>
          Registruotis vizitui
        </Link>
      </div>
    </>
  );
}
