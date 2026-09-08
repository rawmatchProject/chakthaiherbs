import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { orderField } from '../../fields/textList'
import { legacyId } from '../../fields/legacyId'
import { revalidateCollection } from '../../hooks/revalidateSite'

/** Public document shelf — guide, report, posters, forms. Prisma `Download`. */
export const Downloads: CollectionConfig<'downloads'> = {
  slug: 'downloads',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'order', 'updatedAt'],
    group: 'Project',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'คู่มือ (guide)', value: 'guide' },
        { label: 'รายงาน (report)', value: 'report' },
        { label: 'โปสเตอร์ (poster)', value: 'poster' },
        { label: 'อินโฟกราฟิก (infographic)', value: 'infographic' },
        { label: 'งานวิจัย (research)', value: 'research' },
        { label: 'สไลด์ (presentation)', value: 'presentation' },
        { label: 'แบบฟอร์ม (form)', value: 'form' },
      ],
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Leave empty while the file is being prepared — the page renders "กำลังจัดเตรียมไฟล์".',
      },
    },
    {
      name: 'sizeLabel',
      type: 'text',
      admin: { description: 'Shown next to the link. Derived from the file when left empty.' },
    },
    orderField,
    legacyId,
  ],
  hooks: revalidateCollection(() => ['/downloads']),
  versions: { drafts: true },
}
