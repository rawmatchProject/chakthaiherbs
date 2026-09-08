import type { Where } from 'payload'

/**
 * Central visibility policy, ported from charkthai/src/lib/public-visibility.ts.
 *
 * These are query constraints, not access rules: media files themselves stay
 * publicly servable (the site's own illustrations live in the same collection),
 * but every *catalogue* query — the activity galleries, the media page, the
 * public API — must filter through these so an ungranted or withdrawn
 * photograph is never listed.
 */

/** Only claims a reviewer has accepted may leave the public data layer. */
export const publicClaimWhere: Where = {
  reviewStatus: { equals: 'reviewed' },
}

/**
 * Granted, not withdrawn through takedown, and minors require a pointer to the
 * guardian-consent evidence.
 */
export const publicMediaWhere: Where = {
  and: [
    { consentStatus: { equals: 'granted' } },
    { takedownRequestedAt: { exists: false } },
    {
      or: [{ containsMinors: { equals: false } }, { consentEvidenceRef: { exists: true } }],
    },
  ],
}

/** Published-only constraint for the draft-enabled collections. */
export const publishedWhere: Where = {
  _status: { equals: 'published' },
}

type ConsentFields = {
  consentStatus?: string | null
  takedownRequestedAt?: string | null
  containsMinors?: boolean | null
  consentEvidenceRef?: string | null
}

/**
 * The same rule as `publicMediaWhere`, for media already loaded through a
 * relationship (activity photo sets) where a second query would be wasteful.
 */
export const isPubliclyVisibleMedia = (media: ConsentFields | null | undefined): boolean => {
  if (!media) return false
  if (media.consentStatus !== 'granted') return false
  if (media.takedownRequestedAt) return false
  if (media.containsMinors && !media.consentEvidenceRef) return false
  return true
}
