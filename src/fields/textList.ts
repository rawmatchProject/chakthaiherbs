import type { ArrayField, Field } from 'payload'

/**
 * Postgres text[] has no direct Payload equivalent: the idiomatic shape is an
 * array field with a single `value` text child. Every string[] column in the
 * charkthai schema (localNames, ecology, botany, uses, properties,
 * phytochemicals, outcomes, cautions, objectives, ...) maps through here so the
 * serializers can flatten them back to string[] in one place.
 */
export const textList = (
  name: string,
  overrides: Partial<ArrayField> = {},
  useTextarea = false,
): Field => {
  const value: Field = useTextarea
    ? { name: 'value', type: 'textarea', required: true, label: false }
    : { name: 'value', type: 'text', required: true, label: false }

  return {
    name,
    type: 'array',
    admin: { initCollapsed: true },
    fields: [value],
    ...overrides,
  }
}

/** Editorial sort order — the source schema carries an explicit `order` int. */
export const orderField: Field = {
  name: 'order',
  type: 'number',
  defaultValue: 0,
  admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
}
