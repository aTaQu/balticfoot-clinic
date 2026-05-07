import Link from 'next/link'
import {
  SERVICE_CATEGORIES,
  VENETA_PHONE,
  PRICING_NOTE,
  formatPrice,
  type ServiceItem,
} from '@/lib/services-catalog'
import styles from './Services.module.css'

function PriceLabel({ item }: { item: ServiceItem }) {
  if (item.price.kind === 'perSpecialist') {
    return (
      <ul className={styles.priceSplitList}>
        <li>
          <span className={styles.priceSplitWho}>Pas Venetą</span>
          <span className={styles.priceSplitAmount}>{item.price.veneta}</span>
        </li>
        <li>
          <span className={styles.priceSplitWho}>Pas Liną</span>
          <span className={styles.priceSplitAmount}>{item.price.lina}</span>
        </li>
      </ul>
    )
  }
  return <span className={styles.serviceCardPrice}>{formatPrice(item.price)}</span>
}

export default function Services() {
  return (
    <section className={styles.services} id="paslaugos" aria-labelledby="services-heading">
      <div className="container">
        <div className={`${styles.servicesHeader} reveal`}>
          <div className={styles.servicesHeaderLeft}>
            <div className="section-label">Mūsų paslaugos</div>
            <h2 id="services-heading">Profesionali pėdų priežiūra</h2>
            <p>Visos procedūros atliekamos steriliai, specializuotais aparatais, individualiai kiekvienam pacientui.</p>
          </div>
          <div className={styles.headerActions}>
            <a href="#registracija" className="btn btn-ghost">Registruotis →</a>
            <a href={`tel:${VENETA_PHONE.replace(/\s/g, '')}`} className="btn btn-ghost">
              Skambinti Venetai {VENETA_PHONE}
            </a>
          </div>
        </div>

        {SERVICE_CATEGORIES.map((category) => (
          <div key={category.label} className={`${styles.category} reveal`}>
            <h3 className={styles.categoryTitle}>{category.label}</h3>
            {category.intro && <p className={styles.categoryIntro}>{category.intro}</p>}

            <ul className={styles.itemList}>
              {category.items.map((item) => (
                <li key={item.name} className={styles.item}>
                  <div className={styles.itemBody}>
                    <h4 className={styles.itemName}>
                      {item.name}
                      {item.venetaOnly && (
                        <span className={styles.venetaBadge}>Tik telefonu</span>
                      )}
                    </h4>
                    {item.shortDescription && (
                      <p className={styles.itemDescription}>{item.shortDescription}</p>
                    )}
                  </div>

                  <div className={styles.itemMeta}>
                    <PriceLabel item={item} />
                    {item.venetaOnly ? (
                      <a href={`tel:${VENETA_PHONE.replace(/\s/g, '')}`} className={styles.phoneLink}>
                        {VENETA_PHONE}
                      </a>
                    ) : item.slug ? (
                      <Link href={`/paslaugos/${item.slug}`} className={styles.readMore}>
                        Skaityti daugiau →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className={styles.pricingNote}>{PRICING_NOTE}</p>
      </div>
    </section>
  )
}
