import { NextResponse } from 'next/server'

import { getPublishedDownloads } from '@/content/news'
import { serializeDownload } from '@/lib/api-serializers'

export async function GET() {
  const downloads = await getPublishedDownloads()
  return NextResponse.json({ data: downloads.map(serializeDownload) })
}
