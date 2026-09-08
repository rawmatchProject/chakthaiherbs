/**
 * Content model for the Chak Thai community herbarium.
 *
 * These shapes mirror what the printed guide and the project report actually
 * record, so the future backend can serve them without the frontend changing.
 * See docs/BACKEND-HANDOVER.md for the API contract.
 */

export type PublicationStatus = "draft" | "in_review" | "published" | "archived"

/** The five herb groups printed as posters in the project guide. */
export const herbGroups = [
  "health-promotion",
  "ncds",
  "mental-wellness",
  "food-as-medicine",
  "beauty-postpartum",
] as const

export type HerbGroup = (typeof herbGroups)[number]

export type SourceKind = "project-guide" | "project-report" | "community-wisdom" | "reference"

/**
 * Where a record's สรรพคุณ came from.
 *
 * "guide" is the project's own printed card — the text on the page is a
 * transcription of it. "external" is a stand-in looked up on the open web so
 * the reviewer has somewhere to start; it is labelled as provisional on screen
 * and must be replaced with the citation the reviewer actually accepts.
 */
export type HerbReference = {
  label: string
  url: string | null
  kind: "guide" | "external"
}

export type HowToUse = {
  /** Sub-heading on the card, e.g. ชาสมุนไพร or ตำรับพื้นบ้าน. Null when the card gives one unlabelled method. */
  title: string | null
  text: string
}

export type Claim = {
  text: string
  kind: "community_wisdom" | "reference" | "research"
  sourceRefs: string[]
  reviewStatus: "pending" | "reviewed" | "rejected"
  reviewedBy: string | null
  reviewedAt: string | null
}

export type Media = {
  id: string
  url: string
  alt: string
  credit: string | null
  license: string | null
  consentStatus: "unknown" | "granted" | "restricted" | "withdrawn"
  containsMinors: boolean
  takedownRequestedAt: string | null
}

export type Herb = {
  id: string
  slug: string
  /** Position in the printed guide; drives the ชท xx accession code. */
  accessionNo: number
  nameTh: string
  localNames: string[]
  commonNames: string[]
  scientificName: string
  family: string | null
  familyTh: string | null
  groups: HerbGroup[]

  ecology: string[]
  botany: string[]
  uses: string[]
  partsUsed: string | null
  properties: string[]
  howToUse: HowToUse[]
  cautions: string | null
  localWisdom: string | null
  phytochemicals: string[]
  /** ความสำคัญทางการแพทย์แผนไทย — or ความสำคัญต่อชุมชน / ทางการอนุรักษ์ on some cards. */
  significance: string | null
  tagline: string | null

  media: {
    /** Cropped plant photograph from the guide card. */
    thumb: string
    /** The full infographic card as printed in the guide. */
    card: string
    alt: string
  }

  source: { label: string; kind: SourceKind }
  /** Reading behind the สรรพคุณ. See HerbReference — the external ones are provisional. */
  references: HerbReference[]
  /** Set by the reviewer workflow once a botanist or Thai-medicine practitioner signs off. */
  reviewedBy: string | null
  reviewedAt: string | null
  status: PublicationStatus
  /** Present when the record came from the data layer; the public API requires it. */
  updatedAt?: string
}

export type GroupTableRow = {
  name: string
  properties: string
  preparation: string
}

export type GroupTable = {
  heading: string | null
  rows: GroupTableRow[]
}

export type GroupPanel = {
  title: string
  items: string[]
  note: string | null
}

export type HerbGroupRecord = {
  id: HerbGroup
  /** กลุ่มที่ 1–5, as printed. */
  number: number
  slug: string
  titleTh: string
  titleEn: string
  intro: string | null
  tables: GroupTable[]
  panels: GroupPanel[]
  cautions: string[]
  footer: string | null
  poster: string
  updatedAt?: string
}

export type ArticleCategory = "news" | "knowledge" | "announcement"

export type ArticleTextNode = {
  type?: "text" | "link"
  text?: string
  url?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  children?: ArticleTextNode[]
}

export type ArticleBlock = {
  type: "paragraph" | "heading" | "list" | "list-item" | "quote" | string
  level?: number
  format?: "ordered" | "unordered"
  children?: ArticleTextNode[] | ArticleBlock[]
}

export type ArticleBody = ArticleBlock[] | string

export type Article = {
  id: string
  slug: string
  category: ArticleCategory
  title: string
  excerpt: string
  coverImage?: { src: string; alt: string }
  publishedAt?: string
  updatedAt?: string
  authorLabel?: string
  readingMinutes?: number
  body?: ArticleBody | null
  status: PublicationStatus
  /**
   * True for the placeholder records that show the backend team what an
   * article looks like on the page. The UI labels these on screen so a
   * visitor can never mistake one for a real project announcement, and the
   * backend must not migrate them into the CMS.
   */
  isMock?: boolean
}

export type DownloadItem = {
  id: string
  title: string
  description: string
  type: "guide" | "report" | "poster" | "infographic" | "research" | "presentation" | "form"
  /** Null until the backend hosts the file; the UI shows it as “กำลังจัดเตรียม”. */
  fileUrl: string | null
  sizeLabel: string | null
  status: PublicationStatus
  updatedAt?: string
}
