import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

/**
 * The data layer for the public site.
 *
 * Every module in `src/content` keeps the exact function signatures the
 * pre-migration site had (`getPublishedHerbs`, `getProject`, …) and the shapes
 * in `content/types.ts`. Only the implementation changed — Prisma queries
 * became Payload local-API reads — so the components and routes above this
 * layer did not have to change with the backend.
 */
export const getPayloadClient = async (): Promise<Payload> => getPayload({ config: configPromise })

/** Payload has no text[]; array-of-{value} rows flatten back to string[] here. */
export const textValues = (rows?: { value: string }[] | null): string[] =>
  (rows ?? []).map((row) => row.value)

type UploadValue = number | string | { url?: string | null; alt?: string | null } | null | undefined

/** An upload field is either an ID (depth 0) or the populated media document. */
export const mediaUrl = (value: UploadValue): string =>
  typeof value === 'object' && value !== null && typeof value.url === 'string' ? value.url : ''

export const mediaAlt = (value: UploadValue): string =>
  typeof value === 'object' && value !== null && typeof value.alt === 'string' ? value.alt : ''

/** Nothing unpublished may leave this layer. */
export const publishedOnly = { _status: { equals: 'published' } } as const
