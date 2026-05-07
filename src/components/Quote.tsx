import styles from './Quote.module.css';

export default function Quote() {
  return (
    <section className={styles.quote} aria-label="Specialistės žodis">
      <div className="container">
        <div className={styles.quoteInner}>
          <div className={`${styles.quoteMark} reveal`} aria-hidden="true">&ldquo;</div>
          <blockquote className={`${styles.quoteText} reveal reveal-delay-1`}>
            <p>Per daugiau nei penkiolika metų praktikos padėjome šimtams žmonių
            atkurti pėdų komfortą, judėjimo laisvę ir pasitikėjimą savimi.</p>
            <p>Kai išsprendžiamos ilgai varginusios pėdų problemos, keičiasi ne tik
            savijauta, bet ir gyvenimo kokybė — žmogus vėl juda laisvai, drąsiai
            renkasi atvirus batus, sportuoja ir mėgaujasi kasdienybe.</p>
            <p>Pėdų sveikata prasideda nuo profesionalios priežiūros.</p>
          </blockquote>
          <footer className={`${styles.quoteFooter} reveal reveal-delay-2`}>
            <div className={styles.quoteAuthor}>Veneta Liaudanskienė</div>
            <div className={styles.quoteRole}>Baltic Foot · Meliva Klinika</div>
          </footer>
        </div>
      </div>
    </section>
  );
}
