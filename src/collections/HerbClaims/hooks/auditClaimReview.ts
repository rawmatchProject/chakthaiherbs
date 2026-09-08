import type { CollectionAfterChangeHook } from 'payload'

/**
 * Writes a claim-review-audit row whenever a claim's review status moves.
 *
 * The audit trail is the point of the review workflow (BACKEND-HANDOVER §7):
 * a health statement that reached the public site must be traceable to whoever
 * accepted it. `req` is threaded through so the audit row commits in the same
 * transaction as the claim.
 */
export const auditClaimReview: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  const from = operation === 'create' ? null : previousDoc?.reviewStatus
  const to = doc?.reviewStatus

  if (from === to) return doc

  await req.payload.create({
    collection: 'claim-review-audit',
    data: {
      claim: doc.id,
      fromStatus: from ?? null,
      toStatus: to,
      changedBy: req.user?.email ?? 'system',
      reason: doc.reviewNote ?? null,
    },
    req,
    context: { skipAudit: true },
  })

  return doc
}
