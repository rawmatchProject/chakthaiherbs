import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ProjectShell } from "@/components/site/project-shell"
import { BreadcrumbJsonLd } from "@/components/site/json-ld"
import { ArticleBodyContent } from "@/components/site/article-body"
import { articleCategoryLabel, getArticleBySlug, getPublishedArticles } from "@/content/news"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const articles = await getPublishedArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(decodeURIComponent((await params).slug))
  if (!article) return { title: "ไม่พบบทความ" }
  return {
    title: article.title,
    description: article.excerpt,
    // placeholders must never be indexed as if they were project announcements
    robots: article.isMock ? { index: false, follow: false } : undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(decodeURIComponent((await params).slug)),
    getPublishedArticles(),
  ])
  if (!article) notFound()

  const others = allArticles.filter((item) => item.id !== article.id)

  return (
    <ProjectShell>
      <BreadcrumbJsonLd
        trail={[
          { name: "หน้าแรก", path: "/" },
          { name: "บทความ", path: "/news" },
          { name: article.title, path: `/news/${article.slug}` },
        ]}
      />
      <header className="bg-canopy text-white">
        <div className="container-site py-12 sm:py-16">
          <p className="label text-white/70">{articleCategoryLabel[article.category]}</p>
          <h1 className="type-h2 mt-4 max-w-4xl text-balance">{article.title}</h1>
          <p className="type-meta mt-6 flex flex-wrap gap-x-5 gap-y-1 text-white/70">
            {article.authorLabel && <span>{article.authorLabel}</span>}
            {article.publishedAt && <span>เผยแพร่ {article.publishedAt}</span>}
            {article.readingMinutes && <span>อ่าน {article.readingMinutes} นาที</span>}
          </p>
        </div>
      </header>

      {article.isMock && (
        <div className="border-b border-turmeric/40 bg-turmeric/10">
          <div className="container-site flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-5">
            <span className="type-meta shrink-0 rounded-xs border border-turmeric px-3 py-1.5 font-semibold text-turmeric">
              ตัวอย่างโครงสร้าง
            </span>
            <p className="type-sm text-foreground/85">
              หน้านี้แสดงรูปแบบของบทความเพื่อให้ทีมหลังบ้านเห็นโครงสร้าง ยังไม่ใช่เนื้อหาจริง
              ระบบจัดการเนื้อหาจะเป็นผู้ส่งบทความที่เผยแพร่จริงมาแทน
            </p>
          </div>
        </div>
      )}

      <article className="container-site py-14 sm:py-20">
        {article.coverImage && (
          <figure className="sheet relative mb-12 aspect-16/9 overflow-hidden">
            <Image
              src={article.coverImage.src}
              alt={article.coverImage.alt}
              fill
              priority
              sizes="(min-width: 1280px) 60rem, 92vw"
              className={article.isMock ? "object-cover opacity-75 grayscale-[0.3]" : "object-cover"}
            />
          </figure>
        )}

        <div className="mx-auto max-w-3xl">
          <p className="type-lead">{article.excerpt}</p>

          <div className="mt-10 space-y-6 border-t border-border pt-10 text-muted-foreground">
            <h2 className="type-h3 text-foreground">เนื้อหาบทความ</h2>
            {article.body ? (
              <ArticleBodyContent body={article.body} />
            ) : (
              <p>บทความนี้ยังไม่มีเนื้อหาฉบับเต็ม</p>
            )}
          </div>

          <Link
            href="/news"
            className="mt-12 inline-block type-sm font-semibold text-marker underline-offset-4 hover:underline"
          >
            <span aria-hidden="true">←</span> กลับไปหน้าบทความทั้งหมด
          </Link>
        </div>
      </article>

      {others.length > 0 && (
        <nav className="border-t border-border bg-secondary/40 py-14" aria-label="บทความอื่น">
          <div className="container-site">
            <h2 className="type-h3">บทความอื่น</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {others.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="sheet lift group relative block h-full overflow-hidden p-6"
                  >
                    <span className="label text-marker">
                      {articleCategoryLabel[item.category]}
                    </span>
                    <span className="type-h4 mt-3 block">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </ProjectShell>
  )
}
