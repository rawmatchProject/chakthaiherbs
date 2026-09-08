import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

import type { SeedSource } from './types'

/**
 * Location of the old repository. Defaults to a sibling checkout, which is how
 * the two live on the project machine (D:\Mcacc_project\chakthaiproject\...).
 */
export const sourceRoot = path.resolve(process.env.CHAKTHAI_SOURCE ?? '../charkthai')

export const seedSourceDir = path.join(sourceRoot, 'prisma', 'seed-source')
export const sourcePublicDir = path.join(sourceRoot, 'public')

const load = async (file: string): Promise<Record<string, unknown>> =>
  (await import(pathToFileURL(path.join(seedSourceDir, file)).href)) as Record<string, unknown>

/**
 * Reads the four frozen content modules straight out of the old repo. They are
 * plain TypeScript data with only type-level imports, so they load as-is under
 * `payload run` without touching Prisma.
 */
export const loadSeedSource = async (): Promise<SeedSource> => {
  if (!fs.existsSync(seedSourceDir)) {
    throw new Error(
      `Cannot find ${seedSourceDir}. Point CHAKTHAI_SOURCE at the charkthai checkout, e.g. ` +
        `CHAKTHAI_SOURCE=../charkthai pnpm import:chakthai`,
    )
  }

  const [herbsMod, groupsMod, newsMod, projectMod] = await Promise.all([
    load('herbs.ts'),
    load('groups.ts'),
    load('news.ts'),
    load('project.ts'),
  ])

  return {
    herbs: herbsMod.herbs,
    herbGroupRecords: groupsMod.herbGroupRecords,
    downloads: newsMod.downloads,
    project: projectMod.project,
    objectives: projectMod.objectives,
    activities: projectMod.activities,
    indicators: projectMod.indicators,
    satisfaction: projectMod.satisfaction,
    recommendations: projectMod.recommendations,
    partners: projectMod.partners,
    developer: projectMod.developer,
    videos: projectMod.videos,
    bibliography: projectMod.bibliography,
    safetyNotice: projectMod.safetyNotice,
  } as SeedSource
}
