import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

/**
 * On-demand revalidation for the herbarium's own collections.
 *
 * Most of the site is statically generated, so an edit in the admin only
 * reaches a visitor once the pages it appears on are revalidated. This replaces
 * the pre-migration `/api/revalidate` endpoint and the Strapi webhook that
 * called it: Payload knows what changed, so nothing external has to be told.
 *
 * `context.disableRevalidate` is honoured throughout — the content importer
 * sets it, because `revalidatePath` throws outside a request context.
 */
type Doc = Record<string, unknown> & { id: number | string }

const flush = (req: PayloadRequest, paths: string[]) => {
  for (const path of new Set(paths)) {
    req.payload.logger.info(`Revalidating ${path}`)
    revalidatePath(path)
  }
}

/** Every page shows the header and the footer, so global edits redo the layout. */
export const revalidateLayout = (req: PayloadRequest) => {
  req.payload.logger.info('Revalidating the site layout')
  revalidatePath('/', 'layout')
}

export const revalidateCollection = (
  getPaths: (doc: Doc) => string[],
): {
  afterChange: CollectionAfterChangeHook[]
  afterDelete: CollectionAfterDeleteHook[]
} => ({
  afterChange: [
    ({ doc, previousDoc, req, context }) => {
      if (context?.disableRevalidate) return doc
      // A rename leaves the old URL behind; revalidate both.
      flush(req, [...getPaths(doc as Doc), ...(previousDoc ? getPaths(previousDoc as Doc) : [])])
      return doc
    },
  ],
  afterDelete: [
    ({ doc, req, context }) => {
      if (context?.disableRevalidate) return doc
      flush(req, getPaths(doc as Doc))
      return doc
    },
  ],
})

export const revalidateGlobalPaths =
  (paths: string[]): GlobalAfterChangeHook =>
  ({ doc, req, context }) => {
    if (context?.disableRevalidate) return doc
    if (paths.length === 0) revalidateLayout(req)
    else flush(req, paths)
    return doc
  }

/** Globals that feed the header, the footer's safety notice, or both. */
export const revalidateEverything: GlobalAfterChangeHook = ({ doc, req, context }) => {
  if (context?.disableRevalidate) return doc
  revalidateLayout(req)
  return doc
}
