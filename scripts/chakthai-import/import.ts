/**
 * Imports the frozen charkthai content into Payload.
 *
 *   pnpm generate:types            # once, after any schema change
 *   pnpm import:chakthai           # reads ../charkthai/prisma/seed-source
 *
 * Every write is an upsert keyed on `legacyId` (or `legacyPath` for media), so
 * the script is safe to re-run: it updates what it wrote before rather than
 * duplicating it, and it never resets an editor's review or consent decisions.
 *
 * Ported from charkthai/prisma/seed.ts. Mock articles are deliberately not
 * imported — see prisma/seed-source/news.ts and BACKEND-HANDOVER §3.4.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'

import { importMedia, type MediaMap } from './media'
import { list, toPayloadStatus, upsert } from './shared'
import { loadSeedSource, sourceRoot } from './source'
import type { SeedHerb, SeedSource } from './types'

/**
 * The two references every herb card carries: the printed guide it was
 * transcribed from, and a PubMed search as a provisional starting point for
 * whoever reviews the สรรพคุณ. Ported verbatim from seed.ts.
 */
const herbReferences = (herb: SeedHerb) => [
  { label: herb.source.label, url: null, kind: 'guide' as const },
  {
    label: `ผลการค้นงานวิจัย PubMed: ${herb.scientificName}`,
    url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(herb.scientificName)}`,
    kind: 'external' as const,
  },
]

const importGroups = async (payload: Payload, source: SeedSource, media: MediaMap) => {
  const idBySlug = new Map<string, number | string>()

  for (const group of source.herbGroupRecords) {
    const doc = await upsert(payload, {
      collection: 'herb-groups',
      legacyId: group.id,
      data: {
        slug: group.slug,
        number: group.number,
        titleTh: group.titleTh,
        titleEn: group.titleEn,
        intro: group.intro,
        tables: group.tables.map((table) => ({
          heading: table.heading,
          rows: table.rows.map((row) => ({ ...row })),
        })),
        panels: group.panels.map((panel) => ({
          title: panel.title,
          items: list(panel.items),
          note: panel.note,
        })),
        cautions: list(group.cautions),
        footer: group.footer,
        poster: media.get(group.poster) ?? null,
      },
    })
    idBySlug.set(group.slug, doc.id)
  }

  payload.logger.info(`herb-groups: ${idBySlug.size} imported`)
  return idBySlug
}

const importHerbs = async (
  payload: Payload,
  source: SeedSource,
  media: MediaMap,
  groupIdBySlug: Map<string, number | string>,
) => {
  let claimCount = 0
  let herbCount = 0

  for (const herb of source.herbs) {
    const startedAt = Date.now()
    payload.logger.info(`herbs: ${herbCount + 1}/${source.herbs.length} importing ${herb.slug}`)
    const doc = await upsert(payload, {
      collection: 'herbs',
      legacyId: herb.id,
      data: {
        slug: herb.slug,
        accessionNo: herb.accessionNo,
        nameTh: herb.nameTh,
        localNames: list(herb.localNames),
        commonNames: list(herb.commonNames),
        scientificName: herb.scientificName,
        family: herb.family,
        familyTh: herb.familyTh,
        ecology: list(herb.ecology),
        botany: list(herb.botany),
        uses: list(herb.uses),
        partsUsed: herb.partsUsed,
        properties: list(herb.properties),
        howToUse: herb.howToUse.map((method) => ({ title: method.title, text: method.text })),
        cautions: herb.cautions,
        localWisdom: herb.localWisdom,
        phytochemicals: list(herb.phytochemicals),
        significance: herb.significance,
        tagline: herb.tagline,
        media: {
          thumb: media.get(herb.media.thumb) ?? null,
          card: media.get(herb.media.card) ?? null,
          alt: herb.media.alt,
        },
        source: { label: herb.source.label, kind: herb.source.kind },
        references: herbReferences(herb),
        groupMemberships: herb.groups
          .map((slug) => groupIdBySlug.get(slug))
          .filter(Boolean)
          .map((group) => ({ group })),
        reviewedBy: herb.reviewedBy,
        reviewedAt: herb.reviewedAt,
        editorialStatus: herb.status,
        _status: toPayloadStatus(herb.status),
      },
    })

    claimCount += await importClaims(payload, herb, doc.id)
    herbCount += 1
    payload.logger.info(
      `herbs: ${herbCount}/${source.herbs.length} complete, ${claimCount} claims (${Math.round((Date.now() - startedAt) / 1000)}s)`,
    )
  }

  payload.logger.info(`herbs: ${source.herbs.length} imported, ${claimCount} claims`)
}

/**
 * Each สรรพคุณ line, วิธีใช้ method and ข้อควรระวัง becomes a reviewable claim,
 * exactly as the old seed split them. Review state is set on create only — a
 * re-run must never send an accepted claim back to `pending`.
 */
const importClaims = async (payload: Payload, herb: SeedHerb, herbId: number | string) => {
  const claims: { legacyId: string; section: string; title?: string | null; text: string; position: number }[] = []

  herb.properties.forEach((text, index) => {
    claims.push({
      legacyId: `${herb.id}-property-${index + 1}`,
      section: 'property',
      text,
      position: index,
    })
  })
  herb.howToUse.forEach((method, index) => {
    claims.push({
      legacyId: `${herb.id}-how-to-use-${index + 1}`,
      section: 'how_to_use',
      title: method.title,
      text: method.text,
      position: index,
    })
  })
  if (herb.cautions) {
    claims.push({
      legacyId: `${herb.id}-caution-1`,
      section: 'caution',
      text: herb.cautions,
      position: 0,
    })
  }

  for (const claim of claims) {
    await upsert(payload, {
      collection: 'herb-claims',
      legacyId: claim.legacyId,
      data: {
        herb: herbId,
        section: claim.section,
        title: claim.title ?? null,
        text: claim.text,
        position: claim.position,
      },
      createOnly: {
        kind: 'community_wisdom',
        sourceRefs: list(['project-guide']),
        reviewStatus: 'pending',
      },
    })
  }

  return claims.length
}

const importDownloads = async (payload: Payload, source: SeedSource, media: MediaMap) => {
  for (const [order, download] of source.downloads.entries()) {
    const file = download.fileUrl ? (media.get(download.fileUrl) ?? null) : null
    if (download.fileUrl && !file) {
      payload.logger.warn(
        `download "${download.id}": ${download.fileUrl} is not in the media library; left unattached`,
      )
    }

    await upsert(payload, {
      collection: 'downloads',
      legacyId: download.id,
      data: {
        title: download.title,
        description: download.description,
        type: download.type,
        file,
        sizeLabel: download.sizeLabel,
        order,
        _status: toPayloadStatus(download.status),
      },
    })
  }
  payload.logger.info(`downloads: ${source.downloads.length} imported`)
}

const importActivities = async (payload: Payload, source: SeedSource, media: MediaMap) => {
  for (const activity of source.activities) {
    const photos = activity.photos
      .map((photo) => media.get(`/media/activities/${photo}.webp`))
      .filter(Boolean)

    await upsert(payload, {
      collection: 'activities',
      legacyId: activity.id,
      data: {
        title: activity.title,
        dateLabel: activity.dateLabel,
        place: activity.place,
        participants: activity.participants,
        summary: activity.summary,
        outcomes: list(activity.outcomes),
        photos,
        order: activity.order,
        _status: 'published',
      },
    })
  }
  payload.logger.info(`activities: ${source.activities.length} imported`)
}

const importProjectRecords = async (payload: Payload, source: SeedSource) => {
  for (const [order, indicator] of source.indicators.entries()) {
    await upsert(payload, {
      collection: 'indicators',
      legacyId: `indicator-${order + 1}`,
      data: { ...indicator, order },
    })
  }

  for (const [order, partner] of source.partners.entries()) {
    await upsert(payload, {
      collection: 'partners',
      legacyId: `partner-${order + 1}`,
      data: {
        label: partner.label,
        role: partner.role,
        links: partner.links.map((link) => ({ ...link })),
        order,
      },
    })
  }

  for (const [order, video] of source.videos.entries()) {
    await upsert(payload, {
      collection: 'project-videos',
      legacyId: video.id,
      data: {
        title: video.title,
        description: video.description,
        youtubeId: video.youtubeId,
        channel: video.channel,
        order,
        _status: 'published',
      },
    })
  }

  payload.logger.info(
    `project: ${source.indicators.length} indicators, ${source.partners.length} partners, ${source.videos.length} videos`,
  )
}

const importGlobals = async (payload: Payload, source: SeedSource) => {
  const { project, developer, satisfaction } = source

  await payload.updateGlobal({
    slug: 'project-facts',
    data: {
      nameTh: project.nameTh,
      shortName: project.shortName,
      nameEn: project.nameEn,
      tagline: project.tagline,
      owner: project.owner,
      funder: project.funder,
      period: project.period,
      fiscalYear: project.fiscalYear,
      strategy: project.strategy,
      budgetTHB: project.budgetTHB,
      budgetCode: project.budgetCode,
      leads: list([...project.leads]),
      reportDate: project.reportDate,
      objectives: list(source.objectives),
      recommendations: list(source.recommendations),
      bibliography: list(source.bibliography),
      safetyNotice: source.safetyNotice,
    },
    depth: 0,
    context: { disableRevalidate: true },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      ownerUrl: project.ownerUrl,
      ownerMapUrl: project.ownerMapUrl,
      funderUrl: project.funderUrl,
      developerLabel: developer.label,
      developerHref: developer.href,
    },
    depth: 0,
    context: { disableRevalidate: true },
  })

  await payload.updateGlobal({
    slug: 'satisfaction-summary',
    data: {
      respondents: satisfaction.respondents,
      overallMean: satisfaction.overallMean,
      overallPercent: satisfaction.overallPercent,
      collectedAt: satisfaction.collectedAt,
      items: satisfaction.items.map((item) => ({ ...item })),
      profile: satisfaction.profile.map((row) => ({ ...row })),
    },
    depth: 0,
    context: { disableRevalidate: true },
  })

  payload.logger.info('globals: project-facts, site-settings, satisfaction-summary updated')
}

/** The three article categories the old ArticleCategory enum carried. */
const ensureCategories = async (payload: Payload) => {
  const categories = [
    { slug: 'news', title: 'ข่าวกิจกรรม' },
    { slug: 'knowledge', title: 'ความรู้' },
    { slug: 'announcement', title: 'ประกาศ' },
  ]

  for (const category of categories) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    if (found.docs.length === 0) {
      await payload.create({ collection: 'categories', data: category, depth: 0 })
    }
  }
  payload.logger.info('categories: news / knowledge / announcement ready')
}

const main = async () => {
  const payload = await getPayload({ config })

  payload.logger.info(`importing from ${sourceRoot}`)
  const source = await loadSeedSource()

  const media = await importMedia(payload, source)
  const groupIdBySlug = await importGroups(payload, source, media)
  await importHerbs(payload, source, media, groupIdBySlug)
  await importDownloads(payload, source, media)
  await importActivities(payload, source, media)
  await importProjectRecords(payload, source)
  await importGlobals(payload, source)
  await ensureCategories(payload)

  payload.logger.info('import complete. Mock articles were skipped by design.')
  process.exit(0)
}

// `payload run` awaits the module's evaluation, so a top-level await is what
// keeps the process alive until the import finishes.
await main()
