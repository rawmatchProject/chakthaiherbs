/**
 * Applies a live-database dump over the seeded content.
 *
 *   node scripts/chakthai-import/live-export.mjs   # on a machine that reaches the DB
 *   pnpm import:chakthai                           # baseline from the frozen files
 *   pnpm import:chakthai:live                      # then this
 *
 * The live database was itself seeded from the same frozen files, so whatever
 * differs is an editorial change made since — review decisions, consent
 * records, real articles, edited copy. Live wins for those fields; rows the
 * dump does not mention are left alone.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'

import { toLexical } from './lexical'
import { defined, list, toPayloadStatus, upsert } from './shared'

const here = path.dirname(fileURLToPath(import.meta.url))
const dumpFile = process.env.CHAKTHAI_DUMP ?? path.join(here, 'live-dump.json')

// A dump row is arbitrary JSON straight out of Postgres; `any` is the honest type here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>
type Dump = { exportedAt: string; tables: Record<string, Row[]> }

const asList = (value: unknown) => list(Array.isArray(value) ? (value as string[]) : [])
const asDate = (value: unknown) =>
  value ? new Date(value as string).toISOString() : (null as string | null)

/** legacyPath → media doc ID, for the images the live rows point at. */
const mediaMap = async (payload: Payload) => {
  const found = await payload.find({
    collection: 'media',
    where: { legacyPath: { exists: true } },
    limit: 0,
    pagination: false,
    depth: 0,
  })
  const map = new Map<string, number | string>()
  for (const doc of found.docs) if (doc.legacyPath) map.set(doc.legacyPath, doc.id)
  return map
}

const applyHerbs = async (payload: Payload, dump: Dump, media: Map<string, number | string>) => {
  const groups = await payload.find({
    collection: 'herb-groups',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  const groupIdByLegacy = new Map<string, number | string>()
  for (const group of groups.docs) {
    if (group.legacyId) groupIdByLegacy.set(group.legacyId, group.id)
    if (group.slug) groupIdByLegacy.set(group.slug, group.id)
  }

  const memberships = new Map<string, { group: number | string; note?: string | null }[]>()
  for (const row of dump.tables.herb_group_memberships ?? []) {
    const groupId = groupIdByLegacy.get(row.groupId)
    if (!groupId) continue
    const existing = memberships.get(row.herbId) ?? []
    existing.push({ group: groupId, note: row.note ?? null })
    memberships.set(row.herbId, existing)
  }

  for (const row of dump.tables.herbs ?? []) {
    await upsert(payload, {
      collection: 'herbs',
      legacyId: row.id,
      data: defined({
        slug: row.slug,
        accessionNo: row.accessionNo,
        nameTh: row.nameTh,
        localNames: asList(row.localNames),
        commonNames: asList(row.commonNames),
        scientificName: row.scientificName,
        family: row.family,
        familyTh: row.familyTh,
        ecology: asList(row.ecology),
        botany: asList(row.botany),
        uses: asList(row.uses),
        partsUsed: row.partsUsed,
        properties: asList(row.properties),
        howToUse: Array.isArray(row.howToUse) ? row.howToUse : [],
        cautions: row.cautions,
        localWisdom: row.localWisdom,
        phytochemicals: asList(row.phytochemicals),
        significance: row.significance,
        tagline: row.tagline,
        media: {
          thumb: media.get(row.mediaThumb) ?? null,
          card: media.get(row.mediaCard) ?? null,
          alt: row.mediaAlt,
        },
        source: { label: row.sourceLabel, kind: row.sourceKind },
        references: Array.isArray(row.references) ? row.references : [],
        groupMemberships: memberships.get(row.id) ?? [],
        reviewedBy: row.reviewedBy,
        reviewedAt: asDate(row.reviewedAt),
        editorialStatus: row.status,
        _status: toPayloadStatus(row.status),
      }),
    })
  }
  payload.logger.info(`live herbs: ${(dump.tables.herbs ?? []).length} applied`)
}

/** Review decisions are the whole point of carrying the live claims over. */
const applyClaims = async (payload: Payload, dump: Dump) => {
  const herbs = await payload.find({ collection: 'herbs', limit: 0, pagination: false, depth: 0 })
  const herbIdByLegacy = new Map<string, number | string>()
  for (const herb of herbs.docs) if (herb.legacyId) herbIdByLegacy.set(herb.legacyId, herb.id)

  let applied = 0
  for (const row of dump.tables.herb_claims ?? []) {
    const herb = herbIdByLegacy.get(row.herbId)
    if (!herb) {
      payload.logger.warn(`claim ${row.id}: herb ${row.herbId} not found, skipped`)
      continue
    }

    await upsert(payload, {
      collection: 'herb-claims',
      legacyId: row.id,
      data: defined({
        herb,
        section: row.section,
        title: row.title,
        text: row.text,
        kind: row.kind,
        sourceRefs: asList(row.sourceRefs),
        position: row.position,
        reviewStatus: row.reviewStatus,
        reviewedBy: row.reviewedBy,
        reviewedAt: asDate(row.reviewedAt),
      }),
    })
    applied += 1
  }
  payload.logger.info(`live herb-claims: ${applied} applied`)
}

/** Consent and takedown records — never regenerated, only carried over. */
const applyMediaConsent = async (payload: Payload, dump: Dump, media: Map<string, number | string>) => {
  let applied = 0
  for (const row of dump.tables.media ?? []) {
    const id = media.get(row.url)
    if (!id) {
      payload.logger.warn(`media ${row.url}: not in the library, consent record skipped`)
      continue
    }
    await payload.update({
      collection: 'media',
      id,
      data: defined({
        alt: row.alt,
        credit: row.credit,
        license: row.license,
        consentStatus: row.consentStatus,
        consentEvidenceRef: row.consentEvidenceRef,
        containsMinors: row.containsMinors,
        takedownRequestedAt: asDate(row.takedownRequestedAt),
      }),
      depth: 0,
      context: { disableRevalidate: true },
    })
    applied += 1
  }
  payload.logger.info(`live media: ${applied} consent records applied`)
}

/** Real CMS articles become posts. The mock records were never seeded. */
const applyArticles = async (payload: Payload, dump: Dump, media: Map<string, number | string>) => {
  const rows = dump.tables.articles ?? []
  if (rows.length === 0) {
    payload.logger.info('live articles: none')
    return
  }

  const categories = await payload.find({
    collection: 'categories',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  const categoryIdBySlug = new Map(categories.docs.map((doc) => [doc.slug, doc.id]))

  for (const row of rows) {
    const category = categoryIdBySlug.get(row.category)
    const found = await payload.find({
      collection: 'posts',
      where: { slug: { equals: row.slug } },
      limit: 1,
      pagination: false,
      depth: 0,
    })

    const data = defined({
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: toLexical(row.body),
      heroImage: row.coverImageSrc ? (media.get(row.coverImageSrc) ?? null) : null,
      categories: category ? [category] : [],
      authorLabel: row.authorLabel,
      readingMinutes: row.readingMinutes,
      publishedAt: asDate(row.publishedAt),
      _status: toPayloadStatus(row.status),
    })

    // `disableRevalidate` matters here: the revalidate hooks call Next's
    // revalidatePath, which throws outside a request context.
    const common = { depth: 0, context: { disableRevalidate: true } } as const

    if (found.docs[0]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection: 'posts', id: found.docs[0].id, data: data as any, ...common })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.create({ collection: 'posts', data: data as any, ...common })
    }
  }
  payload.logger.info(`live articles: ${rows.length} applied as posts`)
}

const applySimpleTables = async (payload: Payload, dump: Dump, media: Map<string, number | string>) => {
  for (const row of dump.tables.downloads ?? []) {
    await upsert(payload, {
      collection: 'downloads',
      legacyId: row.id,
      data: defined({
        title: row.title,
        description: row.description,
        type: row.type,
        file: row.fileUrl ? (media.get(row.fileUrl) ?? null) : null,
        sizeLabel: row.sizeLabel,
        order: row.order,
        _status: toPayloadStatus(row.status),
      }),
    })
  }

  const activityPhotos = new Map<string, { url: string; order: number }[]>()
  for (const row of dump.tables.media ?? []) {
    if (!row.activityId) continue
    const existing = activityPhotos.get(row.activityId) ?? []
    existing.push({ url: row.url, order: row.order ?? 0 })
    activityPhotos.set(row.activityId, existing)
  }

  for (const row of dump.tables.activities ?? []) {
    const photos = (activityPhotos.get(row.id) ?? [])
      .sort((a, b) => a.order - b.order)
      .map((photo) => media.get(photo.url))
      .filter(Boolean)

    await upsert(payload, {
      collection: 'activities',
      legacyId: row.id,
      data: defined({
        title: row.title,
        dateLabel: row.dateLabel,
        place: row.place,
        participants: row.participants,
        summary: row.summary,
        outcomes: asList(row.outcomes),
        photos,
        order: row.order,
        _status: 'published',
      }),
    })
  }

  for (const row of dump.tables.indicators ?? []) {
    await upsert(payload, {
      collection: 'indicators',
      legacyId: row.id,
      data: defined({
        label: row.label,
        target: row.target,
        result: row.result,
        met: row.met,
        order: row.order,
      }),
    })
  }

  for (const row of dump.tables.partners ?? []) {
    await upsert(payload, {
      collection: 'partners',
      legacyId: row.id,
      data: defined({
        label: row.label,
        role: row.role,
        links: Array.isArray(row.links) ? row.links : [],
        order: row.order,
      }),
    })
  }

  for (const row of dump.tables.project_videos ?? []) {
    await upsert(payload, {
      collection: 'project-videos',
      legacyId: row.id,
      data: defined({
        title: row.title,
        description: row.description,
        youtubeId: row.youtubeId,
        channel: row.channel,
        order: row.order,
        _status: toPayloadStatus(row.status),
      }),
    })
  }

  payload.logger.info('live downloads / activities / indicators / partners / videos applied')
}

const applyGlobals = async (payload: Payload, dump: Dump) => {
  const facts = (dump.tables.project_facts ?? [])[0]
  if (facts) {
    await payload.updateGlobal({
      slug: 'project-facts',
      data: defined({
        nameTh: facts.nameTh,
        shortName: facts.shortName,
        nameEn: facts.nameEn,
        tagline: facts.tagline,
        owner: facts.owner,
        funder: facts.funder,
        period: facts.period,
        fiscalYear: facts.fiscalYear,
        strategy: facts.strategy,
        budgetTHB: facts.budgetTHB,
        budgetCode: facts.budgetCode,
        leads: asList(facts.leads),
        reportDate: facts.reportDate,
        objectives: asList(facts.objectives),
        recommendations: asList(facts.recommendations),
        bibliography: asList(facts.bibliography),
        safetyNotice: facts.safetyNotice,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
      depth: 0,
      context: { disableRevalidate: true },
    })
  }

  const settings = (dump.tables.site_settings ?? [])[0]
  if (settings) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: defined({
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        ownerUrl: settings.ownerUrl,
        ownerMapUrl: settings.ownerMapUrl,
        funderUrl: settings.funderUrl,
        developerLabel: settings.developerLabel,
        developerHref: settings.developerHref,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
      depth: 0,
      context: { disableRevalidate: true },
    })
  }

  const satisfaction = (dump.tables.satisfaction_summary ?? [])[0]
  if (satisfaction) {
    await payload.updateGlobal({
      slug: 'satisfaction-summary',
      data: defined({
        respondents: satisfaction.respondents,
        overallMean: satisfaction.overallMean,
        overallPercent: satisfaction.overallPercent,
        collectedAt: satisfaction.collectedAt,
        items: Array.isArray(satisfaction.items) ? satisfaction.items : [],
        profile: Array.isArray(satisfaction.profile) ? satisfaction.profile : [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
      depth: 0,
      context: { disableRevalidate: true },
    })
  }

  payload.logger.info('live globals applied')
}

const main = async () => {
  if (!fs.existsSync(dumpFile)) {
    throw new Error(
      `No dump at ${dumpFile}. Run "node scripts/chakthai-import/live-export.mjs" on a machine that can reach the old database.`,
    )
  }

  const dump = JSON.parse(fs.readFileSync(dumpFile, 'utf8')) as Dump
  const payload = await getPayload({ config })
  payload.logger.info(`applying live dump from ${dump.exportedAt}`)

  const media = await mediaMap(payload)
  await applyHerbs(payload, dump, media)
  await applyClaims(payload, dump)
  await applyMediaConsent(payload, dump, media)
  await applyArticles(payload, dump, media)
  await applySimpleTables(payload, dump, media)
  await applyGlobals(payload, dump)

  payload.logger.info('live diff applied')
  process.exit(0)
}

// `payload run` awaits the module's evaluation, so a top-level await is what
// keeps the process alive until the import finishes.
await main()
