import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { orderField } from '../../fields/textList'
import { legacyId } from '../../fields/legacyId'
import { revalidateCollection } from '../../hooks/revalidateSite'

/** YouTube videos produced by the project. Prisma `ProjectVideoRecord`. */
export const ProjectVideos: CollectionConfig<'project-videos'> = {
  slug: 'project-videos',
  labels: { singular: 'Project video', plural: 'Project videos' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'youtubeId', 'channel', 'order'],
    group: 'Project',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'youtubeId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The 11-character video ID, not the full URL.' },
    },
    { name: 'channel', type: 'text', required: true },
    orderField,
    legacyId,
  ],
  hooks: revalidateCollection(() => ['/', '/media']),
  versions: { drafts: true },
}
