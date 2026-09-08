import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { textList } from '../../fields/textList'
import { auditClaimReview } from './hooks/auditClaimReview'
import { legacyId } from '../../fields/legacyId'
import { revalidateHerbForClaim } from '../../hooks/revalidateHerbClaim'

/**
 * Reviewable health-related statements attached to a herb.
 *
 * Only `reviewed` claims may leave the public data layer — the legacy free-text
 * fields on the herb record remain as import source. Ported from the Prisma
 * `HerbClaim` model.
 */
export const HerbClaims: CollectionConfig<'herb-claims'> = {
  slug: 'herb-claims',
  labels: { singular: 'Herb claim', plural: 'Herb claims' },
  access: {
    create: authenticated,
    delete: authenticated,
    update: authenticated,
    // Public reads are limited to claims a reviewer has accepted.
    read: ({ req: { user } }) => (user ? true : { reviewStatus: { equals: 'reviewed' } }),
  },
  defaultSort: 'position',
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['herb', 'section', 'reviewStatus', 'position', 'updatedAt'],
    group: 'Herbarium',
  },
  fields: [
    { name: 'herb', type: 'relationship', relationTo: 'herbs', required: true, index: true },
    {
      name: 'section',
      type: 'select',
      required: true,
      options: [
        { label: 'สรรพคุณ (property)', value: 'property' },
        { label: 'วิธีใช้ (how to use)', value: 'how_to_use' },
        { label: 'ข้อควรระวัง (caution)', value: 'caution' },
      ],
    },
    { name: 'title', type: 'text' },
    { name: 'text', type: 'textarea', required: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'community_wisdom',
      options: [
        { label: 'Community wisdom', value: 'community_wisdom' },
        { label: 'Reference', value: 'reference' },
        { label: 'Research', value: 'research' },
      ],
    },
    textList('sourceRefs', { label: 'Source references' }),
    {
      name: 'position',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Order within its section.' },
    },
    {
      name: 'reviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'reviewNote',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Recorded on the audit row for this change.' },
    },
    { name: 'reviewedBy', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    legacyId,
    {
      name: 'auditLogs',
      type: 'join',
      collection: 'claim-review-audit',
      on: 'claim',
      admin: { defaultColumns: ['fromStatus', 'toStatus', 'changedBy', 'createdAt'] },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        // Stamp the reviewer when a claim is accepted or rejected and nothing was set by hand.
        const moved = data?.reviewStatus && data.reviewStatus !== originalDoc?.reviewStatus
        if (moved && data.reviewStatus !== 'pending') {
          if (!data.reviewedBy) data.reviewedBy = req.user?.email ?? null
          if (!data.reviewedAt) data.reviewedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [auditClaimReview, revalidateHerbForClaim],
    afterDelete: [revalidateHerbForClaim],
  },
  indexes: [{ fields: ['herb', 'section', 'position'], unique: true }],
}
