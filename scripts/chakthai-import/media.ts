import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { sourcePublicDir } from './source'
import type { SeedSource } from './types'

export type MediaMap = Map<string, number | string>

type Planned = {
  /** Public path on the old site, e.g. /media/herbs/card-01.webp */
  legacyPath: string
  absPath: string
  alt: string
  consentStatus: 'unknown' | 'granted'
  containsMinors: boolean
}

const walk = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.isFile() ? [full] : []
  })
}

const toLegacyPath = (absPath: string): string =>
  '/' + path.relative(sourcePublicDir, absPath).split(path.sep).join('/')

/**
 * Plans every file under the old site's public/media, with the alt text and the
 * consent posture each one should carry.
 *
 * Consent follows the old database, deliberately: only the scans of the
 * project's own printed material start as `granted`. Field photographs stay
 * `unknown` until an editor records consent, and the activity photos keep the
 * `containsMinors` flag the old seed set — so nothing appears in a public
 * gallery on the strength of this import alone.
 */
const planMedia = (source: SeedSource): Planned[] => {
  const altByPath = new Map<string, string>()

  for (const herb of source.herbs) {
    altByPath.set(herb.media.thumb, herb.media.alt)
    altByPath.set(herb.media.card, herb.media.alt)
  }
  for (const group of source.herbGroupRecords) {
    altByPath.set(group.poster, `โปสเตอร์${group.titleTh}`)
  }

  const activityPhotos = new Map<string, string>()
  for (const activity of source.activities) {
    for (const photo of activity.photos) {
      activityPhotos.set(`/media/activities/${photo}.webp`, `ภาพกิจกรรม${activity.title}`)
    }
  }

  return walk(path.join(sourcePublicDir, 'media'))
    .filter((absPath) => !toLegacyPath(absPath).startsWith('/media/site/'))
    .map((absPath) => {
      const legacyPath = toLegacyPath(absPath)
      const isActivity = legacyPath.startsWith('/media/activities/')
      const isGuideArtwork =
        legacyPath.startsWith('/media/herbs/') ||
        legacyPath.startsWith('/media/groups/') ||
        legacyPath === '/media/guide-cover.webp'

      return {
        legacyPath,
        absPath,
        alt:
          altByPath.get(legacyPath) ??
          activityPhotos.get(legacyPath) ??
          path.basename(legacyPath, path.extname(legacyPath)),
        consentStatus: isGuideArtwork ? 'granted' : 'unknown',
        containsMinors: isActivity,
      }
    })
}

/**
 * Uploads the old site's media into the `media` collection and returns a
 * legacy-path → document-ID map for the rest of the import.
 *
 * Keyed on `legacyPath`, so a second run adopts what is already there instead
 * of uploading duplicates.
 */
export const importMedia = async (payload: Payload, source: SeedSource): Promise<MediaMap> => {
  const planned = planMedia(source)
  const map: MediaMap = new Map()

  const existing = await payload.find({
    collection: 'media',
    where: { legacyPath: { exists: true } },
    limit: 0,
    pagination: false,
    depth: 0,
  })
  for (const doc of existing.docs) {
    if (doc.legacyPath) map.set(doc.legacyPath, doc.id)
  }

  let uploaded = 0
  for (const item of planned) {
    if (map.has(item.legacyPath)) continue
    if (!fs.existsSync(item.absPath)) {
      payload.logger.warn(`media missing on disk, skipped: ${item.absPath}`)
      continue
    }

    const doc = await payload.create({
      collection: 'media',
      filePath: item.absPath,
      data: {
        alt: item.alt,
        legacyPath: item.legacyPath,
        consentStatus: item.consentStatus,
        containsMinors: item.containsMinors,
      },
      context: { disableRevalidate: true },
    })
    map.set(item.legacyPath, doc.id)
    uploaded += 1
  }

  payload.logger.info(
    `media: ${uploaded} uploaded, ${map.size - uploaded} already present, ${map.size} mapped`,
  )
  return map
}
