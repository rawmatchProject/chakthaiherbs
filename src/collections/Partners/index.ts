import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { orderField } from '../../fields/textList'
import { legacyId } from '../../fields/legacyId'
import { revalidateCollection } from '../../hooks/revalidateSite'

/** Partner organisations shown on the project pages. Prisma `Partner`. */
export const Partners: CollectionConfig<'partners'> = {
  slug: 'partners',
  access: { create: authenticated, delete: authenticated, read: anyone, update: authenticated },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'role', 'order'],
    group: 'Project',
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Map', value: 'map' },
            { label: 'Facebook', value: 'facebook' },
          ],
        },
        { name: 'href', type: 'text', required: true },
      ],
    },
    orderField,
    legacyId,
  ],
  // Partners are listed in the footer, so they appear on every page.
  hooks: revalidateCollection(() => ['/', '/project']),

}
