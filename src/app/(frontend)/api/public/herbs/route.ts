import { NextResponse, type NextRequest } from 'next/server'

import { getPublishedHerbs } from '@/content/herbs'
import { paginatedResponse, parsePagination } from '@/lib/api-pagination'
import { serializeHerb } from '@/lib/api-serializers'

/** Matches the pre-migration query semantics: substring on the two names, exact on the name lists. */
const matches = (herb: Awaited<ReturnType<typeof getPublishedHerbs>>[number], q: string) => {
  const needle = q.toLocaleLowerCase('th-TH')
  return (
    herb.nameTh.toLocaleLowerCase('th-TH').includes(needle) ||
    herb.scientificName.toLocaleLowerCase('th-TH').includes(needle) ||
    herb.localNames.includes(q) ||
    herb.commonNames.includes(q)
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const family = searchParams.get('family')?.trim()
  const { page, limit, skip } = parsePagination(searchParams)

  const all = await getPublishedHerbs()
  const filtered = all
    .filter((herb) => (family ? herb.family === family : true))
    .filter((herb) => (q ? matches(herb, q) : true))

  const rows = filtered.slice(skip, skip + limit).map(serializeHerb)
  return NextResponse.json(paginatedResponse(rows, page, limit, filtered.length))
}
