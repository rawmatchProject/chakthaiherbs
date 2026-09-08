/**
 * Post-import parity check.
 *
 *   pnpm import:chakthai:verify
 *
 * Compares what landed in Payload against the frozen source, and checks the
 * things that silently go wrong in a migration: unresolved image references,
 * herbs that lost their group links, empty globals.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'

import { loadSeedSource } from './source'

const problems: string[] = []

const check = (label: string, actual: number, expected: number) => {
  const ok = actual === expected
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(28)} ${actual} / ${expected}`)
  if (!ok) problems.push(`${label}: expected ${expected}, found ${actual}`)
}

const count = async (payload: Payload, collection: string) => {
  const result = await payload.count({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: collection as any,
  })
  return result.totalDocs
}

const main = async () => {
  const payload = await getPayload({ config })
  const source = await loadSeedSource()

  const expectedClaims = source.herbs.reduce(
    (total, herb) =>
      total + herb.properties.length + herb.howToUse.length + (herb.cautions ? 1 : 0),
    0,
  )

  check('herbs', await count(payload, 'herbs'), source.herbs.length)
  check('herb-groups', await count(payload, 'herb-groups'), source.herbGroupRecords.length)
  check('herb-claims', await count(payload, 'herb-claims'), expectedClaims)
  check('downloads', await count(payload, 'downloads'), source.downloads.length)
  check('activities', await count(payload, 'activities'), source.activities.length)
  check('indicators', await count(payload, 'indicators'), source.indicators.length)
  check('partners', await count(payload, 'partners'), source.partners.length)
  check('project-videos', await count(payload, 'project-videos'), source.videos.length)

  // Every herb must carry both images and its group links.
  const herbs = await payload.find({ collection: 'herbs', limit: 0, pagination: false, depth: 0 })
  const missingImages = herbs.docs.filter((herb) => !herb.media?.thumb || !herb.media?.card)
  const expectedMemberships = source.herbs.reduce((total, herb) => total + herb.groups.length, 0)
  const actualMemberships = herbs.docs.reduce(
    (total, herb) => total + (herb.groupMemberships?.length ?? 0),
    0,
  )

  check('herbs with both images', herbs.docs.length - missingImages.length, herbs.docs.length)
  check('group memberships', actualMemberships, expectedMemberships)
  for (const herb of missingImages) {
    problems.push(`herb ${herb.slug}: missing thumb or card image`)
  }

  const groups = await payload.find({
    collection: 'herb-groups',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  check(
    'groups with a poster',
    groups.docs.filter((group) => group.poster).length,
    groups.docs.length,
  )

  const facts = await payload.findGlobal({ slug: 'project-facts', depth: 0 })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const satisfaction = await payload.findGlobal({ slug: 'satisfaction-summary', depth: 0 })

  if (!facts?.nameTh) problems.push('project-facts global is empty')
  if (!settings?.ownerUrl) problems.push('site-settings global is empty')
  if (!satisfaction?.respondents) problems.push('satisfaction-summary global is empty')

  console.log('')
  if (problems.length > 0) {
    console.error(`${problems.length} problem(s):`)
    for (const problem of problems) console.error(`  - ${problem}`)
    process.exit(1)
  }

  console.log('import verified')
  process.exit(0)
}

// `payload run` awaits the module's evaluation, so a top-level await is what
// keeps the process alive until the import finishes.
await main()
