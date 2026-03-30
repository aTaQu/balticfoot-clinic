import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import type { BlogPost, Media } from '../../../../../payload-types'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import styles from './BlogPost.module.css'
import { formatDateLT } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'blog-posts' as any,
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })

  const post = result.docs[0] as BlogPost | undefined
  if (!post) return {}

  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  const payload = await getPayload({ config: configPromise })

  const [result, settings] = await Promise.all([
    payload.find({
      collection: 'blog-posts' as any,
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      depth: 1,
    }),
    payload.findGlobal({ slug: 'clinic-settings' }),
  ])

  const post = result.docs[0] as BlogPost | undefined
  if (!post) notFound()

  const image =
    post.featuredImage && typeof post.featuredImage === 'object'
      ? (post.featuredImage as Media)
      : null

  const openDays = (settings.openDays ?? []) as string[]

  return (
    <>
      <Navigation />
      <main>
        <article>
          <header className={styles.header}>
            <div className="container">
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/blog">Blogas</Link>
                <span aria-hidden="true">›</span>
                <span>{post.title}</span>
              </nav>
              {post.publishedAt && (
                <time className={styles.date} dateTime={post.publishedAt}>
                  {formatDateLT(post.publishedAt)}
                </time>
              )}
              <h1 className={styles.h1}>{post.title}</h1>
            </div>
          </header>

          {image?.url && (
            <div className={styles.featuredImageWrap}>
              <div className="container">
                <div className={styles.featuredImage}>
                  <Image
                    src={image.url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className={styles.image}
                    priority
                  />
                </div>
              </div>
            </div>
          )}

          <div className={styles.body}>
            <div className="container">
              <div className={styles.prose}>
                {post.body && <RichText data={post.body} />}
              </div>

              <div className={styles.cta}>
                <p className={styles.ctaText}>Norite pasikonsultuoti su specialistu?</p>
                <Link href="/rezervacija" className="btn btn-primary">
                  Registruokitės konsultacijai
                </Link>
              </div>
            </div>
          </div>
        </article>
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
