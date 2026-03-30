import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import type { BlogPost, Media } from '../../../../payload-types'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Blog.module.css'
import { formatDateLT } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blogas — Baltic Foot',
  description:
    'Patarimai pėdų sveikatai, procedūrų aprašymai ir naujienos iš Baltic Foot podologijos klinikos Šiauliuose.',
}

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })

  const [result, settings] = await Promise.all([
    payload.find({
      collection: 'blog-posts' as any,
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1,
    }),
    payload.findGlobal({ slug: 'clinic-settings' }),
  ])

  const posts = result.docs as BlogPost[]
  const openDays = (settings.openDays ?? []) as string[]

  return (
    <>
      <Navigation />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className="section-label">Baltic Foot · Šiauliai</div>
            <h1 className={styles.h1}>Blogas</h1>
            <p className={styles.lead}>Patarimai pėdų sveikatai ir procedūrų aprašymai.</p>
          </div>
        </section>

        <section className={styles.listing}>
          <div className="container">
            {posts.length === 0 ? (
              <p className={styles.empty}>Straipsnių kol kas nėra.</p>
            ) : (
              <ul className={styles.grid}>
                {posts.map((post) => {
                  const image =
                    post.featuredImage && typeof post.featuredImage === 'object'
                      ? (post.featuredImage as Media)
                      : null

                  return (
                    <li key={post.id} className={styles.card}>
                      {image?.url && (
                        <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
                          <div className={styles.imageWrap}>
                            <Image
                              src={image.url}
                              alt={post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 400px"
                              className={styles.image}
                            />
                          </div>
                        </Link>
                      )}
                      <div className={styles.cardBody}>
                        {post.publishedAt && (
                          <time className={styles.date} dateTime={post.publishedAt}>
                            {formatDateLT(post.publishedAt)}
                          </time>
                        )}
                        <h2 className={styles.cardTitle}>
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h2>
                        {post.excerpt && (
                          <p className={styles.excerpt}>{post.excerpt}</p>
                        )}
                        <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                          Skaityti daugiau →
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        workingHoursStart={settings.workingHoursStart}
        workingHoursEnd={settings.workingHoursEnd}
        openDays={openDays}
      />
    </>
  )
}
