import { describe, expect, it } from 'vitest'

import {
  isPubliclyVisibleMedia,
  publicClaimWhere,
  publicMediaWhere,
  publishedWhere,
} from '@/lib/public-visibility'

/**
 * The visibility policy is the one piece of this codebase where a silent
 * regression is a real-world harm: an unreviewed health claim or a photograph
 * without recorded consent reaching the public site. It is asserted literally,
 * so any edit to the policy has to be a deliberate edit to this test too.
 */
describe('public visibility policy', () => {
  it('only exposes reviewed claims', () => {
    expect(publicClaimWhere).toEqual({ reviewStatus: { equals: 'reviewed' } })
  })

  it('requires granted, active consent and evidence for minors', () => {
    expect(publicMediaWhere).toEqual({
      and: [
        { consentStatus: { equals: 'granted' } },
        { takedownRequestedAt: { exists: false } },
        {
          or: [{ containsMinors: { equals: false } }, { consentEvidenceRef: { exists: true } }],
        },
      ],
    })
  })

  it('only exposes published documents', () => {
    expect(publishedWhere).toEqual({ _status: { equals: 'published' } })
  })
})

describe('media consent predicate', () => {
  const granted = {
    consentStatus: 'granted',
    takedownRequestedAt: null,
    containsMinors: false,
    consentEvidenceRef: null,
  }

  it('passes media with recorded consent', () => {
    expect(isPubliclyVisibleMedia(granted)).toBe(true)
  })

  it.each([
    ['nothing at all', null],
    ['unknown consent', { ...granted, consentStatus: 'unknown' }],
    ['restricted consent', { ...granted, consentStatus: 'restricted' }],
    ['withdrawn consent', { ...granted, consentStatus: 'withdrawn' }],
    ['a pending takedown', { ...granted, takedownRequestedAt: '2026-01-01T00:00:00.000Z' }],
    ['minors without evidence on file', { ...granted, containsMinors: true }],
  ])('hides %s', (_label, media) => {
    expect(isPubliclyVisibleMedia(media)).toBe(false)
  })

  it('passes media with minors once the evidence reference is recorded', () => {
    expect(
      isPubliclyVisibleMedia({ ...granted, containsMinors: true, consentEvidenceRef: 'consent-1' }),
    ).toBe(true)
  })
})
