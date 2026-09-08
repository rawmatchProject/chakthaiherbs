import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { revalidateEverything } from '@/hooks/revalidateSite'

/**
 * Editable contact and ownership fields (Prisma `SiteSetting`, a singleton row).
 * These were constants in src/content/project.ts on the old site.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Project' },
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'contactEmail', type: 'email', admin: { width: '50%' } },
        { name: 'contactPhone', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'ownerUrl', type: 'text', label: 'Owner URL' },
    { name: 'ownerMapUrl', type: 'text', label: 'Owner map URL' },
    { name: 'funderUrl', type: 'text', label: 'Funder URL' },
    {
      type: 'row',
      fields: [
        { name: 'developerLabel', type: 'text', admin: { width: '50%' } },
        { name: 'developerHref', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}
