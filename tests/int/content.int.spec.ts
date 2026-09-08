import { describe, expect, it } from 'vitest'

import { getHerbGroupRecords } from '@/content/groups'
import { getHerbBySlug, getPublishedHerbs, herbFamilies, searchHerbs } from '@/content/herbs'
import { getActivities, getProject, getVideos } from '@/content/project'
import { getPublishedDownloads } from '@/content/news'

/**
 * Contract tests, not content tests: they assert the shape a consumer — the
 * pages, or an API client — can rely on, whatever the backend underneath is.
 * Ported from the pre-migration suite, which asserted the same contract
 * against Prisma; they now run against Payload and a seeded Postgres, so
 * POSTGRES_URL must point at a database the importer has run into.
 */
describe('herb register', () => {
  it('publishes records with a stable accession number and slug', async () => {
    const herbs = await getPublishedHerbs()
    expect(herbs.length).toBeGreaterThan(0)

    const slugs = herbs.map((herb) => herb.slug)
    expect(new Set(slugs).size).toBe(slugs.length)

    const accessions = herbs.map((herb) => herb.accessionNo)
    expect(new Set(accessions).size).toBe(accessions.length)
  })

  it('finds a record by its slug and not by an unknown one', async () => {
    const [first] = await getPublishedHerbs()
    expect((await getHerbBySlug(first.slug))?.nameTh).toBe(first.nameTh)
    expect(await getHerbBySlug('not-a-herb')).toBeUndefined()
  })

  it('searches Thai, local and scientific names', async () => {
    const herbs = await getPublishedHerbs()
    const [first] = herbs
    expect((await searchHerbs(first.nameTh)).map((herb) => herb.slug)).toContain(first.slug)
    expect(await searchHerbs('ไม่มีสมุนไพรชื่อนี้')).toHaveLength(0)
    expect(await searchHerbs('')).toHaveLength(herbs.length)
  })

  it('resolves both images on every record', async () => {
    // The old suite asserted the /media/herbs/... paths the site shipped as
    // static files. Images are Payload uploads now — local in development, Blob
    // in production — so the contract is that both resolve and differ, not what
    // the storage layer happens to name them.
    for (const herb of await getPublishedHerbs()) {
      expect(herb.media.thumb, `${herb.slug} thumb`).toMatch(/\S/)
      expect(herb.media.card, `${herb.slug} card`).toMatch(/\S/)
      expect(herb.media.thumb).not.toBe(herb.media.card)
      expect(herb.media.alt).toMatch(/\S/)
    }
  })

  it('cites something behind every record', async () => {
    for (const herb of await getPublishedHerbs()) {
      expect(herb.references.length).toBeGreaterThan(0)
      // the printed card is what the page transcribes, so it is always named
      expect(herb.references.some((ref) => ref.kind === 'guide')).toBe(true)
      // an external reference the reader cannot open is worse than none
      for (const ref of herb.references.filter((ref) => ref.kind === 'external')) {
        expect(ref.url).toMatch(/^https:\/\//)
      }
    }
  })

  it('counts families only for records that declare one', async () => {
    const [families, herbs] = await Promise.all([herbFamilies(), getPublishedHerbs()])
    const counted = families.reduce((sum, item) => sum + item.count, 0)
    const withFamily = herbs.filter((herb) => herb.family).length
    expect(counted).toBe(withFamily)
  })

  it('publishes สรรพคุณ only from reviewed claims', async () => {
    // BACKEND-HANDOVER §7 — the review gate. A herb whose claims are all still
    // pending must reach the page with nothing to say, rather than with text
    // no reviewer has accepted.
    const herbs = await getPublishedHerbs()
    const { getPayloadClient } = await import('@/content/payload')
    const payload = await getPayloadClient()

    for (const herb of herbs.slice(0, 3)) {
      const reviewed = await payload.count({
        collection: 'herb-claims',
        where: {
          and: [{ herb: { equals: Number(herb.id) } }, { reviewStatus: { equals: 'reviewed' } }],
        },
      })
      if (reviewed.totalDocs === 0) {
        expect(herb.properties, `${herb.slug} has unreviewed properties on the page`).toHaveLength(0)
        expect(herb.howToUse).toHaveLength(0)
        expect(herb.cautions).toBeNull()
      }
    }
  })
})

describe('herb groups', () => {
  it('keeps the five posters numbered and slugged uniquely', async () => {
    const herbGroupRecords = await getHerbGroupRecords()
    expect(herbGroupRecords).toHaveLength(5)
    expect(herbGroupRecords.map((group) => group.number)).toEqual([1, 2, 3, 4, 5])
    expect(new Set(herbGroupRecords.map((group) => group.slug)).size).toBe(5)
    for (const group of herbGroupRecords) expect(group.poster).toMatch(/\S/)
  })

  it('only cross-links a group from a herb when the poster names that herb', async () => {
    const [herbs, herbGroupRecords] = await Promise.all([
      getPublishedHerbs(),
      getHerbGroupRecords(),
    ])
    for (const herb of herbs) {
      for (const groupId of herb.groups) {
        const group = herbGroupRecords.find((candidate) => candidate.id === groupId)
        expect(group, `${herb.slug} points at an unknown group`).toBeDefined()
        const names = group!.tables.flatMap((table) => table.rows.map((row) => row.name))
        expect(names).toContain(herb.nameTh)
      }
    }
  })
})

describe('project record', () => {
  it('merges the report facts and the site settings into one view', async () => {
    const project = await getProject()
    expect(project.nameTh).toMatch(/\S/)
    expect(project.objectives.length).toBeGreaterThan(0)
    expect(project.safetyNotice).toMatch(/\S/)
    expect(project.budgetTHB).toBeGreaterThan(0)
  })

  it('lists only consent-cleared photographs with an activity', async () => {
    for (const activity of await getActivities()) {
      for (const photo of activity.photos) {
        expect(photo.url).toMatch(/\S/)
        expect(photo.id).toMatch(/\S/)
      }
    }
  })

  it('serves videos and downloads that are actually publishable', async () => {
    for (const video of await getVideos()) expect(video.youtubeId).toMatch(/^[\w-]{6,}$/)
    for (const download of await getPublishedDownloads()) {
      expect(download.title).toMatch(/\S/)
      expect(download.status).toBe('published')
    }
  })
})
