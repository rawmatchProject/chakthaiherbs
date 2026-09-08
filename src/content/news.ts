import type { Article, DownloadItem } from '@/content/types'
import { getPayloadClient, mediaAlt, mediaUrl, publishedOnly } from '@/content/payload'
import { lexicalToArticleBody } from '@/content/lexical-to-body'
import type { Post } from '@/payload-types'

/**
 * Editorial content lives in Payload's `posts` collection — the old `Article`
 * model, with `categories` standing in for the ArticleCategory enum.
 *
 * The three mock placeholder articles the pre-migration site fell back to are
 * gone: the CMS is live now, which is exactly the condition their own comment
 * said to delete them under. An empty news page renders its own empty state.
 */
const categorySlug = (post: Post): Article['category'] => {
  const first = (post.categories ?? []).find((category) => typeof category === 'object')
  const slug = typeof first === 'object' && first !== null ? first.slug : null
  return slug === 'knowledge' || slug === 'announcement' ? slug : 'news'
}

const toArticle = (post: Post): Article => ({
  id: String(post.id),
  slug: post.slug ?? '',
  category: categorySlug(post),
  title: post.title,
  excerpt: post.excerpt,
  coverImage: post.heroImage
    ? { src: mediaUrl(post.heroImage), alt: mediaAlt(post.heroImage) }
    : undefined,
  publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : undefined,
  updatedAt: post.updatedAt,
  authorLabel: post.authorLabel ?? undefined,
  readingMinutes: post.readingMinutes ?? undefined,
  body: lexicalToArticleBody(post.content),
  status: 'published',
})

export async function getRealPublishedArticles(): Promise<Article[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: publishedOnly,
    sort: '-publishedAt',
    limit: 0,
    pagination: false,
    depth: 1,
  })
  return docs.map(toArticle)
}

export const getPublishedArticles = getRealPublishedArticles

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [publishedOnly, { slug: { equals: slug } }] },
    limit: 1,
    pagination: false,
    depth: 1,
  })
  return docs[0] ? toArticle(docs[0]) : undefined
}

export const articleCategoryLabel: Record<Article['category'], string> = {
  news: 'ข่าวกิจกรรม',
  knowledge: 'บทความความรู้',
  announcement: 'ประกาศ',
}

export async function getPublishedDownloads(): Promise<DownloadItem[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'downloads',
    where: publishedOnly,
    sort: 'order',
    limit: 0,
    pagination: false,
    depth: 1,
  })

  return docs.map((row) => ({
    id: String(row.id),
    title: row.title,
    description: row.description,
    type: row.type,
    fileUrl: mediaUrl(row.file) || null,
    updatedAt: row.updatedAt,
    sizeLabel:
      row.sizeLabel ??
      (typeof row.file === 'object' && row.file?.filesize
        ? `${Math.round(row.file.filesize / 1024 / 1024)} MB`
        : null),
    status: 'published',
  }))
}
