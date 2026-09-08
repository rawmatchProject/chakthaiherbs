import type { MetadataRoute } from 'next'

import { getHerbGroupRecords } from '@/content/groups'
import { getPublishedHerbs } from '@/content/herbs'
import { getPublishedArticles } from '@/content/news'
import { getPayloadClient, publishedOnly } from '@/content/payload'
import { absoluteUrl, isConfigured } from '@/lib/site'

/** Roughly how often each kind of page is expected to change, for crawlers. */
const staticPaths: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/herbs', priority: 0.9 },
  { path: '/groups', priority: 0.9 },
  { path: '/wisdom', priority: 0.7 },
  { path: '/activities', priority: 0.7 },
  { path: '/news', priority: 0.6 },
  { path: '/media', priority: 0.6 },
  { path: '/project', priority: 0.6 },
  { path: '/project/team', priority: 0.4 },
  { path: '/downloads', priority: 0.5 },
  { path: '/contact', priority: 0.5 },
]

/** CMS-authored pages served by the catch-all route, excluding the home page. */
const cmsPages = async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: publishedOnly,
    limit: 0,
    pagination: false,
    depth: 0,
    select: { slug: true, updatedAt: true },
  })
  return docs.filter((page) => page.slug && page.slug !== 'home')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // An unconfigured build has no real address to list; see @/lib/site.
  if (!isConfigured) return []

  const [herbGroupRecords, herbs, articles, pages] = await Promise.all([
    getHerbGroupRecords(),
    getPublishedHerbs(),
    getPublishedArticles(),
    cmsPages(),
  ])
  const lastModified = new Date()

  return [
    ...staticPaths.map(({ path, priority }) => ({
      url: absoluteUrl(path),
      lastModified,
      priority,
    })),
    ...herbGroupRecords.map((group) => ({
      url: absoluteUrl(`/groups/${group.slug}`),
      lastModified: group.updatedAt ? new Date(group.updatedAt) : lastModified,
      priority: 0.8,
    })),
    ...herbs.map((herb) => ({
      url: absoluteUrl(`/herbs/${herb.slug}`),
      lastModified: herb.updatedAt ? new Date(herb.updatedAt) : lastModified,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/news/${article.slug}`),
      lastModified: article.updatedAt ? new Date(article.updatedAt) : lastModified,
      priority: 0.5,
    })),
    ...pages.map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: new Date(page.updatedAt),
      priority: 0.4,
    })),
  ]
}
