import { getPayloadClient, publishedOnly, textValues } from '@/content/payload'
import { isPubliclyVisibleMedia } from '@/lib/public-visibility'
import type { Media as MediaDoc } from '@/payload-types'

export type PublicMedia = {
  id: string
  url: string
  alt: string
  /** Attribution and rights, as the public API contract carries them. */
  credit: string | null
  license: string | null
  updatedAt: string
}

export type Activity = {
  id: string
  order: number
  title: string
  dateLabel: string
  place: string
  participants: number
  summary: string
  outcomes: string[]
  /**
   * Consent-cleared photographs only, in editorial order.
   *
   * Was a list of media IDs the page turned into paths by hand; now the
   * resolved media, so the curated alt text travels with the image and the
   * consent rule is applied in one place.
   */
  photos: PublicMedia[]
}

const toPublicMedia = (media: MediaDoc): PublicMedia => ({
  id: String(media.id),
  url: media.url ?? '',
  alt: media.alt ?? '',
  credit: media.credit ?? null,
  license: media.license ?? null,
  updatedAt: media.updatedAt,
})

export type Indicator = { label: string; target: string; result: string; met: boolean }

export type SatisfactionItem = { label: string; mean: number }
export type SatisfactionProfileRow = { label: string; percent: number }
export type Satisfaction = {
  respondents: number
  overallMean: number | null
  overallPercent: number
  collectedAt: string
  items: SatisfactionItem[]
  profile: SatisfactionProfileRow[]
}

export type PartnerLink = { kind: 'website' | 'map' | 'facebook'; href: string }
export type Partner = { label: string; role: string; links: PartnerLink[] }

export type ProjectVideo = {
  id: string
  title: string
  description: string
  youtubeId: string
  channel: string
}

export type ProjectView = {
  nameTh: string
  shortName: string
  nameEn: string
  tagline: string
  owner: string
  ownerUrl: string
  ownerMapUrl: string
  funder: string
  funderUrl: string
  period: string
  fiscalYear: string
  strategy: string
  budgetTHB: number
  budgetCode: string
  leads: string[]
  reportDate: string
  objectives: string[]
  recommendations: string[]
  bibliography: string[]
  safetyNotice: string
}

/**
 * The report facts and the editable site settings are two globals — see
 * BACKEND-HANDOVER §2 and §5.4 — but every page reads them as one `project`
 * object, so this merges them into that shape.
 */
export async function getProject(): Promise<ProjectView> {
  const payload = await getPayloadClient()
  const [fact, setting] = await Promise.all([
    payload.findGlobal({ slug: 'project-facts', depth: 0 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ])

  return {
    nameTh: fact.nameTh,
    shortName: fact.shortName,
    nameEn: fact.nameEn,
    tagline: fact.tagline,
    owner: fact.owner,
    ownerUrl: setting.ownerUrl ?? '',
    ownerMapUrl: setting.ownerMapUrl ?? '',
    funder: fact.funder,
    funderUrl: setting.funderUrl ?? '',
    period: fact.period,
    fiscalYear: fact.fiscalYear,
    strategy: fact.strategy,
    budgetTHB: fact.budgetTHB,
    budgetCode: fact.budgetCode,
    leads: textValues(fact.leads),
    reportDate: fact.reportDate,
    objectives: textValues(fact.objectives),
    recommendations: textValues(fact.recommendations),
    bibliography: textValues(fact.bibliography),
    safetyNotice: fact.safetyNotice,
  }
}

export async function getDeveloper(): Promise<{ label: string; href: string }> {
  const payload = await getPayloadClient()
  const setting = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  return { label: setting.developerLabel ?? '', href: setting.developerHref ?? '' }
}

export async function getActivities(): Promise<Activity[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'activities',
    where: publishedOnly,
    sort: 'order',
    limit: 0,
    pagination: false,
    depth: 1,
  })

  return docs.map((row) => ({
    id: String(row.legacyId ?? row.id),
    order: row.order ?? 0,
    title: row.title,
    dateLabel: row.dateLabel,
    place: row.place,
    participants: row.participants,
    summary: row.summary,
    outcomes: textValues(row.outcomes),
    photos: (row.photos ?? [])
      .filter((photo) => typeof photo === 'object' && isPubliclyVisibleMedia(photo))
      .map((photo) => toPublicMedia(photo as MediaDoc)),
  }))
}

export async function getIndicators(): Promise<Indicator[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'indicators',
    sort: 'order',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  return docs.map((row) => ({
    label: row.label,
    target: row.target,
    result: row.result,
    met: Boolean(row.met),
  }))
}

/**
 * One consent-cleared photograph, addressed the way the pre-migration site
 * addressed it — by the file's old ID (`a3-17`) or its full old path.
 */
export async function getPublicMedia(id: string): Promise<PublicMedia | null> {
  const payload = await getPayloadClient()
  const legacyPath = id.startsWith('/') ? { equals: id } : { like: `/${id}.` }
  const { docs } = await payload.find({
    collection: 'media',
    where: { legacyPath },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const media = docs[0]
  if (!media || !isPubliclyVisibleMedia(media)) return null
  return toPublicMedia(media)
}

export async function getSatisfaction(): Promise<Satisfaction> {
  const payload = await getPayloadClient()
  const row = await payload.findGlobal({ slug: 'satisfaction-summary', depth: 0 })
  return {
    respondents: row.respondents,
    overallMean: Number.isFinite(row.overallMean) ? row.overallMean : null,
    overallPercent: row.overallPercent,
    collectedAt: row.collectedAt,
    items: (row.items ?? [])
      .filter((item) => Number.isFinite(item.mean))
      .map((item) => ({ label: item.label, mean: item.mean })),
    profile: (row.profile ?? []).map((entry) => ({ label: entry.label, percent: entry.percent })),
  }
}

export async function getPartners(): Promise<Partner[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'partners',
    sort: 'order',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  return docs.map((row) => ({
    label: row.label,
    role: row.role,
    links: (row.links ?? []).map((link) => ({ kind: link.kind, href: link.href })),
  }))
}

export const partnerLinkLabel: Record<PartnerLink['kind'], string> = {
  website: 'เว็บไซต์',
  map: 'แผนที่',
  facebook: 'Facebook',
}

export async function getVideos(): Promise<ProjectVideo[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'project-videos',
    where: publishedOnly,
    sort: 'order',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  return docs.map((row) => ({
    id: String(row.legacyId ?? row.id),
    title: row.title,
    description: row.description,
    youtubeId: row.youtubeId,
    channel: row.channel,
  }))
}
