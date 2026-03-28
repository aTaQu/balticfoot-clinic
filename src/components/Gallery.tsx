import Image from 'next/image';
import styles from './Gallery.module.css';

const GALLERY_ITEMS = [
  { src: '/images/IMG-20260217-WA0007.jpg', alt: 'Baltic Foot komanda kabinete', span: 'tall' },
  { src: '/images/Darbo_Vieta.jpg', alt: 'Baltic Foot procedūrų kabinetas', span: 'normal' },
  { src: '/images/Veneta_dirba2.jpg', alt: 'Veneta Liaudanskienė darbo vietoje', span: 'normal' },
  { src: '/images/IMG-20260217-WA0008.jpg', alt: 'Baltic Foot specialistės su produktais', span: 'normal' },
  { src: '/images/Veneta_dirba.jpg', alt: 'Veneta Liaudanskienė pasiruošusi procedūrai', span: 'tall' },
  { src: '/images/IMG-20260217-WA0006.jpg', alt: 'Baltic Foot komanda', span: 'normal' },
] as const;

export default function Gallery() {
  return (
    <section className={styles.gallery} id="galerija" aria-labelledby="gallery-heading">
      <div className="container">
        <div className={`${styles.galleryHeader} reveal`}>
          <div className="section-label">Galerija</div>
          <h2 id="gallery-heading">Mūsų kabinetas</h2>
        </div>

        <div className={styles.galleryGrid}>
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={item.src}
              className={`${styles.galleryItem} ${item.span === 'tall' ? styles.tall : ''} reveal reveal-delay-${(i % 3) + 1}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
