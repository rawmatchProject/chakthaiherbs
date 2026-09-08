import { NextResponse } from 'next/server'

import { getArticleBySlug } from '@/content/news'
import { serializeArticle } from '@/lib/api-serializers'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params
  const article = await getArticleBySlug(decodeURIComponent(slug))

  if (!article) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ data: serializeArticle(article) })
}
