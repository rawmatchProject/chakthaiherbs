import type { Metadata } from "next"
import Link from "next/link"

import { HerbThumb } from "@/components/herbs/herb-thumb"
import { LeafMark } from "@/components/site/leaf-mark"
import { Plate, toThaiNumerals } from "@/components/site/plate"
import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { Reveal } from "@/components/site/reveal"
import { getHerbGroupRecords, groupHerbCount } from "@/content/groups"
import { getPublishedHerbs } from "@/content/herbs"

export const metadata: Metadata = {
  title: "5 กลุ่มสมุนไพรเพื่อสุขภาพ",
  description:
    "สมุนไพรจัดกลุ่มตามการดูแลสุขภาพ 5 กลุ่ม พร้อมสรรพคุณ วิธีปรุง และตำรับที่ใช้ได้ในครัวเรือน",
}

export default async function GroupsPage() {
  const [herbGroupRecords, herbs] = await Promise.all([getHerbGroupRecords(), getPublishedHerbs()])
  const totalRows = herbGroupRecords.reduce((sum, g) => sum + groupHerbCount(g), 0)

  return (
    <ProjectShell>
      <PageHeader
        plate="กลุ่มสมุนไพร"
        title="5 กลุ่มสมุนไพรเพื่อสุขภาพ"
        intro="คู่มือของโครงการจัดสมุนไพรเป็นห้ากลุ่มตามเป้าหมายการดูแลสุขภาพ แต่ละกลุ่มบอกสรรพคุณโดยละเอียด วิธีปรุง และข้อควรระวัง เลือกกลุ่มที่ต้องการเพื่ออ่านเนื้อหาเต็ม"
        meta={[
          { label: "จำนวนกลุ่ม", value: "5 กลุ่ม" },
          { label: "สมุนไพรที่กล่าวถึง", value: `${totalRows} รายการ` },
          { label: "ที่มา", value: "คู่มือสมุนไพรฯ 2569" },
        ]}
      />

      {/* A plain, large-type index. The printed posters are far too dense to
          read at thumbnail size, so the content itself is the navigation. */}
      <Reveal as="section" className="container-site py-14 sm:py-20">
        <ul className="space-y-5">
          {herbGroupRecords.map((group) => {
            const names = [...new Set(group.tables.flatMap((t) => t.rows.map((r) => r.name)))]
            return (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.slug}`}
                  className="sheet lift group relative block overflow-hidden p-7 sm:p-9"
                >
                  <LeafMark variant={group.number} size={190} className="-right-10 -bottom-10" />
                  <div className="relative flex flex-wrap items-center gap-x-5 gap-y-3">
                    <Plate size="lg">กลุ่มที่ {toThaiNumerals(group.number)}</Plate>
                    <span className="type-meta text-muted-foreground">
                      {groupHerbCount(group)} ชนิด
                    </span>
                  </div>

                  <h2 className="type-h3 relative mt-5 transition-colors group-hover:text-marker">{group.titleTh}</h2>
                  <p className="label relative mt-1 text-muted-foreground">{group.titleEn}</p>

                  {group.intro && (
                    <p className="type-sm relative mt-4 max-w-4xl text-muted-foreground">{group.intro}</p>
                  )}

                  {/* one column on the narrowest screens: a thumbnail plus a long
                      Thai name does not fit two-up at the largest text setting */}
                  <ul className="relative mt-7 grid grid-cols-1 gap-x-5 gap-y-4 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                    {names.map((name) => (
                      <li key={name} className="flex min-w-0 items-center gap-3">
                        <HerbThumb name={name} herbs={herbs} className="size-14 sm:size-14" linked={false} />
                        <span className="type-sm min-w-0">{name}</span>
                      </li>
                    ))}
                  </ul>

                  <span className="relative mt-7 inline-flex items-center gap-2 border-b border-marker/50 pb-1 font-medium text-marker">
                    อ่านสรรพคุณและวิธีปรุงทั้งกลุ่ม
                    <span aria-hidden="true" className="arrow-slide">→</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Reveal>
    </ProjectShell>
  )
}
