import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type LegacyNode = {
  type?: string
  text?: string
  url?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  level?: number
  format?: string
  children?: LegacyNode[]
}

const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_UNDERLINE = 1 << 3

const textNode = (node: LegacyNode) => ({
  type: 'text',
  detail: 0,
  format:
    (node.bold ? IS_BOLD : 0) | (node.italic ? IS_ITALIC : 0) | (node.underline ? IS_UNDERLINE : 0),
  mode: 'normal',
  style: '',
  text: node.text ?? '',
  version: 1,
})

const inline = (nodes: LegacyNode[] = []): unknown[] =>
  nodes.flatMap((node): unknown[] => {
    if (node.type === 'link') {
      return [
        {
          type: 'link',
          children: inline(node.children ?? [{ text: node.text }]),
          direction: 'ltr',
          fields: { linkType: 'custom', newTab: true, url: node.url ?? '#' },
          format: '',
          indent: 0,
          version: 3,
        },
      ]
    }
    return [textNode(node)]
  })

const paragraph = (children: unknown[]) => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

const block = (node: LegacyNode): unknown => {
  const children = inline((node.children ?? []) as LegacyNode[])

  switch (node.type) {
    case 'heading':
      return {
        type: 'heading',
        tag: `h${Math.min(Math.max(node.level ?? 2, 1), 6)}`,
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    case 'quote':
      return {
        type: 'quote',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    case 'list':
      return {
        type: 'list',
        listType: node.format === 'ordered' ? 'number' : 'bullet',
        tag: node.format === 'ordered' ? 'ol' : 'ul',
        start: 1,
        children: (node.children ?? []).map((item, index) => ({
          type: 'listitem',
          value: index + 1,
          checked: undefined,
          children: inline((item.children ?? [{ text: item.text }]) as LegacyNode[]),
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        })),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    default:
      return paragraph(children)
  }
}

const empty = (): SerializedEditorState =>
  ({
    root: {
      type: 'root',
      children: [paragraph([])],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as unknown as SerializedEditorState

/**
 * Converts an old `Article.body` into Lexical state.
 *
 * The column held either the Strapi block JSON described by `ArticleBlock` in
 * charkthai/src/content/types.ts, or plain text. Anything unrecognised is
 * treated as plain text split on blank lines — lossy only in formatting, never
 * in words, which is the right trade for a handful of articles an editor will
 * open anyway.
 */
export const toLexical = (body: string | null | undefined): SerializedEditorState => {
  if (!body || !body.trim()) return empty()

  let parsed: unknown = null
  try {
    parsed = JSON.parse(body)
  } catch {
    parsed = null
  }

  if (Array.isArray(parsed)) {
    return {
      root: {
        type: 'root',
        children: (parsed as LegacyNode[]).map(block),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as unknown as SerializedEditorState
  }

  const paragraphs = body
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean)

  return {
    root: {
      type: 'root',
      children: paragraphs.map((text) => paragraph([textNode({ text })])),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as unknown as SerializedEditorState
}
