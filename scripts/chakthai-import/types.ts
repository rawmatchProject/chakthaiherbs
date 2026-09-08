/**
 * Shapes of the frozen content modules in charkthai/prisma/seed-source/.
 * Declared here rather than imported so this repo does not take a type
 * dependency on the old one — the source repo can be deleted after migration.
 */

export type HowToUse = { title: string | null; text: string }

export type SeedHerb = {
  id: string
  slug: string
  accessionNo: number
  nameTh: string
  localNames: string[]
  commonNames: string[]
  scientificName: string
  family: string | null
  familyTh: string | null
  groups: string[]
  ecology: string[]
  botany: string[]
  uses: string[]
  partsUsed: string | null
  properties: string[]
  howToUse: HowToUse[]
  cautions: string | null
  localWisdom: string | null
  phytochemicals: string[]
  significance: string | null
  tagline: string | null
  media: { thumb: string; card: string; alt: string }
  source: { label: string; kind: string }
  reviewedBy: string | null
  reviewedAt: string | null
  status: string
}

export type SeedGroupRow = { name: string; properties: string; preparation: string }
export type SeedGroupTable = { heading: string | null; rows: SeedGroupRow[] }
export type SeedGroupPanel = { title: string; items: string[]; note: string | null }

export type SeedGroup = {
  id: string
  number: number
  slug: string
  titleTh: string
  titleEn: string
  intro: string | null
  tables: SeedGroupTable[]
  panels: SeedGroupPanel[]
  cautions: string[]
  footer: string | null
  poster: string
}

export type SeedDownload = {
  id: string
  title: string
  description: string
  type: string
  fileUrl: string | null
  sizeLabel: string | null
  status: string
}

export type SeedActivity = {
  id: string
  order: number
  title: string
  dateLabel: string
  place: string
  participants: number
  summary: string
  outcomes: string[]
  photos: string[]
}

export type SeedPartner = {
  label: string
  role: string
  links: { kind: string; href: string }[]
}

export type SeedVideo = {
  id: string
  title: string
  description: string
  youtubeId: string
  channel: string
}

export type SeedProject = {
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
  leads: readonly string[]
  reportDate: string
}

export type SeedSatisfaction = {
  respondents: number
  overallMean: number
  overallPercent: number
  collectedAt: string
  items: { label: string; mean: number }[]
  profile: { label: string; percent: number }[]
}

export type SeedSource = {
  herbs: SeedHerb[]
  herbGroupRecords: SeedGroup[]
  downloads: SeedDownload[]
  project: SeedProject
  objectives: string[]
  activities: SeedActivity[]
  indicators: { label: string; target: string; result: string; met: boolean }[]
  satisfaction: SeedSatisfaction
  recommendations: string[]
  partners: SeedPartner[]
  developer: { label: string; href: string }
  videos: SeedVideo[]
  bibliography: string[]
  safetyNotice: string
}
