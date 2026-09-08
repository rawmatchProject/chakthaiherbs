import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { editorialStatus } from '../../fields/editorialStatus'
import { textList } from '../../fields/textList'
import { legacyId } from '../../fields/legacyId'
import { revalidateCollection } from '../../hooks/revalidateSite'

/**
 * The herb register — one document per plant card in the printed guide.
 * Ported from the Prisma `Herb` model (charkthai/prisma/schema.prisma).
 */
export const Herbs: CollectionConfig<'herbs'> = {
  slug: 'herbs',
  labels: { singular: 'Herb', plural: 'Herbs' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    slug: true,
    accessionNo: true,
    nameTh: true,
    scientificName: true,
    tagline: true,
    media: true,
  },
  admin: {
    useAsTitle: 'nameTh',
    defaultColumns: ['accessionNo', 'nameTh', 'scientificName', 'editorialStatus', 'updatedAt'],
    group: 'Herbarium',
  },
  fields: [
    {
      name: 'nameTh',
      type: 'text',
      required: true,
      label: 'ชื่อไทย',
    },
    {
      name: 'accessionNo',
      type: 'number',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Position in the printed guide; drives the ชท xx accession code.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'scientificName', type: 'text', required: true },
            { name: 'family', type: 'text' },
            { name: 'familyTh', type: 'text' },
            textList('localNames', { label: 'ชื่อท้องถิ่น' }),
            textList('commonNames', { label: 'Common names' }),
            { name: 'tagline', type: 'text' },
          ],
        },
        {
          label: 'Record',
          fields: [
            textList('ecology', { label: 'นิเวศวิทยา' }, true),
            textList('botany', { label: 'ลักษณะทางพฤกษศาสตร์' }, true),
            textList('uses', { label: 'การใช้ประโยชน์' }, true),
            { name: 'partsUsed', type: 'text', label: 'ส่วนที่ใช้' },
            textList('properties', { label: 'สรรพคุณ' }, true),
            {
              name: 'howToUse',
              type: 'array',
              label: 'วิธีใช้',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  admin: {
                    description:
                      'Sub-heading on the card (ชาสมุนไพร, ตำรับพื้นบ้าน). Leave empty for a single unlabelled method.',
                  },
                },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
            { name: 'cautions', type: 'textarea', label: 'ข้อควรระวัง' },
            { name: 'localWisdom', type: 'textarea', label: 'ภูมิปัญญาท้องถิ่น' },
            textList('phytochemicals', { label: 'สารสำคัญ' }),
            { name: 'significance', type: 'textarea', label: 'ความสำคัญ' },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'media',
              type: 'group',
              fields: [
                {
                  name: 'thumb',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Cropped plant photograph from the guide card.' },
                },
                {
                  name: 'card',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'The full infographic card as printed in the guide.' },
                },
                { name: 'alt', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Provenance',
          fields: [
            {
              name: 'source',
              type: 'group',
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'kind',
                  type: 'select',
                  required: true,
                  defaultValue: 'project-guide',
                  options: [
                    { label: 'Project guide', value: 'project-guide' },
                    { label: 'Project report', value: 'project-report' },
                    { label: 'Community wisdom', value: 'community-wisdom' },
                    { label: 'Reference', value: 'reference' },
                  ],
                },
              ],
            },
            {
              name: 'references',
              type: 'array',
              admin: {
                initCollapsed: true,
                description:
                  'Reading behind the สรรพคุณ. "External" entries are provisional stand-ins and are labelled as such on screen until a reviewer accepts a citation.',
              },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text' },
                {
                  name: 'kind',
                  type: 'select',
                  required: true,
                  defaultValue: 'guide',
                  options: [
                    { label: 'Guide (transcribed from the printed card)', value: 'guide' },
                    { label: 'External (provisional)', value: 'external' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Groups',
          fields: [
            {
              name: 'groupMemberships',
              type: 'array',
              label: 'Health-theme groups',
              admin: {
                description:
                  'Editorial links to the five poster groups. Never derive these from name matching.',
              },
              fields: [
                {
                  name: 'group',
                  type: 'relationship',
                  relationTo: 'herb-groups',
                  required: true,
                },
                { name: 'note', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    legacyId,
    editorialStatus,
    {
      name: 'reviewedBy',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Botanist or Thai-medicine practitioner who signed the record off.',
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    // Slugs are the slugified scientific name (thunbergia-laurifolia), matching the
    // URLs the current site already publishes.
    slugField({ useAsSlug: 'scientificName' }),
  ],
  hooks: revalidateCollection((doc) => ['/', '/herbs', `/herbs/${doc.slug}`]),
  versions: {
    drafts: { schedulePublish: true },
    maxPerDoc: 25,
  },
}
