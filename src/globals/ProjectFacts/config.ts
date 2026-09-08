import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { textList } from '@/fields/textList'
import { revalidateEverything } from '@/hooks/revalidateSite'

/**
 * The project report facts (Prisma `ProjectFact`, a singleton row) — hard-coded
 * in src/content/project.ts on the old site, editable here.
 */
export const ProjectFacts: GlobalConfig = {
  slug: 'project-facts',
  label: 'Project facts',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Project' },
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'nameTh', type: 'text', required: true },
            { name: 'shortName', type: 'text', required: true },
            { name: 'nameEn', type: 'text', required: true },
            { name: 'tagline', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Administration',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'owner', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'funder', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'period', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'fiscalYear', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            { name: 'strategy', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'budgetTHB', type: 'number', required: true, admin: { width: '50%' } },
                { name: 'budgetCode', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            textList('leads', { label: 'หัวหน้าโครงการ' }),
            { name: 'reportDate', type: 'text', required: true },
          ],
        },
        {
          label: 'Report',
          fields: [
            textList('objectives', { label: 'วัตถุประสงค์' }, true),
            textList('recommendations', { label: 'ข้อเสนอแนะ' }, true),
            textList('bibliography', { label: 'บรรณานุกรม' }, true),
            {
              name: 'safetyNotice',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'Shown wherever health information appears. Do not remove without a clinical reviewer.',
              },
            },
          ],
        },
      ],
    },
  ],
}
