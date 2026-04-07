import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  {
    quote:
      'Po pirmojo vizito pagaliau galiu vaikščioti be skausmo. Veneta iš karto rado problemą ir paaiškino, ką reikia daryti. Tikrai rekomenduoju.',
    author: 'Rūta M.',
    service: 'Įaugusio nago korekcija',
  },
  {
    quote:
      'Labai švaru, profesionalu ir jaučiamas tikras rūpestis. Lina kantriai atsakė į visus klausimus. Jau pusmetis lankaus reguliariai.',
    author: 'Aldona K.',
    service: 'Higieninis pedikiūras',
  },
  {
    quote:
      'Diabetikui labai svarbu rūpintis pėdomis, o Baltic Foot tai daro atsakingai ir kompetentingai. Esu dėkingas už atsidavimą.',
    author: 'Vytautas J.',
    service: 'Diabetinių pėdų priežiūra',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonials} aria-labelledby="testimonials-heading">
      <div className="container">
        <div className={`${styles.testimonialsHeader} reveal`}>
          <div className="section-label">Pacientų atsiliepimai</div>
          <h2 id="testimonials-heading">Ką sako mūsų pacientai</h2>
        </div>

        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((item, i) => (
            <figure
              key={item.author}
              className={`${styles.testimonialCard} reveal reveal-delay-${i + 1}`}
            >
              <div className={styles.testimonialQuoteMark} aria-hidden="true">&ldquo;</div>
              <blockquote className={styles.testimonialText}>
                <p>{item.quote}</p>
              </blockquote>
              <figcaption className={styles.testimonialMeta}>
                <span className={styles.testimonialAuthor}>{item.author}</span>
                <span className={styles.testimonialService}>{item.service}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
