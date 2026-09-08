import type { Field } from 'payload'

/**
 * The record's primary key in the old Prisma database (e.g.
 * `herb-01-thunbergia-laurifolia`, `indicator-2`, `guide-2569`).
 *
 * The importer matches on this, so re-running it updates rows instead of
 * duplicating them, and the live-database diff can line its rows up with what
 * was seeded. Safe to clear once the old database is gone.
 */
export const legacyId: Field = {
  name: 'legacyId',
  type: 'text',
  index: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Primary key in the pre-migration database. Set by the importer.',
  },
}
