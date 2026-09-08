import type { Article, DownloadItem, Herb, HerbGroupRecord } from '@/content/types'

/**
 * Shapes for the public REST API (BACKEND-HANDOVER §4).
 *
 * Before the migration these mapped Prisma rows directly, in parallel with the
 * frontend's own data layer — two mappings of the same records that could drift.
 * They now sit on top of `src/content/*`, so the API and the pages are served
 * from one mapping and can no longer disagree. The only thing the API adds is
 * `updatedAt` on every resource, which the pages have no use for.
 */

const requireUpdatedAt = (value: string | undefined): string => value ?? new Date(0).toISOString()

export function serializeHerb(herb: Herb) {
  const { updatedAt, ...rest } = herb
  return { ...rest, updatedAt: requireUpdatedAt(updatedAt) }
}

export function serializeGroup(group: HerbGroupRecord) {
  const { updatedAt, ...rest } = group
  return { ...rest, updatedAt: requireUpdatedAt(updatedAt) }
}

export function serializeArticle(article: Article) {
  const { updatedAt, coverImage, ...rest } = article
  return {
    ...rest,
    coverImage: coverImage ?? null,
    publishedAt: article.publishedAt ?? null,
    authorLabel: article.authorLabel ?? null,
    readingMinutes: article.readingMinutes ?? null,
    body: article.body ?? null,
    updatedAt: requireUpdatedAt(updatedAt),
  }
}

export function serializeDownload(download: DownloadItem) {
  const { updatedAt, ...rest } = download
  return { ...rest, updatedAt: requireUpdatedAt(updatedAt) }
}
