import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidateSite'

/** Satisfaction survey summary (Prisma `SatisfactionSummary`, a singleton row). */
export const SatisfactionSummary: GlobalConfig = {
  slug: 'satisfaction-summary',
  label: 'Satisfaction summary',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Project' },
  hooks: { afterChange: [revalidateGlobalPaths(['/project'])] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'respondents', type: 'number', required: true, admin: { width: '33%' } },
        { name: 'overallMean', type: 'number', required: true, admin: { width: '33%' } },
        { name: 'overallPercent', type: 'number', required: true, admin: { width: '33%' } },
      ],
    },
    { name: 'collectedAt', type: 'text', required: true, admin: { description: 'As printed in the report.' } },
    {
      name: 'items',
      type: 'array',
      label: 'รายข้อ',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'mean', type: 'number', required: true },
      ],
    },
    {
      name: 'profile',
      type: 'array',
      label: 'ข้อมูลผู้ตอบ',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'percent', type: 'number', required: true },
      ],
    },
  ],
}
