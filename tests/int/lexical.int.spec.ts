import { describe, expect, it } from 'vitest'

import { lexicalToArticleBody } from '@/content/lexical-to-body'

const root = (children: unknown[]) => ({ root: { type: 'root', children } })
const text = (value: string, format = 0) => ({ type: 'text', text: value, format })

/**
 * Article bodies cross two formats in this migration: the old Strapi block JSON
 * on the way in (scripts/chakthai-import/lexical.ts) and Lexical on the way out
 * to the site's own renderer. This covers the second half.
 */
describe('lexical → article body', () => {
  it('returns nothing for empty content', () => {
    expect(lexicalToArticleBody(null)).toEqual([])
    expect(lexicalToArticleBody({})).toEqual([])
  })

  it('maps paragraphs and their marks', () => {
    const body = lexicalToArticleBody(
      root([{ type: 'paragraph', children: [text('ปกติ'), text('หนา', 1), text('เอียง', 2)] }]),
    )
    expect(body).toHaveLength(1)
    expect(body[0].type).toBe('paragraph')
    expect(body[0].children).toEqual([
      { type: 'text', text: 'ปกติ', bold: false, italic: false, underline: false, strikethrough: false, code: false },
      { type: 'text', text: 'หนา', bold: true, italic: false, underline: false, strikethrough: false, code: false },
      { type: 'text', text: 'เอียง', bold: false, italic: true, underline: false, strikethrough: false, code: false },
    ])
  })

  it('keeps heading levels', () => {
    const body = lexicalToArticleBody(
      root([
        { type: 'heading', tag: 'h2', children: [text('หัวข้อ')] },
        { type: 'heading', tag: 'h4', children: [text('ย่อย')] },
      ]),
    )
    expect(body.map((block) => block.level)).toEqual([2, 4])
  })

  it('maps both kinds of list into list-items', () => {
    const [bullet, numbered] = lexicalToArticleBody(
      root([
        { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [text('ก')] }] },
        { type: 'list', listType: 'number', children: [{ type: 'listitem', children: [text('ข')] }] },
      ]),
    )
    expect(bullet.format).toBe('unordered')
    expect(numbered.format).toBe('ordered')
    expect(bullet.children?.[0]).toMatchObject({ type: 'list-item' })
  })

  it('keeps links with their URL', () => {
    const [block] = lexicalToArticleBody(
      root([
        {
          type: 'paragraph',
          children: [{ type: 'link', fields: { url: 'https://example.org' }, children: [text('อ่าน')] }],
        },
      ]),
    )
    expect(block.children?.[0]).toMatchObject({ type: 'link', url: 'https://example.org' })
  })

  it('keeps the words from nodes it has no equivalent for, and drops empty ones', () => {
    const body = lexicalToArticleBody(
      root([
        { type: 'horizontalrule' },
        { type: 'block', children: [text('คำบรรยายภาพ')] },
      ]),
    )
    expect(body).toHaveLength(1)
    expect(body[0].children?.[0]).toMatchObject({ text: 'คำบรรยายภาพ' })
  })
})
