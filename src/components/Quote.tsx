import styles from './Quote.module.css';

export default function Quote() {
  return (
    <section className={styles.quote} aria-label="Specialistės žodis">
      <div className="container">
        <div className={styles.quoteInner}>
          <div className={`${styles.quoteMark} reveal`} aria-hidden="true">&ldquo;</div>
          <blockquote className={`${styles.quoteText} reveal reveal-delay-1`}>
            <p>Per daugiau nei dešimtmetį klinikinės praktikos ant sveikų pėdų
            &bdquo;pastatėme&ldquo; šimtus žmonių, tuo pačiu užkirsdami kelią antrinėms
            problemoms, kurias pažeistos pėdos dažnai perduoda visam kūnui. Kuomet
            chroninės pėdų problemos išsprendžiamos, pagerėja bendra viso organizmo
            sveikata.</p>
            <p>Visuminis pėdų priežiūros ciklas gali iš esmės pakeisti žmogaus gyvenimą
            tiek fizinės, tiek psichologinės sveikatos prasme.</p>
            <p>Dar neseniai viešumoje be uždarų batų nedrįsęs pasirodyti žmogus nuo šiol
            su malonumu ir pasitikėjimu keliaus į paplūdimį, pradės sportuoti ar
            pasileis su draugais bėgti vaikystės pievomis.</p>
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
