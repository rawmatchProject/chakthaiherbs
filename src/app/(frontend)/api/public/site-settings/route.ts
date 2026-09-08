import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/content/payload'

export async function GET() {
  const payload = await getPayloadClient()
  const setting = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  return NextResponse.json({
    data: {
      contactEmail: setting.contactEmail ?? null,
      contactPhone: setting.contactPhone ?? null,
      ownerUrl: setting.ownerUrl ?? null,
      ownerMapUrl: setting.ownerMapUrl ?? null,
      funderUrl: setting.funderUrl ?? null,
      developer:
        setting.developerLabel && setting.developerHref
          ? { label: setting.developerLabel, href: setting.developerHref }
          : null,
      updatedAt: setting.updatedAt,
    },
  })
}
