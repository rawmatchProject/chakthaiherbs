import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { textList } from '../../fields/textList'
import { legacyId } from '../../fields/legacyId'
import { revalidateCollection } from '../../hooks/revalidateSite'

/**
 * The five health-theme posters from the project guide (กลุ่มที่ 1–5).
 * Ported from the Prisma `HerbGroupRecord` model. Fixed set — create/delete are
 * left open to editors but the site assumes these five slugs exist.
 */
export const HerbGroups: CollectionConfig<'herb-groups'> = {
  slug: 'herb-groups',
  labels: { singular: 'Herb group', plural: 'Herb groups' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: { slug: true, number: true, titleTh: true, titleEn: true, poster: true },
  defaultSort: 'number',
  admin: {
    useAsTitle: 'titleTh',
    defaultColumns: ['number', 'titleTh', 'titleEn', 'updatedAt'],
    group: 'Herbarium',
  },
  fields: [
    { name: 'titleTh', type: 'text', required: true },
    { name: 'titleEn', type: 'text', required: true },
    {
      name: 'number',
      type: 'number',
      required: true,
      unique: true,
      admin: { position: 'sidebar', description: 'กลุ่มที่ 1–5, as printed.' },
    },
    { name: 'intro', type: 'textarea' },
    {
      name: 'tables',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'rows',
          type: 'array',
          admin: { initCollapsed: true },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'properties', type: 'textarea', required: true },
            { name: 'preparation', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'panels',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true },
        textList('items', {}, true),
        { name: 'note', type: 'textarea' },
      ],
    },
    textList('cautions', { label: 'ข้อควรระวัง' }, true),
    { name: 'footer', type: 'textarea' },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'The printed poster for this group.' },
    },
    {
      name: 'herbs',
      type: 'join',
      collection: 'herbs',
      on: 'groupMemberships.group',
      admin: { description: 'Herbs linked to this group (edited from the herb record).' },
    },
    legacyId,
    slugField({ useAsSlug: 'titleEn' }),
  ],
  hooks: revalidateCollection((doc) => ['/', '/groups', `/groups/${doc.slug}`]),
}
