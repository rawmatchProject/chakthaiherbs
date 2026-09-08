import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * A claim only ever appears on its herb's page, so accepting or rejecting one
 * revalidates that page — the review workflow's result is visible immediately
 * rather than at the next deploy.
 */
const revalidateHerb: CollectionAfterChangeHook & CollectionAfterDeleteHook = async ({
  doc,
  req,
  context,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => {
  if (context?.disableRevalidate) return doc

  const herbId = typeof doc?.herb === 'object' ? doc.herb?.id : doc?.herb
  if (!herbId) return doc

  const herb = await req.payload.findByID({
    collection: 'herbs',
    id: herbId,
    depth: 0,
    req,
    select: { slug: true },
  })

  if (herb?.slug) {
    req.payload.logger.info(`Revalidating /herbs/${herb.slug}`)
    revalidatePath(`/herbs/${herb.slug}`)
  }
  return doc
}

export const revalidateHerbForClaim = revalidateHerb
