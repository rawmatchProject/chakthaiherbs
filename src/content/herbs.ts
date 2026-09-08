import type { Herb, HerbGroup, HerbReference, HowToUse } from '@/content/types'
import { getPayloadClient, mediaUrl, publishedOnly, textValues } from '@/content/payload'
import { publicClaimWhere } from '@/lib/public-visibility'
import type { Herb as HerbDoc, HerbClaim as ClaimDoc } from '@/payload-types'

/**
 * ทะเบียนสมุนไพรตำบลชากไทย — the 24 herb cards from the printed guide.
 *
 * สรรพคุณ, วิธีใช้ and ข้อควรระวัง are assembled from *reviewed claims only*
 * (BACKEND-HANDOVER §7). The free-text fields on the herb record are import
 * source, not publishable content: a health statement reaches a visitor only
 * once a reviewer has accepted it.
 */
const toPublicHerb = (row: HerbDoc, claims: ClaimDoc[]): Herb => {
  const ordered = [...claims].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  const bySection = (section: ClaimDoc['section']) =>
    ordered.filter((claim) => claim.section === section)

  const cautions = bySection('caution')
    .map((claim) => claim.text)
    .join('\n')

  return {
    id: String(row.id),
    slug: row.slug ?? '',
    accessionNo: row.accessionNo,
    nameTh: row.nameTh,
    localNames: textValues(row.localNames),
    commonNames: textValues(row.commonNames),
    scientificName: row.scientificName,
    family: row.family ?? null,
    familyTh: row.familyTh ?? null,
    groups: (row.groupMemberships ?? [])
      .map((membership) =>
        typeof membership.group === 'object' && membership.group !== null
          ? (membership.group.slug as HerbGroup)
          : undefined,
      )
      .filter((slug): slug is HerbGroup => Boolean(slug)),
    ecology: textValues(row.ecology),
    botany: textValues(row.botany),
    uses: textValues(row.uses),
    partsUsed: row.partsUsed ?? null,
    properties: bySection('property').map((claim) => claim.text),
    howToUse: bySection('how_to_use').map(
      (claim): HowToUse => ({ title: claim.title ?? null, text: claim.text }),
    ),
    cautions: cautions || null,
    localWisdom: row.localWisdom ?? null,
    phytochemicals: textValues(row.phytochemicals),
    significance: row.significance ?? null,
    tagline: row.tagline ?? null,
    media: {
      thumb: mediaUrl(row.media?.thumb),
      card: mediaUrl(row.media?.card),
      alt: row.media?.alt ?? '',
    },
    source: {
      label: row.source?.label ?? '',
      kind: (row.source?.kind ?? 'project-guide') as Herb['source']['kind'],
    },
    references: (row.references ?? []).map(
      (reference): HerbReference => ({
        label: reference.label,
        url: reference.url ?? null,
        kind: reference.kind,
      }),
    ),
    reviewedBy: row.reviewedBy ?? null,
    reviewedAt: row.reviewedAt ?? null,
    status: 'published',
    updatedAt: row.updatedAt,
  }
}

/** Reviewed claims for a set of herbs, grouped by herb ID. */
const claimsByHerb = async (herbIds: (number | string)[]) => {
  if (herbIds.length === 0) return new Map<string, ClaimDoc[]>()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'herb-claims',
    where: { and: [publicClaimWhere, { herb: { in: herbIds } }] },
    limit: 0,
    pagination: false,
    depth: 0,
  })

  const map = new Map<string, ClaimDoc[]>()
  for (const claim of docs) {
    const key = String(typeof claim.herb === 'object' ? claim.herb.id : claim.herb)
    map.set(key, [...(map.get(key) ?? []), claim])
  }
  return map
}

export async function getPublishedHerbs(): Promise<Herb[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'herbs',
    where: publishedOnly,
    sort: 'accessionNo',
    limit: 0,
    pagination: false,
    depth: 1,
  })

  const claims = await claimsByHerb(docs.map((herb) => herb.id))
  return docs.map((herb) => toPublicHerb(herb, claims.get(String(herb.id)) ?? []))
}

export async function getHerbBySlug(slug: string): Promise<Herb | undefined> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'herbs',
    where: { and: [publishedOnly, { slug: { equals: slug } }] },
    limit: 1,
    pagination: false,
    depth: 1,
  })

  const row = docs[0]
  if (!row) return undefined

  const claims = await claimsByHerb([row.id])
  return toPublicHerb(row, claims.get(String(row.id)) ?? [])
}

export async function searchHerbs(query = ''): Promise<Herb[]> {
  const publishedHerbs = await getPublishedHerbs()
  const q = query.trim().toLocaleLowerCase('th-TH')
  if (!q) return publishedHerbs
  return publishedHerbs.filter((herb) =>
    [herb.nameTh, herb.scientificName, herb.family ?? '', ...herb.localNames, ...herb.commonNames]
      .join(' ')
      .toLocaleLowerCase('th-TH')
      .includes(q),
  )
}

/** Botanical families present in the register, with their record counts. */
export async function herbFamilies(): Promise<{ family: string; count: number }[]> {
  const herbs = await getPublishedHerbs()
  const counts = new Map<string, number>()
  for (const herb of herbs) {
    if (!herb.family) continue
    counts.set(herb.family, (counts.get(herb.family) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([family, count]) => ({ family, count }))
    .sort((a, b) => b.count - a.count || a.family.localeCompare(b.family))
}
