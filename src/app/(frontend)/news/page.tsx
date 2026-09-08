import type { Metadata } from "next"

import { ArticleCard } from "@/components/site/article-card"
import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { articleCategoryLabel, getPublishedArticles } from "@/content/news"

export const metadata: Metadata = {
  title: "บทความและข่าวสาร",
  description: "บทความความรู้ ข่าวกิจกรรม และประกาศของโครงการสมุนไพรชากไทย",
}

export default async function NewsPage() {
  const articles = await getPublishedArticles()
  const isMockOnly = articles.length > 0 && articles.every((article) => article.isMock)

  return (
    <ProjectShell>
      <PageHeader
        plate="บทความ"
        title="บทความและข่าวสาร"
        intro="พื้นที่สำหรับบทความความรู้เรื่องสมุนไพร ข่าวกิจกรรมในตำบล และประกาศถึงชุมชน โดยผู้ดูแลเผยแพร่เองจากระบบหลังบ้าน"
      />

      {isMockOnly && (
        <div className="border-b border-turmeric/40 bg-turmeric/10">
          <div className="container-site flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-5">
            <span className="type-meta shrink-0 rounded-xs border border-turmeric px-3 py-1.5 text-turmeric">
              ตัวอย่างโครงสร้าง
            </span>
            <p className="type-sm text-foreground/85">
              รายการด้านล่างเป็นตัวอย่างเพื่อแสดงหน้าตาของบทความบนเว็บไซต์ ยังไม่ใช่เนื้อหาจริง
              ทีมหลังบ้านจะแทนที่ด้วยบทความที่เผยแพร่จริงจากระบบจัดการเนื้อหา
            </p>
          </div>
        </div>
      )}

      <section className="container-site py-14 sm:py-20">
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {Object.entries(articleCategoryLabel).map(([key, label]) => (
            <span
              key={key}
              className="type-sm border border-input bg-paper px-4 py-2 text-muted-foreground"
            >
              {label} · {articles.filter((article) => article.category === key).length}
            </span>
          ))}
        </div>

        <h2 className="sr-only">บทความทั้งหมด</h2>
        <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="mx-auto max-w-2xl border border-dashed border-input bg-paper/60 p-12 text-center">
            <p className="type-h3">ยังไม่มีบทความเผยแพร่</p>
            <p className="type-sm mt-4 text-muted-foreground">
              เมื่อผู้ดูแลเผยแพร่บทความจากระบบหลังบ้าน บทความจะปรากฏที่หน้านี้
            </p>
          </div>
        )}
      </section>
    </ProjectShell>
  )
}
