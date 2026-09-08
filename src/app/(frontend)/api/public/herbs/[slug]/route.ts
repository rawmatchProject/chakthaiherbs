import { NextResponse } from 'next/server'

import { getHerbBySlug } from '@/content/herbs'
import { serializeHerb } from '@/lib/api-serializers'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params
  const herb = await getHerbBySlug(decodeURIComponent(slug))

  if (!herb) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ data: serializeHerb(herb) })
}
