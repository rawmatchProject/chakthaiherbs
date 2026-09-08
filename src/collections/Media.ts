import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      // Public path this file had on the pre-migration site, e.g.
      // /media/herbs/card-01.webp. The importer keys on it so herb, group and
      // activity references resolve, and so a re-run updates rather than
      // uploads a second copy.
      name: 'legacyPath',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Path on the pre-migration site. Set by the importer.',
      },
    },
    {
      type: 'collapsible',
      label: 'Consent & rights',
      admin: {
        description:
          'Consent-aware media catalogue (BACKEND-HANDOVER §6). Public listings filter on these through lib/public-visibility.ts — media with minors additionally requires an evidence reference.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'credit', type: 'text', admin: { width: '50%' } },
            { name: 'license', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          name: 'consentStatus',
          type: 'select',
          defaultValue: 'unknown',
          options: [
            { label: 'Unknown', value: 'unknown' },
            { label: 'Granted', value: 'granted' },
            { label: 'Restricted', value: 'restricted' },
            { label: 'Withdrawn', value: 'withdrawn' },
          ],
        },
        {
          name: 'containsMinors',
          type: 'checkbox',
          defaultValue: false,
          label: 'Contains minors',
        },
        {
          name: 'consentEvidenceRef',
          type: 'text',
          label: 'Consent evidence reference',
          admin: {
            description: 'Required before media containing minors can be listed publicly.',
            condition: (_, siblingData) => Boolean(siblingData?.containsMinors),
          },
        },
        {
          name: 'takedownRequestedAt',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Set this and the item drops out of every public listing immediately.',
          },
        },
      ],
    },

    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.containsMinors && data?.consentStatus === 'granted' && !data?.consentEvidenceRef) {
          throw new Error(
            'Media containing minors needs a consent evidence reference before consent can be recorded as granted.',
          )
        }
        return data
      },
    ],
  },
  upload: {
    // Local development fallback; the Blob plugin disables local storage when its token is set.
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
