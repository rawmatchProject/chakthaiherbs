import Image from "next/image"
import Link from "next/link"

import { LeafMark } from "@/components/site/leaf-mark"
import { articleCategoryLabel } from "@/content/news"
import type { Article } from "@/content/types"
import { cn } from "@/lib/utils"

/**
 * Article card. Mock records keep a visible "ตัวอย่างโครงสร้าง" ribbon here and
 * on the article page itself, so a reader is never left guessing whether a
 * placeholder is a real project announcement.
 */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return (
    <article className={cn("sheet lift group relative flex flex-col overflow-hidden", className)}>
      <LeafMark variant={article.slug.length} size={124} className="-right-10 -bottom-9" />
      {article.coverImage && (
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
            className={cn("zoom-media object-cover", article.isMock && "opacity-70 grayscale-[0.35]")}
          />
          {article.isMock && (
            <span className="absolute top-3 left-3 rounded-xs border border-turmeric bg-paper px-3 py-1.5 type-meta text-turmeric">
              ตัวอย่างโครงสร้าง
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <p className="label relative text-marker">{articleCategoryLabel[article.category]}</p>
        <h3 className="type-h4 relative mt-3">
          <Link
            href={`/news/${article.slug}`}
            className="transition-colors group-hover:text-marker"
          >
            {/* stretch the link across the card so the whole tile is clickable */}
            <span aria-hidden="true" className="absolute inset-0" />
            {article.title}
          </Link>
        </h3>
        <p className="type-sm relative mt-3 text-muted-foreground">{article.excerpt}</p>

        <p className="type-meta relative mt-auto flex flex-wrap gap-x-3 pt-6 text-muted-foreground">
          {article.authorLabel && <span>{article.authorLabel}</span>}
          {article.publishedAt && <span>{article.publishedAt}</span>}
          {article.readingMinutes && <span>อ่าน {article.readingMinutes} นาที</span>}
        </p>
      </div>
    </article>
  )
}
