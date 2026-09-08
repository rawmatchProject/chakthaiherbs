import { NextResponse } from 'next/server'

import { getGroupBySlug } from '@/content/groups'
import { serializeGroup } from '@/lib/api-serializers'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params
  const group = await getGroupBySlug(decodeURIComponent(slug))

  if (!group) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ data: serializeGroup(group) })
}
