import type { ReactNode } from "react"

import type { ArticleBlock, ArticleBody, ArticleTextNode } from "@/content/types"

function renderText(node: ArticleTextNode, key: string): ReactNode {
  if (node.type === "link") {
    const href = node.url ?? "#"
    const external = /^https?:\/\//i.test(href)
    return (
      <a
        key={key}
        href={href}
        className="font-medium text-marker underline underline-offset-4"
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {node.children?.map((child, index) => renderText(child, `${key}-${index}`))}
      </a>
    )
  }

  let content: ReactNode = node.text ?? ""
  if (node.code) content = <code className="rounded-xs bg-secondary px-1.5 py-0.5">{content}</code>
  if (node.bold) content = <strong>{content}</strong>
  if (node.italic) content = <em>{content}</em>
  if (node.underline) content = <u>{content}</u>
  if (node.strikethrough) content = <s>{content}</s>
  return <span key={key}>{content}</span>
}

function blockChildren(block: ArticleBlock, key: string) {
  return (block.children ?? []).map((child, index) =>
    "text" in child || child.type === "link"
      ? renderText(child as ArticleTextNode, `${key}-${index}`)
      : renderBlock(child as ArticleBlock, `${key}-${index}`),
  )
}

function renderBlock(block: ArticleBlock, key: string): ReactNode {
  if (block.type === "heading") {
    const children = blockChildren(block, key)
    if (block.level === 3) return <h3 key={key} className="type-h4 pt-3 text-foreground">{children}</h3>
    if (block.level && block.level >= 4) return <h4 key={key} className="font-semibold text-foreground">{children}</h4>
    return <h2 key={key} className="type-h3 pt-4 text-foreground">{children}</h2>
  }
  if (block.type === "quote") {
    return <blockquote key={key} className="border-l-4 border-marker pl-5 italic">{blockChildren(block, key)}</blockquote>
  }
  if (block.type === "list") {
    const Tag = block.format === "ordered" ? "ol" : "ul"
    return <Tag key={key} className="space-y-2 pl-6">{blockChildren(block, key)}</Tag>
  }
  if (block.type === "list-item") return <li key={key}>{blockChildren(block, key)}</li>
  return <p key={key}>{blockChildren(block, key)}</p>
}

export function ArticleBodyContent({ body }: { body: ArticleBody }) {
  if (typeof body === "string") {
    return body
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((paragraph) => <p key={paragraph}>{paragraph}</p>)
  }
  return body.map((block, index) => renderBlock(block, `block-${index}`))
}
