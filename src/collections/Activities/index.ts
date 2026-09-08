import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { orderField, textList } from '../../fields/textList'
import { legacyId } from '../../fields/legacyId'
import { revalidateCollection } from '../../hooks/revalidateSite'

/** Project activities with their photo sets. Prisma `Activity`. */
export const Activities: CollectionConfig<'activities'> = {
  slug: 'activities',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', 'dateLabel', 'participants'],
    group: 'Project',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'dateLabel', type: 'text', required: true, admin: { description: 'As printed, e.g. 12 มีนาคม 2569.' } },
    { name: 'place', type: 'text', required: true },
    { name: 'participants', type: 'number', required: true, defaultValue: 0 },
    { name: 'summary', type: 'textarea', required: true },
    textList('outcomes', { label: 'ผลที่ได้' }, true),
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description:
          'Only media with recorded consent reaches the public gallery — see the consent fields on each item.',
      },
    },
    orderField,
    legacyId,
  ],
  hooks: revalidateCollection(() => ['/', '/activities']),
  versions: { drafts: true },
}
