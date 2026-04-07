export const dynamic = 'force-dynamic'

import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  const [servicesResult, postsResult] = await Promise.all([
    payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'services' as any,
      where: { active: { equals: true } },
      depth: 0,
      limit: 100,
    }),
    payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'blog-posts' as any,
      where: { status: { equals: 'published' } },
      depth: 0,
      limit: 1000,
    }),
  ])

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/blog/`, changeFrequency: 'weekly', priority: 0.6 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...servicesResult.docs.map((s: any) => ({
      url: `${SITE_URL}/paslaugos/${s.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...postsResult.docs.map((p: any) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    })),
  ]
}
