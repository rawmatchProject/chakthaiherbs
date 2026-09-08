import { NextResponse } from 'next/server'

import { getHerbGroupRecords } from '@/content/groups'
import { serializeGroup } from '@/lib/api-serializers'

export async function GET() {
  const groups = await getHerbGroupRecords()
  return NextResponse.json({ data: groups.map(serializeGroup) })
}
