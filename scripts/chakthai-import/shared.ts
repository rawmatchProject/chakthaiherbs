import type { Payload } from 'payload'

/** string[] → Payload's array-of-{value} shape. */
export const list = (values: readonly (string | null | undefined)[] = []) =>
  values.filter((v): v is string => Boolean(v)).map((value) => ({ value }))

/** The old four-state status; only `published` is publicly visible. */
export const toPayloadStatus = (status?: string | null): 'published' | 'draft' =>
  status === 'published' ? 'published' : 'draft'

export type UpsertArgs = {
  collection: string
  legacyId: string
  data: Record<string, unknown>
  /** Fields written only when the document is first created. */
  createOnly?: Record<string, unknown>
}

/**
 * Upsert keyed on `legacyId` — the record's primary key in the old database.
 * Every write in this folder goes through here, which is what makes both the
 * import and the live diff safe to re-run.
 */
export const upsert = async (
  payload: Payload,
  { collection, legacyId, data, createOnly }: UpsertArgs,
) => {
  const found = await payload.find({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: collection as any,
    where: { legacyId: { equals: legacyId } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const existing = found.docs[0]
  const common = { depth: 0, context: { disableRevalidate: true } } as const

  if (existing) {
    return payload.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: collection as any,
      id: existing.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...data, legacyId } as any,
      ...common,
    })
  }

  return payload.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: collection as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...createOnly, ...data, legacyId } as any,
    ...common,
  })
}

/** Drops keys whose value is `undefined`, so a partial update stays partial. */
export const defined = <T extends Record<string, unknown>>(input: T): Partial<T> =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>
