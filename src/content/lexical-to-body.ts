import type { ArticleBlock, ArticleTextNode } from '@/content/types'

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number | string
  listType?: string
  fields?: { url?: string | null; doc?: unknown; linkType?: string }
  children?: LexicalNode[]
}

const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4

const inline = (nodes: LexicalNode[] = []): ArticleTextNode[] =>
  nodes.flatMap((node): ArticleTextNode[] => {
    if (node.type === 'link' || node.type === 'autolink') {
      return [
        {
          type: 'link',
          url: node.fields?.url ?? '#',
          children: inline(node.children),
        },
      ]
    }
    if (node.type === 'linebreak') return [{ text: '\n' }]
    if (typeof node.text !== 'string') return inline(node.children)

    const format = typeof node.format === 'number' ? node.format : 0
    return [
      {
        type: 'text',
        text: node.text,
        bold: Boolean(format & IS_BOLD),
        italic: Boolean(format & IS_ITALIC),
        underline: Boolean(format & IS_UNDERLINE),
        strikethrough: Boolean(format & IS_STRIKETHROUGH),
        code: Boolean(format & IS_CODE),
      },
    ]
  })

const block = (node: LexicalNode): ArticleBlock | null => {
  switch (node.type) {
    case 'heading':
      return {
        type: 'heading',
        level: Number(String(node.tag ?? 'h2').replace('h', '')) || 2,
        children: inline(node.children),
      }
    case 'quote':
      return { type: 'quote', children: inline(node.children) }
    case 'list':
      return {
        type: 'list',
        format: node.listType === 'number' ? 'ordered' : 'unordered',
        children: (node.children ?? []).map((item) => ({
          type: 'list-item',
          children: inline(item.children),
        })),
      }
    case 'paragraph':
      return { type: 'paragraph', children: inline(node.children) }
    default:
      // Uploads, custom blocks and horizontal rules have no equivalent in the
      // site's article renderer; their text, if any, is kept as a paragraph.
      if (node.children?.length) return { type: 'paragraph', children: inline(node.children) }
      return null
  }
}

/**
 * Payload stores article bodies as Lexical state; the site renders the
 * `ArticleBlock[]` shape the old CMS contract defined. Converting here keeps
 * `components/site/article-body.tsx` — and its typography — untouched.
 */
export const lexicalToArticleBody = (content: unknown): ArticleBlock[] => {
  const root = (content as { root?: LexicalNode })?.root
  if (!root?.children) return []
  return root.children.map(block).filter((node): node is ArticleBlock => node !== null)
}
