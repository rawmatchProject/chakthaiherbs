import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

/**
 * Append-only trail of claim review decisions. Written by the `herb-claims`
 * afterChange hook; not editable by hand.
 */
export const ClaimReviewAudit: CollectionConfig<'claim-review-audit'> = {
  slug: 'claim-review-audit',
  labels: { singular: 'Claim review entry', plural: 'Claim review audit' },
  access: {
    create: () => false,
    delete: () => false,
    update: () => false,
    read: authenticated,
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'toStatus',
    defaultColumns: ['claim', 'fromStatus', 'toStatus', 'changedBy', 'createdAt'],
    group: 'Herbarium',
    hidden: false,
  },
  fields: [
    { name: 'claim', type: 'relationship', relationTo: 'herb-claims', required: true, index: true },
    {
      name: 'fromStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'toStatus',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    { name: 'changedBy', type: 'text', required: true },
    { name: 'reason', type: 'textarea' },
  ],
}
