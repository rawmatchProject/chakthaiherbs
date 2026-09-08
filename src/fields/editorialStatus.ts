import type { Field } from 'payload'

/**
 * The source schema has four publication states; Payload drafts have two.
 *
 * `_status` (Publish/Save-draft) remains authoritative for public visibility —
 * nothing unpublished ever leaves the data layer. This field only preserves the
 * editorial distinction between a fresh draft, one waiting on review, and a
 * record retired from the site, so the review workflow described in
 * BACKEND-HANDOVER survives the migration.
 */
export const editorialStatus: Field = {
  name: 'editorialStatus',
  type: 'select',
  defaultValue: 'draft',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'In review', value: 'in_review' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ],
  admin: {
    position: 'sidebar',
    description: 'Editorial tracking only. Public visibility is controlled by Publish.',
  },
}
