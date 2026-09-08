import type { GroupPanel, GroupTable, HerbGroup, HerbGroupRecord } from '@/content/types'
import { getPayloadClient, mediaUrl, textValues } from '@/content/payload'
import type { HerbGroup as GroupDoc } from '@/payload-types'

const toRecord = (row: GroupDoc): HerbGroupRecord => ({
  id: (row.slug ?? '') as HerbGroup,
  number: row.number,
  slug: row.slug ?? '',
  titleTh: row.titleTh,
  titleEn: row.titleEn,
  intro: row.intro ?? null,
  tables: (row.tables ?? []).map(
    (table): GroupTable => ({
      heading: table.heading ?? null,
      rows: (table.rows ?? []).map((entry) => ({
        name: entry.name,
        properties: entry.properties,
        preparation: entry.preparation,
      })),
    }),
  ),
  panels: (row.panels ?? []).map(
    (panel): GroupPanel => ({
      title: panel.title,
      items: textValues(panel.items),
      note: panel.note ?? null,
    }),
  ),
  cautions: textValues(row.cautions),
  footer: row.footer ?? null,
  poster: mediaUrl(row.poster),
  updatedAt: row.updatedAt,
})

export async function getHerbGroupRecords(): Promise<HerbGroupRecord[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'herb-groups',
    sort: 'number',
    limit: 0,
    pagination: false,
    depth: 1,
  })
  return docs.map(toRecord)
}

export async function getGroupBySlug(slug: string): Promise<HerbGroupRecord | undefined> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'herb-groups',
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 1,
  })
  return docs[0] ? toRecord(docs[0]) : undefined
}

/** Poster names are the only per-group count that doesn't need a second query. */
export function groupHerbCount(group: HerbGroupRecord): number {
  return new Set(group.tables.flatMap((table) => table.rows.map((row) => row.name))).size
}
