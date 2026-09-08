import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { orderField } from '../../fields/textList'
import { legacyId } from '../../fields/legacyId'
import { revalidateCollection } from '../../hooks/revalidateSite'

/** Project result indicators (target vs result). Prisma `Indicator`. */
export const Indicators: CollectionConfig<'indicators'> = {
  slug: 'indicators',
  access: { create: authenticated, delete: authenticated, read: anyone, update: authenticated },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'target', 'result', 'met', 'order'],
    group: 'Project',
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'target', type: 'text', required: true },
    { name: 'result', type: 'text', required: true },
    { name: 'met', type: 'checkbox', defaultValue: false, label: 'Target met' },
    orderField,
    legacyId,
  ],
  hooks: revalidateCollection(() => ['/activities', '/project']),
}
