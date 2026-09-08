import { NextResponse, type NextRequest } from 'next/server'

import { getRealPublishedArticles } from '@/content/news'
import { paginatedResponse, parsePagination } from '@/lib/api-pagination'
import { serializeArticle } from '@/lib/api-serializers'

const categories = new Set(['news', 'knowledge', 'announcement'])

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type')?.trim()
  const { page, limit, skip } = parsePagination(searchParams)

  const all = await getRealPublishedArticles()
  const filtered =
    type && categories.has(type) ? all.filter((article) => article.category === type) : all
  const rows = filtered.slice(skip, skip + limit).map(serializeArticle)

  return NextResponse.json(paginatedResponse(rows, page, limit, filtered.length))
}
